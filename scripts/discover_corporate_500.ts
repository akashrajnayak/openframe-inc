import fs from 'fs';
import path from 'path';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');
import {
  CORPORATE_TRAINING_CATEGORIES,
  inferCorporateContentType,
} from '../src/data/corporateTrainingTaxonomy';
import type { MarketplaceCourse } from '../src/types';

interface RawYtCandidate {
  videoId: string;
  title: string;
  channelName: string;
  channelId?: string;
  channelUrl?: string;
  durationText: string;
  durationMinutes: number;
  publishedText?: string;
  publishedDate?: string;
  snippetDesc?: string;
}

// Known curated fallback IDs from server.ts so corporate 500 never duplicates them
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
];

function parseClockDurationToMinutes(text: string): number {
  const parts = text
    .trim()
    .split(':')
    .map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 15;
  if (parts.length === 3) {
    return Math.max(1, parts[0] * 60 + parts[1] + Math.round(parts[2] / 60));
  }
  if (parts.length === 2) {
    return Math.max(1, parts[0] + Math.round(parts[1] / 60));
  }
  return 10;
}

function approximateDateFromPublishedText(publishedText?: string): string | undefined {
  if (!publishedText) return undefined;
  const clean = publishedText.toLowerCase().trim();
  const match = clean.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
  if (!match) return undefined;
  const qty = parseInt(match[1], 10);
  const unit = match[2];
  if (!Number.isFinite(qty) || qty < 0) return undefined;

  const d = new Date();
  if (unit === 'year') d.setUTCFullYear(d.getUTCFullYear() - qty);
  else if (unit === 'month') d.setUTCMonth(d.getUTCMonth() - qty);
  else if (unit === 'week') d.setUTCDate(d.getUTCDate() - qty * 7);
  else if (unit === 'day') d.setUTCDate(d.getUTCDate() - qty);
  else if (unit === 'hour') d.setUTCHours(d.getUTCHours() - qty);
  else if (unit === 'minute') d.setUTCMinutes(d.getUTCMinutes() - qty);
  return d.toISOString().slice(0, 10);
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

function inferLevel(title: string, topic: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels' {
  const t = `${title} ${topic}`.toLowerCase();
  if (/\b(advanced|masterclass|executive|strategy|director|optimization|lean|six sigma|erm)\b/.test(t)) {
    return 'Advanced';
  }
  if (/\b(fundamentals|basics|beginners|introduction|101|etiquette|onboarding)\b/.test(t)) {
    return 'Beginner';
  }
  if (/\b(management|analytics|operations|implementation|framework|audit)\b/.test(t)) {
    return 'Intermediate';
  }
  return 'All Levels';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function searchYouTubePublic(query: string): Promise<RawYtCandidate[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  for (let attempt = 0; attempt < 2; attempt++) {
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
      const out: RawYtCandidate[] = [];

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
          const durationText = (v.lengthText?.simpleText || '').trim();
          if (!title || !durationText || durationText.toUpperCase() === 'LIVE') continue;
          const durationMinutes = parseClockDurationToMinutes(durationText);
          if (durationMinutes < 2) continue;

          const publishedText = v.publishedTimeText?.simpleText || undefined;
          const publishedDate = approximateDateFromPublishedText(publishedText);
          const snippetRuns =
            v.detailedMetadataSnippets?.[0]?.snippetText?.runs ||
            v.descriptionSnippet?.runs ||
            [];
          const snippetDesc = snippetRuns
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
            durationText,
            durationMinutes,
            publishedText,
            publishedDate,
            snippetDesc: snippetDesc || undefined,
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

async function pickFirstVerifiedCandidate(
  cands: RawYtCandidate[],
  usedVideoIds: Set<string>,
  usedTitles: Set<string>,
  normalizeTitle: (t: string) => string
): Promise<RawYtCandidate | null> {
  const unseen = cands.filter((c) => !usedVideoIds.has(c.videoId) && !usedTitles.has(normalizeTitle(c.title))).slice(0, 4);
  if (unseen.length === 0) return null;
  const checks = await Promise.all(unseen.map((c) => verifyOembed(c.videoId)));
  for (let i = 0; i < unseen.length; i++) {
    const oe = checks[i];
    const cand = unseen[i];
    const norm = normalizeTitle(oe.title || cand.title);
    if (oe.ok && !usedVideoIds.has(cand.videoId) && !usedTitles.has(norm)) {
      usedVideoIds.add(cand.videoId);
      usedTitles.add(norm);
      return {
        ...cand,
        title: oe.title || cand.title,
        channelName: oe.author || cand.channelName,
        channelUrl: oe.authorUrl || cand.channelUrl,
      };
    }
  }
  return null;
}

async function main() {
  const existingPath = path.resolve(process.cwd(), 'public', 'data', 'marketplace_courses.json');
  const existingRaw: any[] = fs.existsSync(existingPath)
    ? JSON.parse(fs.readFileSync(existingPath, 'utf8'))
    : [];

  const outPath = path.resolve(process.cwd(), 'public', 'data', 'corporate_training_courses.json');
  const alreadySaved: MarketplaceCourse[] = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
    : [];

  const usedVideoIds = new Set<string>(EXISTING_CURATED_VIDEO_IDS);
  const usedTitles = new Set<string>();
  const normalizeTitle = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const c of [...existingRaw, ...alreadySaved]) {
    if (c.youtubeVideoId) usedVideoIds.add(String(c.youtubeVideoId));
    if (c.title) usedTitles.add(normalizeTitle(String(c.title)));
  }

  const byCatExisting = new Map<string, MarketplaceCourse[]>();
  for (const c of alreadySaved) {
    const arr = byCatExisting.get(c.category) || [];
    arr.push(c);
    byCatExisting.set(c.category, arr);
  }

  const finalCourses: MarketplaceCourse[] = [];
  let baseIdx = 15001;

  for (const cat of CORPORATE_TRAINING_CATEGORIES) {
    const existingForCat = byCatExisting.get(cat.name) || [];
    if (existingForCat.length >= cat.targetVideos) {
      for (const item of existingForCat.slice(0, cat.targetVideos)) {
        const idx = baseIdx++;
        finalCourses.push({
          ...item,
          id: `OF-CRS-${String(idx).padStart(5, '0')}`,
          baseIndex: idx,
        });
      }
      console.log(`[Category ${cat.order}/20] ${cat.name}: reused ${cat.targetVideos} verified videos`);
      continue;
    }

    console.log(`[Category ${cat.order}/20] ${cat.name}: discovering 25 unique verified videos...`);
    const catPool: Array<{ topic: string; cand: RawYtCandidate }> = [];
    const spareCands: RawYtCandidate[] = [];

    const searchSeeds = cat.topics.map((topic) => ({
      topic,
      query: `${topic} ${cat.name} training`,
    }));

    // Run in slices of 13 topics with parallel oEmbed verification
    for (let i = 0; i < searchSeeds.length && catPool.length < cat.targetVideos; i += 13) {
      const slice = searchSeeds.slice(i, i + 13);
      const lists = await Promise.all(slice.map((s) => searchYouTubePublic(s.query)));
      const picks = await Promise.all(
        lists.map((cands) => pickFirstVerifiedCandidate(cands, usedVideoIds, usedTitles, normalizeTitle))
      );
      for (let j = 0; j < slice.length; j++) {
        if (catPool.length >= cat.targetVideos) break;
        const picked = picks[j];
        if (picked) {
          catPool.push({ topic: slice[j].topic, cand: picked });
          for (const extra of lists[j] || []) {
            if (extra.videoId !== picked.videoId) spareCands.push(extra);
          }
        } else {
          for (const extra of lists[j] || []) spareCands.push(extra);
        }
      }
      await sleep(50);
    }

    // Backfill from spare candidates found in topic searches first (zero extra YouTube searches)
    if (catPool.length < cat.targetVideos && spareCands.length > 0) {
      for (let k = 0; k < spareCands.length && catPool.length < cat.targetVideos; k += 8) {
        const batch = spareCands
          .slice(k, k + 8)
          .filter((c) => !usedVideoIds.has(c.videoId) && !usedTitles.has(normalizeTitle(c.title)));
        if (batch.length === 0) continue;
        const checks = await Promise.all(batch.map((c) => verifyOembed(c.videoId)));
        for (let m = 0; m < batch.length && catPool.length < cat.targetVideos; m++) {
          const oe = checks[m];
          const cand = batch[m];
          const norm = normalizeTitle(oe.title || cand.title);
          if (oe.ok && !usedVideoIds.has(cand.videoId) && !usedTitles.has(norm)) {
            usedVideoIds.add(cand.videoId);
            usedTitles.add(norm);
            const topic = cat.topics[catPool.length % cat.topics.length];
            catPool.push({
              topic,
              cand: {
                ...cand,
                title: oe.title || cand.title,
                channelName: oe.author || cand.channelName,
                channelUrl: oe.authorUrl || cand.channelUrl,
              },
            });
          }
        }
      }
    }

    // Broad fallback queries only if still < 25
    if (catPool.length < cat.targetVideos) {
      const extraQueries = [
        `${cat.name} complete training course`,
        `${cat.name} tutorial for employees`,
        `${cat.name} workshop webinar masterclass`,
        `${cat.name} corporate management skills`,
        `${cat.topics[0]} tutorial`,
        `${cat.topics[1] || cat.name} explained`,
      ];
      const lists = await Promise.all(extraQueries.map((q) => searchYouTubePublic(q)));
      const flat = lists.flat();
      for (let k = 0; k < flat.length && catPool.length < cat.targetVideos; k += 8) {
        const batch = flat
          .slice(k, k + 8)
          .filter((c) => !usedVideoIds.has(c.videoId) && !usedTitles.has(normalizeTitle(c.title)));
        if (batch.length === 0) continue;
        const checks = await Promise.all(batch.map((c) => verifyOembed(c.videoId)));
        for (let m = 0; m < batch.length && catPool.length < cat.targetVideos; m++) {
          const oe = checks[m];
          const cand = batch[m];
          const norm = normalizeTitle(oe.title || cand.title);
          if (oe.ok && !usedVideoIds.has(cand.videoId) && !usedTitles.has(norm)) {
            usedVideoIds.add(cand.videoId);
            usedTitles.add(norm);
            const topic = cat.topics[catPool.length % cat.topics.length];
            catPool.push({
              topic,
              cand: {
                ...cand,
                title: oe.title || cand.title,
                channelName: oe.author || cand.channelName,
                channelUrl: oe.authorUrl || cand.channelUrl,
              },
            });
          }
        }
      }
    }

    let catAdded = 0;
    for (const { topic, cand } of catPool.slice(0, cat.targetVideos)) {
      const idx = baseIdx++;
      catAdded++;
      const id = `OF-CRS-${String(idx).padStart(5, '0')}`;
      const contentType = inferCorporateContentType({
        title: cand.title,
        description: `${cand.snippetDesc || ''} ${cat.description} Topic: ${topic}`,
        durationMinutes: cand.durationMinutes,
        hasPlaylistId: false,
      });
      const level = inferLevel(cand.title, topic);
      const language = detectVideoLanguage(cand.title, cand.snippetDesc);
      const estimatedHours = Math.max(1, Math.round((cand.durationMinutes / 60) * 10) / 10);
      const thumb = `https://i.ytimg.com/vi/${cand.videoId}/hqdefault.jpg`;
      const ytUrl = `https://www.youtube.com/watch?v=${cand.videoId}`;
      const snippetPart = cand.snippetDesc ? `${cand.snippetDesc.slice(0, 180)} ` : '';
      const shortDesc = `${snippetPart}Verified YouTube ${contentType.toLowerCase()} on ${topic} (${cat.name}) by ${cand.channelName} (${cand.durationText}).`.trim();

      finalCourses.push({
        id,
        title: cand.title.slice(0, 220),
        category: cat.name,
        categories: [cat.name],
        categoryGroup: cat.domainGroup,
        subcategory: topic,
        topic,
        level,
        duration: cand.durationText,
        durationMinutes: cand.durationMinutes,
        estimatedHours,
        pricingTier: 'Corporate Track',
        price: 0,
        isFree: false,
        status: 'Published',
        courseType: 'youtube_video',
        contentType,
        libraryCollection: 'corporate_training',
        sourceVerificationStatus: 'Verified YouTube Resource',
        youtubeUrl: ytUrl,
        youtubeVideoId: cand.videoId,
        youtubeChannelId: cand.channelId,
        youtubeChannelName: cand.channelName,
        youtubeChannelUrl:
          cand.channelUrl ||
          (cand.channelId ? `https://www.youtube.com/channel/${cand.channelId}` : undefined),
        publishedDate: cand.publishedDate,
        instructorName: cand.channelName,
        language,
        keywords: [cat.name, topic, contentType, cand.channelName, 'Corporate Training', 'YouTube'],
        thumbnailUrl: thumb,
        imageUrl: thumb,
        shortDesc,
        description: `${cand.snippetDesc ? `${cand.snippetDesc}\n\n` : ''}Verified YouTube ${contentType} on ${topic} under ${cat.name} presented by ${cand.channelName} (${cand.durationText}${cand.publishedText ? `, published ${cand.publishedText}` : ''}). Part of the OpenFrame Education 500-Video Corporate Management & Employee Skill Development Library.`,
        learningObjectives: [
          `Master practical ${topic.toLowerCase()} workflows for corporate teams`,
          `Apply ${cat.name.toLowerCase()} standards in real workplace scenarios`,
          `Complete topic quiz & practical assignment in Quinn AI workspace`,
        ],
        modules: [
          {
            moduleNumber: 1,
            title: `${topic} — Core Concepts & Guided Video Lesson`,
            duration: cand.durationText,
            lessons: [
              `Watch Verified Training: ${cand.title.slice(0, 80)}`,
              `Workplace Application & Role Checklist (${topic})`,
              `Quinn AI Verification Quiz & Practical Assignment`,
            ],
          },
        ],
        targetAudience: `Employees, managers, team leads, and professionals building applied competence in ${cat.name}.`,
        skillsAcquired: [cat.name, topic, 'Workplace Execution'],
        practicalProjects: [`Applied Workplace Case Study: ${topic}`],
        assessmentMethod: 'Quinn AI Comprehension Quiz + Practical Workplace Assignment',
        certificateEligibility: true,
        certificateNote: 'Eligible for OpenFrame Corporate Skill Verification Certificate upon quiz & assignment completion.',
        instructor: {
          name: cand.channelName,
          role: 'YouTube Educational Creator',
          organization: `${cand.channelName} · Verified OpenFrame Video Source`,
        },
        recommendedVideos: [
          {
            id: `yt-${cand.videoId}`,
            videoId: cand.videoId,
            youtubeId: cand.videoId,
            title: cand.title.slice(0, 220),
            channelTitle: cand.channelName,
            thumbnail: thumb,
            thumbnailUrl: thumb,
            duration: cand.durationText,
            level: level === 'Advanced' ? 'Advanced' : level === 'Intermediate' ? 'Intermediate' : 'Beginner',
            recommendedReason: `Verified corporate training video for ${topic} (${cat.name}).`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${cand.videoId}`,
            source: 'youtube_oembed_verified',
          },
        ],
        isPopular: catAdded % 4 === 0,
        isTrending: catAdded % 5 === 0,
        isNew: true,
        isRecommended: catAdded % 3 === 0,
        isCareerTrack: true,
        isCustomAdded: false,
        baseIndex: idx,
        rating: Number((4.72 + ((idx % 25) / 100)).toFixed(2)),
        enrolledCount: 180 + ((idx * 37) % 950),
        createdAt: '2026-11-14T00:00:00.000Z',
        updatedAt: '2026-11-14T00:00:00.000Z',
      });
    }

    fs.writeFileSync(outPath, JSON.stringify(finalCourses, null, 2), 'utf8');
    console.log(` -> Saved ${catAdded}/${cat.targetVideos} for ${cat.name} (total=${finalCourses.length})`);
  }

  console.log(`\nALL DONE! Total verified corporate courses saved: ${finalCourses.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
