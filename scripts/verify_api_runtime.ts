import { CORPORATE_TRAINING_CATEGORIES } from '../src/data/corporateTrainingTaxonomy';

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';

async function fetchJson(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json();
  return { status: res.status, ok: res.ok, json };
}

async function main() {
  console.log(`Testing live Express API endpoints on ${BASE_URL}...`);

  const statusRes = await fetchJson('/api/discovery/status');
  if (!statusRes.ok) throw new Error(`/api/discovery/status failed: ${statusRes.status}`);
  console.log('/api/discovery/status:', {
    apiKeyConfigured: statusRes.json.quota?.apiKeyConfigured,
    missingRequirement: statusRes.json.missingRequirement,
    baseCatalog: statusRes.json.targetGoal?.baseCatalog,
  });

  const statsRes = await fetchJson('/api/marketplace/base-stats');
  if (!statsRes.ok) throw new Error(`/api/marketplace/base-stats failed: ${statsRes.status}`);
  console.log('/api/marketplace/base-stats:', {
    totalBase: statsRes.json.totalBase,
    youtubeCourses: statsRes.json.youtubeCourses,
    freeCourses: statsRes.json.freeCourses,
    categoriesTotal: Object.keys(statsRes.json.categoryCounts || {}).length,
  });

  if (Number(statsRes.json.totalBase) !== 15500) {
    throw new Error(`Expected totalBase === 15500 (15,000 + 500 corporate), got ${statsRes.json.totalBase}`);
  }

  for (const cat of CORPORATE_TRAINING_CATEGORIES) {
    const count = statsRes.json.categoryCounts?.[cat.name] || 0;
    if (count < 25) {
      throw new Error(`Category "${cat.name}" has only ${count} courses in base-stats (expected >= 25)`);
    }
  }
  console.log('All 20 corporate categories confirmed >= 25 courses in live base-stats!');

  const searchAllRes = await fetchJson('/api/marketplace/base-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ libraryCollection: 'corporate_training', page: 1, pageSize: 50 }),
  });
  if (!searchAllRes.ok || Number(searchAllRes.json.total) !== 500) {
    throw new Error(
      `Expected corporate_training library search total === 500, got ${searchAllRes.json.total}`
    );
  }
  console.log('Corporate library search total:', searchAllRes.json.total);

  // Spot search by topic + contentType + existing 15,000 catalog preservation
  const topicRes = await fetchJson('/api/marketplace/base-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      libraryCollection: 'corporate_training',
      query: 'payroll',
      page: 1,
      pageSize: 20,
    }),
  });
  if (!topicRes.ok || Number(topicRes.json.total) < 1) {
    throw new Error('Topic keyword search "payroll" returned 0 corporate results');
  }
  console.log('Topic search "payroll" matches:', topicRes.json.total);

  const corpFirst = await fetchJson('/api/marketplace/base-course/OF-CRS-15001');
  const corpLast = await fetchJson('/api/marketplace/base-course/OF-CRS-15500');
  const origFirst = await fetchJson('/api/marketplace/base-course/OF-CRS-00001');
  const origLast = await fetchJson('/api/marketplace/base-course/OF-CRS-15000');

  if (!corpFirst.ok || !corpFirst.json.course?.youtubeVideoId) {
    throw new Error('Missing corporate course OF-CRS-15001');
  }
  if (!corpLast.ok || !corpLast.json.course?.youtubeVideoId) {
    throw new Error('Missing corporate course OF-CRS-15500');
  }
  if (!origFirst.ok || !origLast.ok) {
    throw new Error('Existing 15,000 catalog boundary check failed');
  }

  // Test live video verification fallback endpoint using real discovered video ID
  const verifyRes = await fetchJson('/api/discovery/verify-videos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      videoIds: [corpFirst.json.course.youtubeVideoId, corpLast.json.course.youtubeVideoId],
    }),
  });
  if (!verifyRes.ok) {
    throw new Error(`/api/discovery/verify-videos failed: ${verifyRes.status}`);
  }
  console.log('Live verify-videos check:', {
    firstValid: verifyRes.json.verifiedVideos?.[corpFirst.json.course.youtubeVideoId]?.valid,
    lastValid: verifyRes.json.verifiedVideos?.[corpLast.json.course.youtubeVideoId]?.valid,
  });

  console.log('\nALL LIVE API RUNTIME CHECKS PASSED!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
