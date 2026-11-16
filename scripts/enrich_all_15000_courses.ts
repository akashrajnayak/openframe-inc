import fs from 'fs';
import path from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import {
  ALL_90_CATEGORIES,
  DOMAIN_GROUPS_BY_CATEGORY,
  synthesizeBaseCourse,
} from '../src/data/marketplaceCatalogData';
import type { MarketplaceCourse } from '../src/types';

interface VerifiedYouTubeResource {
  kind: 'video' | 'playlist';
  category: string;
  videoId: string;
  playlistId?: string;
  title: string;
  channelName: string;
  channelUrl?: string;
  thumbnailUrl: string;
  duration: string;
  durationMinutes?: number;
  snippetDesc?: string;
  youtubeUrl: string;
  youtubePlaylistUrl?: string;
}

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Technology: '/assets/images/artificial_intelligence.jpg',
  STEM: '/assets/images/robotics_stem.jpg',
  Creative: '/assets/images/graphic_design_media.jpg',
  Business: '/assets/images/entrepreneurship_finance.jpg',
  Professional: '/assets/images/career_development.jpg',
  Academic: '/assets/images/academic_education.jpg',
  Wellbeing: '/assets/images/agriculture_rural_innovation.jpg',
  Intelligence: '/assets/images/iq_eq_sq_development.jpg',
};

function getFallbackJpgForCategory(category: string, categoryGroup: string): string {
  const lc = category.toLowerCase();
  if (lc.includes('programming') || lc.includes('javascript') || lc.includes('development')) {
    return '/assets/images/coding_programming.jpg';
  }
  if (lc.includes('communication') || lc.includes('english') || lc.includes('personality')) {
    return '/assets/images/communication_personality.jpg';
  }
  if (lc.includes('parenting')) {
    return '/assets/images/parenting_wellbeing.jpg';
  }
  if (lc.includes('technology') || lc.includes('cloud') || lc.includes('aws') || lc.includes('azure') || lc.includes('cyber')) {
    return '/assets/images/technology_digital_skills.jpg';
  }
  return CATEGORY_FALLBACK_IMAGES[categoryGroup] || '/assets/images/artificial_intelligence.jpg';
}

function parseClockDurationToMinutes(text: string): number {
  const parts = text
    .trim()
    .split(':')
    .map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 20;
  if (parts.length === 3) {
    return Math.max(1, parts[0] * 60 + parts[1] + Math.round(parts[2] / 60));
  }
  if (parts.length === 2) {
    return Math.max(1, parts[0] + Math.round(parts[1] / 60));
  }
  return 15;
}

function sanitizeFreeWord(text: string): string {
  if (!text) return text;
  let out = text
    .replace(/\[FREE\s+RESOURCE\]/gi, '')
    .replace(/\(FREE\s+Template\)/gi, '(Downloadable Template)')
    .replace(/\bDistraction[-\s]Free\b/gi, 'Focus-First')
    .replace(/\bHands[-\s]Free\b/gi, 'Voice-Guided')
    .replace(/\bStress[-\s]Free\b/gi, 'Calm Structured')
    .replace(/\bBug[-\s]Free\b/gi, 'Reliable')
    .replace(/\bError[-\s]Free\b/gi, 'Accurate')
    .replace(/\bToll[-\s]Free\b/gi, 'Helpline')
    .replace(/\bFree\s+of\s+Charge\b/gi, 'Included')
    .replace(/\bStart\s+free\s*:/gi, 'Get started:')
    .replace(/\bin\s+my\s+free\s+newsletter\b/gi, 'in the newsletter')
    .replace(/\bfree\s+courses?\b/gi, 'open curriculum')
    .replace(/\bfree\s+training\b/gi, 'open training')
    .replace(/\bfree\s+video\b/gi, 'educational video')
    .replace(/\bfree\s+tutorial\b/gi, 'guided tutorial')
    .replace(/\bfree\b/gi, 'open');
  return out.replace(/\s{2,}/g, ' ').trim();
}

async function verifyOembedVideo(
  videoId: string
): Promise<{ ok: boolean; title?: string; author?: string; authorUrl?: string; thumbnailUrl?: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5500) });
    if (!res.ok) return { ok: false };
    const json: any = await res.json();
    if (!json?.title) return { ok: false };
    return {
      ok: true,
      title: String(json.title).trim(),
      author: json.author_name ? String(json.author_name).trim() : undefined,
      authorUrl: json.author_url ? String(json.author_url).trim() : undefined,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  } catch {
    return { ok: false };
  }
}

async function verifyOembedPlaylist(
  playlistId: string
): Promise<{ ok: boolean; title?: string; author?: string; authorUrl?: string; thumbnailUrl?: string; videoId?: string }> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/playlist?list=${playlistId}`
    )}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5500) });
    if (!res.ok) return { ok: false };
    const json: any = await res.json();
    const thumb: string | undefined = json?.thumbnail_url;
    const vidMatch = thumb?.match(/\/vi\/([A-Za-z0-9_-]{11})\//);
    return {
      ok: Boolean(json?.title && thumb),
      title: json?.title ? String(json.title).trim() : undefined,
      author: json?.author_name ? String(json.author_name).trim() : undefined,
      authorUrl: json?.author_url ? String(json.author_url).trim() : undefined,
      thumbnailUrl: thumb,
      videoId: vidMatch?.[1],
    };
  } catch {
    return { ok: false };
  }
}

async function searchYouTubeVideosRaw(query: string): Promise<
  Array<{
    videoId: string;
    title: string;
    channelName: string;
    channelUrl?: string;
    duration: string;
    durationMinutes: number;
    snippetDesc?: string;
  }>
> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  for (let attempt = 0; attempt < 2; attempt++) {
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
      if (!res.ok) {
        await SLEEP(400 * (attempt + 1));
        continue;
      }
      const html = await res.text();
      const match = html.match(/var ytInitialData = (\{.+?\});<\/script>/);
      if (!match) return [];
      const data: any = JSON.parse(match[1]);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const results: any[] = [];
      for (const sec of contents) {
        const items = sec?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId || !/^[A-Za-z0-9_-]{11}$/.test(v.videoId)) continue;
          const title = (v.title?.runs || []).map((r: any) => r.text).join('').trim();
          const channelName = (v.ownerText?.runs?.[0]?.text || '').trim() || 'YouTube Educator';
          const browseEndpoint = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint;
          const channelId = browseEndpoint?.browseId || undefined;
          const canonicalBaseUrl = browseEndpoint?.canonicalBaseUrl || undefined;
          const channelUrl = canonicalBaseUrl
            ? `https://www.youtube.com${canonicalBaseUrl}`
            : channelId
            ? `https://www.youtube.com/channel/${channelId}`
            : undefined;
          const duration = (v.lengthText?.simpleText || '').trim();
          if (!title || !duration || duration.toUpperCase() === 'LIVE') continue;
          const durationMinutes = parseClockDurationToMinutes(duration);
          if (durationMinutes < 3) continue;
          const snippetRuns =
            v.detailedMetadataSnippets?.[0]?.snippetText?.runs ||
            v.descriptionSnippet?.runs ||
            [];
          const snippetDesc = snippetRuns
            .map((r: any) => r.text || '')
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
          results.push({
            videoId: v.videoId,
            title,
            channelName,
            channelUrl,
            duration,
            durationMinutes,
            snippetDesc: snippetDesc || undefined,
          });
        }
      }
      return results;
    } catch {
      await SLEEP(400 * (attempt + 1));
    }
  }
  return [];
}

async function searchYouTubePlaylistsRaw(query: string): Promise<
  Array<{
    playlistId: string;
    title: string;
    channelName: string;
    videoCountText?: string;
  }>
> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAw%253D%253D`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(7000),
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
    const results: any[] = [];
    for (const sec of contents) {
      const items = sec?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const lockup = item?.lockupViewModel;
        const pl = item?.playlistRenderer;
        if (pl && pl.playlistId) {
          const title = (pl.title?.simpleText || (pl.title?.runs || []).map((r: any) => r.text).join('') || '').trim();
          const channelName = (pl.shortBylineText?.runs?.[0]?.text || 'YouTube Educator').trim();
          const videoCountText = pl.videoCount ? `${pl.videoCount} videos` : undefined;
          if (title) {
            results.push({ playlistId: pl.playlistId, title, channelName, videoCountText });
          }
        } else if (lockup && lockup.contentId && String(lockup.contentId).startsWith('PL')) {
          const metaTitle = lockup?.metadata?.lockupMetadataViewModel?.title?.content || '';
          if (metaTitle) {
            results.push({
              playlistId: String(lockup.contentId),
              title: String(metaTitle).trim(),
              channelName: 'YouTube Educator',
            });
          }
        }
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function discoverCategoryResources(
  category: string,
  globalUsedIds: Set<string>
): Promise<VerifiedYouTubeResource[]> {
  const resources: VerifiedYouTubeResource[] = [];
  const localSeen = new Set<string>();

  const vidQueries = [
    `${category} complete course tutorial`,
    `${category} fundamentals lecture university`,
  ];

  for (const q of vidQueries) {
    const rawCands = await searchYouTubeVideosRaw(q);
    const unseen = rawCands
      .filter((c) => !localSeen.has(c.videoId) && !globalUsedIds.has(c.videoId))
      .slice(0, 8);

    const oembedChecks = await Promise.all(unseen.map((c) => verifyOembedVideo(c.videoId)));
    for (let i = 0; i < unseen.length; i++) {
      const oe = oembedChecks[i];
      const cand = unseen[i];
      if (!oe.ok) continue;
      if (localSeen.has(cand.videoId)) continue;
      localSeen.add(cand.videoId);
      globalUsedIds.add(cand.videoId);
      resources.push({
        kind: 'video',
        category,
        videoId: cand.videoId,
        title: sanitizeFreeWord(oe.title || cand.title),
        channelName: oe.author || cand.channelName,
        channelUrl: oe.authorUrl || cand.channelUrl,
        thumbnailUrl: oe.thumbnailUrl || `https://i.ytimg.com/vi/${cand.videoId}/hqdefault.jpg`,
        duration: cand.duration,
        durationMinutes: cand.durationMinutes,
        snippetDesc: cand.snippetDesc ? sanitizeFreeWord(cand.snippetDesc) : undefined,
        youtubeUrl: `https://www.youtube.com/watch?v=${cand.videoId}`,
      });
      if (resources.length >= 8) break;
    }
    if (resources.length >= 8) break;
  }

  // Also grab up to 2 real verified playlists for this category
  const rawPls = await searchYouTubePlaylistsRaw(`${category} full course playlist`);
  const candidatePls = rawPls.slice(0, 4);
  if (candidatePls.length > 0) {
    const plChecks = await Promise.all(candidatePls.map((p) => verifyOembedPlaylist(p.playlistId)));
    for (let i = 0; i < candidatePls.length; i++) {
      const oe = plChecks[i];
      const pl = candidatePls[i];
      if (!oe.ok || !oe.thumbnailUrl) continue;
      const fallbackVidId = oe.videoId || resources[0]?.videoId || '';
      if (!fallbackVidId) continue;
      resources.push({
        kind: 'playlist',
        category,
        videoId: fallbackVidId,
        playlistId: pl.playlistId,
        title: sanitizeFreeWord(oe.title || pl.title),
        channelName: oe.author || pl.channelName,
        channelUrl: oe.authorUrl,
        thumbnailUrl: oe.thumbnailUrl,
        duration: pl.videoCountText || 'Multi-Lesson Playlist',
        youtubeUrl: `https://www.youtube.com/watch?v=${fallbackVidId}&list=${pl.playlistId}`,
        youtubePlaylistUrl: `https://www.youtube.com/playlist?list=${pl.playlistId}`,
      });
      if (resources.filter((r) => r.kind === 'playlist').length >= 2) break;
    }
  }

  return resources;
}

async function buildOrLoadVerifiedPool(corpExcludeIds: Set<string>): Promise<Record<string, VerifiedYouTubeResource[]>> {
  const poolPath = path.resolve(process.cwd(), 'public', 'data', 'verified_youtube_pool_90cats.json');
  let pool: Record<string, VerifiedYouTubeResource[]> = {};
  if (fs.existsSync(poolPath)) {
    try {
      pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
    } catch {
      pool = {};
    }
  }

  const globalUsedIds = new Set<string>(corpExcludeIds);
  for (const list of Object.values(pool)) {
    for (const r of list) {
      if (r.videoId) globalUsedIds.add(r.videoId);
    }
  }

  const missingCats = ALL_90_CATEGORIES.filter((cat) => !Array.isArray(pool[cat]) || pool[cat].length < 4);
  console.log(`[Pool Discovery] ${ALL_90_CATEGORIES.length - missingCats.length}/90 categories cached, fetching ${missingCats.length} categories...`);

  // Process 6 categories in parallel for speed & reliability
  const CONCURRENCY = 6;
  for (let i = 0; i < missingCats.length; i += CONCURRENCY) {
    const chunk = missingCats.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (cat) => {
        const res = await discoverCategoryResources(cat, globalUsedIds);
        return { cat, res };
      })
    );
    for (const { cat, res } of results) {
      const existing = Array.isArray(pool[cat]) ? pool[cat] : [];
      const merged = [...existing];
      for (const item of res) {
        if (!merged.some((m) => m.videoId === item.videoId && m.playlistId === item.playlistId)) {
          merged.push(item);
        }
      }
      pool[cat] = merged;
      console.log(`  ✓ [${cat}] -> ${merged.length} verified resources (${merged.filter((r) => r.kind === 'playlist').length} playlists)`);
    }
    fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2));
    await SLEEP(250);
  }

  return pool;
}

function normalizePricingTierNoFree(rawTier: string | undefined, price: number): any {
  if (!rawTier || rawTier === 'Free') {
    if (price === 0) return 'Academic Access';
    if (price >= 2000) return 'Specialised';
    if (price >= 1400) return 'Advanced';
    if (price >= 900) return 'Professional';
    if (price >= 400) return 'Basic';
    return 'Starter';
  }
  return rawTier;
}

function enrichSingleCourse(
  raw: MarketplaceCourse,
  index: number,
  pool: Record<string, VerifiedYouTubeResource[]>,
  fallbackPool: VerifiedYouTubeResource[]
): MarketplaceCourse {
  const category = raw.category || ALL_90_CATEGORIES[(index - 1) % ALL_90_CATEGORIES.length];
  const categoryGroup = raw.categoryGroup || DOMAIN_GROUPS_BY_CATEGORY[category] || 'Technology';
  const catResources = pool[category] && pool[category].length > 0 ? pool[category] : fallbackPool;

  const primary = catResources.length > 0 ? catResources[(index - 1) % catResources.length] : null;
  const secondaryList = catResources.length > 0
    ? [
        catResources[(index - 1) % catResources.length],
        catResources[index % catResources.length],
        catResources[(index + 1) % catResources.length],
      ].filter((v, idx, arr) => v && arr.findIndex((x) => x.videoId === v.videoId && x.playlistId === v.playlistId) === idx)
    : [];

  // Preserve original numeric price; NEVER charge previously 0-price students, just remove Free badges/labels
  const preservedPrice = Math.max(0, Number(raw.price ?? 0));
  const preservedTier = normalizePricingTierNoFree(raw.pricingTier, preservedPrice);

  const fallbackImg = getFallbackJpgForCategory(category, categoryGroup);
  const rawImg = raw.thumbnailUrl || raw.imageUrl || '';
  const hasRealYtExisting =
    raw.youtubeVideoId &&
    /^[A-Za-z0-9_-]{11}$/.test(raw.youtubeVideoId) &&
    !raw.youtubeVideoId.startsWith('yt_ai_') &&
    raw.youtubeVideoId !== 'dQw4w9WgXcQ';

  const chosenVideoId = hasRealYtExisting
    ? raw.youtubeVideoId!
    : primary?.videoId;

  const chosenPlaylistId =
    raw.youtubePlaylistId || (primary?.kind === 'playlist' ? primary.playlistId : undefined);

  const realThumb = chosenVideoId
    ? `https://i.ytimg.com/vi/${chosenVideoId}/hqdefault.jpg`
    : primary?.thumbnailUrl
    ? primary.thumbnailUrl
    : rawImg && !rawImg.endsWith('.svg') && !rawImg.includes('/of_ai_')
    ? rawImg
    : fallbackImg;

  const cleanTitle = sanitizeFreeWord(raw.title || `${category} Comprehensive Course`);
  const cleanSubcategory = sanitizeFreeWord(raw.subcategory || category);
  const cleanShortDesc = sanitizeFreeWord(
    raw.shortDesc ||
      (primary?.snippetDesc
        ? `${primary.snippetDesc} Structured inside the OpenFrame Education ${category} track with assessment & verification.`
        : `Master ${category} through structured modules, verified video lectures, and capstone evaluation.`)
  );
  const cleanDesc = sanitizeFreeWord(raw.description || cleanShortDesc);

  // Replace any fake yt_ai_* or dQw4w9WgXcQ recommendedVideos with real verified lectures
  const rawRecs = Array.isArray(raw.recommendedVideos) ? raw.recommendedVideos : [];
  const hasFakeRecs = rawRecs.some(
    (v: any) =>
      !v?.videoId ||
      String(v.videoId).startsWith('yt_ai_') ||
      v.videoId === 'dQw4w9WgXcQ' ||
      String(v.embedUrl || '').includes('dQw4w9WgXcQ')
  );

  const recommendedVideos =
    rawRecs.length > 0 && !hasFakeRecs
      ? rawRecs.map((v: any) => ({
          ...v,
          title: sanitizeFreeWord(v.title || cleanTitle),
          recommendedReason: sanitizeFreeWord(v.recommendedReason || `Curated lecture for ${category}.`),
          thumbnail: v.thumbnail?.startsWith('http') ? v.thumbnail : `https://i.ytimg.com/vi/${v.videoId || v.youtubeId}/hqdefault.jpg`,
          thumbnailUrl: v.thumbnailUrl?.startsWith('http') ? v.thumbnailUrl : `https://i.ytimg.com/vi/${v.videoId || v.youtubeId}/hqdefault.jpg`,
        }))
      : secondaryList.map((v, idx) => ({
          id: `yt-${raw.id}-${idx + 1}`,
          videoId: v.videoId,
          youtubeId: v.videoId,
          title: v.title,
          channelTitle: v.channelName,
          thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
          duration: v.duration,
          level: idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced',
          difficultyLevel: idx === 0 ? 'Beginner' : idx === 1 ? 'Intermediate' : 'Advanced',
          recommendedReason: v.snippetDesc
            ? `${v.snippetDesc.slice(0, 140)} — Verified ${category} lecture.`
            : `Verified ${category} resource by ${v.channelName} (${v.duration}).`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${v.videoId}`,
          source: 'verified_youtube_oembed',
        }));

  const cleanKeywords = Array.from(
    new Set(
      [
        category,
        cleanSubcategory,
        ...(Array.isArray(raw.keywords) ? raw.keywords.map((k) => sanitizeFreeWord(String(k))) : []),
        primary?.channelName || '',
      ].filter(Boolean)
    )
  ).slice(0, 10);

  const courseType = chosenPlaylistId
    ? 'youtube_playlist'
    : chosenVideoId
    ? 'youtube_video'
    : raw.courseType || 'standard';

  return {
    ...raw,
    id: raw.id,
    aliasId: raw.aliasId || (index <= 100 ? `OF-CRS-${String(index).padStart(4, '0')}` : undefined),
    title: cleanTitle,
    category,
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : [category],
    categoryGroup,
    subcategory: cleanSubcategory,
    pricingTier: preservedTier,
    price: preservedPrice,
    isFree: false,
    courseType,
    contentType: chosenPlaylistId ? 'Playlist' : raw.contentType || (chosenVideoId ? 'Individual video' : undefined),
    youtubeVideoId: chosenVideoId,
    youtubeUrl: raw.youtubeUrl || (chosenVideoId ? `https://www.youtube.com/watch?v=${chosenVideoId}` : undefined),
    youtubePlaylistId: chosenPlaylistId,
    youtubePlaylistUrl:
      raw.youtubePlaylistUrl ||
      (chosenPlaylistId ? `https://www.youtube.com/playlist?list=${chosenPlaylistId}` : undefined),
    youtubeChannelName: raw.youtubeChannelName || primary?.channelName,
    youtubeChannelUrl: raw.youtubeChannelUrl || primary?.channelUrl,
    imageUrl: realThumb,
    thumbnailUrl: realThumb,
    shortDesc: cleanShortDesc,
    description: cleanDesc,
    keywords: cleanKeywords,
    recommendedVideos,
    sourceVerificationStatus: chosenVideoId ? 'Verified YouTube Resource' : raw.sourceVerificationStatus,
    updatedAt: new Date().toISOString(),
  };
}

async function main() {
  const dataDir = path.resolve(process.cwd(), 'public', 'data');
  const corpPath = path.join(dataDir, 'corporate_training_courses.json');
  const corpRaw: MarketplaceCourse[] = fs.existsSync(corpPath)
    ? JSON.parse(fs.readFileSync(corpPath, 'utf8'))
    : [];

  const corpExcludeIds = new Set<string>();
  for (const c of corpRaw) {
    if (c.youtubeVideoId) corpExcludeIds.add(c.youtubeVideoId);
  }

  // 1. Discover & verify real YouTube resources across all 90 categories
  const pool = await buildOrLoadVerifiedPool(corpExcludeIds);
  const allVerifiedList = Object.values(pool).flat();
  console.log(`[Pool Ready] Collected ${allVerifiedList.length} verified YouTube resources across ${Object.keys(pool).length} categories.`);

  // 2. Clean 500 corporate courses of any "Free" wording/badge/tier while preserving IDs, videos, thumbnails & price
  if (corpRaw.length > 0) {
    const cleanedCorp = corpRaw.map((c) => ({
      ...c,
      title: sanitizeFreeWord(c.title),
      shortDesc: sanitizeFreeWord(c.shortDesc),
      description: sanitizeFreeWord(c.description),
      subcategory: sanitizeFreeWord(c.subcategory),
      pricingTier: 'Corporate Track' as any,
      isFree: false,
      price: Number(c.price ?? 0),
      keywords: Array.isArray(c.keywords) ? c.keywords.map((k) => sanitizeFreeWord(String(k))) : c.keywords,
      recommendedVideos: Array.isArray(c.recommendedVideos)
        ? c.recommendedVideos.map((v: any) => ({
            ...v,
            title: sanitizeFreeWord(v.title || ''),
            recommendedReason: sanitizeFreeWord(v.recommendedReason || ''),
          }))
        : c.recommendedVideos,
      updatedAt: new Date().toISOString(),
    }));
    fs.writeFileSync(corpPath, JSON.stringify(cleanedCorp, null, 2));
    console.log(`[Corporate 500] Cleaned Free badges/labels across ${cleanedCorp.length} corporate courses.`);
  }

  // 3. Load existing 1..1500 base JSON records
  const mktPath = path.join(dataDir, 'marketplace_courses.json');
  const existing1500: MarketplaceCourse[] = fs.existsSync(mktPath)
    ? JSON.parse(fs.readFileSync(mktPath, 'utf8'))
    : [];

  const enriched15000: MarketplaceCourse[] = [];
  const batchesOutDir = path.join(dataDir, 'catalog_15k');
  if (!fs.existsSync(batchesOutDir)) fs.mkdirSync(batchesOutDir, { recursive: true });

  // 4. Process all 15,000 courses in safe batches of 1,000
  const TOTAL_EXISTING = 15000;
  const BATCH_SIZE = 1000;
  let globalIdx = 0;

  for (let b = 0; b < TOTAL_EXISTING / BATCH_SIZE; b++) {
    const startIdx = b * BATCH_SIZE + 1;
    const endIdx = (b + 1) * BATCH_SIZE;
    const batchRecords: MarketplaceCourse[] = [];

    for (let idx = startIdx; idx <= endIdx; idx++) {
      const existingRaw = idx <= existing1500.length ? existing1500[idx - 1] : synthesizeBaseCourse(idx);
      const enriched = enrichSingleCourse(existingRaw, idx, pool, allVerifiedList);
      batchRecords.push(enriched);
      enriched15000.push(enriched);
      globalIdx++;
    }

    const batchFile = path.join(batchesOutDir, `batch_${String(b + 1).padStart(2, '0')}.json`);
    fs.writeFileSync(batchFile, JSON.stringify(batchRecords));
    console.log(
      `[Batch ${String(b + 1).padStart(2, '0')}/15] Saved courses ${startIdx}..${endIdx} (${batchRecords.length} records) -> ${path.basename(batchFile)}`
    );
  }

  // 5. Update marketplace_courses.json (1..1500), batch_1..15.json (100 each), and marketplace_summary.json
  const first1500 = enriched15000.slice(0, 1500);
  fs.writeFileSync(mktPath, JSON.stringify(first1500, null, 2));

  for (let i = 0; i < 15; i++) {
    const slice100 = first1500.slice(i * 100, (i + 1) * 100);
    fs.writeFileSync(path.join(dataDir, `batch_${i + 1}.json`), JSON.stringify(slice100, null, 2));
  }

  const summary1500 = first1500.map((c) => ({
    id: c.id,
    aliasId: c.aliasId,
    title: c.title,
    category: c.category,
    categoryGroup: c.categoryGroup,
    subcategory: c.subcategory,
    level: c.level,
    duration: c.duration,
    pricingTier: c.pricingTier,
    price: c.price,
    status: c.status,
    isPopular: c.isPopular,
    isTrending: c.isTrending,
    isNew: c.isNew,
    isRecommended: c.isRecommended,
    isCareerTrack: c.isCareerTrack,
    rating: c.rating,
    enrolledCount: c.enrolledCount,
    imageUrl: c.imageUrl,
    thumbnailUrl: c.thumbnailUrl,
    youtubeVideoId: c.youtubeVideoId,
    youtubeUrl: c.youtubeUrl,
    youtubeChannelName: c.youtubeChannelName,
    shortDesc: c.shortDesc,
  }));
  fs.writeFileSync(path.join(dataDir, 'marketplace_summary.json'), JSON.stringify(summary1500));

  console.log(`\nDONE: Enriched ${globalIdx} existing base courses + cleaned ${corpRaw.length} corporate courses.`);
}

main().catch((err) => {
  console.error('Fatal enrichment error:', err);
  process.exit(1);
});
