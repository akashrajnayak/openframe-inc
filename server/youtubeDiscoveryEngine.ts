import {
  DISCOVERY_COURSE_MODIFIERS,
  DISCOVERY_EDUCATION_FIELDS,
  DISCOVERY_LANGUAGES,
  detectEmergingSubjectsFromText,
  getDomainGroupForField,
} from '../src/data/discoveryTaxonomy';
import {
  getCorporateCategoryByName,
  inferCorporateContentType,
} from '../src/data/corporateTrainingTaxonomy';
import type {
  CourseContentType,
  DiscoveredCourse,
  DiscoveryJobState,
  DiscoveryQuotaStatus,
  MarketplaceCourseType,
} from '../src/types';

const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';
const DAILY_QUOTA_SAFETY_LIMIT = 9800; // Default YouTube Data API v3 daily project quota = 10,000 units

function getYouTubeApiKey(): string | null {
  const key = (process.env.YOUTUBE_API_KEY || '').trim();
  if (!key || key === 'MY_YOUTUBE_API_KEY') return null;
  return key;
}

export function normalizeCourseTitleForDedup(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

/**
 * Parses ISO 8601 duration (e.g. PT2H14M30S) into human label and exact minutes.
 */
export function parseIsoDuration(iso?: string): { label: string; minutes: number; hours: number } {
  if (!iso) return { label: 'N/A', minutes: 0, hours: 0 };
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!match) return { label: iso, minutes: 0, hours: 0 };
  const h = Number(match[1] || 0);
  const m = Number(match[2] || 0);
  const s = Number(match[3] || 0);
  const totalMinutes = Math.max(1, Math.round(h * 60 + m + s / 60));
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (h === 0 && m === 0 && s > 0) parts.push(`${s}s`);
  return {
    label: parts.length > 0 ? parts.join(' ') : '1m',
    minutes: totalMinutes,
    hours: Number((totalMinutes / 60).toFixed(2)),
  };
}

function detectReliableLanguage(
  title: string,
  description: string,
  apiLang?: string,
  requestedLanguage?: string
): string {
  const combined = `${title} ${description}`;
  if (/[\u0C80-\u0CFF]/.test(combined)) return 'Kannada';
  if (/[\u0B80-\u0BFF]/.test(combined)) return 'Tamil';
  if (/[\u0C00-\u0C7F]/.test(combined)) return 'Telugu';
  if (/[\u0900-\u097F]/.test(combined)) return 'Hindi';
  if (/[\u0980-\u09FF]/.test(combined)) return 'Bengali';

  const langMap: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    kn: 'Kannada',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
    bn: 'Bengali',
    es: 'Spanish',
    fr: 'French',
  };

  if (apiLang) {
    const shortCode = apiLang.toLowerCase().split(/[-_]/)[0];
    if (langMap[shortCode]) return langMap[shortCode];
  }

  const lower = combined.toLowerCase();
  for (const opt of DISCOVERY_LANGUAGES) {
    if (opt.label !== 'English' && lower.includes(opt.label.toLowerCase())) {
      return opt.label;
    }
  }

  return requestedLanguage || 'English';
}

function detectDifficultyLevel(title: string, description: string, queryModifier?: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' {
  const text = `${title} ${description} ${queryModifier || ''}`.toLowerCase();
  if (/\b(advanced|masterclass|expert|architect|deep dive|production|phd)\b/.test(text)) {
    return 'Advanced';
  }
  if (/\b(intermediate|practical|project-based|bootcamp|applied)\b/.test(text)) {
    return 'Intermediate';
  }
  if (/\b(beginner|basics|from scratch|introduction|intro|101|for beginners)\b/.test(text)) {
    return 'Beginner';
  }
  return 'All Levels';
}

function extractObjectivesFromDescription(description: string, title: string, category: string): string[] {
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim().replace(/^[-•*▶✓\d.)]+\s*/, ''))
    .filter((l) => l.length >= 18 && l.length <= 160 && !l.startsWith('http'));

  if (lines.length >= 2) {
    return lines.slice(0, 4);
  }
  return [
    `Study structured concepts in ${category} through "${title.slice(0, 80)}"`,
    `Verify practical comprehension against authentic OpenFrame learning outcomes`,
  ];
}

function verifyExplicitCertificateClaim(description: string): boolean {
  const lower = description.toLowerCase();
  return (
    (lower.includes('free certificate') ||
      lower.includes('certificate of completion') ||
      lower.includes('verified certificate')) &&
    !lower.includes('no certificate')
  );
}

interface QuotaLedgerState {
  dateKey: string;
  unitsUsedToday: number;
  searchCallsToday: number;
  detailCallsToday: number;
  cachedHitsToday: number;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}

class YouTubeDiscoveryEngine {
  private quota: QuotaLedgerState = {
    dateKey: new Date().toISOString().slice(0, 10),
    unitsUsedToday: 0,
    searchCallsToday: 0,
    detailCallsToday: 0,
    cachedHitsToday: 0,
  };

  private searchCache = new Map<string, { ts: number; data: any }>();
  private knownVideoIds = new Set<string>();
  private knownPlaylistIds = new Set<string>();
  private knownNormalizedTitles = new Set<string>();
  private activeReferer: string | undefined = (process.env.APP_URL || '').trim() || undefined;

  private activeJob: DiscoveryJobState | null = null;
  private jobCandidates: DiscoveredCourse[] = [];

  public setRequestReferer(referer?: string) {
    const clean = (referer || '').trim();
    if (clean && /^https?:\/\//i.test(clean)) {
      this.activeReferer = clean;
    }
  }

  public seedKnownDeduplicationSet(params: {
    videoIds?: string[];
    playlistIds?: string[];
    titles?: string[];
  }) {
    params.videoIds?.forEach((v) => v && this.knownVideoIds.add(v.trim()));
    params.playlistIds?.forEach((p) => p && this.knownPlaylistIds.add(p.trim()));
    params.titles?.forEach((t) => {
      const norm = normalizeCourseTitleForDedup(t);
      if (norm) this.knownNormalizedTitles.add(norm);
    });
  }

  private resetQuotaIfNewDay() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.quota.dateKey !== today) {
      this.quota = {
        dateKey: today,
        unitsUsedToday: 0,
        searchCallsToday: 0,
        detailCallsToday: 0,
        cachedHitsToday: 0,
      };
    }
  }

  public getQuotaStatus(): DiscoveryQuotaStatus {
    this.resetQuotaIfNewDay();
    return {
      apiKeyConfigured: Boolean(getYouTubeApiKey()),
      dateKey: this.quota.dateKey,
      unitsUsedToday: this.quota.unitsUsedToday,
      dailyLimit: 10000,
      remainingUnits: Math.max(0, 10000 - this.quota.unitsUsedToday),
      searchCallsToday: this.quota.searchCallsToday,
      detailCallsToday: this.quota.detailCallsToday,
      cachedHitsToday: this.quota.cachedHitsToday,
      lastErrorCode: this.quota.lastErrorCode,
      lastErrorMessage: this.quota.lastErrorMessage,
    };
  }

  public getJobState(): { job: DiscoveryJobState | null; candidates: DiscoveredCourse[] } {
    return {
      job: this.activeJob,
      candidates: this.jobCandidates,
    };
  }

  private async callYouTubeEndpoint(
    endpoint: 'search' | 'videos' | 'playlists' | 'playlistItems' | 'channels',
    params: Record<string, string | number | undefined>,
    unitCost: number
  ): Promise<any> {
    this.resetQuotaIfNewDay();
    const apiKey = getYouTubeApiKey();
    if (!apiKey) {
      const msg =
        'Missing YOUTUBE_API_KEY: Configure the official YouTube Data API v3 key in server environment secrets before running live discovery.';
      this.quota.lastErrorCode = 'MISSING_API_KEY';
      this.quota.lastErrorMessage = msg;
      const err: any = new Error(msg);
      err.code = 'MISSING_API_KEY';
      throw err;
    }

    if (this.quota.unitsUsedToday + unitCost > DAILY_QUOTA_SAFETY_LIMIT) {
      const msg = `Daily YouTube Data API v3 quota safety limit reached (${this.quota.unitsUsedToday} / 10,000 units used today). Resume after quota resets at midnight Pacific Time.`;
      this.quota.lastErrorCode = 'QUOTA_LIMIT_GUARD';
      this.quota.lastErrorMessage = msg;
      const err: any = new Error(msg);
      err.code = 'QUOTA_LIMIT_GUARD';
      throw err;
    }

    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    }
    const cacheKey = `${endpoint}:${qs.toString()}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 15 * 60 * 1000) {
      this.quota.cachedHitsToday++;
      return cached.data;
    }

    qs.set('key', apiKey);
    const url = `${YT_API_BASE}/${endpoint}?${qs.toString()}`;
    const headers: Record<string, string> = {};
    if (this.activeReferer) {
      headers['Referer'] = this.activeReferer;
    }

    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });

        if (res.ok) {
          this.quota.unitsUsedToday += unitCost;
          if (endpoint === 'search') this.quota.searchCallsToday++;
          else this.quota.detailCallsToday++;

          const json = await res.json();
          this.quota.lastErrorCode = undefined;
          this.quota.lastErrorMessage = undefined;
          this.searchCache.set(cacheKey, { ts: Date.now(), data: json });
          if (this.searchCache.size > 400) {
            const firstKey = this.searchCache.keys().next().value;
            if (firstKey) this.searchCache.delete(firstKey);
          }
          return json;
        }

        const errBody: any = await res.json().catch(() => ({}));
        const reason = errBody?.error?.errors?.[0]?.reason || '';
        const message = errBody?.error?.message || `YouTube Data API v3 HTTP ${res.status}`;

        if (res.status === 403 && (reason.includes('quota') || message.toLowerCase().includes('quota'))) {
          this.quota.lastErrorCode = 'QUOTA_EXCEEDED';
          this.quota.lastErrorMessage = message;
          const e: any = new Error(message);
          e.code = 'QUOTA_EXCEEDED';
          throw e;
        }

        if (
          res.status === 403 &&
          (message.toLowerCase().includes('referer') ||
            reason === 'ipRefererBlocked' ||
            reason === 'forbidden')
        ) {
          const hint = `${message}. The configured YOUTUBE_API_KEY has HTTP Referrer restrictions in Google Cloud Console that block server-side API calls. Either set Application Restrictions to "None" or "IP addresses" (or allow the app URL referrer) for server-side YouTube Data API v3 requests.`;
          this.quota.lastErrorCode = 'API_KEY_REFERRER_BLOCKED';
          this.quota.lastErrorMessage = hint;
          const e: any = new Error(hint);
          e.code = 'API_KEY_REFERRER_BLOCKED';
          throw e;
        }

        if (res.status === 403 && reason === 'accessNotConfigured') {
          this.quota.lastErrorCode = 'YOUTUBE_API_DISABLED';
          this.quota.lastErrorMessage = message;
          const e: any = new Error(message);
          e.code = 'YOUTUBE_API_DISABLED';
          throw e;
        }

        if (res.status === 400 || res.status === 401 || reason === 'keyInvalid') {
          this.quota.lastErrorCode = 'INVALID_API_KEY';
          this.quota.lastErrorMessage = message;
          const e: any = new Error(message);
          e.code = 'INVALID_API_KEY';
          throw e;
        }

        lastError = new Error(message);
        if (res.status === 429 || res.status >= 500) {
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
          continue;
        }
        throw lastError;
      } catch (err: any) {
        if (
          err.code === 'QUOTA_EXCEEDED' ||
          err.code === 'INVALID_API_KEY' ||
          err.code === 'MISSING_API_KEY' ||
          err.code === 'API_KEY_REFERRER_BLOCKED' ||
          err.code === 'YOUTUBE_API_DISABLED'
        ) {
          throw err;
        }
        lastError = err;
        await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
      }
    }

    this.quota.lastErrorCode = 'YOUTUBE_NETWORK_ERROR';
    this.quota.lastErrorMessage = lastError?.message || 'YouTube API request failed after retries.';
    throw lastError;
  }

  private async searchPublicYouTubeFallback(query: string, maxResults = 25): Promise<any[]> {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Cookie: 'CONSENT=YES+cb.20210328-17-p0.en+FX+999; PREF=hl=en&gl=US',
        },
      });
      if (!res.ok) return [];
      const html = await res.text();
      const match = html.match(/var ytInitialData = (\{.+?\});<\/script>/);
      if (!match) return [];
      const data: any = JSON.parse(match[1]);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const rawItems: any[] = [];
      for (const sec of contents) {
        const items = sec?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId || !/^[a-zA-Z0-9_-]{11}$/.test(v.videoId)) continue;
          const title = (v.title?.runs || []).map((r: any) => r.text).join('').trim();
          const channelTitle = (v.ownerText?.runs?.[0]?.text || '').trim() || 'OpenFrame Partner Channel';
          const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || undefined;
          const durText = (v.lengthText?.simpleText || '').trim();
          if (!title || !durText || durText.toUpperCase() === 'LIVE') continue;
          const parts = durText.split(':').map((p: string) => parseInt(p, 10));
          const mins = parts.some((n: number) => Number.isNaN(n))
            ? 15
            : parts.length === 3
            ? Math.max(1, parts[0] * 60 + parts[1] + Math.round(parts[2] / 60))
            : parts.length === 2
            ? Math.max(1, parts[0] + Math.round(parts[1] / 60))
            : 10;
          if (mins < 2) continue;
          const isoDur = `PT${Math.floor(mins / 60) > 0 ? `${Math.floor(mins / 60)}H` : ''}${mins % 60}M`;
          rawItems.push({
            id: { videoId: v.videoId },
            snippet: {
              title,
              description: (v.detailedMetadataSnippets?.[0]?.snippetText?.runs || []).map((r: any) => r.text).join('') || title,
              channelId,
              channelTitle,
              thumbnails: {
                high: { url: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` },
              },
            },
            __fallbackDetail: {
              id: v.videoId,
              snippet: {
                title,
                description: title,
                channelId,
                channelTitle,
                thumbnails: { high: { url: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` } },
              },
              contentDetails: { duration: isoDur },
              status: { embeddable: true, privacyStatus: 'public' },
            },
          });
          if (rawItems.length >= maxResults) return rawItems;
        }
      }
      return rawItems;
    } catch {
      return [];
    }
  }

  /**
   * Executes one real search page against YouTube Data API v3 (with automatic real public YouTube + oEmbed fallback if API key is HTTP-referrer blocked) and hydrates metadata.
   */
  public async discoverPage(params: {
    query: string;
    category: string;
    topic?: string;
    libraryCollection?: 'standard' | 'corporate_training';
    languageLabel?: string;
    languageCode?: string;
    searchType?: 'video' | 'playlist' | 'channel';
    pageToken?: string;
    videoDuration?: 'any' | 'short' | 'medium' | 'long';
    publishedAfter?: string;
    maxResults?: number;
    jobId?: string;
    modifier?: string;
    extraKnownVideoIds?: string[];
    extraKnownPlaylistIds?: string[];
  }): Promise<{
    items: DiscoveredCourse[];
    nextPageToken?: string;
    totalResults?: number;
    duplicatesSkipped: number;
  }> {
    if (params.extraKnownVideoIds?.length || params.extraKnownPlaylistIds?.length) {
      this.seedKnownDeduplicationSet({
        videoIds: params.extraKnownVideoIds,
        playlistIds: params.extraKnownPlaylistIds,
      });
    }

    const searchType = params.searchType || 'video';
    const maxResults = Math.min(50, Math.max(5, Number(params.maxResults || 25)));
    const langCode =
      params.languageCode ||
      DISCOVERY_LANGUAGES.find((l) => l.label === params.languageLabel)?.isoCode;

    let searchJson: any = null;
    let usedPublicFallback = false;
    try {
      searchJson = await this.callYouTubeEndpoint(
        'search',
        {
          part: 'snippet',
          q: params.query,
          type: searchType,
          maxResults,
          pageToken: params.pageToken,
          relevanceLanguage: langCode,
          safeSearch: 'strict',
          videoEmbeddable: searchType === 'video' ? 'true' : undefined,
          videoDuration:
            searchType === 'video' && params.videoDuration && params.videoDuration !== 'any'
              ? params.videoDuration
              : undefined,
          publishedAfter: params.publishedAfter,
        },
        100
      );
    } catch (err: any) {
      if (
        searchType === 'video' &&
        (err?.code === 'API_KEY_REFERRER_BLOCKED' || err?.code === 'MISSING_API_KEY' || err?.code === 'YOUTUBE_API_DISABLED')
      ) {
        usedPublicFallback = true;
        const fallbackItems = await this.searchPublicYouTubeFallback(params.query, maxResults);
        searchJson = { items: fallbackItems, pageInfo: { totalResults: fallbackItems.length } };
      } else {
        throw err;
      }
    }

    const rawItems: any[] = Array.isArray(searchJson?.items) ? searchJson.items : [];
    const videoIds = rawItems
      .map((i) => i?.id?.videoId)
      .filter((v): v is string => Boolean(v));
    const playlistIds = rawItems
      .map((i) => i?.id?.playlistId)
      .filter((p): p is string => Boolean(p));
    const channelIdsFromSearch = rawItems
      .map((i) => i?.id?.channelId || i?.snippet?.channelId)
      .filter((c): c is string => Boolean(c));

    // Hydrate video details in a single 1-unit batch call (50 IDs/call), or use fallback details
    const videoDetailsMap = new Map<string, any>();
    if (usedPublicFallback) {
      for (const item of rawItems) {
        if (item?.id?.videoId && item.__fallbackDetail) {
          videoDetailsMap.set(item.id.videoId, item.__fallbackDetail);
        }
      }
    } else if (videoIds.length > 0) {
      const vidJson = await this.callYouTubeEndpoint(
        'videos',
        {
          part: 'snippet,contentDetails,status,statistics',
          id: Array.from(new Set(videoIds)).slice(0, 50).join(','),
        },
        1
      );
      for (const v of vidJson?.items || []) {
        videoDetailsMap.set(v.id, v);
      }
    }

    // Batch fetch channel thumbnails (1 unit per batch)
    const channelThumbnailMap = new Map<string, string>();
    if (!usedPublicFallback && channelIdsFromSearch.length > 0) {
      try {
        const chThumbJson = await this.callYouTubeEndpoint(
          'channels',
          {
            part: 'snippet',
            id: Array.from(new Set(channelIdsFromSearch)).slice(0, 50).join(','),
          },
          1
        );
        for (const ch of chThumbJson?.items || []) {
          const thumbUrl =
            ch?.snippet?.thumbnails?.default?.url ||
            ch?.snippet?.thumbnails?.medium?.url ||
            ch?.snippet?.thumbnails?.high?.url;
          if (ch.id && thumbUrl) channelThumbnailMap.set(ch.id, thumbUrl);
        }
      } catch {
        // Optional channel avatar enrichment; continue if quota or partial failure occurs
      }
    }

    // Hydrate playlist details in a single 1-unit batch call
    const playlistDetailsMap = new Map<string, any>();
    if (playlistIds.length > 0) {
      const plJson = await this.callYouTubeEndpoint(
        'playlists',
        {
          part: 'snippet,contentDetails,status',
          id: Array.from(new Set(playlistIds)).slice(0, 50).join(','),
        },
        1
      );
      for (const p of plJson?.items || []) {
        playlistDetailsMap.set(p.id, p);
      }
    }

    // For discovered channels, fetch their uploads/playlists
    let extraChannelItems: any[] = [];
    if (searchType === 'channel' && channelIdsFromSearch.length > 0) {
      const chJson = await this.callYouTubeEndpoint(
        'channels',
        {
          part: 'snippet,contentDetails,statistics',
          id: Array.from(new Set(channelIdsFromSearch)).slice(0, 20).join(','),
        },
        1
      );
      extraChannelItems = Array.isArray(chJson?.items) ? chJson.items : [];
    }

    const discovered: DiscoveredCourse[] = [];
    let duplicatesSkipped = 0;
    const nowIso = new Date().toISOString();
    const fieldDef = DISCOVERY_EDUCATION_FIELDS.find(
      (f) => f.name.toLowerCase() === params.category.toLowerCase()
    );
    const corpDef = getCorporateCategoryByName(params.category);
    const subcategory =
      params.topic ||
      corpDef?.topics?.[0] ||
      fieldDef?.subcategories?.[0] ||
      `${params.category} Core`;
    const categoryGroup =
      corpDef?.domainGroup || getDomainGroupForField(params.category);

    for (const raw of rawItems) {
      const videoId: string | undefined = raw?.id?.videoId;
      const playlistId: string | undefined = raw?.id?.playlistId;
      const channelId: string | undefined = raw?.id?.channelId || raw?.snippet?.channelId;

      if (searchType === 'channel' && raw?.id?.channelId && !videoId && !playlistId) {
        // Hydrate upload playlist from channel contentDetails so channels become real playable courses
        const ch = extraChannelItems.find((c) => c.id === raw.id.channelId);
        const uploadsPlaylistId = ch?.contentDetails?.relatedPlaylists?.uploads;
        if (!uploadsPlaylistId) continue;

        const title = `${ch.snippet?.title || raw.snippet?.title} — Educational Channel Series`;
        const normTitle = normalizeCourseTitleForDedup(title);
        if (this.knownPlaylistIds.has(uploadsPlaylistId) || this.knownNormalizedTitles.has(normTitle)) {
          duplicatesSkipped++;
          continue;
        }

        const desc = ch.snippet?.description || raw.snippet?.description || '';
        const thumb =
          ch.snippet?.thumbnails?.high?.url ||
          raw.snippet?.thumbnails?.high?.url ||
          raw.snippet?.thumbnails?.medium?.url ||
          '';
        const emerging = detectEmergingSubjectsFromText(`${title} ${desc}`);
        const language = detectReliableLanguage(title, desc, ch.snippet?.defaultLanguage, params.languageLabel);

        const rec: DiscoveredCourse = {
          id: `disc-pl-${uploadsPlaylistId}`,
          jobId: params.jobId || 'manual',
          title,
          description: desc || `Curated educational channel series hosted by ${ch.snippet?.title}.`,
          category: params.category,
          categories: Array.from(new Set([params.category, ...emerging])),
          subcategory,
          categoryGroup,
          youtubePlaylistId: uploadsPlaylistId,
          youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${uploadsPlaylistId}`,
          youtubeChannelId: raw.id.channelId,
          youtubeChannelName: ch.snippet?.title || raw.snippet?.channelTitle || 'YouTube Educator',
          youtubeChannelUrl: `https://www.youtube.com/channel/${raw.id.channelId}`,
          channelThumbnailUrl: channelThumbnailMap.get(raw.id.channelId) || thumb,
          thumbnailUrl: thumb,
          publishedAt: raw.snippet?.publishedAt,
          embeddable: true,
          playlistInfo: 'Channel Educational Uploads Series',
          duration: 'Channel Playlist',
          language,
          level: detectDifficultyLevel(title, desc, params.modifier),
          learningObjectives: extractObjectivesFromDescription(desc, title, params.category),
          keywords: Array.from(new Set([params.category, subcategory, language, ...emerging])),
          isFree: false,
          price: 0,
          courseType: 'youtube_playlist',
          contentType: 'Playlist',
          topic: params.topic,
          libraryCollection: params.libraryCollection,
          certificateEligibility: verifyExplicitCertificateClaim(desc),
          sourceVerificationStatus: 'Verified YouTube Resource',
          reviewStatus: 'Pending Review',
          emergingSubjects: emerging,
          searchQueryUsed: params.query,
          discoveredAt: nowIso,
          updatedAt: nowIso,
        };
        this.knownPlaylistIds.add(uploadsPlaylistId);
        this.knownNormalizedTitles.add(normTitle);
        discovered.push(rec);
        continue;
      }

      if (playlistId) {
        const pDetail = playlistDetailsMap.get(playlistId);
        if (pDetail?.status?.privacyStatus && pDetail.status.privacyStatus !== 'public') continue;

        const snippet = pDetail?.snippet || raw.snippet || {};
        const title: string = String(snippet.title || '').trim();
        if (!title) continue;

        const normTitle = normalizeCourseTitleForDedup(title);
        if (this.knownPlaylistIds.has(playlistId) || this.knownNormalizedTitles.has(normTitle)) {
          duplicatesSkipped++;
          continue;
        }

        const desc: string = String(snippet.description || '');
        const itemCount = Number(pDetail?.contentDetails?.itemCount || 0);
        const chId = snippet.channelId || channelId;
        const thumb =
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          '';
        const emerging = detectEmergingSubjectsFromText(`${title} ${desc}`);
        const language = detectReliableLanguage(title, desc, snippet.defaultLanguage, params.languageLabel);

        const rec: DiscoveredCourse = {
          id: `disc-pl-${playlistId}`,
          jobId: params.jobId || 'manual',
          title,
          description: desc || `YouTube educational playlist (${itemCount || 'multi-part'} lectures).`,
          category: params.category,
          categories: Array.from(new Set([params.category, ...emerging])),
          subcategory,
          categoryGroup,
          youtubePlaylistId: playlistId,
          youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
          youtubeChannelId: chId,
          youtubeChannelName: snippet.channelTitle || 'YouTube Educator',
          youtubeChannelUrl: chId ? `https://www.youtube.com/channel/${chId}` : undefined,
          channelThumbnailUrl: chId ? channelThumbnailMap.get(chId) : undefined,
          thumbnailUrl: thumb,
          publishedAt: snippet.publishedAt,
          embeddable: true,
          playlistInfo: itemCount > 0 ? `${itemCount} videos in playlist` : 'Multi-video YouTube playlist',
          duration: itemCount > 0 ? `${itemCount} Lessons (Playlist)` : 'Multi-Video Playlist',
          language,
          level: detectDifficultyLevel(title, desc, params.modifier),
          learningObjectives: extractObjectivesFromDescription(desc, title, params.category),
          keywords: Array.from(new Set([params.category, subcategory, language, 'Playlist', ...emerging])),
          isFree: false,
          price: 0,
          courseType: 'youtube_playlist',
          contentType: 'Playlist',
          topic: params.topic,
          libraryCollection: params.libraryCollection,
          certificateEligibility: verifyExplicitCertificateClaim(desc),
          sourceVerificationStatus: 'Verified YouTube Resource',
          reviewStatus: 'Pending Review',
          emergingSubjects: emerging,
          searchQueryUsed: params.query,
          discoveredAt: nowIso,
          updatedAt: nowIso,
        };
        this.knownPlaylistIds.add(playlistId);
        this.knownNormalizedTitles.add(normTitle);
        discovered.push(rec);
        continue;
      }

      if (videoId) {
        const vDetail = videoDetailsMap.get(videoId);
        if (vDetail?.status?.embeddable === false) continue;

        const snippet = vDetail?.snippet || raw.snippet || {};
        const title: string = String(snippet.title || '').trim();
        if (!title) continue;

        const normTitle = normalizeCourseTitleForDedup(title);
        if (this.knownVideoIds.has(videoId) || this.knownNormalizedTitles.has(normTitle)) {
          duplicatesSkipped++;
          continue;
        }

        const desc: string = String(snippet.description || '');
        const parsedDur = parseIsoDuration(vDetail?.contentDetails?.duration);
        const chId = snippet.channelId || channelId;
        const thumb =
          snippet.thumbnails?.maxres?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.medium?.url ||
          `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const emerging = detectEmergingSubjectsFromText(`${title} ${desc}`);
        const language = detectReliableLanguage(
          title,
          desc,
          snippet.defaultAudioLanguage || snippet.defaultLanguage,
          params.languageLabel
        );
        const rawViews = vDetail?.statistics?.viewCount;
        const viewCount = rawViews ? Number(rawViews) : undefined;

        const rec: DiscoveredCourse = {
          id: `disc-vid-${videoId}`,
          jobId: params.jobId || 'manual',
          title,
          description: desc || `YouTube educational course video by ${snippet.channelTitle || 'Educator'}.`,
          category: params.category,
          categories: Array.from(new Set([params.category, ...emerging])),
          subcategory,
          categoryGroup,
          youtubeVideoId: videoId,
          youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
          youtubeChannelId: chId,
          youtubeChannelName: snippet.channelTitle || 'YouTube Educator',
          youtubeChannelUrl: chId ? `https://www.youtube.com/channel/${chId}` : undefined,
          channelThumbnailUrl: chId ? channelThumbnailMap.get(chId) : undefined,
          thumbnailUrl: thumb,
          publishedAt: snippet.publishedAt || raw.snippet?.publishedAt,
          viewCount: Number.isFinite(viewCount) ? viewCount : undefined,
          embeddable: vDetail?.status?.embeddable !== false,
          duration: parsedDur.label,
          durationMinutes: parsedDur.minutes,
          estimatedHours: parsedDur.hours,
          language,
          level: detectDifficultyLevel(title, desc, params.modifier),
          learningObjectives: extractObjectivesFromDescription(desc, title, params.category),
          keywords: Array.from(
            new Set([
              params.category,
              subcategory,
              language,
              ...(Array.isArray(snippet.tags) ? snippet.tags.slice(0, 6) : []),
              ...emerging,
            ])
          ),
          isFree: false,
          price: 0,
          courseType: 'youtube_video',
          contentType: inferCorporateContentType({
            title,
            description: desc,
            durationMinutes: parsedDur.minutes,
            hasPlaylistId: false,
          }),
          topic: params.topic,
          libraryCollection: params.libraryCollection,
          certificateEligibility: verifyExplicitCertificateClaim(desc),
          sourceVerificationStatus: vDetail ? 'Verified YouTube Resource' : 'Unverified',
          reviewStatus: 'Pending Review',
          emergingSubjects: emerging,
          searchQueryUsed: params.query,
          discoveredAt: nowIso,
          updatedAt: nowIso,
        };
        this.knownVideoIds.add(videoId);
        this.knownNormalizedTitles.add(normTitle);
        discovered.push(rec);
      }
    }

    return {
      items: discovered,
      nextPageToken: searchJson?.nextPageToken,
      totalResults: searchJson?.pageInfo?.totalResults,
      duplicatesSkipped,
    };
  }

  /**
   * Starts a controlled automated discovery job across categories x modifiers x languages.
   */
  public startJob(config: {
    mode?: 'batch' | 'test_20';
    autoApproveImport?: boolean;
    selectedCategories?: string[];
    selectedLanguages?: string[];
    selectedModifiers?: string[];
    emergingKeywords?: string[];
    includeVideos?: boolean;
    includePlaylists?: boolean;
    includeChannels?: boolean;
    targetBatchLimit?: number;
  }): DiscoveryJobState {
    if (!getYouTubeApiKey()) {
      const err: any = new Error(
        'Cannot start live YouTube Course Discovery: YOUTUBE_API_KEY is not configured in server environment secrets.'
      );
      err.code = 'MISSING_API_KEY';
      throw err;
    }

    const nowIso = new Date().toISOString();
    const cats =
      config.selectedCategories && config.selectedCategories.length > 0
        ? config.selectedCategories
        : DISCOVERY_EDUCATION_FIELDS.map((f) => f.name);
    const mergedCats = Array.from(
      new Set([...cats, ...(config.emergingKeywords || []).map((k) => k.trim()).filter(Boolean)])
    );

    const job: DiscoveryJobState = {
      id: `job-${Date.now().toString(36)}`,
      status: 'running',
      mode: config.mode || 'batch',
      autoApproveImport: Boolean(config.autoApproveImport),
      selectedCategories: mergedCats,
      selectedLanguages:
        config.selectedLanguages && config.selectedLanguages.length > 0
          ? config.selectedLanguages
          : ['English'],
      selectedModifiers:
        config.selectedModifiers && config.selectedModifiers.length > 0
          ? config.selectedModifiers
          : DISCOVERY_COURSE_MODIFIERS.slice(0, 6),
      emergingKeywords: config.emergingKeywords || [],
      includeVideos: config.includeVideos !== false,
      includePlaylists: config.includePlaylists !== false,
      includeChannels: Boolean(config.includeChannels),
      targetBatchLimit: config.mode === 'test_20' ? 20 : Math.max(10, Math.min(5000, config.targetBatchLimit || 100)),
      currentCategoryIdx: 0,
      currentModifierIdx: 0,
      currentLanguageIdx: 0,
      queriesExecuted: 0,
      discoveredCount: 0,
      verifiedCount: 0,
      importedCount: 0,
      duplicateCount: 0,
      failedCount: 0,
      rejectedCount: 0,
      startedAt: nowIso,
      updatedAt: nowIso,
    };

    this.activeJob = job;
    this.jobCandidates = [];
    return job;
  }

  public pauseJob(): DiscoveryJobState | null {
    if (this.activeJob && this.activeJob.status === 'running') {
      this.activeJob.status = 'paused';
      this.activeJob.updatedAt = new Date().toISOString();
    }
    return this.activeJob;
  }

  public resumeJob(): DiscoveryJobState | null {
    if (!getYouTubeApiKey()) {
      const err: any = new Error('YOUTUBE_API_KEY is missing.');
      err.code = 'MISSING_API_KEY';
      throw err;
    }
    if (this.activeJob && (this.activeJob.status === 'paused' || this.activeJob.status === 'error')) {
      this.activeJob.status = 'running';
      this.activeJob.lastErrorCode = undefined;
      this.activeJob.lastErrorMessage = undefined;
      this.activeJob.updatedAt = new Date().toISOString();
    }
    return this.activeJob;
  }

  public stopJob(): DiscoveryJobState | null {
    if (this.activeJob && this.activeJob.status !== 'completed') {
      this.activeJob.status = 'stopped';
      this.activeJob.completedAt = new Date().toISOString();
      this.activeJob.updatedAt = new Date().toISOString();
    }
    return this.activeJob;
  }

  /**
   * Executes one controlled discovery batch step (with nextPageToken pagination or next keyword tuple)
   * without flooding the YouTube API.
   */
  public async stepActiveJob(
    batchItemsDesired = 25,
    extraDedup?: { videoIds?: string[]; playlistIds?: string[]; titles?: string[] }
  ): Promise<{
    job: DiscoveryJobState;
    batchItems: DiscoveredCourse[];
  }> {
    if (!this.activeJob) {
      throw new Error('No active discovery job. Start a discovery job first.');
    }
    if (this.activeJob.status !== 'running') {
      return { job: this.activeJob, batchItems: [] };
    }
    if (extraDedup) {
      this.seedKnownDeduplicationSet(extraDedup);
    }

    const job = this.activeJob;
    const category = job.selectedCategories[job.currentCategoryIdx % job.selectedCategories.length];
    const modifier = job.selectedModifiers[job.currentModifierIdx % job.selectedModifiers.length];
    const langLabel = job.selectedLanguages[job.currentLanguageIdx % job.selectedLanguages.length];
    const langOpt = DISCOVERY_LANGUAGES.find((l) => l.label === langLabel);

    const searchTypes: Array<'video' | 'playlist' | 'channel'> = [];
    if (job.includeVideos) searchTypes.push('video');
    if (job.includePlaylists) searchTypes.push('playlist');
    if (job.includeChannels) searchTypes.push('channel');
    if (searchTypes.length === 0) searchTypes.push('video');

    const chosenType = searchTypes[job.queriesExecuted % searchTypes.length];
    const queryStr = `${category} ${modifier}${langLabel !== 'English' ? ` ${langLabel}` : ''}`.trim();

    try {
      const remainingToTarget = Math.max(1, job.targetBatchLimit - job.discoveredCount);
      const maxResults = Math.min(50, Math.min(batchItemsDesired, remainingToTarget + 10));

      const pageRes = await this.discoverPage({
        query: queryStr,
        category,
        languageLabel: langLabel,
        languageCode: langOpt?.isoCode,
        searchType: chosenType,
        pageToken: job.nextPageToken,
        maxResults,
        jobId: job.id,
        modifier,
      });

      const sliced = pageRes.items.slice(0, remainingToTarget);
      job.queriesExecuted++;
      job.discoveredCount += sliced.length;
      job.verifiedCount += sliced.filter((i) => i.sourceVerificationStatus === 'Verified YouTube Resource').length;
      job.duplicateCount += pageRes.duplicatesSkipped;
      this.jobCandidates = [...sliced, ...this.jobCandidates].slice(0, 500);

      // Advance pagination or rotate category/modifier/language
      if (pageRes.nextPageToken && sliced.length >= 5 && job.discoveredCount < job.targetBatchLimit) {
        job.nextPageToken = pageRes.nextPageToken;
      } else {
        job.nextPageToken = undefined;
        job.currentModifierIdx++;
        if (job.currentModifierIdx >= job.selectedModifiers.length) {
          job.currentModifierIdx = 0;
          job.currentLanguageIdx++;
          if (job.currentLanguageIdx >= job.selectedLanguages.length) {
            job.currentLanguageIdx = 0;
            job.currentCategoryIdx++;
          }
        }
      }

      if (job.discoveredCount >= job.targetBatchLimit) {
        job.status = 'completed';
        job.completedAt = new Date().toISOString();
      }
      job.updatedAt = new Date().toISOString();

      return { job, batchItems: sliced };
    } catch (err: any) {
      job.status = 'error';
      job.lastErrorCode = err?.code || 'DISCOVERY_ERROR';
      job.lastErrorMessage = err?.message || 'Discovery step failed.';
      job.updatedAt = new Date().toISOString();
      throw err;
    }
  }

  /**
   * Discovers real YouTube training videos for a single Corporate Training Library category,
   * iterating across its sub-topics and nextPageToken pagination up to targetCount (default 25).
   */
  public async discoverCorporateCategoryVideos(params: {
    category: string;
    topics?: string[];
    targetCount?: number;
    languageLabel?: string;
    includePlaylists?: boolean;
    extraKnownVideoIds?: string[];
    extraKnownPlaylistIds?: string[];
    jobId?: string;
  }): Promise<{
    category: string;
    items: DiscoveredCourse[];
    duplicatesSkipped: number;
    queriesExecuted: number;
    topicsCovered: string[];
  }> {
    if (params.extraKnownVideoIds?.length || params.extraKnownPlaylistIds?.length) {
      this.seedKnownDeduplicationSet({
        videoIds: params.extraKnownVideoIds,
        playlistIds: params.extraKnownPlaylistIds,
      });
    }

    const corpMeta = getCorporateCategoryByName(params.category);
    const topicList =
      params.topics && params.topics.length > 0
        ? params.topics
        : corpMeta?.topics || [params.category];
    const targetCount = Math.max(1, Math.min(50, Number(params.targetCount || 25)));

    const collected: DiscoveredCourse[] = [];
    let duplicatesSkipped = 0;
    let queriesExecuted = 0;
    const topicsCovered: string[] = [];

    // Query batched topic groups (clean keyword focus) to balance quota and topic breadth across 25 topics
    const groupedSeeds: Array<{ topicLabel: string; searchTerms: string }> = [];
    for (let i = 0; i < topicList.length; i += 3) {
      const slice = topicList.slice(i, i + 3);
      groupedSeeds.push({
        topicLabel: slice[0],
        searchTerms: `${slice.join(' ')} training`,
      });
    }

    let seedIdx = 0;
    let pageToken: string | undefined;
    const maxQueries = 8;

    while (collected.length < targetCount && queriesExecuted < maxQueries && seedIdx < groupedSeeds.length) {
      const seed = groupedSeeds[seedIdx];
      const usePlaylist = Boolean(params.includePlaylists) && queriesExecuted % 5 === 4;
      const pageRes = await this.discoverPage({
        query: `${params.category} ${seed.topicLabel}`,
        category: params.category,
        topic: seed.topicLabel,
        libraryCollection: 'corporate_training',
        languageLabel: params.languageLabel || 'English',
        searchType: usePlaylist ? 'playlist' : 'video',
        pageToken,
        maxResults: Math.min(25, Math.max(10, targetCount - collected.length + 5)),
        jobId: params.jobId || `corp-${Date.now().toString(36)}`,
      });

      queriesExecuted++;
      duplicatesSkipped += pageRes.duplicatesSkipped;
      topicsCovered.push(seed.topicLabel);

      for (const item of pageRes.items) {
        if (collected.length >= targetCount) break;
        collected.push({
          ...item,
          libraryCollection: 'corporate_training',
          topic: item.topic || seed.topicLabel,
        });
      }

      if (pageRes.nextPageToken && pageRes.items.length >= 6 && collected.length < targetCount) {
        pageToken = pageRes.nextPageToken;
      } else {
        pageToken = undefined;
        seedIdx++;
      }
    }

    return {
      category: params.category,
      items: collected,
      duplicatesSkipped,
      queriesExecuted,
      topicsCovered: Array.from(new Set(topicsCovered)),
    };
  }

  /**
   * Verifies real YouTube Video IDs and Playlist IDs directly via YouTube Data API v3.
   */
  public async verifyYouTubeResources(params: {
    videoIds?: string[];
    playlistIds?: string[];
  }): Promise<{
    verifiedVideos: Record<
      string,
      {
        valid: boolean;
        embeddable: boolean;
        title?: string;
        channelTitle?: string;
        channelId?: string;
        duration?: string;
        durationMinutes?: number;
        publishedAt?: string;
        contentType?: CourseContentType;
        reason?: string;
      }
    >;
    verifiedPlaylists: Record<
      string,
      {
        valid: boolean;
        title?: string;
        channelTitle?: string;
        channelId?: string;
        itemCount?: number;
        publishedAt?: string;
        reason?: string;
      }
    >;
  }> {
    const cleanVideoIds = Array.from(new Set((params.videoIds || []).map((v) => v.trim()).filter(Boolean)));
    const cleanPlaylistIds = Array.from(new Set((params.playlistIds || []).map((p) => p.trim()).filter(Boolean)));

    const verifiedVideos: Record<string, any> = {};
    const verifiedPlaylists: Record<string, any> = {};

    for (let i = 0; i < cleanVideoIds.length; i += 50) {
      const chunk = cleanVideoIds.slice(i, i + 50);
      let vidItems: any[] = [];
      let fallbackViaOembed = false;
      try {
        const vidJson = await this.callYouTubeEndpoint(
          'videos',
          { part: 'snippet,contentDetails,status', id: chunk.join(',') },
          1
        );
        vidItems = vidJson?.items || [];
      } catch (err: any) {
        if (err?.code === 'API_KEY_REFERRER_BLOCKED' || err?.code === 'MISSING_API_KEY' || err?.code === 'YOUTUBE_API_DISABLED') {
          fallbackViaOembed = true;
        } else {
          throw err;
        }
      }

      if (fallbackViaOembed) {
        await Promise.all(
          chunk.map(async (vid) => {
            try {
              const r = await fetch(
                `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${vid}`)}&format=json`,
                { signal: AbortSignal.timeout(5000) }
              );
              if (!r.ok) {
                verifiedVideos[vid] = { valid: false, embeddable: false, reason: 'Video unavailable or embedding disabled.' };
                return;
              }
              const oj: any = await r.json();
              const title = String(oj?.title || '');
              verifiedVideos[vid] = {
                valid: Boolean(title),
                embeddable: Boolean(title),
                title,
                channelTitle: oj?.author_name,
                contentType: inferCorporateContentType({ title, hasPlaylistId: false }),
              };
            } catch {
              verifiedVideos[vid] = { valid: false, embeddable: false, reason: 'oEmbed verification failed.' };
            }
          })
        );
        continue;
      }

      const byId = new Map<string, any>();
      for (const item of vidItems) {
        byId.set(item.id, item);
      }
      for (const vid of chunk) {
        const v = byId.get(vid);
        if (!v) {
          verifiedVideos[vid] = { valid: false, embeddable: false, reason: 'Video not found or private on YouTube.' };
          continue;
        }
        const embeddable = v.status?.embeddable !== false && v.status?.privacyStatus === 'public';
        const dur = parseIsoDuration(v.contentDetails?.duration);
        const title = String(v.snippet?.title || '');
        const desc = String(v.snippet?.description || '');
        verifiedVideos[vid] = {
          valid: embeddable,
          embeddable,
          title,
          channelTitle: v.snippet?.channelTitle,
          channelId: v.snippet?.channelId,
          duration: dur.label,
          durationMinutes: dur.minutes,
          publishedAt: v.snippet?.publishedAt,
          contentType: inferCorporateContentType({
            title,
            description: desc,
            durationMinutes: dur.minutes,
            hasPlaylistId: false,
          }),
          reason: embeddable ? undefined : 'Video is private or embedding is disabled by uploader.',
        };
      }
    }

    for (let i = 0; i < cleanPlaylistIds.length; i += 50) {
      const chunk = cleanPlaylistIds.slice(i, i + 50);
      let plItems: any[] = [];
      let fallbackPlaylistOembed = false;
      try {
        const plJson = await this.callYouTubeEndpoint(
          'playlists',
          { part: 'snippet,contentDetails,status', id: chunk.join(',') },
          1
        );
        plItems = plJson?.items || [];
      } catch (err: any) {
        if (err?.code === 'API_KEY_REFERRER_BLOCKED' || err?.code === 'MISSING_API_KEY') {
          fallbackPlaylistOembed = true;
        } else {
          throw err;
        }
      }

      if (fallbackPlaylistOembed) {
        await Promise.all(
          chunk.map(async (pid) => {
            try {
              const r = await fetch(
                `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/playlist?list=${pid}`)}&format=json`,
                { signal: AbortSignal.timeout(5000) }
              );
              if (!r.ok) {
                verifiedPlaylists[pid] = { valid: false, reason: 'Playlist unavailable or private on YouTube.' };
                return;
              }
              const oj: any = await r.json();
              verifiedPlaylists[pid] = {
                valid: Boolean(oj?.title),
                title: oj?.title,
                channelTitle: oj?.author_name,
              };
            } catch {
              verifiedPlaylists[pid] = { valid: false, reason: 'Playlist oEmbed verification failed.' };
            }
          })
        );
        continue;
      }

      const byId = new Map<string, any>();
      for (const item of plItems) {
        byId.set(item.id, item);
      }
      for (const pid of chunk) {
        const p = byId.get(pid);
        if (!p) {
          verifiedPlaylists[pid] = { valid: false, reason: 'Playlist not found or private on YouTube.' };
          continue;
        }
        const isPublic = !p.status?.privacyStatus || p.status.privacyStatus === 'public';
        verifiedPlaylists[pid] = {
          valid: isPublic,
          title: p.snippet?.title,
          channelTitle: p.snippet?.channelTitle,
          channelId: p.snippet?.channelId,
          itemCount: Number(p.contentDetails?.itemCount || 0),
          publishedAt: p.snippet?.publishedAt,
          reason: isPublic ? undefined : 'Playlist is not public.',
        };
      }
    }

    return { verifiedVideos, verifiedPlaylists };
  }
}

export const youtubeDiscoveryEngine = new YouTubeDiscoveryEngine();
