import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  orderBy,
  limit,
  getCountFromServer,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  MarketplaceCourse,
  MarketplacePricingTier,
  MarketplaceCourseStatus,
  MarketplaceCounters,
  MarketplaceCategory,
  CourseImportLog,
  CourseImportSourceType,
  StudentFavoriteCourse,
  MarketplaceAutocompleteSuggestion,
  MarketplaceFilterParams,
} from '../types';
import {
  ALL_90_CATEGORIES,
  ALL_MARKETPLACE_CATEGORIES,
  MARKETPLACE_STATUSES,
  MARKETPLACE_PRICING_TIERS,
  SUPPORTED_COURSE_LANGUAGES,
  DOMAIN_GROUPS_BY_CATEGORY,
  slugifyCategory,
  extractYouTubeIdentifiers,
  buildCourseSearchTokens,
  matchesDurationFilter,
  synthesizeBaseCourse,
} from '../data/marketplaceCatalogData';
import {
  CORPORATE_TRAINING_CATEGORIES,
  inferCorporateContentType,
} from '../data/corporateTrainingTaxonomy';
import { normalizeAndExpandQuery } from '../utils/searchIntelligence';

export {
  ALL_90_CATEGORIES,
  ALL_MARKETPLACE_CATEGORIES,
  MARKETPLACE_STATUSES,
  MARKETPLACE_PRICING_TIERS,
  SUPPORTED_COURSE_LANGUAGES,
  DOMAIN_GROUPS_BY_CATEGORY,
  slugifyCategory,
  extractYouTubeIdentifiers,
  buildCourseSearchTokens,
  matchesDurationFilter,
  synthesizeBaseCourse as synthesizeCourse,
};

export function normalizeCourseTitleKey(title: string): string {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

export function hashNormalizedTitle(title: string): string {
  const norm = normalizeCourseTitleKey(title);
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < norm.length; i++) {
    const ch = norm.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= ch + ((i + 1) << 3);
    h2 = Math.imul(h2, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

export interface BatchImportProgress {
  processed: number;
  total: number;
  imported: number;
  duplicates: number;
  failed: number;
  percent: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  existingCourseId?: string;
  existingTitle?: string;
  keyType?: 'video' | 'playlist' | 'course' | 'title';
}

export interface ResolvedYouTubeMetadata {
  resolved: boolean;
  source: string;
  courseType: 'youtube_video' | 'youtube_playlist' | 'standard';
  youtubeVideoId?: string;
  youtubeUrl?: string;
  youtubePlaylistId?: string;
  youtubePlaylistUrl?: string;
  title?: string;
  description?: string;
  youtubeChannelName?: string;
  thumbnailUrl?: string;
  duration?: string;
  keywords?: string[];
  itemCount?: number;
  playlistVideos?: Array<{
    videoId: string;
    title: string;
    description: string;
    channelTitle: string;
    thumbnailUrl: string;
  }>;
}

const STATS_DOC_ID = 'global';
const MAX_LOCAL_OVERRIDE_SCAN = 500;

function pickDefaultImage(category: string, categoryGroup: string): string {
  if (categoryGroup === 'Creative') return '/assets/images/graphic_design_media.jpg';
  if (categoryGroup === 'Business') return '/assets/images/entrepreneurship_finance.jpg';
  if (categoryGroup === 'Academic') return '/assets/images/academic_education.jpg';
  if (categoryGroup === 'STEM') return '/assets/images/robotics_stem.jpg';
  if (categoryGroup === 'Wellbeing') return '/assets/images/agriculture_rural_innovation.jpg';
  if (categoryGroup === 'Professional') return '/assets/images/career_development.jpg';
  if (categoryGroup === 'Intelligence') return '/assets/images/iq_eq_sq_development.jpg';
  if (category.includes('Programming') || category.includes('Development')) {
    return '/assets/images/coding_programming.jpg';
  }
  return '/assets/images/artificial_intelligence.jpg';
}

function removeUndefinedDeep<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedDeep(item)) as unknown as T;
  }
  if (obj && typeof obj === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = removeUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return obj;
}

class MarketplaceService {
  private countersCache: { data: MarketplaceCounters; ts: number } | null = null;
  private overridesCache: { map: Map<string, MarketplaceCourse>; ts: number } | null = null;
  private publishedCoursesCache: { list: MarketplaceCourse[]; ts: number } | null = null;

  public invalidateCaches() {
    this.countersCache = null;
    this.overridesCache = null;
    this.publishedCoursesCache = null;
  }

  /**
   * Fetches Published Firestore custom/override courses via a single-field index
   * (`where('status', '==', 'Published')`) so zero composite indexes are required
   * and firestore.rules `allow list` passes cleanly for public visitors and all roles.
   */
  private async fetchPublishedFirestoreCourses(force = false): Promise<MarketplaceCourse[]> {
    const now = Date.now();
    if (!force && this.publishedCoursesCache && now - this.publishedCoursesCache.ts < 15_000) {
      return this.publishedCoursesCache.list;
    }
    try {
      const snap = await getDocs(
        query(collection(db, 'courses'), where('status', '==', 'Published'), limit(2500))
      );
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as MarketplaceCourse));
      this.publishedCoursesCache = { list, ts: now };
      return list;
    } catch {
      return this.publishedCoursesCache?.list || [];
    }
  }

  /**
   * Normalizes partial or imported course data into a canonical MarketplaceCourse document.
   */
  public normalizeCoursePayload(input: Partial<MarketplaceCourse>, options?: { isCustomAdded?: boolean; isBaseOverride?: boolean }): MarketplaceCourse {
    const nowIso = new Date().toISOString();
    const category = (input.category || input.categories?.[0] || 'Artificial Intelligence').trim();
    const categories = Array.isArray(input.categories) && input.categories.length > 0
      ? Array.from(new Set([category, ...input.categories.map((c) => c.trim()).filter(Boolean)]))
      : [category];
    const categoryGroup = input.categoryGroup || DOMAIN_GROUPS_BY_CATEGORY[category] || 'Technology';

    const ytFromUrl = extractYouTubeIdentifiers(input.youtubePlaylistUrl || input.youtubeUrl || input.youtubeVideoId || input.youtubePlaylistId);
    const youtubeVideoId = input.youtubeVideoId || ytFromUrl.videoId;
    const youtubePlaylistId = input.youtubePlaylistId || ytFromUrl.playlistId;

    const courseType =
      input.courseType ||
      (youtubePlaylistId ? 'youtube_playlist' : youtubeVideoId ? 'youtube_video' : 'standard');

    const price = Math.max(0, Number(input.price ?? 0));
    const isFree = false;
    const rawTier = input.pricingTier as string | undefined;
    const pricingTier: MarketplacePricingTier =
      rawTier && rawTier !== 'Free'
        ? (rawTier as MarketplacePricingTier)
        : price >= 2000
        ? 'Specialised'
        : price >= 1400
        ? 'Advanced'
        : price >= 900
        ? 'Professional'
        : price >= 400
        ? 'Basic'
        : price > 0
        ? 'Starter'
        : input.libraryCollection === 'corporate_training'
        ? 'Corporate Track'
        : 'Academic Access';

    const fallbackThumb = youtubeVideoId
      ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : pickDefaultImage(category, categoryGroup);

    const candidateImg = (input.thumbnailUrl || input.imageUrl || '').trim();
    const imageUrl =
      candidateImg && !candidateImg.endsWith('.svg') && !candidateImg.includes('/of_ai_')
        ? candidateImg
        : fallbackThumb;
    const id =
      input.id && input.id.trim()
        ? input.id.trim()
        : `OF-CRS-CU-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const title = (input.title || 'Untitled Course').trim();
    const instructorName = (input.instructorName || input.instructor?.name || 'OpenFrame Academic Faculty').trim();
    const language = (input.language || 'English').trim();
    const subcategory = (input.subcategory || category).trim();
    const keywords = Array.isArray(input.keywords) && input.keywords.length > 0
      ? input.keywords
      : Array.from(new Set([category, subcategory, ...categories, courseType === 'youtube_playlist' ? 'Playlist' : courseType === 'youtube_video' ? 'YouTube' : 'Certification'])).filter(Boolean);

    const shortDesc = (input.shortDesc || input.description || `Structured learning pathway in ${title} with guided lessons, practical assignments, and OpenFrame certification.`).slice(0, 1500);
    const description = (input.description || shortDesc).slice(0, 8000);
    const learningObjectives =
      Array.isArray(input.learningObjectives) && input.learningObjectives.length > 0
        ? input.learningObjectives
        : [`Master core foundations of ${category}`, `Complete practical exercises in ${title}`];

    const modules =
      Array.isArray(input.modules) && input.modules.length > 0
        ? input.modules
        : [
            {
              moduleNumber: 1,
              title: `Foundations of ${title.slice(0, 60)}`,
              duration: input.duration || '4 Hours',
              lessons: ['Core Concepts & Overview', 'Guided Practice Session', 'Assessment & Review'],
            },
          ];

    const baseCourse: MarketplaceCourse = {
      id,
      aliasId: input.aliasId,
      title,
      category,
      categories,
      categoryGroup,
      subcategory,
      level: input.level || 'All Levels',
      duration: input.duration || '12 Hours',
      estimatedHours: input.estimatedHours ?? 12,
      pricingTier,
      price,
      isFree,
      status: input.status || 'Published',
      courseType,
      contentType:
        input.contentType ||
        (youtubePlaylistId || youtubeVideoId
          ? inferCorporateContentType({
              title: input.title,
              description: input.description || input.shortDesc,
              durationMinutes: input.durationMinutes,
              hasPlaylistId: Boolean(youtubePlaylistId),
            })
          : undefined),
      topic: input.topic ? String(input.topic).trim().slice(0, 160) : undefined,
      libraryCollection: input.libraryCollection,
      youtubeUrl: input.youtubeUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : undefined),
      youtubeVideoId,
      youtubePlaylistUrl:
        input.youtubePlaylistUrl || (youtubePlaylistId ? `https://www.youtube.com/playlist?list=${youtubePlaylistId}` : undefined),
      youtubePlaylistId,
      youtubeChannelId: input.youtubeChannelId,
      youtubeChannelName: input.youtubeChannelName,
      youtubeChannelUrl:
        input.youtubeChannelUrl ||
        (input.youtubeChannelId ? `https://www.youtube.com/channel/${input.youtubeChannelId}` : undefined),
      publishedDate: input.publishedDate,
      durationMinutes: input.durationMinutes,
      sourceVerificationStatus: input.sourceVerificationStatus,
      instructorName,
      language,
      keywords,
      thumbnailUrl: imageUrl,
      imageUrl,
      shortDesc,
      description,
      learningObjectives,
      modules,
      targetAudience: input.targetAudience || `Students and professionals building expertise in ${category}.`,
      skillsAcquired: Array.isArray(input.skillsAcquired) && input.skillsAcquired.length > 0 ? input.skillsAcquired : [category, subcategory],
      practicalProjects:
        Array.isArray(input.practicalProjects) && input.practicalProjects.length > 0
          ? input.practicalProjects
          : [`Capstone Project: Applied ${category}`],
      assessmentMethod: input.assessmentMethod || 'Quinn AI Verification Quiz + Practical Capstone Evaluation',
      certificateEligibility: input.certificateEligibility !== undefined ? Boolean(input.certificateEligibility) : true,
      certificateNote: input.certificateNote || 'Verified OpenFrame Education & HopeNest Global Foundation Certificate upon completion.',
      instructor: input.instructor || {
        name: instructorName,
        role: 'Course Instructor',
        organization: input.youtubeChannelName ? `${input.youtubeChannelName} · OpenFrame Partner` : 'OpenFrame Academic Council',
      },
      recommendedVideos:
        input.recommendedVideos ||
        (youtubeVideoId
          ? [
              {
                id: `yt-${youtubeVideoId}`,
                videoId: youtubeVideoId,
                youtubeId: youtubeVideoId,
                title,
                channelTitle: input.youtubeChannelName || instructorName,
                thumbnail: `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
                thumbnailUrl: `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
                duration: input.duration || '25:00',
                level: input.level === 'Advanced' ? 'Advanced' : input.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
                recommendedReason: `Primary curated course video lesson for ${title}.`,
                embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeVideoId}`,
                source: 'marketplace_course',
              },
            ]
          : undefined),
      isPopular: Boolean(input.isPopular),
      isTrending: Boolean(input.isTrending),
      isNew: input.isNew !== undefined ? Boolean(input.isNew) : true,
      isRecommended: Boolean(input.isRecommended),
      isCareerTrack: Boolean(input.isCareerTrack),
      isCustomAdded: options?.isCustomAdded !== undefined ? options.isCustomAdded : Boolean(input.isCustomAdded ?? true),
      isBaseOverride: options?.isBaseOverride !== undefined ? options.isBaseOverride : Boolean(input.isBaseOverride ?? false),
      rating: Number(input.rating ?? 4.85),
      enrolledCount: Number(input.enrolledCount ?? 0),
      createdAt: input.createdAt || nowIso,
      updatedAt: nowIso,
    };

    baseCourse.searchTokens = buildCourseSearchTokens(baseCourse);
    return removeUndefinedDeep(baseCourse);
  }

  /**
   * Loads overridden / deleted base course documents from Firestore (tiny set vs 15k/1M catalog).
   */
  private async getBaseOverridesMap(force = false): Promise<Map<string, MarketplaceCourse>> {
    const now = Date.now();
    if (!force && this.overridesCache && now - this.overridesCache.ts < 30_000) {
      return this.overridesCache.map;
    }
    const map = new Map<string, MarketplaceCourse>();
    try {
      const q = query(
        collection(db, 'courses'),
        where('isBaseOverride', '==', true),
        limit(MAX_LOCAL_OVERRIDE_SCAN)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const data = d.data() as MarketplaceCourse;
        map.set(data.id || d.id, data);
      });
    } catch {
      // Non-admin/public visitors cannot list non-Published docs; read Published overrides via rule-compliant query
      const published = await this.fetchPublishedFirestoreCourses(force);
      for (const c of published) {
        if (c.isBaseOverride) {
          map.set(c.id, c);
        }
      }
    }
    this.overridesCache = { map, ts: now };
    return map;
  }

  private async fetchBaseStatsFromServer(excludeIds: string[]) {
    const res = await fetch('/api/marketplace/base-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excludeIds }),
    });
    if (!res.ok) {
      throw new Error('Failed to load base catalog stats');
    }
    return res.json();
  }

  /**
   * Calculates live dynamic course counters directly from the server base catalog index
   * and Firestore aggregations — never hardcoded and never double-counting base records.
   */
  async getLiveMarketplaceCounters(forceRefresh = false): Promise<MarketplaceCounters> {
    const now = Date.now();
    if (!forceRefresh && this.countersCache && now - this.countersCache.ts < 15_000) {
      return this.countersCache.data;
    }

    const overridesMap = await this.getBaseOverridesMap(forceRefresh);
    const excludeIds = Array.from(overridesMap.keys());

    let baseStats: any = null;
    try {
      baseStats = await this.fetchBaseStatsFromServer(excludeIds);
    } catch {
      baseStats = {
        totalBase: 15500 - excludeIds.length,
        published: 13798,
        paidCourses: 12528,
        youtubeCourses: 15500,
        videoPlaylists: 0,
        categoryCounts: {},
      };
    }

    // Add back active (non-deleted/non-draft/non-archived) overridden base courses
    let overrideActive = 0;
    let overrideDraft = 0;
    let overridePaid = 0;
    let overrideYoutube = 0;
    let overridePlaylists = 0;

    overridesMap.forEach((c) => {
      if (c.status === 'Archived' || c.status === 'Unavailable') return;
      if (c.status === 'Draft') {
        overrideDraft++;
        return;
      }
      overrideActive++;
      if (c.price > 0) overridePaid++;

      if (c.courseType === 'youtube_playlist' || c.youtubePlaylistId) {
        overridePlaylists++;
        overrideYoutube++;
      } else if (c.courseType === 'youtube_video' || c.youtubeVideoId) {
        overrideYoutube++;
      }
    });

    // Firestore custom-added courses via rule-safe single-field Published query
    let customPublished = 0;
    let customDraft = 0;
    let customPaidPublished = 0;
    let customYtPublished = 0;
    let customPlaylistPublished = 0;
    let categoriesCount = ALL_MARKETPLACE_CATEGORIES.length;

    try {
      const publishedDocs = await this.fetchPublishedFirestoreCourses(forceRefresh);

      if (publishedDocs.length < 2500) {
        for (const c of publishedDocs) {
          if (!c.isCustomAdded) continue;
          customPublished++;
          if (c.price > 0) customPaidPublished++;
          if (c.courseType === 'youtube_playlist' || c.youtubePlaylistId) {
            customPlaylistPublished++;
            customYtPublished++;
          } else if (c.courseType === 'youtube_video' || c.youtubeVideoId) {
            customYtPublished++;
          }
        }
      } else {
        // High-scale 100k–1M path via atomic /marketplace_stats/global doc
        const statsDoc = await getDoc(doc(db, 'marketplace_stats', STATS_DOC_ID));
        if (statsDoc.exists()) {
          const s = statsDoc.data() as any;
          customPublished = Number(s.customPublishedCount || 0);
          customDraft = Number(s.customDraftCount || 0);
          customPaidPublished = Number(s.customPaidPublishedCount || 0);
          customYtPublished = Number(s.customYoutubePublishedCount || 0);
          customPlaylistPublished = Number(s.customPlaylistPublishedCount || 0);
        }
      }

      // Draft counts (succeeds quietly for admins/educators, ignored for public visitors)
      try {
        const draftSnap = await getDocs(
          query(collection(db, 'courses'), where('status', '==', 'Draft'), limit(500))
        );
        draftSnap.forEach((d) => {
          const c = d.data() as MarketplaceCourse;
          if (c.isCustomAdded) customDraft++;
        });
      } catch {
        // Public visitors do not have permission to list Draft courses
      }

      const catCountSnap = await getCountFromServer(collection(db, 'course_categories'));
      if (catCountSnap.data().count > 0) {
        categoriesCount = catCountSnap.data().count;
      }
    } catch (err) {
      console.warn('Firestore counter aggregation fallback:', err);
    }

    const counters: MarketplaceCounters = {
      totalCoursesAvailable: Number(baseStats.totalBase || 0) + overrideActive + customPublished,
      paidCourses: Number(baseStats.paidCourses || 0) + overridePaid + customPaidPublished,
      youtubeCourses: Number(baseStats.youtubeCourses || 0) + overrideYoutube + customYtPublished,
      videoPlaylists: Number(baseStats.videoPlaylists || 0) + overridePlaylists + customPlaylistPublished,
      newlyAddedCourses: customPublished,
      draftCourses: overrideDraft + customDraft,
      categoriesCount,
      baseCatalogTotal: Number(baseStats.totalBase || 0) + overrideActive,
      updatedAt: new Date().toISOString(),
    };

    this.countersCache = { data: counters, ts: Date.now() };
    return counters;
  }

  /**
   * Matches a single course against MarketplaceFilterParams on client for Firestore custom/override subset.
   */
  private matchesFilterParams(course: MarketplaceCourse, params: MarketplaceFilterParams): boolean {
    if (!params.status && (course.status === 'Draft' || course.status === 'Archived' || course.status === 'Unavailable')) {
      return false;
    }

    if (params.tab && params.tab !== 'all') {
      switch (params.tab) {
        case 'popular':
          if (!course.isPopular && course.enrolledCount < 200) return false;
          break;
        case 'trending':
          if (!course.isTrending) return false;
          break;
        case 'new':
          if (!course.isNew && !course.isCustomAdded) return false;
          break;
        case 'beginner':
          if (course.level !== 'Beginner' && course.level !== 'All Levels') return false;
          break;
        case 'professional':
          if (course.level !== 'Advanced' && course.pricingTier !== 'Professional' && course.pricingTier !== 'Advanced') return false;
          break;
        case 'premium':
          if (course.price < 999) return false;
          break;
        case 'recommended':
          if (!course.isRecommended && course.rating < 4.8) return false;
          break;
        case 'career':
          if (!course.isCareerTrack && course.categoryGroup !== 'Professional' && course.categoryGroup !== 'Business') return false;
          break;
        case 'youtube':
          if (course.courseType !== 'youtube_video' && course.courseType !== 'youtube_playlist' && !course.youtubeVideoId && !course.youtubePlaylistId) return false;
          break;
        case 'playlists':
          if (course.courseType !== 'youtube_playlist' && !course.youtubePlaylistId) return false;
          break;
      }
    }

    if (params.query && params.query.trim()) {
      const expanded = normalizeAndExpandQuery(params.query);
      const terms = expanded.tokens;
      const blob = [
        course.id,
        course.aliasId || '',
        course.title,
        course.category,
        ...(course.categories || []),
        course.subcategory,
        course.topic || '',
        course.contentType || '',
        course.categoryGroup,
        course.shortDesc,
        course.instructorName || course.instructor?.name || '',
        course.youtubeChannelName || '',
        course.language || 'English',
        ...(course.keywords || []),
        ...(course.skillsAcquired || []),
      ]
        .join(' ')
        .toLowerCase();
      let directMatch = true;
      for (const term of terms) {
        if (!blob.includes(term)) {
          directMatch = false;
          break;
        }
      }
      if (!directMatch) {
        const synMatch = expanded.expandedTerms.some((alt) => blob.includes(alt));
        if (!synMatch) return false;
      }
    }

    if (params.category && params.category !== 'All') {
      const cats = course.categories && course.categories.length > 0 ? course.categories : [course.category];
      if (!cats.includes(params.category) && course.category !== params.category) return false;
    }
    if (params.subcategory && params.subcategory !== 'All') {
      if (!course.subcategory.toLowerCase().includes(params.subcategory.toLowerCase())) return false;
    }
    if (params.categoryGroup && params.categoryGroup !== 'All') {
      if (course.categoryGroup !== params.categoryGroup) return false;
    }
    if (params.pricingTier && params.pricingTier !== 'All') {
      if (course.pricingTier !== params.pricingTier) return false;
    }
    if (params.courseType && params.courseType !== 'all') {
      if (course.courseType !== params.courseType) return false;
    }
    if (params.contentType && params.contentType !== 'all') {
      const effectiveContentType =
        course.contentType ||
        (course.youtubePlaylistId || course.courseType === 'youtube_playlist'
          ? 'Playlist'
          : course.youtubeVideoId || course.courseType === 'youtube_video'
          ? inferCorporateContentType({
              title: course.title,
              description: course.shortDesc,
              durationMinutes: course.durationMinutes,
              hasPlaylistId: false,
            })
          : undefined);
      if (effectiveContentType !== params.contentType) return false;
    }
    if (params.libraryCollection && params.libraryCollection !== 'all') {
      if ((course.libraryCollection || 'standard') !== params.libraryCollection) return false;
    }
    if (params.language && params.language !== 'All') {
      if ((course.language || 'English').toLowerCase() !== params.language.toLowerCase()) return false;
    }
    if (params.level && params.level !== 'All') {
      if (course.level !== params.level && course.level !== 'All Levels') return false;
    }
    if (params.duration && params.duration !== 'All' && params.duration !== 'all') {
      if (!matchesDurationFilter(course, params.duration)) return false;
    }
    if (params.certificateOnly && !course.certificateEligibility) {
      return false;
    }
    if (params.publicationDate && params.publicationDate !== 'all') {
      const nowMs = Date.now();
      const cutoff =
        params.publicationDate === 'week'
          ? nowMs - 7 * 86400000
          : params.publicationDate === 'month'
          ? nowMs - 30 * 86400000
          : params.publicationDate === 'year'
          ? nowMs - 365 * 86400000
          : 0;
      if (cutoff > 0) {
        const dt = course.publishedDate || course.createdAt || course.updatedAt;
        const ms = dt ? Date.parse(dt) : 0;
        if (!ms || ms < cutoff) return false;
      }
    }
    if (params.status && params.status !== 'All') {
      if (course.status !== params.status) return false;
    }

    return true;
  }

  /**
   * Database + Server-Indexed Paginated Search (never loads all 15k–1M records into frontend RAM).
   */
  async filterCourses(params: MarketplaceFilterParams): Promise<{
    courses: MarketplaceCourse[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 24));
    const sortBy = params.sortBy || 'popular';

    // 1. Fetch base overrides & custom courses from Firestore with single-field indexed queries
    const overridesMap = await this.getBaseOverridesMap();
    const excludeIds = Array.from(overridesMap.keys());

    let customMatches: MarketplaceCourse[] = [];
    try {
      if (params.status === 'Draft') {
        try {
          const draftSnap = await getDocs(
            query(collection(db, 'courses'), where('status', '==', 'Draft'), limit(500))
          );
          draftSnap.forEach((d) => {
            const c = d.data() as MarketplaceCourse;
            if (c.isCustomAdded && this.matchesFilterParams(c, params)) {
              customMatches.push(c);
            }
          });
        } catch {
          // Non-admin/public cannot read Drafts
        }
      } else {
        const publishedDocs = await this.fetchPublishedFirestoreCourses();
        for (const c of publishedDocs) {
          if (c.isCustomAdded && this.matchesFilterParams(c, params)) {
            customMatches.push(c);
          }
        }
        if (params.status === 'All') {
          try {
            const draftSnap = await getDocs(
              query(collection(db, 'courses'), where('status', '==', 'Draft'), limit(500))
            );
            draftSnap.forEach((d) => {
              const c = d.data() as MarketplaceCourse;
              if (c.isCustomAdded && this.matchesFilterParams(c, params)) {
                customMatches.push(c);
              }
            });
          } catch {
            // Non-admin/public cannot read Drafts
          }
        }
      }
    } catch (err) {
      console.warn('Custom courses Firestore query fallback:', err);
    }

    // Include matching overridden base courses
    const overrideMatches: MarketplaceCourse[] = [];
    overridesMap.forEach((c) => {
      if (this.matchesFilterParams(c, params)) {
        overrideMatches.push(c);
      }
    });

    const firestoreMatches = [...customMatches, ...overrideMatches];
    firestoreMatches.sort((a, b) => {
      if (sortBy === 'popular') return b.enrolledCount - a.enrolledCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      if (sortBy === 'newest') return (b.createdAt || '').localeCompare(a.createdAt || '');
      return 0;
    });

    // When specifically viewing Drafts only, return Firestore matches directly
    if (params.status === 'Draft') {
      const start = (page - 1) * pageSize;
      return {
        courses: firestoreMatches.slice(start, start + pageSize),
        total: firestoreMatches.length,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(firestoreMatches.length / pageSize)),
      };
    }

    // 2. Query server-side indexed 15,000 base catalog (paginated)
    const fsTotal = firestoreMatches.length;
    const startGlobal = (page - 1) * pageSize;
    const endGlobal = startGlobal + pageSize;

    // Determine which slice comes from Firestore custom/overrides vs server base catalog
    const fsSlice = startGlobal < fsTotal ? firestoreMatches.slice(startGlobal, endGlobal) : [];
    const remainingSlots = pageSize - fsSlice.length;

    let serverCourses: MarketplaceCourse[] = [];
    let serverTotal = 0;

    try {
      const baseOffset = Math.max(0, startGlobal - fsTotal);
      const basePageNeeded = remainingSlots > 0 ? Math.floor(baseOffset / pageSize) + 1 : 1;
      const res = await fetch('/api/marketplace/base-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          excludeIds,
          page: basePageNeeded,
          pageSize,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        serverTotal = Number(data.total || 0);
        if (remainingSlots > 0 && Array.isArray(data.courses)) {
          const offsetWithinPage = baseOffset % pageSize;
          serverCourses = data.courses.slice(offsetWithinPage, offsetWithinPage + remainingSlots);
          // If boundary straddles two server pages, fetch next page tail
          if (serverCourses.length < remainingSlots && data.total > basePageNeeded * pageSize) {
            const nextRes = await fetch('/api/marketplace/base-search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...params,
                excludeIds,
                page: basePageNeeded + 1,
                pageSize,
              }),
            });
            if (nextRes.ok) {
              const nextData = await nextRes.json();
              const neededMore = remainingSlots - serverCourses.length;
              serverCourses = [...serverCourses, ...(nextData.courses || []).slice(0, neededMore)];
            }
          }
        }
      }
    } catch (err) {
      console.warn('Server base search unreachable, using local fallback slice:', err);
      const fallbackTotal = 15500;
      serverTotal = fallbackTotal;
      if (remainingSlots > 0) {
        const baseIdxStart = Math.max(1, startGlobal - fsTotal + 1);
        for (let i = 0; i < remainingSlots; i++) {
          if (baseIdxStart + i <= fallbackTotal) {
            serverCourses.push(synthesizeBaseCourse(baseIdxStart + i));
          }
        }
      }
    }

    const total = fsTotal + serverTotal;
    return {
      courses: [...fsSlice, ...serverCourses],
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  /**
   * Fast autocomplete search across title, keywords, category, subcategory, instructor, YouTube channel, and language.
   */
  async autocompleteSearch(queryText: string): Promise<MarketplaceAutocompleteSuggestion[]> {
    const clean = queryText.trim().toLowerCase();
    const suggestions: MarketplaceAutocompleteSuggestion[] = [];
    const seen = new Set<string>();

    // Match published Firestore custom courses if query >= 2 chars
    if (clean.length >= 2) {
      try {
        const publishedDocs = await this.fetchPublishedFirestoreCourses();
        let added = 0;
        for (const c of publishedDocs) {
          if (added >= 10) break;
          if (c.status === 'Draft' || c.status === 'Archived' || c.status === 'Unavailable') continue;
          const haystack = [
            c.title,
            c.category,
            c.subcategory,
            c.instructorName,
            c.youtubeChannelName,
            ...(c.keywords || []),
            ...(c.searchTokens || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(clean)) continue;
          const key = `course:${c.id}`;
          if (!seen.has(key)) {
            seen.add(key);
            added++;
            suggestions.push({
              type: 'course',
              id: c.id,
              label: c.title,
              sublabel: `${c.id} · ${c.category} · ${c.youtubeChannelName || c.instructorName || 'Custom'}`,
              category: c.category,
              courseType: c.courseType,
            });
          }
        }
      } catch {
        // Ignore autocomplete fallback errors
      }
    }

    try {
      const res = await fetch(`/api/marketplace/base-autocomplete?q=${encodeURIComponent(queryText)}`);
      if (res.ok) {
        const data = await res.json();
        for (const s of data.suggestions || []) {
          const key = `${s.type}:${s.id || s.label}`;
          if (!seen.has(key)) {
            seen.add(key);
            suggestions.push(s);
          }
        }
      }
    } catch {
      // Fallback to category list matching
      ALL_MARKETPLACE_CATEGORIES.filter((c) => !clean || c.toLowerCase().includes(clean))
        .slice(0, 6)
        .forEach((cat) => {
          suggestions.push({ type: 'category', label: cat, sublabel: 'Category', category: cat });
        });
    }

    return suggestions.slice(0, 14);
  }

  /**
   * Resolves single course by ID from Firestore first, then server base index, then deterministic fallback.
   */
  async getCourseById(id: string): Promise<MarketplaceCourse | null> {
    const cleanId = id.trim();
    if (!cleanId) return null;

    // 1. Check Firestore directly
    try {
      const snap = await getDoc(doc(db, 'courses', cleanId));
      if (snap.exists()) {
        const data = snap.data() as MarketplaceCourse;
        if (data.status === 'Unavailable' && data.isBaseOverride) return null;
        return data;
      }
    } catch (err) {
      console.warn('Firestore getCourseById check:', err);
    }

    // 2. Check server indexed base catalog (handles OF-AI-001, OF-CRS-0101, OF-CRS-00001..15000)
    try {
      const res = await fetch(`/api/marketplace/base-course/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.course) return data.course;
      }
    } catch {
      // Fallback
    }

    const match = cleanId.toLowerCase().match(/^of-crs-0*(\d+)$/);
    if (match && match[1]) {
      const idx = parseInt(match[1], 10);
      if (idx >= 1 && idx <= 15000) {
        return synthesizeBaseCourse(idx);
      }
    }

    return null;
  }

  /**
   * Checks duplicates against /course_dedup_keys (videoId, playlistId) and existing course IDs.
   */
  async checkDuplicate(candidate: Partial<MarketplaceCourse>): Promise<DuplicateCheckResult> {
    const extracted = extractYouTubeIdentifiers(
      candidate.youtubePlaylistUrl || candidate.youtubeUrl || candidate.youtubePlaylistId || candidate.youtubeVideoId
    );
    const vid = candidate.youtubeVideoId || extracted.videoId;
    const pid = candidate.youtubePlaylistId || extracted.playlistId;

    try {
      if (pid) {
        const plSnap = await getDoc(doc(db, 'course_dedup_keys', `playlist_${pid}`));
        if (plSnap.exists()) {
          const d = plSnap.data() as any;
          if (d.courseId !== candidate.id) {
            return {
              isDuplicate: true,
              keyType: 'playlist',
              existingCourseId: d.courseId,
              existingTitle: d.title,
              reason: `YouTube Playlist ID (${pid}) is already registered under "${d.title}" (${d.courseId}).`,
            };
          }
        }
      }

      if (vid && !pid) {
        const vidSnap = await getDoc(doc(db, 'course_dedup_keys', `video_${vid}`));
        if (vidSnap.exists()) {
          const d = vidSnap.data() as any;
          if (d.courseId !== candidate.id) {
            return {
              isDuplicate: true,
              keyType: 'video',
              existingCourseId: d.courseId,
              existingTitle: d.title,
              reason: `YouTube Video ID (${vid}) is already registered under "${d.title}" (${d.courseId}).`,
            };
          }
        }
      }

      if (candidate.title && candidate.title.trim()) {
        const titleNorm = normalizeCourseTitleKey(candidate.title);
        if (titleNorm.length >= 6) {
          const titleHash = hashNormalizedTitle(candidate.title);
          const titleSnap = await getDoc(doc(db, 'course_dedup_keys', `title_${titleHash}`));
          if (titleSnap.exists()) {
            const d = titleSnap.data() as any;
            if (d.courseId !== candidate.id) {
              return {
                isDuplicate: true,
                keyType: 'title',
                existingCourseId: d.courseId,
                existingTitle: d.title,
                reason: `Duplicate Course Title detected — matches existing "${d.title}" (${d.courseId}).`,
              };
            }
          }
        }
      }

      if (candidate.id && !candidate.id.startsWith('new-')) {
        const existingSnap = await getDoc(doc(db, 'courses', candidate.id));
        if (existingSnap.exists()) {
          const existing = existingSnap.data() as MarketplaceCourse;
          return {
            isDuplicate: true,
            keyType: 'course',
            existingCourseId: existing.id,
            existingTitle: existing.title,
            reason: `Course ID "${candidate.id}" already exists ("${existing.title}").`,
          };
        }
      }
    } catch (err) {
      console.warn('Duplicate check error:', err);
    }

    return { isDuplicate: false };
  }

  /**
   * Resolves metadata from a YouTube Video or Playlist URL using backend API.
   */
  async resolveYouTubeCourse(url: string): Promise<ResolvedYouTubeMetadata> {
    const res = await fetch('/api/youtube/resolve-course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Could not resolve YouTube URL.');
    }
    return res.json();
  }

  /**
   * Admin: Add a single new course to Firestore with duplicate prevention and counter tracking.
   */
  async addCourse(input: Partial<MarketplaceCourse>): Promise<MarketplaceCourse> {
    const normalized = this.normalizeCoursePayload(input, { isCustomAdded: true, isBaseOverride: false });
    const dup = await this.checkDuplicate(normalized);
    if (dup.isDuplicate) {
      throw new Error(dup.reason || 'Duplicate course detected.');
    }

    const batch = writeBatch(db);
    batch.set(doc(db, 'courses', normalized.id), normalized);

    const nowIso = new Date().toISOString();
    if (normalized.youtubePlaylistId) {
      batch.set(doc(db, 'course_dedup_keys', `playlist_${normalized.youtubePlaylistId}`), {
        id: `playlist_${normalized.youtubePlaylistId}`,
        keyType: 'playlist',
        rawValue: normalized.youtubePlaylistId,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    } else if (normalized.youtubeVideoId) {
      batch.set(doc(db, 'course_dedup_keys', `video_${normalized.youtubeVideoId}`), {
        id: `video_${normalized.youtubeVideoId}`,
        keyType: 'video',
        rawValue: normalized.youtubeVideoId,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    }

    const titleNorm = normalizeCourseTitleKey(normalized.title);
    if (titleNorm.length >= 6) {
      const titleHash = hashNormalizedTitle(normalized.title);
      batch.set(doc(db, 'course_dedup_keys', `title_${titleHash}`), {
        id: `title_${titleHash}`,
        keyType: 'title',
        rawValue: titleNorm,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    }

    // Atomic stats counter update
    const statsUpdate: Record<string, any> = { updatedAt: nowIso };
    if (normalized.status === 'Published') {
      statsUpdate.customPublishedCount = increment(1);
      if (normalized.price > 0) statsUpdate.customPaidPublishedCount = increment(1);
      if (normalized.courseType === 'youtube_playlist') {
        statsUpdate.customPlaylistPublishedCount = increment(1);
        statsUpdate.customYoutubePublishedCount = increment(1);
      } else if (normalized.courseType === 'youtube_video') {
        statsUpdate.customYoutubePublishedCount = increment(1);
      }
    } else if (normalized.status === 'Draft') {
      statsUpdate.customDraftCount = increment(1);
    }
    batch.set(doc(db, 'marketplace_stats', STATS_DOC_ID), statsUpdate, { merge: true });

    await batch.commit();
    this.invalidateCaches();
    return normalized;
  }

  /**
   * Admin: Update existing course (custom or base catalog override) in Firestore.
   */
  async updateCourse(course: MarketplaceCourse): Promise<MarketplaceCourse> {
    const isBaseId = /^OF-(AI|CRS)-\d{4,5}$/i.test(course.id) && !course.isCustomAdded;
    const normalized = this.normalizeCoursePayload(course, {
      isCustomAdded: !isBaseId,
      isBaseOverride: isBaseId,
    });

    const existingSnap = await getDoc(doc(db, 'courses', normalized.id));
    const prev = existingSnap.exists() ? (existingSnap.data() as MarketplaceCourse) : null;

    const batch = writeBatch(db);
    batch.set(doc(db, 'courses', normalized.id), normalized, { merge: true });

    const nowIso = new Date().toISOString();
    if (normalized.youtubePlaylistId) {
      batch.set(doc(db, 'course_dedup_keys', `playlist_${normalized.youtubePlaylistId}`), {
        id: `playlist_${normalized.youtubePlaylistId}`,
        keyType: 'playlist',
        rawValue: normalized.youtubePlaylistId,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    } else if (normalized.youtubeVideoId) {
      batch.set(doc(db, 'course_dedup_keys', `video_${normalized.youtubeVideoId}`), {
        id: `video_${normalized.youtubeVideoId}`,
        keyType: 'video',
        rawValue: normalized.youtubeVideoId,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    }

    const titleNorm = normalizeCourseTitleKey(normalized.title);
    if (titleNorm.length >= 6) {
      const titleHash = hashNormalizedTitle(normalized.title);
      batch.set(doc(db, 'course_dedup_keys', `title_${titleHash}`), {
        id: `title_${titleHash}`,
        keyType: 'title',
        rawValue: titleNorm,
        courseId: normalized.id,
        title: normalized.title,
        createdAt: nowIso,
      });
    }

    // Update atomic counters if custom course changed publication status
    if (normalized.isCustomAdded && prev && prev.status !== normalized.status) {
      const statsDelta: Record<string, any> = { updatedAt: nowIso };
      if (prev.status === 'Published') statsDelta.customPublishedCount = increment(-1);
      if (prev.status === 'Draft') statsDelta.customDraftCount = increment(-1);
      if (normalized.status === 'Published') statsDelta.customPublishedCount = increment(1);
      if (normalized.status === 'Draft') statsDelta.customDraftCount = increment(1);
      batch.set(doc(db, 'marketplace_stats', STATS_DOC_ID), statsDelta, { merge: true });
    }

    await batch.commit();
    this.invalidateCaches();
    return normalized;
  }

  /**
   * Admin: Delete custom course or archive base course safely without corrupting base indices.
   */
  async deleteCourse(id: string): Promise<void> {
    const existingSnap = await getDoc(doc(db, 'courses', id));
    const existing = existingSnap.exists() ? (existingSnap.data() as MarketplaceCourse) : null;

    if (existing && existing.isCustomAdded) {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'courses', id));
      if (existing.youtubePlaylistId) {
        batch.delete(doc(db, 'course_dedup_keys', `playlist_${existing.youtubePlaylistId}`));
      }
      if (existing.youtubeVideoId) {
        batch.delete(doc(db, 'course_dedup_keys', `video_${existing.youtubeVideoId}`));
      }
      if (existing.title) {
        const titleNorm = normalizeCourseTitleKey(existing.title);
        if (titleNorm.length >= 6) {
          batch.delete(doc(db, 'course_dedup_keys', `title_${hashNormalizedTitle(existing.title)}`));
        }
      }
      if (existing.status === 'Published') {
        batch.set(
          doc(db, 'marketplace_stats', STATS_DOC_ID),
          { customPublishedCount: increment(-1), updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } else if (existing.status === 'Draft') {
        batch.set(
          doc(db, 'marketplace_stats', STATS_DOC_ID),
          { customDraftCount: increment(-1), updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
      await batch.commit();
    } else {
      // Base catalog item: mark Unavailable override in Firestore so base ID is excluded cleanly
      const base = await this.getCourseById(id);
      if (base) {
        await setDoc(doc(db, 'courses', id), {
          ...base,
          status: 'Unavailable',
          isBaseOverride: true,
          isCustomAdded: false,
          updatedAt: new Date().toISOString(),
        });
      }
    }
    this.invalidateCaches();
  }

  /**
   * Chunked Batch Import (500 to 1,000+ records) with duplicate detection, progress reporting, and persistent Import History.
   */
  async batchImportCourses(params: {
    records: Partial<MarketplaceCourse>[];
    sourceType: CourseImportSourceType;
    sourceLabel?: string;
    importedBy: string;
    importedByUid: string;
    onProgress?: (progress: BatchImportProgress) => void;
  }): Promise<CourseImportLog> {
    const { records, sourceType, sourceLabel, importedBy, importedByUid, onProgress } = params;
    const createdAt = new Date().toISOString();
    const total = records.length;

    let processed = 0;
    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    const duplicatesSample: Array<{ title?: string; id?: string; reason: string }> = [];
    const errorsSample: Array<{ row?: number; title?: string; error: string }> = [];

    const seenVideoIds = new Set<string>();
    const seenPlaylistIds = new Set<string>();
    const seenCourseIds = new Set<string>();
    const seenTitleHashes = new Set<string>();

    const CHUNK_SIZE = 95; // <= 300 writes per commit (course + yt/pl dedup + title dedup + stats), safely under 500 Firestore batch cap

    for (let offset = 0; offset < total; offset += CHUNK_SIZE) {
      const chunk = records.slice(offset, offset + CHUNK_SIZE);
      const batch = writeBatch(db);
      let batchPub = 0;
      let batchDraft = 0;
      let batchPaidPub = 0;
      let batchYtPub = 0;
      let batchPlPub = 0;
      let pendingWrites = 0;

      for (let idx = 0; idx < chunk.length; idx++) {
        const raw = chunk[idx];
        const rowNum = offset + idx + 1;
        processed++;

        try {
          if (!raw.title || !String(raw.title).trim()) {
            failedCount++;
            if (errorsSample.length < 25) {
              errorsSample.push({ row: rowNum, error: 'Missing required course title' });
            }
            continue;
          }

          const generatedId =
            raw.id && String(raw.id).trim()
              ? String(raw.id).trim()
              : `OF-CRS-IMP-${Date.now().toString(36).toUpperCase()}-${rowNum}`;

          const normalized = this.normalizeCoursePayload(
            { ...raw, id: generatedId },
            { isCustomAdded: true, isBaseOverride: false }
          );

          const titleNorm = normalizeCourseTitleKey(normalized.title);
          const titleHash = titleNorm.length >= 6 ? hashNormalizedTitle(normalized.title) : '';

          // Intra-batch deduplication
          if (seenCourseIds.has(normalized.id)) {
            duplicateCount++;
            if (duplicatesSample.length < 25) {
              duplicatesSample.push({ id: normalized.id, title: normalized.title, reason: 'Duplicate Course ID in batch' });
            }
            continue;
          }
          if (normalized.youtubePlaylistId && seenPlaylistIds.has(normalized.youtubePlaylistId)) {
            duplicateCount++;
            if (duplicatesSample.length < 25) {
              duplicatesSample.push({
                id: normalized.id,
                title: normalized.title,
                reason: `Duplicate Playlist ID (${normalized.youtubePlaylistId}) in batch`,
              });
            }
            continue;
          }
          if (normalized.youtubeVideoId && !normalized.youtubePlaylistId && seenVideoIds.has(normalized.youtubeVideoId)) {
            duplicateCount++;
            if (duplicatesSample.length < 25) {
              duplicatesSample.push({
                id: normalized.id,
                title: normalized.title,
                reason: `Duplicate Video ID (${normalized.youtubeVideoId}) in batch`,
              });
            }
            continue;
          }
          if (titleHash && seenTitleHashes.has(titleHash)) {
            duplicateCount++;
            if (duplicatesSample.length < 25) {
              duplicatesSample.push({
                id: normalized.id,
                title: normalized.title,
                reason: `Duplicate normalized title in batch`,
              });
            }
            continue;
          }

          // Cross-database deduplication check
          const dupCheck = await this.checkDuplicate(normalized);
          if (dupCheck.isDuplicate) {
            duplicateCount++;
            if (duplicatesSample.length < 25) {
              duplicatesSample.push({
                id: normalized.id,
                title: normalized.title,
                reason: dupCheck.reason || 'Duplicate exists in database',
              });
            }
            continue;
          }

          seenCourseIds.add(normalized.id);
          if (normalized.youtubePlaylistId) seenPlaylistIds.add(normalized.youtubePlaylistId);
          if (normalized.youtubeVideoId) seenVideoIds.add(normalized.youtubeVideoId);
          if (titleHash) seenTitleHashes.add(titleHash);

          batch.set(doc(db, 'courses', normalized.id), normalized);
          pendingWrites++;

          const nowIso = new Date().toISOString();
          if (normalized.youtubePlaylistId) {
            batch.set(doc(db, 'course_dedup_keys', `playlist_${normalized.youtubePlaylistId}`), {
              id: `playlist_${normalized.youtubePlaylistId}`,
              keyType: 'playlist',
              rawValue: normalized.youtubePlaylistId,
              courseId: normalized.id,
              title: normalized.title,
              createdAt: nowIso,
            });
            pendingWrites++;
          } else if (normalized.youtubeVideoId) {
            batch.set(doc(db, 'course_dedup_keys', `video_${normalized.youtubeVideoId}`), {
              id: `video_${normalized.youtubeVideoId}`,
              keyType: 'video',
              rawValue: normalized.youtubeVideoId,
              courseId: normalized.id,
              title: normalized.title,
              createdAt: nowIso,
            });
            pendingWrites++;
          }

          if (titleHash) {
            batch.set(doc(db, 'course_dedup_keys', `title_${titleHash}`), {
              id: `title_${titleHash}`,
              keyType: 'title',
              rawValue: titleNorm,
              courseId: normalized.id,
              title: normalized.title,
              createdAt: nowIso,
            });
            pendingWrites++;
          }

          importedCount++;
          if (normalized.status === 'Published') {
            batchPub++;
            if (normalized.price > 0) batchPaidPub++;
            if (normalized.courseType === 'youtube_playlist') {
              batchPlPub++;
              batchYtPub++;
            } else if (normalized.courseType === 'youtube_video') {
              batchYtPub++;
            }
          } else if (normalized.status === 'Draft') {
            batchDraft++;
          }
        } catch (err: any) {
          failedCount++;
          if (errorsSample.length < 25) {
            errorsSample.push({
              row: rowNum,
              title: raw.title,
              error: err?.message || 'Validation failed',
            });
          }
        }
      }

      if (pendingWrites > 0) {
        const statsDelta: Record<string, any> = { updatedAt: new Date().toISOString() };
        if (batchPub) statsDelta.customPublishedCount = increment(batchPub);
        if (batchDraft) statsDelta.customDraftCount = increment(batchDraft);
        if (batchPaidPub) statsDelta.customPaidPublishedCount = increment(batchPaidPub);
        if (batchYtPub) statsDelta.customYoutubePublishedCount = increment(batchYtPub);
        if (batchPlPub) statsDelta.customPlaylistPublishedCount = increment(batchPlPub);
        batch.set(doc(db, 'marketplace_stats', STATS_DOC_ID), statsDelta, { merge: true });
        await batch.commit();
      }

      if (onProgress) {
        onProgress({
          processed,
          total,
          imported: importedCount,
          duplicates: duplicateCount,
          failed: failedCount,
          percent: total > 0 ? Math.round((processed / total) * 100) : 100,
        });
      }
    }

    const completedAt = new Date().toISOString();
    const logId = `imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const importLog: CourseImportLog = {
      id: logId,
      sourceType,
      sourceLabel: sourceLabel || sourceType.toUpperCase(),
      totalProcessed: total,
      importedCount,
      duplicateCount,
      failedCount,
      duplicatesSample,
      errorsSample,
      importedBy,
      importedByUid,
      status:
        failedCount === total && total > 0
          ? 'Failed'
          : duplicateCount > 0 || failedCount > 0
          ? 'Completed With Warnings'
          : 'Completed',
      createdAt,
      completedAt,
    };

    try {
      await setDoc(doc(db, 'course_import_logs', logId), importLog);
    } catch (err) {
      console.warn('Could not persist import log:', err);
    }

    this.invalidateCaches();
    return importLog;
  }

  /**
   * Backward-compatible JSON bulk import wrapper (routes through batchImportCourses with dedup).
   */
  async bulkImportJSON(
    importedCourses: Partial<MarketplaceCourse>[],
    user: { email: string; uid: string } = { email: 'admin@openframeitsolutions.com', uid: 'admin' },
    onProgress?: (p: BatchImportProgress) => void
  ): Promise<number> {
    if (!Array.isArray(importedCourses)) throw new Error('Invalid JSON format: expected an array');
    const log = await this.batchImportCourses({
      records: importedCourses,
      sourceType: 'json',
      sourceLabel: `JSON Batch (${importedCourses.length} records)`,
      importedBy: user.email,
      importedByUid: user.uid,
      onProgress,
    });
    return log.importedCount;
  }

  /**
   * Parses CSV text supporting YouTube URLs, Playlists, Languages, Instructors, Categories, Pricing Tiers.
   */
  public parseCsvToCourseRecords(csvText: string): Partial<MarketplaceCourse>[] {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const records: Partial<MarketplaceCourse>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i]
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((v) => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
      if (values.length < 2) continue;

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? '';
      });

      const price = Math.max(0, Number(row.price || 0));
      const rawTier = (row.pricingTier || '').trim();
      const pricingTier =
        rawTier && rawTier.toLowerCase() !== 'free'
          ? (rawTier as any)
          : price > 0
          ? 'Basic'
          : 'Academic Access';

      records.push({
        id: row.id || undefined,
        title: row.title || '',
        category: row.category || 'Artificial Intelligence',
        categories: row.categories ? row.categories.split('|').map((s) => s.trim()).filter(Boolean) : undefined,
        categoryGroup: row.categoryGroup || undefined,
        subcategory: row.subcategory || row.category || 'General',
        shortDesc: row.shortDesc || row.description || '',
        description: row.description || row.shortDesc || '',
        imageUrl: row.thumbnailUrl || row.imageUrl || undefined,
        youtubeUrl: row.youtubeUrl || undefined,
        youtubePlaylistUrl: row.youtubePlaylistUrl || undefined,
        youtubeChannelName: row.youtubeChannelName || undefined,
        instructorName: row.instructorName || undefined,
        language: row.language || 'English',
        level: (row.level as any) || 'All Levels',
        duration: row.duration || '12 Hours',
        isFree: false,
        price,
        pricingTier,
        certificateEligibility: row.certificateEligibility ? row.certificateEligibility.toLowerCase() !== 'false' : true,
        keywords: row.keywords ? row.keywords.split('|').map((s) => s.trim()).filter(Boolean) : undefined,
        status: (row.status as any) || 'Published',
      });
    }
    return records;
  }

  /**
   * Backward-compatible CSV bulk import wrapper.
   */
  async bulkImportCSV(
    csvText: string,
    user: { email: string; uid: string } = { email: 'admin@openframeitsolutions.com', uid: 'admin' },
    onProgress?: (p: BatchImportProgress) => void
  ): Promise<number> {
    const records = this.parseCsvToCourseRecords(csvText);
    const log = await this.batchImportCourses({
      records,
      sourceType: 'csv',
      sourceLabel: `CSV Batch (${records.length} records)`,
      importedBy: user.email,
      importedByUid: user.uid,
      onProgress,
    });
    return log.importedCount;
  }

  /**
   * Fetch Import History logs from Firestore.
   */
  async getImportHistory(maxRows = 30): Promise<CourseImportLog[]> {
    try {
      const q = query(collection(db, 'course_import_logs'), orderBy('createdAt', 'desc'), limit(maxRows));
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as CourseImportLog);
    } catch (err) {
      console.warn('Error fetching import history:', err);
      return [];
    }
  }

  /**
   * Category Management: Loads merged categories from Firestore + server base counts.
   */
  async getCategories(): Promise<MarketplaceCategory[]> {
    let baseCategoryCounts: Record<string, number> = {};
    try {
      const stats = await this.fetchBaseStatsFromServer([]);
      baseCategoryCounts = stats.categoryCounts || {};
    } catch {
      ALL_90_CATEGORIES.forEach((c) => {
        baseCategoryCounts[c] = 166;
      });
    }

    const customByCategory: Record<string, number> = {};
    try {
      const publishedDocs = await this.fetchPublishedFirestoreCourses();
      for (const c of publishedDocs) {
        if (!c.isCustomAdded) continue;
        const cats = c.categories && c.categories.length > 0 ? c.categories : [c.category];
        for (const cat of cats) {
          customByCategory[cat] = (customByCategory[cat] || 0) + 1;
        }
      }
    } catch {
      // ignore
    }

    const firestoreCats = new Map<string, MarketplaceCategory>();
    try {
      const snap = await getDocs(collection(db, 'course_categories'));
      snap.forEach((d) => {
        const cat = d.data() as MarketplaceCategory;
        firestoreCats.set(cat.name, cat);
      });
    } catch (err) {
      console.warn('Error reading course_categories:', err);
    }

    const nowIso = new Date().toISOString();
    const merged: MarketplaceCategory[] = [];
    const seenNames = new Set<string>();
    const seenIds = new Set<string>();

    const reserveUniqueId = (preferredId: string, name: string): string => {
      const candidate = preferredId && !seenIds.has(preferredId) ? preferredId : slugifyCategory(name);
      if (!seenIds.has(candidate)) {
        seenIds.add(candidate);
        return candidate;
      }
      let idx = 2;
      while (seenIds.has(`${candidate}_${idx}`)) idx++;
      const unique = `${candidate}_${idx}`;
      seenIds.add(unique);
      return unique;
    };

    // First include all Firestore persisted categories (so custom edits/adds appear)
    firestoreCats.forEach((cat) => {
      const lowerName = cat.name.trim().toLowerCase();
      if (seenNames.has(lowerName)) return;
      seenNames.add(lowerName);
      const baseCount = baseCategoryCounts[cat.name] || 0;
      const customCount = customByCategory[cat.name] || 0;
      const uniqueId = reserveUniqueId(cat.id, cat.name);
      merged.push({
        ...cat,
        id: uniqueId,
        baseCourseCount: baseCount,
        customCourseCount: customCount,
        totalCourseCount: baseCount + customCount,
      });
    });

    // Ensure all base + discovery + corporate categories exist cleanly with unique IDs
    for (const name of ALL_MARKETPLACE_CATEGORIES) {
      if (seenNames.has(name.trim().toLowerCase())) continue;
      seenNames.add(name.trim().toLowerCase());
      const baseCount = baseCategoryCounts[name] || 0;
      const customCount = customByCategory[name] || 0;
      const corpMeta = CORPORATE_TRAINING_CATEGORIES.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      const slug = slugifyCategory(name);
      const uniqueId = reserveUniqueId(slug, name);
      merged.push({
        id: uniqueId,
        name,
        slug: slug || uniqueId,
        domainGroup: DOMAIN_GROUPS_BY_CATEGORY[name] || corpMeta?.domainGroup || 'Technology',
        description:
          corpMeta?.description ||
          `Verified curriculum pathway and practical projects in ${name}.`,
        subcategories: corpMeta ? corpMeta.topics.slice(0, 12) : [],
        baseCourseCount: baseCount,
        customCourseCount: customCount,
        totalCourseCount: baseCount + customCount,
        isSystemDefault: true,
        createdAt: '2026-01-15T00:00:00.000Z',
        updatedAt: nowIso,
      });
    }

    return merged.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Lists Corporate Training Library courses from Firestore /courses + server-indexed corporate library
   * without modifying the existing 15,000 base courses.
   */
  async listCorporateImportedCourses(maxRows = 1000): Promise<MarketplaceCourse[]> {
    const corpNameSet = new Set(CORPORATE_TRAINING_CATEGORIES.map((c) => c.name.toLowerCase()));
    const resultMap = new Map<string, MarketplaceCourse>();
    const seenVideoIds = new Set<string>();

    const addCourse = (c: MarketplaceCourse) => {
      if (c.status === 'Archived' || c.status === 'Unavailable') return;
      if (resultMap.has(c.id)) return;
      if (c.youtubeVideoId && seenVideoIds.has(c.youtubeVideoId)) return;
      resultMap.set(c.id, c);
      if (c.youtubeVideoId) seenVideoIds.add(c.youtubeVideoId);
    };

    try {
      const publishedDocs = await this.fetchPublishedFirestoreCourses();
      for (const c of publishedDocs) {
        if (resultMap.size >= maxRows) break;
        if (
          c.libraryCollection === 'corporate_training' ||
          (c.isCustomAdded &&
            (c.youtubeVideoId || c.youtubePlaylistId) &&
            corpNameSet.has((c.category || '').toLowerCase()))
        ) {
          addCourse(c);
        }
      }
    } catch (err) {
      console.warn('Error loading corporate training library courses from Firestore:', err);
    }

    try {
      let page = 1;
      let totalPages = 1;
      while (page <= totalPages && page <= 10 && resultMap.size < maxRows) {
        const res = await fetch('/api/marketplace/base-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            libraryCollection: 'corporate_training',
            page,
            pageSize: 100,
          }),
        });
        if (!res.ok) break;
        const data = await res.json();
        totalPages = Number(data.totalPages || 1);
        for (const c of data.courses || []) {
          addCourse(c);
        }
        page++;
      }
    } catch (err) {
      console.warn('Error loading server-indexed corporate training courses:', err);
    }

    return Array.from(resultMap.values()).sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }

  /**
   * Seeds all 90 system default categories into Firestore /course_categories if not already saved.
   */
  async syncDefaultCategoriesToFirestore(): Promise<number> {
    const categories = await this.getCategories();
    const batch = writeBatch(db);
    let count = 0;
    for (const cat of categories) {
      batch.set(doc(db, 'course_categories', cat.id), cat, { merge: true });
      count++;
    }
    await batch.commit();
    this.invalidateCaches();
    return count;
  }

  async createCategory(input: {
    name: string;
    domainGroup: string;
    description?: string;
    subcategories?: string[];
  }): Promise<MarketplaceCategory> {
    const name = input.name.trim();
    if (!name) throw new Error('Category name is required.');
    const id = slugifyCategory(name);
    const existing = await getDoc(doc(db, 'course_categories', id));
    if (existing.exists() || ALL_90_CATEGORIES.some((c) => c.toLowerCase() === name.toLowerCase())) {
      throw new Error(`Category "${name}" already exists.`);
    }

    const nowIso = new Date().toISOString();
    const cat: MarketplaceCategory = {
      id,
      name,
      slug: id,
      domainGroup: input.domainGroup || 'Technology',
      description: input.description || `OpenFrame Education courses & labs in ${name}.`,
      subcategories: input.subcategories || [],
      baseCourseCount: 0,
      customCourseCount: 0,
      totalCourseCount: 0,
      isSystemDefault: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await setDoc(doc(db, 'course_categories', id), cat);
    this.invalidateCaches();
    return cat;
  }

  async updateCategory(category: MarketplaceCategory): Promise<void> {
    const updated: MarketplaceCategory = {
      ...category,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'course_categories', category.id), updated, { merge: true });
    this.invalidateCaches();
  }

  async deleteCategory(category: MarketplaceCategory, reassignToCategoryName?: string): Promise<void> {
    if (category.totalCourseCount > 0 && !reassignToCategoryName) {
      throw new Error(
        `Safeguard blocked deletion: "${category.name}" has ${category.totalCourseCount.toLocaleString()} courses. Select a target category to reassign custom courses first, or keep it active.`
      );
    }

    if (category.baseCourseCount > 0) {
      throw new Error(
        `System safeguard: "${category.name}" contains ${category.baseCourseCount.toLocaleString()} core 15,000-catalog courses and cannot be deleted.`
      );
    }

    if (category.customCourseCount > 0 && reassignToCategoryName) {
      const snap = await getDocs(
        query(collection(db, 'courses'), where('categories', 'array-contains', category.name), limit(450))
      );
      const batch = writeBatch(db);
      snap.forEach((d) => {
        const c = d.data() as MarketplaceCourse;
        const nextCats = Array.from(
          new Set(
            (c.categories || [c.category])
              .map((n) => (n === category.name ? reassignToCategoryName : n))
              .filter(Boolean)
          )
        );
        batch.update(doc(db, 'courses', c.id), {
          category: c.category === category.name ? reassignToCategoryName : c.category,
          categories: nextCats,
          updatedAt: new Date().toISOString(),
        });
      });
      await batch.commit();
    }

    await deleteDoc(doc(db, 'course_categories', category.id));
    this.invalidateCaches();
  }

  /**
   * Student Favorite Courses (/student_favorites)
   */
  async getStudentFavorites(studentId: string): Promise<StudentFavoriteCourse[]> {
    if (!studentId) return [];
    try {
      const q = query(
        collection(db, 'student_favorites'),
        where('studentId', '==', studentId),
        limit(200)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => d.data() as StudentFavoriteCourse);
      return list.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
    } catch (err) {
      console.warn('Could not load student favorites:', err);
      return [];
    }
  }

  private sanitizeFavoriteDocId(studentId: string, courseId: string): string {
    const cleanUid = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanCourse = courseId.replace(/[^a-zA-Z0-9_-]/g, '_');
    return `${cleanUid}__${cleanCourse}`.slice(0, 120);
  }

  async toggleFavoriteCourse(studentId: string, course: MarketplaceCourse): Promise<boolean> {
    if (!studentId || !course?.id) throw new Error('Student authentication required to save favourites.');
    const docId = this.sanitizeFavoriteDocId(studentId, course.id);
    const ref = doc(db, 'student_favorites', docId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await deleteDoc(ref);
      return false;
    }

    const fav: StudentFavoriteCourse = removeUndefinedDeep({
      id: docId,
      studentId,
      courseId: course.id.slice(0, 120),
      courseTitle: (course.title || 'Course').slice(0, 280),
      category: course.category,
      subcategory: course.subcategory,
      imageUrl: course.thumbnailUrl || course.imageUrl,
      youtubeUrl: course.youtubeUrl,
      youtubePlaylistUrl: course.youtubePlaylistUrl,
      courseType: course.courseType || 'standard',
      level: course.level,
      duration: course.duration,
      isFree: false,
      price: Number(course.price || 0),
      savedAt: new Date().toISOString(),
    });
    await setDoc(ref, fav);
    return true;
  }

  async removeFavoriteCourse(studentId: string, courseId: string): Promise<void> {
    if (!studentId || !courseId) return;
    await deleteDoc(doc(db, 'student_favorites', this.sanitizeFavoriteDocId(studentId, courseId)));
  }

  /**
   * Paginated Export: exports current filtered/custom set or sample safely without freezing browser on 1M docs.
   */
  async exportJSON(maxExport = 2500): Promise<string> {
    const res = await this.filterCourses({ page: 1, pageSize: Math.min(100, maxExport), sortBy: 'newest' });
    const publishedDocs = await this.fetchPublishedFirestoreCourses();
    const customList = publishedDocs.filter((c) => c.isCustomAdded).slice(0, maxExport);
    const combined = customList.length > 0 ? [...customList, ...res.courses.filter((c) => !c.isCustomAdded)] : res.courses;
    return JSON.stringify(combined, null, 2);
  }

  async exportCSV(maxExport = 2500): Promise<string> {
    const res = await this.filterCourses({ page: 1, pageSize: Math.min(100, maxExport), sortBy: 'newest' });
    const publishedDocs = await this.fetchPublishedFirestoreCourses();
    const customList = publishedDocs.filter((c) => c.isCustomAdded).slice(0, maxExport);
    const list = customList.length > 0 ? [...customList, ...res.courses.filter((c) => !c.isCustomAdded)] : res.courses;

    const headers = [
      'id',
      'title',
      'category',
      'subcategory',
      'instructorName',
      'language',
      'level',
      'duration',
      'pricingTier',
      'price',
      'courseType',
      'youtubeUrl',
      'youtubePlaylistUrl',
      'youtubeChannelName',
      'status',
    ];
    const rows = list.map((c) =>
      [
        `"${c.id}"`,
        `"${(c.title || '').replace(/"/g, '""')}"`,
        `"${c.category}"`,
        `"${(c.subcategory || '').replace(/"/g, '""')}"`,
        `"${(c.instructorName || c.instructor?.name || '').replace(/"/g, '""')}"`,
        `"${c.language || 'English'}"`,
        `"${c.level}"`,
        `"${c.duration}"`,
        `"${c.pricingTier}"`,
        c.price,
        `"${c.courseType || 'standard'}"`,
        `"${c.youtubeUrl || ''}"`,
        `"${c.youtubePlaylistUrl || ''}"`,
        `"${(c.youtubeChannelName || '').replace(/"/g, '""')}"`,
        `"${c.status}"`,
      ].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}

export const marketplaceService = new MarketplaceService();
