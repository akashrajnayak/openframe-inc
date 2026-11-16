import fs from 'fs';
import path from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import { ALL_90_CATEGORIES, DOMAIN_GROUPS_BY_CATEGORY } from '../src/data/marketplaceCatalogData';

export interface BaseVerifiedYouTubeVideo {
  videoId: string;
  youtubeUrl: string;
  title: string;
  channelName: string;
  channelId?: string;
  channelUrl?: string;
  thumbnailUrl: string;
  duration: string;
  durationMinutes: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  language: string;
  publishedDate?: string;
  descriptionSnippet?: string;
}

export type BaseYouTubePoolByCategory = Record<string, BaseVerifiedYouTubeVideo[]>;

const TARGET_PER_CATEGORY = 20;

const EXISTING_CURATED_VIDEO_IDS = [
  'JMUxmLyrhSk',
  'wjZofJX0v4U',
  'kCc8FmEb1nY',
  'i_LwzRVP7bg',
  'IHZwWFHWa-w',
  '_uQrJ0TkZlc',
  'vmEHCJofslg',
  'PkZNo7MFNFg',
  'bMknfKXIFA8',
  'Oe421EPjeBE',
  'ulprqHHWlng',
  'pg19Z8LL06w',
  '3Kq1MIfTWCE',
  'bixR-KIJKYM',
  'c9Wg6Cb_YlU',
  '30tCG5BMydA',
  'dQw4w9WgXcQ',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

function detectVideoLanguage(title: string, snippet?: string): string {
  const combined = `${title} ${snippet || ''}`;
  if (/[\u0C80-\u0CFF]/.test(combined)) return 'Kannada';
  if (/[\u0B80-\u0BFF]/.test(combined)) return 'Tamil';
  if (/[\u0C00-\u0C7F]/.test(combined)) return 'Telugu';
  if (/[\u0900-\u097F]/.test(combined)) return 'Hindi';
  if (/[\u0980-\u09FF]/.test(combined)) return 'Bengali';

  const lower = combined.toLowerCase();
  if (/\b(in hindi|hindi mein|hindi tutorial|for beginners in hindi)\b/.test(lower)) return 'Hindi';
  if (/\b(in tamil|tamil tutorial)\b/.test(lower)) return 'Tamil';
  if (/\b(in telugu|telugu tutorial)\b/.test(lower)) return 'Telugu';
  if (/\b(in kannada|kannada tutorial)\b/.test(lower)) return 'Kannada';
  if (/\b(en espa[ñn]ol|spanish)\b/.test(lower)) return 'Spanish';
  if (/\b(en fran[çc]ais|french)\b/.test(lower)) return 'French';
  return 'English';
}

function inferLevel(title: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' {
  const t = title.toLowerCase();
  if (/\b(advanced|masterclass|architecture|deep dive|optimization|pro)\b/.test(t)) return 'Advanced';
  if (/\b(beginner|beginners|basics|fundamentals|introduction|101|crash course)\b/.test(t)) return 'Beginner';
  if (/\b(intermediate|projects|practical|workflow|guide)\b/.test(t)) return 'Intermediate';
  return 'All Levels';
}

interface RawCandidate {
  videoId: string;
  title: string;
  channelName: string;
  channelId?: string;
  channelUrl?: string;
  duration: string;
  durationMinutes: number;
  descriptionSnippet?: string;
}

async function searchYouTubePublic(query: string): Promise<RawCandidate[]> {
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
        await sleep(300 * (attempt + 1));
        continue;
      }
      const html = await res.text();
      const match = html.match(/var ytInitialData = (\{.+?\});<\/script>/);
      if (!match) return [];

      const data: any = JSON.parse(match[1]);
      const contents =
        data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];
      const out: RawCandidate[] = [];

      for (const sec of contents) {
        const items = sec?.itemSectionRenderer?.contents || [];
        for (const item of items) {
          const v = item?.videoRenderer;
          if (!v || !v.videoId || !/^[a-zA-Z0-9_-]{11}$/.test(v.videoId)) continue;
          const title = (v.title?.runs || []).map((r: any) => r.text).join('').trim();
          const channelName = (v.ownerText?.runs?.[0]?.text || '').trim() || 'OpenFrame Partner Channel';
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
          if (durationMinutes < 2) continue;

          const snippetRuns =
            v.detailedMetadataSnippets?.[0]?.snippetText?.runs ||
            v.descriptionSnippet?.runs ||
            [];
          const descriptionSnippet = snippetRuns
            .map((r: any) => r.text || '')
            .join('')
            .replace(/\s+/g, ' ')
            .trim();

          out.push({
            videoId: v.videoId,
            title,
            channelName,
            channelId,
            channelUrl,
            duration,
            durationMinutes,
            descriptionSnippet: descriptionSnippet || undefined,
          });
        }
      }
      return out;
    } catch {
      await sleep(350 * (attempt + 1));
    }
  }
  return [];
}

async function verifyOembed(
  videoId: string
): Promise<{ ok: boolean; title?: string; author?: string; authorUrl?: string }> {
  try {
    const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
      `https://www.youtube.com/watch?v=${videoId}`
    )}&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5500) });
    if (!res.ok) return { ok: false };
    const json: any = await res.json();
    return {
      ok: Boolean(json?.title),
      title: json?.title,
      author: json?.author_name,
      authorUrl: json?.author_url,
    };
  } catch {
    return { ok: false };
  }
}

async function discoverCategoryVideos(
  category: string,
  usedGlobalIds: Set<string>,
  existingList: BaseVerifiedYouTubeVideo[]
): Promise<BaseVerifiedYouTubeVideo[]> {
  const results: BaseVerifiedYouTubeVideo[] = [...existingList];
  if (results.length >= TARGET_PER_CATEGORY) return results.slice(0, TARGET_PER_CATEGORY);

  const localIds = new Set(results.map((r) => r.videoId));
  const domainGroup = DOMAIN_GROUPS_BY_CATEGORY[category] || '';
  const queries = [
    `${category} full course tutorial`,
    `${category} complete training lecture`,
    `${category} ${domainGroup} crash course fundamentals`,
    `${category} practical guide projects`,
  ];

  for (const q of queries) {
    if (results.length >= TARGET_PER_CATEGORY) break;
    const raw = await searchYouTubePublic(q);
    const needed = TARGET_PER_CATEGORY - results.length;
    const candidates = raw
      .filter((c) => !usedGlobalIds.has(c.videoId) && !localIds.has(c.videoId))
      .slice(0, needed + 6);

    if (candidates.length === 0) continue;

    // Verify candidates in parallel batches of 10
    for (let i = 0; i < candidates.length && results.length < TARGET_PER_CATEGORY; i += 10) {
      const batch = candidates.slice(i, i + 10);
      const checks = await Promise.all(batch.map((c) => verifyOembed(c.videoId)));
      for (let j = 0; j < batch.length && results.length < TARGET_PER_CATEGORY; j++) {
        const cand = batch[j];
        const oe = checks[j];
        if (!oe.ok) continue;
        if (usedGlobalIds.has(cand.videoId) || localIds.has(cand.videoId)) continue;

        usedGlobalIds.add(cand.videoId);
        localIds.add(cand.videoId);

        const title = (oe.title || cand.title).trim();
        const channelName = (oe.author || cand.channelName).trim();
        results.push({
          videoId: cand.videoId,
          youtubeUrl: `https://www.youtube.com/watch?v=${cand.videoId}`,
          title,
          channelName,
          channelId: cand.channelId,
          channelUrl: oe.authorUrl || cand.channelUrl,
          thumbnailUrl: `https://i.ytimg.com/vi/${cand.videoId}/hqdefault.jpg`,
          duration: cand.duration,
          durationMinutes: cand.durationMinutes,
          level: inferLevel(title),
          language: detectVideoLanguage(title, cand.descriptionSnippet),
          descriptionSnippet: cand.descriptionSnippet,
        });
      }
    }
  }

  return results;
}

async function main() {
  const outPath = path.resolve(process.cwd(), 'public', 'data', 'base_youtube_pool.json');
  const corpPath = path.resolve(process.cwd(), 'public', 'data', 'corporate_training_courses.json');

  const pool: BaseYouTubePoolByCategory = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
    : {};

  const usedGlobalIds = new Set<string>(EXISTING_CURATED_VIDEO_IDS);

  // Exclude all 500 corporate training video IDs so zero duplicates occur
  if (fs.existsSync(corpPath)) {
    const corp = JSON.parse(fs.readFileSync(corpPath, 'utf8'));
    if (Array.isArray(corp)) {
      for (const c of corp) {
        if (c.youtubeVideoId) usedGlobalIds.add(String(c.youtubeVideoId));
      }
    }
  }

  // Reserve already-discovered base pool IDs
  for (const list of Object.values(pool)) {
    for (const v of list) {
      if (v.videoId) usedGlobalIds.add(v.videoId);
    }
  }

  const pendingCategories = ALL_90_CATEGORIES.filter(
    (cat) => !Array.isArray(pool[cat]) || pool[cat].length < TARGET_PER_CATEGORY
  );

  console.log(
    `Base 90-category YouTube discovery: ${ALL_90_CATEGORIES.length - pendingCategories.length}/90 complete, ${pendingCategories.length} pending...`
  );

  const CONCURRENCY = 4;
  for (let i = 0; i < pendingCategories.length; i += CONCURRENCY) {
    const slice = pendingCategories.slice(i, i + CONCURRENCY);
    const updatedSlice = await Promise.all(
      slice.map(async (cat) => {
        const existing = Array.isArray(pool[cat]) ? pool[cat] : [];
        const videos = await discoverCategoryVideos(cat, usedGlobalIds, existing);
        return { cat, videos };
      })
    );

    for (const { cat, videos } of updatedSlice) {
      pool[cat] = videos;
    }

    fs.writeFileSync(outPath, JSON.stringify(pool, null, 2), 'utf8');
    const totalVideos = Object.values(pool).reduce((acc, list) => acc + list.length, 0);
    const doneCats = ALL_90_CATEGORIES.filter((c) => (pool[c]?.length || 0) >= TARGET_PER_CATEGORY).length;
    console.log(
      `[Batch ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(pendingCategories.length / CONCURRENCY)}] Saved: ${slice
        .map((c) => `${c}(${pool[c].length})`)
        .join(', ')} | Categories >=${TARGET_PER_CATEGORY}: ${doneCats}/90 | Total verified videos: ${totalVideos}`
    );
  }

  const totalUnique = new Set(Object.values(pool).flat().map((v) => v.videoId)).size;
  console.log(`COMPLETE! Categories in pool: ${Object.keys(pool).length}/90 | Unique verified videos: ${totalUnique}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
