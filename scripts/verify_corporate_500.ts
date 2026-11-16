import fs from 'fs';
import path from 'path';
import { CORPORATE_TRAINING_CATEGORIES } from '../src/data/corporateTrainingTaxonomy';
import type { MarketplaceCourse } from '../src/types';

async function main() {
  const basePath = path.resolve(process.cwd(), 'public', 'data', 'marketplace_courses.json');
  const corpPath = path.resolve(process.cwd(), 'public', 'data', 'corporate_training_courses.json');

  if (!fs.existsSync(basePath)) {
    throw new Error('Missing public/data/marketplace_courses.json');
  }
  if (!fs.existsSync(corpPath)) {
    throw new Error('Missing public/data/corporate_training_courses.json');
  }

  const baseCourses: MarketplaceCourse[] = JSON.parse(fs.readFileSync(basePath, 'utf8'));
  const corpCourses: MarketplaceCourse[] = JSON.parse(fs.readFileSync(corpPath, 'utf8'));

  console.log(`Existing marketplace_courses.json count: ${baseCourses.length}`);
  console.log(`Corporate training library count: ${corpCourses.length}`);

  const baseVideoIds = new Set<string>(
    baseCourses.map((c) => c.youtubeVideoId).filter((v): v is string => Boolean(v))
  );

  const corpIds = new Set<string>();
  const corpVideoIds = new Set<string>();
  const byCategory: Record<string, number> = {};
  const byContentType: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  const byLanguage: Record<string, number> = {};

  const missingFields: string[] = [];
  const invalidVideoIds: string[] = [];
  const invalidUrls: string[] = [];
  const overlapWithBase: string[] = [];
  const duplicateVideoIds: string[] = [];

  for (const c of corpCourses) {
    if (corpIds.has(c.id)) missingFields.push(`Duplicate course ID: ${c.id}`);
    corpIds.add(c.id);

    if (!c.youtubeVideoId || !/^[a-zA-Z0-9_-]{11}$/.test(c.youtubeVideoId)) {
      invalidVideoIds.push(`${c.id}: ${c.youtubeVideoId}`);
    } else {
      if (corpVideoIds.has(c.youtubeVideoId)) duplicateVideoIds.push(`${c.id}:${c.youtubeVideoId}`);
      corpVideoIds.add(c.youtubeVideoId);
      if (baseVideoIds.has(c.youtubeVideoId)) overlapWithBase.push(`${c.id}:${c.youtubeVideoId}`);
    }

    if (!c.youtubeUrl || !c.youtubeUrl.startsWith('https://www.youtube.com/watch?v=')) {
      invalidUrls.push(`${c.id}: ${c.youtubeUrl}`);
    }

    if (!c.title || !c.youtubeChannelName || !c.thumbnailUrl || !c.duration || !c.category || !c.topic || !c.shortDesc || !c.level || !c.contentType) {
      missingFields.push(`Incomplete metadata on ${c.id}`);
    }

    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    const ct = c.contentType || 'Unknown';
    byContentType[ct] = (byContentType[ct] || 0) + 1;
    byLevel[c.level] = (byLevel[c.level] || 0) + 1;
    const lang = c.language || 'Unknown';
    byLanguage[lang] = (byLanguage[lang] || 0) + 1;
  }

  console.log('\nCategory Breakdown (20 expected, 25 each):');
  let allCategoriesHave25 = true;
  for (const cat of CORPORATE_TRAINING_CATEGORIES) {
    const count = byCategory[cat.name] || 0;
    if (count !== 25) allCategoriesHave25 = false;
    console.log(`  [${String(cat.order).padStart(2, '0')}] ${cat.name}: ${count}/25`);
  }

  console.log('\nContent Type Distribution:', byContentType);
  console.log('Difficulty Level Distribution:', byLevel);
  console.log('Language Distribution:', byLanguage);

  const publishedDateCount = corpCourses.filter((c) => Boolean(c.publishedDate)).length;
  const channelUrlCount = corpCourses.filter((c) => Boolean(c.youtubeChannelUrl)).length;
  console.log(`PublishedDate populated: ${publishedDateCount}/${corpCourses.length}`);
  console.log(`ChannelUrl populated: ${channelUrlCount}/${corpCourses.length}`);

  // Live oEmbed spot-check on 20 videos (1 per category)
  const samples = CORPORATE_TRAINING_CATEGORIES.map((cat) =>
    corpCourses.find((c) => c.category === cat.name)
  ).filter((c): c is MarketplaceCourse => Boolean(c));

  const oembedChecks = await Promise.all(
    samples.map(async (c) => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(c.youtubeUrl!)}&format=json`,
          { signal: AbortSignal.timeout(6000) }
        );
        return { id: c.id, videoId: c.youtubeVideoId, ok: res.ok };
      } catch {
        return { id: c.id, videoId: c.youtubeVideoId, ok: false };
      }
    })
  );
  const oembedOkCount = oembedChecks.filter((r) => r.ok).length;
  console.log(`Live oEmbed spot-check (1 per category): ${oembedOkCount}/${samples.length} reachable`);

  console.log('\nValidation Checks:');
  console.log('  Total === 500:', corpCourses.length === 500);
  console.log('  Unique IDs === 500:', corpIds.size === 500);
  console.log('  Unique Video IDs === 500:', corpVideoIds.size === 500);
  console.log('  All 20 Categories === 25:', allCategoriesHave25);
  console.log('  Invalid Video IDs:', invalidVideoIds.length);
  console.log('  Invalid URLs:', invalidUrls.length);
  console.log('  Duplicate Video IDs:', duplicateVideoIds.length);
  console.log('  Overlap with marketplace_courses.json:', overlapWithBase.length);
  console.log('  Missing required fields:', missingFields.length);

  if (
    corpCourses.length !== 500 ||
    corpVideoIds.size !== 500 ||
    !allCategoriesHave25 ||
    invalidVideoIds.length > 0 ||
    invalidUrls.length > 0 ||
    duplicateVideoIds.length > 0 ||
    overlapWithBase.length > 0 ||
    missingFields.length > 0
  ) {
    console.error('FAILED VALIDATION!', {
      invalidVideoIds,
      invalidUrls,
      duplicateVideoIds,
      overlapWithBase,
      missingFields: missingFields.slice(0, 10),
    });
    process.exit(1);
  }
  console.log('\nALL VALIDATIONS PASSED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
