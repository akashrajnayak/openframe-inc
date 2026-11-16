import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  marketplaceService,
  BatchImportProgress,
  extractYouTubeIdentifiers,
} from './marketplaceService';
import type {
  CourseContentType,
  CourseDedupKey,
  CourseImportLog,
  DiscoveredCourse,
  DiscoveredCourseReviewStatus,
  DiscoveryJobState,
  DiscoveryQuotaStatus,
  MarketplaceCourse,
} from '../types';
import { slugifyCategory } from '../data/marketplaceCatalogData';
import { getDomainGroupForField } from '../data/discoveryTaxonomy';
import {
  getCorporateCategoryByName,
  inferCorporateContentType,
} from '../data/corporateTrainingTaxonomy';

export interface DiscoveryApiError extends Error {
  code?: string;
  missingRequirement?: string;
  quota?: DiscoveryQuotaStatus;
}

export interface DiscoveryStatusPayload {
  ok: boolean;
  quota: DiscoveryQuotaStatus;
  activeJob: DiscoveryJobState | null;
  candidateBufferCount: number;
  targetGoal: {
    baseCatalog: number;
    targetTotal: number;
    newlyDiscoveredTarget: number;
  };
  missingRequirement?: string;
}

function removeUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => removeUndefined(v)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj as Record<string, any>)) {
      if (v !== undefined) {
        clean[k] = removeUndefined(v);
      }
    }
    return clean as T;
  }
  return obj;
}

function makeApiError(data: any, fallbackMessage: string): DiscoveryApiError {
  const err = new Error(data?.error || fallbackMessage) as DiscoveryApiError;
  err.code = data?.errorCode || 'DISCOVERY_API_ERROR';
  err.missingRequirement = data?.missingRequirement;
  err.quota = data?.quota;
  return err;
}

function validateYouTubeResourceUrl(item: Partial<DiscoveredCourse>): { valid: boolean; reason?: string } {
  const targetUrl = item.youtubePlaylistUrl || item.youtubeUrl || '';
  if (!targetUrl) {
    return { valid: false, reason: 'Missing verified YouTube video or playlist URL.' };
  }
  const ids = extractYouTubeIdentifiers(targetUrl);
  if (!ids.videoId && !ids.playlistId) {
    return { valid: false, reason: `Invalid YouTube URL format: ${targetUrl}` };
  }
  if (!item.title || item.title.trim().length < 2) {
    return { valid: false, reason: 'Missing valid course title from YouTube metadata.' };
  }
  return { valid: true };
}

class DiscoveryService {
  /**
   * Fetches existing deduplication IDs from Firestore /course_dedup_keys so the server engine
   * never re-collects already imported videos or playlists.
   */
  async fetchKnownDedupSets(maxScan = 1000): Promise<{
    videoIds: string[];
    playlistIds: string[];
    titles: string[];
  }> {
    const videoIds: string[] = [];
    const playlistIds: string[] = [];
    const titles: string[] = [];
    try {
      const snap = await getDocs(query(collection(db, 'course_dedup_keys'), limit(maxScan)));
      snap.forEach((d) => {
        const row = d.data() as CourseDedupKey;
        if (row.keyType === 'video' && row.rawValue) videoIds.push(row.rawValue);
        else if (row.keyType === 'playlist' && row.rawValue) playlistIds.push(row.rawValue);
        else if (row.keyType === 'title' && row.title) titles.push(row.title);
      });
    } catch {
      // Non-admin read or empty collection safely degrades to server-only base seed
    }
    return { videoIds, playlistIds, titles };
  }

  async getStatus(): Promise<DiscoveryStatusPayload> {
    const res = await fetch('/api/discovery/status');
    const data = await res.json();
    if (!res.ok) {
      throw makeApiError(data, 'Could not retrieve YouTube Discovery Engine status.');
    }
    return data;
  }

  async searchYouTube(params: {
    query: string;
    category: string;
    topic?: string;
    libraryCollection?: 'standard' | 'corporate_training';
    languageLabel?: string;
    searchType?: 'video' | 'playlist' | 'channel';
    pageToken?: string;
    maxResults?: number;
  }): Promise<{
    items: DiscoveredCourse[];
    nextPageToken?: string;
    totalResults?: number;
    duplicatesSkipped: number;
    quota: DiscoveryQuotaStatus;
  }> {
    const known = await this.fetchKnownDedupSets(800);
    const res = await fetch('/api/discovery/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        knownVideoIds: known.videoIds,
        knownPlaylistIds: known.playlistIds,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw makeApiError(data, 'YouTube search request failed.');
    }
    return data;
  }

  /**
   * Discovers real YouTube training videos for a single Corporate Management category (up to targetCount=25)
   * and stages them in /discovered_courses. Optionally auto-approves & imports unique verified records.
   */
  async discoverCorporateCategoryBatch(params: {
    category: string;
    topics?: string[];
    targetCount?: number;
    languageLabel?: string;
    includePlaylists?: boolean;
    autoApproveImport?: boolean;
    admin?: { email: string; uid: string };
    jobId?: string;
  }): Promise<{
    category: string;
    stagedItems: DiscoveredCourse[];
    duplicateCount: number;
    failedCount: number;
    queriesExecuted: number;
    topicsCovered: string[];
    importLog?: CourseImportLog;
    quota: DiscoveryQuotaStatus;
  }> {
    const known = await this.fetchKnownDedupSets(1000);
    const res = await fetch('/api/discovery/corporate-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: params.category,
        topics: params.topics,
        targetCount: params.targetCount ?? 25,
        languageLabel: params.languageLabel || 'English',
        includePlaylists: Boolean(params.includePlaylists),
        knownVideoIds: known.videoIds,
        knownPlaylistIds: known.playlistIds,
        jobId: params.jobId,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw makeApiError(data, `Corporate YouTube discovery failed for "${params.category}".`);
    }

    const rawItems: DiscoveredCourse[] = (data.items || []).map((item: DiscoveredCourse) => ({
      ...item,
      libraryCollection: 'corporate_training',
      contentType:
        item.contentType ||
        inferCorporateContentType({
          title: item.title,
          description: item.description,
          durationMinutes: item.durationMinutes,
          hasPlaylistId: Boolean(item.youtubePlaylistId),
        }),
    }));

    const stageRes = await this.saveDiscoveredCandidates(
      rawItems,
      params.autoApproveImport ? 'Approved' : 'Pending Review'
    );

    let importLog: CourseImportLog | undefined;
    if (params.autoApproveImport && params.admin) {
      const eligible = stageRes.saved.filter((c) => c.reviewStatus === 'Approved');
      if (eligible.length > 0) {
        const importRes = await this.approveAndImportCourses(eligible, params.admin);
        importLog = importRes.importLog;
      }
    }

    return {
      category: params.category,
      stagedItems: stageRes.saved,
      duplicateCount: (data.duplicatesSkipped || 0) + stageRes.duplicateCount,
      failedCount: stageRes.failedCount,
      queriesExecuted: Number(data.queriesExecuted || 0),
      topicsCovered: Array.isArray(data.topicsCovered) ? data.topicsCovered : [],
      importLog,
      quota: data.quota,
    };
  }

  /**
   * Calls the backend YouTube Data API v3 verification endpoint for a set of staged candidates
   * and updates /discovered_courses/{id} with live embeddability, duration, publishedAt, and contentType.
   */
  async verifyYouTubeResources(candidates: DiscoveredCourse[]): Promise<{
    verifiedCount: number;
    unavailableCount: number;
    duplicateCount: number;
    updatedItems: DiscoveredCourse[];
    quota: DiscoveryQuotaStatus;
  }> {
    if (candidates.length === 0) {
      const st = await this.getStatus();
      return { verifiedCount: 0, unavailableCount: 0, duplicateCount: 0, updatedItems: [], quota: st.quota };
    }

    const videoIds = candidates
      .map((c) => c.youtubeVideoId)
      .filter((v): v is string => Boolean(v));
    const playlistIds = candidates
      .map((c) => c.youtubePlaylistId)
      .filter((p): p is string => Boolean(p));

    const res = await fetch('/api/discovery/verify-videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoIds, playlistIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw makeApiError(data, 'YouTube resource verification request failed.');
    }

    const verifiedVideos = data.verifiedVideos || {};
    const verifiedPlaylists = data.verifiedPlaylists || {};
    const nowIso = new Date().toISOString();

    let verifiedCount = 0;
    let unavailableCount = 0;
    let duplicateCount = 0;
    const updatedItems: DiscoveredCourse[] = [];

    const BATCH_LIMIT = 200;
    for (let i = 0; i < candidates.length; i += BATCH_LIMIT) {
      const slice = candidates.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      for (const c of slice) {
        const vCheck = c.youtubeVideoId ? verifiedVideos[c.youtubeVideoId] : undefined;
        const pCheck = c.youtubePlaylistId ? verifiedPlaylists[c.youtubePlaylistId] : undefined;
        const isAvailable = Boolean(
          (vCheck && vCheck.valid) || (pCheck && pCheck.valid)
        );
        const dup = await marketplaceService.checkDuplicate({
          title: c.title,
          youtubeUrl: c.youtubeUrl,
          youtubeVideoId: c.youtubeVideoId,
          youtubePlaylistUrl: c.youtubePlaylistUrl,
          youtubePlaylistId: c.youtubePlaylistId,
        });

        let nextReviewStatus = c.reviewStatus;
        let nextReason = c.duplicateReason;
        if (!isAvailable) {
          unavailableCount++;
          nextReviewStatus = 'Failed';
          nextReason = vCheck?.reason || pCheck?.reason || 'YouTube resource is unavailable or non-embeddable.';
        } else {
          verifiedCount++;
          if (dup.isDuplicate && c.reviewStatus !== 'Imported') {
            duplicateCount++;
            nextReviewStatus = 'Duplicate';
            nextReason = dup.reason || 'Duplicate already exists in course database.';
          }
        }

        const nextContentType: CourseContentType =
          c.contentType ||
          (c.youtubePlaylistId
            ? 'Playlist'
            : vCheck?.contentType ||
              inferCorporateContentType({
                title: vCheck?.title || c.title,
                description: c.description,
                durationMinutes: vCheck?.durationMinutes || c.durationMinutes,
                hasPlaylistId: Boolean(c.youtubePlaylistId),
              }));

        const updated: DiscoveredCourse = removeUndefined({
          ...c,
          title: (vCheck?.title || pCheck?.title || c.title).slice(0, 280),
          youtubeChannelName: vCheck?.channelTitle || pCheck?.channelTitle || c.youtubeChannelName,
          duration: vCheck?.duration || (pCheck?.itemCount ? `${pCheck.itemCount} Lessons (Playlist)` : c.duration),
          durationMinutes: vCheck?.durationMinutes ?? c.durationMinutes,
          publishedAt: vCheck?.publishedAt || pCheck?.publishedAt || c.publishedAt,
          contentType: nextContentType,
          sourceVerificationStatus: isAvailable ? 'Verified YouTube Resource' : 'Unavailable',
          reviewStatus: nextReviewStatus,
          duplicateReason: nextReason,
          existingCourseId: dup.isDuplicate ? dup.existingCourseId : c.existingCourseId,
          updatedAt: nowIso,
        });

        batch.set(doc(db, 'discovered_courses', updated.id), updated, { merge: true });
        updatedItems.push(updated);
      }

      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'discovered_courses');
      }
    }

    return {
      verifiedCount,
      unavailableCount,
      duplicateCount,
      updatedItems,
      quota: data.quota,
    };
  }

  /**
   * Saves discovered candidates into Firestore /discovered_courses/{id}, checking Firestore dedup keys & URL validity.
   */
  async saveDiscoveredCandidates(
    items: DiscoveredCourse[],
    initialStatusOverride?: DiscoveredCourseReviewStatus
  ): Promise<{
    saved: DiscoveredCourse[];
    duplicateCount: number;
    failedCount: number;
  }> {
    const saved: DiscoveredCourse[] = [];
    let duplicateCount = 0;
    let failedCount = 0;

    const BATCH_LIMIT = 200;
    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
      const slice = items.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      let writes = 0;

      for (const candidate of slice) {
        const docId = candidate.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
        const nowIso = new Date().toISOString();

        const validation = validateYouTubeResourceUrl(candidate);
        if (!validation.valid) {
          failedCount++;
          const failedDoc = removeUndefined<DiscoveredCourse>({
            ...candidate,
            id: docId,
            reviewStatus: 'Failed',
            sourceVerificationStatus: 'Unavailable',
            duplicateReason: validation.reason,
            updatedAt: nowIso,
          });
          batch.set(doc(db, 'discovered_courses', docId), failedDoc, { merge: true });
          writes++;
          saved.push(failedDoc);
          continue;
        }

        const dup = await marketplaceService.checkDuplicate({
          title: candidate.title,
          youtubeUrl: candidate.youtubeUrl,
          youtubeVideoId: candidate.youtubeVideoId,
          youtubePlaylistUrl: candidate.youtubePlaylistUrl,
          youtubePlaylistId: candidate.youtubePlaylistId,
        });

        const cleanDoc = removeUndefined<DiscoveredCourse>({
          ...candidate,
          id: docId,
          title: (candidate.title || '').trim().slice(0, 280),
          contentType:
            candidate.contentType ||
            inferCorporateContentType({
              title: candidate.title,
              description: candidate.description,
              durationMinutes: candidate.durationMinutes,
              hasPlaylistId: Boolean(candidate.youtubePlaylistId),
            }),
          certificateEligibility: Boolean(candidate.certificateEligibility),
          reviewStatus: dup.isDuplicate ? 'Duplicate' : initialStatusOverride || candidate.reviewStatus || 'Pending Review',
          duplicateReason: dup.isDuplicate ? dup.reason : candidate.duplicateReason,
          existingCourseId: dup.isDuplicate ? dup.existingCourseId : candidate.existingCourseId,
          updatedAt: nowIso,
        });

        if (dup.isDuplicate) duplicateCount++;

        batch.set(doc(db, 'discovered_courses', docId), cleanDoc, { merge: true });
        writes++;
        saved.push(cleanDoc);
      }

      if (writes > 0) {
        try {
          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'discovered_courses');
        }
      }
    }

    return { saved, duplicateCount, failedCount };
  }

  async persistJob(job: DiscoveryJobState): Promise<void> {
    const clean = removeUndefined(job);
    try {
      await setDoc(doc(db, 'discovery_jobs', clean.id), clean, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `discovery_jobs/${clean.id}`);
    }
  }

  async runTestBatch20(params: {
    selectedCategories?: string[];
    selectedLanguages?: string[];
    includePlaylists?: boolean;
  }): Promise<{
    job: DiscoveryJobState;
    items: DiscoveredCourse[];
    duplicateCount: number;
    failedCount: number;
    quota: DiscoveryQuotaStatus;
  }> {
    const known = await this.fetchKnownDedupSets(800);
    const res = await fetch('/api/discovery/test-batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        knownVideoIds: known.videoIds,
        knownPlaylistIds: known.playlistIds,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw makeApiError(data, 'Test batch of 20 educational resources failed.');
    }

    const stageRes = await this.saveDiscoveredCandidates(data.items || []);
    const finalJob: DiscoveryJobState = {
      ...(data.job as DiscoveryJobState),
      duplicateCount: (data.job?.duplicateCount || 0) + stageRes.duplicateCount,
      failedCount: (data.job?.failedCount || 0) + stageRes.failedCount,
    };
    await this.persistJob(finalJob);

    return {
      job: finalJob,
      items: stageRes.saved,
      duplicateCount: stageRes.duplicateCount,
      failedCount: stageRes.failedCount,
      quota: data.quota,
    };
  }

  async startBatchJob(config: {
    autoApproveImport?: boolean;
    selectedCategories?: string[];
    selectedLanguages?: string[];
    selectedModifiers?: string[];
    emergingKeywords?: string[];
    includeVideos?: boolean;
    includePlaylists?: boolean;
    includeChannels?: boolean;
    targetBatchLimit?: number;
  }): Promise<{ job: DiscoveryJobState; quota: DiscoveryQuotaStatus }> {
    const known = await this.fetchKnownDedupSets(1000);
    const res = await fetch('/api/discovery/job/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...config,
        knownVideoIds: known.videoIds,
        knownPlaylistIds: known.playlistIds,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw makeApiError(data, 'Unable to start automated YouTube discovery.');
    }
    await this.persistJob(data.job);
    return { job: data.job, quota: data.quota };
  }

  async stepBatchJob(
    batchSize: number,
    admin: { email: string; uid: string }
  ): Promise<{
    job: DiscoveryJobState;
    stagedItems: DiscoveredCourse[];
    importLog?: CourseImportLog;
    quota: DiscoveryQuotaStatus;
  }> {
    const known = await this.fetchKnownDedupSets(1000);
    const res = await fetch('/api/discovery/job/step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchSize,
        knownVideoIds: known.videoIds,
        knownPlaylistIds: known.playlistIds,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      if (data?.job) {
        await this.persistJob(data.job).catch(() => {});
      }
      throw makeApiError(data, 'Discovery batch step failed.');
    }

    const stageRes = await this.saveDiscoveredCandidates(data.batchItems || []);
    const updatedJob: DiscoveryJobState = {
      ...(data.job as DiscoveryJobState),
      duplicateCount: (data.job?.duplicateCount || 0) + stageRes.duplicateCount,
      failedCount: (data.job?.failedCount || 0) + stageRes.failedCount,
    };

    let importLog: CourseImportLog | undefined;
    if (updatedJob.autoApproveImport) {
      const eligible = stageRes.saved.filter((c) => c.reviewStatus === 'Pending Review');
      if (eligible.length > 0) {
        const importRes = await this.approveAndImportCourses(eligible, admin);
        importLog = importRes.importLog;
        updatedJob.importedCount += importLog.importedCount;
        updatedJob.duplicateCount += importLog.duplicateCount;
        updatedJob.failedCount += importLog.failedCount;
      }
    }

    await this.persistJob(updatedJob);
    return {
      job: updatedJob,
      stagedItems: stageRes.saved,
      importLog,
      quota: data.quota,
    };
  }

  async pauseJob(): Promise<DiscoveryJobState | null> {
    const res = await fetch('/api/discovery/job/pause', { method: 'POST' });
    const data = await res.json();
    if (data.job) await this.persistJob(data.job);
    return data.job || null;
  }

  async resumeJob(): Promise<DiscoveryJobState | null> {
    const res = await fetch('/api/discovery/job/resume', { method: 'POST' });
    const data = await res.json();
    if (!res.ok) throw makeApiError(data, 'Unable to resume discovery job.');
    if (data.job) await this.persistJob(data.job);
    return data.job || null;
  }

  async stopJob(): Promise<DiscoveryJobState | null> {
    const res = await fetch('/api/discovery/job/stop', { method: 'POST' });
    const data = await res.json();
    if (data.job) await this.persistJob(data.job);
    return data.job || null;
  }

  async listDiscoveredCourses(
    statusFilter?: DiscoveredCourseReviewStatus | 'All',
    maxRows = 150
  ): Promise<DiscoveredCourse[]> {
    try {
      const colRef = collection(db, 'discovered_courses');
      const q =
        statusFilter && statusFilter !== 'All'
          ? query(colRef, where('reviewStatus', '==', statusFilter), limit(maxRows))
          : query(colRef, orderBy('discoveredAt', 'desc'), limit(maxRows));
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data() as DiscoveredCourse);
      return list.sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'discovered_courses');
    }
  }

  async listCorporateDiscoveredCourses(
    statusFilter?: DiscoveredCourseReviewStatus | 'All',
    maxRows = 700
  ): Promise<DiscoveredCourse[]> {
    try {
      const q = query(
        collection(db, 'discovered_courses'),
        where('libraryCollection', '==', 'corporate_training'),
        limit(maxRows)
      );
      const snap = await getDocs(q);
      let list = snap.docs.map((d) => d.data() as DiscoveredCourse);
      if (statusFilter && statusFilter !== 'All') {
        list = list.filter((c) => c.reviewStatus === statusFilter);
      }
      return list.sort((a, b) => (b.discoveredAt || '').localeCompare(a.discoveredAt || ''));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'discovered_courses');
    }
  }

  async listRecentJobs(maxRows = 12): Promise<DiscoveryJobState[]> {
    try {
      const q = query(collection(db, 'discovery_jobs'), orderBy('startedAt', 'desc'), limit(maxRows));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as DiscoveryJobState);
    } catch (err) {
      console.warn('Could not list discovery jobs:', err);
      return [];
    }
  }

  /**
   * Ensures any newly surfaced category/emerging subject exists inside /course_categories.
   */
  private async ensureCategoriesRegistered(categoryNames: string[]): Promise<void> {
    const uniqueNames = Array.from(new Set(categoryNames.map((n) => n.trim()).filter(Boolean)));
    if (uniqueNames.length === 0) return;

    try {
      const batch = writeBatch(db);
      const nowIso = new Date().toISOString();
      for (const name of uniqueNames.slice(0, 30)) {
        const slug = slugifyCategory(name);
        if (!slug) continue;
        const corpDef = getCorporateCategoryByName(name);
        batch.set(
          doc(db, 'course_categories', slug),
          {
            id: slug,
            name,
            slug,
            domainGroup: corpDef?.domainGroup || getDomainGroupForField(name),
            description:
              corpDef?.description ||
              `Discovered & curated YouTube education pathways in ${name}.`,
            subcategories: corpDef ? corpDef.topics.slice(0, 12) : [],
            baseCourseCount: 0,
            customCourseCount: 0,
            totalCourseCount: 0,
            isSystemDefault: false,
            updatedAt: nowIso,
          },
          { merge: true }
        );
      }
      await batch.commit();
    } catch {
      // Non-blocking category enrichment
    }
  }

  /**
   * Approves and publishes verified unique DiscoveredCourse records into /courses, updating live counters
   * and duplicate prevention indexes without touching existing 15,000 courses.
   */
  async approveAndImportCourses(
    candidates: DiscoveredCourse[],
    admin: { email: string; uid: string },
    onProgress?: (p: BatchImportProgress) => void
  ): Promise<{ importLog: CourseImportLog; updatedCandidates: number }> {
    const validCandidates: DiscoveredCourse[] = [];
    const invalidIds: Array<{ id: string; reason: string }> = [];

    for (const c of candidates) {
      const check = validateYouTubeResourceUrl(c);
      if (!check.valid) {
        invalidIds.push({ id: c.id, reason: check.reason || 'Validation failed' });
        continue;
      }
      validCandidates.push(c);
    }

    const records: Partial<MarketplaceCourse>[] = validCandidates.map((c) => {
      const allCats = Array.from(
        new Set([c.category, ...(c.categories || []), ...(c.emergingSubjects || [])].filter(Boolean))
      );
      const corpDef = getCorporateCategoryByName(c.category);
      return {
        title: c.title.slice(0, 280),
        category: c.category,
        categories: allCats,
        categoryGroup: c.categoryGroup || corpDef?.domainGroup || getDomainGroupForField(c.category),
        subcategory: c.subcategory || c.topic || c.category,
        shortDesc: c.description.slice(0, 1400),
        description: c.description,
        thumbnailUrl: c.thumbnailUrl,
        imageUrl: c.thumbnailUrl,
        youtubeUrl: c.youtubeUrl,
        youtubeVideoId: c.youtubeVideoId,
        youtubePlaylistUrl: c.youtubePlaylistUrl,
        youtubePlaylistId: c.youtubePlaylistId,
        youtubeChannelId: c.youtubeChannelId,
        youtubeChannelName: c.youtubeChannelName,
        youtubeChannelUrl: c.youtubeChannelUrl,
        publishedDate: c.publishedAt,
        durationMinutes: c.durationMinutes,
        estimatedHours: c.estimatedHours,
        duration: c.duration || 'Self-Paced',
        instructorName: c.youtubeChannelName || 'YouTube Educator',
        language: c.language || 'English',
        level: c.level || 'All Levels',
        isFree: false,
        price: 0,
        pricingTier: c.libraryCollection === 'corporate_training' ? 'Corporate Track' : 'Academic Access',
        courseType: c.courseType,
        contentType:
          c.contentType ||
          inferCorporateContentType({
            title: c.title,
            description: c.description,
            durationMinutes: c.durationMinutes,
            hasPlaylistId: Boolean(c.youtubePlaylistId),
          }),
        topic: c.topic,
        libraryCollection: c.libraryCollection,
        // Never mark certificate true unless explicitly verified from source metadata
        certificateEligibility: Boolean(c.certificateEligibility),
        certificateNote: c.certificateEligibility
          ? 'Certificate availability referenced in verified YouTube source description.'
          : 'Open educational YouTube training resource. Complete OpenFrame Quiz & Capstone for OpenFrame credential evaluation.',
        learningObjectives: c.learningObjectives,
        keywords: c.keywords,
        sourceVerificationStatus: c.sourceVerificationStatus,
        status: 'Published',
        isNew: true,
      };
    });

    const importLog = await marketplaceService.batchImportCourses({
      records,
      sourceType: 'youtube_discovery',
      sourceLabel: `YouTube Discovery Batch (${validCandidates.length} courses)`,
      importedBy: admin.email,
      importedByUid: admin.uid,
      onProgress,
    });

    await this.ensureCategoriesRegistered(
      validCandidates.flatMap((c) => [c.category, ...(c.emergingSubjects || [])])
    );

    const nowIso = new Date().toISOString();
    let updatedCandidates = 0;

    const BATCH_LIMIT = 200;
    for (let i = 0; i < validCandidates.length; i += BATCH_LIMIT) {
      const slice = validCandidates.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      for (const c of slice) {
        const dupSample = importLog.duplicatesSample.find((d) => d.title === c.title);
        const errSample = importLog.errorsSample.find((e) => e.title === c.title);
        const nextStatus: DiscoveredCourseReviewStatus = dupSample
          ? 'Duplicate'
          : errSample
          ? 'Failed'
          : 'Imported';
        batch.set(
          doc(db, 'discovered_courses', c.id),
          removeUndefined({
            reviewStatus: nextStatus,
            duplicateReason: dupSample?.reason || errSample?.error,
            updatedAt: nowIso,
          }),
          { merge: true }
        );
        updatedCandidates++;
      }
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'discovered_courses');
      }
    }

    if (invalidIds.length > 0) {
      const batch = writeBatch(db);
      for (const inv of invalidIds.slice(0, 200)) {
        batch.set(
          doc(db, 'discovered_courses', inv.id),
          { reviewStatus: 'Failed', duplicateReason: inv.reason, updatedAt: nowIso },
          { merge: true }
        );
      }
      await batch.commit().catch(() => {});
    }

    return { importLog, updatedCandidates };
  }

  async approveDiscoveredCourses(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);
    for (const id of ids.slice(0, 400)) {
      batch.set(
        doc(db, 'discovered_courses', id),
        { reviewStatus: 'Approved', updatedAt: nowIso },
        { merge: true }
      );
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'discovered_courses');
    }
  }

  async updateDiscoveredCourseContentType(id: string, contentType: CourseContentType): Promise<void> {
    if (!id) return;
    try {
      await setDoc(
        doc(db, 'discovered_courses', id),
        { contentType, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `discovered_courses/${id}`);
    }
  }

  async rejectDiscoveredCourses(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);
    for (const id of ids.slice(0, 400)) {
      batch.set(
        doc(db, 'discovered_courses', id),
        { reviewStatus: 'Rejected', updatedAt: nowIso },
        { merge: true }
      );
    }
    try {
      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'discovered_courses');
    }
  }

  async runDuplicateAuditOnPending(): Promise<{ checked: number; flaggedDuplicates: number }> {
    const pending = await this.listDiscoveredCourses('Pending Review', 200);
    let flaggedDuplicates = 0;
    const nowIso = new Date().toISOString();
    const batch = writeBatch(db);
    let writes = 0;

    for (const item of pending) {
      const dup = await marketplaceService.checkDuplicate({
        title: item.title,
        youtubeUrl: item.youtubeUrl,
        youtubeVideoId: item.youtubeVideoId,
        youtubePlaylistUrl: item.youtubePlaylistUrl,
        youtubePlaylistId: item.youtubePlaylistId,
      });
      if (dup.isDuplicate) {
        flaggedDuplicates++;
        batch.set(
          doc(db, 'discovered_courses', item.id),
          {
            reviewStatus: 'Duplicate',
            duplicateReason: dup.reason || 'Already exists in marketplace database',
            existingCourseId: dup.existingCourseId || '',
            updatedAt: nowIso,
          },
          { merge: true }
        );
        writes++;
      }
    }

    if (writes > 0) {
      try {
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'discovered_courses');
      }
    }

    return { checked: pending.length, flaggedDuplicates };
  }
}

export const discoveryService = new DiscoveryService();
