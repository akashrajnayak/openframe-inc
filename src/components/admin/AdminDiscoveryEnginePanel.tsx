import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  ExternalLink,
  Filter,
  Globe,
  History,
  KeyRound,
  Layers,
  ListVideo,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Trash2,
  Upload,
  Youtube,
} from 'lucide-react';
import {
  ALL_70_DISCOVERY_CATEGORY_NAMES,
  DISCOVERY_COURSE_MODIFIERS,
  DISCOVERY_EDUCATION_FIELDS,
  DISCOVERY_LANGUAGES,
} from '../../data/discoveryTaxonomy';
import { discoveryService } from '../../services/discoveryService';
import type { BatchImportProgress } from '../../services/marketplaceService';
import type {
  DiscoveredCourse,
  DiscoveredCourseReviewStatus,
  DiscoveryJobState,
  DiscoveryQuotaStatus,
  MarketplaceCounters,
} from '../../types';

interface AdminDiscoveryEnginePanelProps {
  adminEmail: string;
  adminUid: string;
  counters: MarketplaceCounters | null;
  onCoursesMutated: () => Promise<void>;
  onNotify: (msg: string) => void;
  onLogActivity: (action: string, collectionName: string, recordId?: string, details?: string) => Promise<void>;
}

const TARGET_CATALOG_MILESTONE = 100000;

export const AdminDiscoveryEnginePanel: React.FC<AdminDiscoveryEnginePanelProps> = ({
  adminEmail,
  adminUid,
  counters,
  onCoursesMutated,
  onNotify,
  onLogActivity,
}) => {
  const [quota, setQuota] = useState<DiscoveryQuotaStatus | null>(null);
  const [activeJob, setActiveJob] = useState<DiscoveryJobState | null>(null);
  const [recentJobs, setRecentJobs] = useState<DiscoveryJobState[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [apiErrorBanner, setApiErrorBanner] = useState<{
    code?: string;
    missingRequirement?: string;
    message: string;
  } | null>(null);

  // Batch Configuration
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    ALL_70_DISCOVERY_CATEGORY_NAMES.slice(0, 12)
  );
  const [categoryPickerQuery, setCategoryPickerQuery] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Hindi']);
  const [emergingKeywordsRaw, setEmergingKeywordsRaw] = useState('Prompt Engineering, Quantum Computing, EV Tech');
  const [includeVideos, setIncludeVideos] = useState(true);
  const [includePlaylists, setIncludePlaylists] = useState(true);
  const [includeChannels, setIncludeChannels] = useState(false);
  const [useAllModifiers, setUseAllModifiers] = useState(false);
  const [autoApproveImport, setAutoApproveImport] = useState(false);
  const [targetBatchLimit, setTargetBatchLimit] = useState(100);
  const [isStepping, setIsStepping] = useState(false);
  const [isRunningTest20, setIsRunningTest20] = useState(false);
  const loopControlRef = useRef<{ running: boolean }>({ running: false });

  // Direct Search YouTube panel
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState(ALL_70_DISCOVERY_CATEGORY_NAMES[0]);
  const [searchLanguage, setSearchLanguage] = useState('English');
  const [searchFormat, setSearchFormat] = useState<'video' | 'playlist' | 'channel'>('video');
  const [searchingYouTube, setSearchingYouTube] = useState(false);
  const [directSearchResults, setDirectSearchResults] = useState<DiscoveredCourse[]>([]);
  const [directNextPageToken, setDirectNextPageToken] = useState<string | undefined>(undefined);
  const [directTotalResults, setDirectTotalResults] = useState<number | undefined>(undefined);

  // Discovered Queue State (/discovered_courses)
  const [stagedQueue, setStagedQueue] = useState<DiscoveredCourse[]>([]);
  const [queueFilter, setQueueFilter] = useState<DiscoveredCourseReviewStatus | 'All'>('Pending Review');
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importingSelected, setImportingSelected] = useState(false);
  const [importProgress, setImportProgress] = useState<BatchImportProgress | null>(null);
  const [auditingDuplicates, setAuditingDuplicates] = useState(false);

  const loadEngineStatus = async () => {
    setLoadingStatus(true);
    try {
      const [statusPayload, jobsList] = await Promise.all([
        discoveryService.getStatus(),
        discoveryService.listRecentJobs(10),
      ]);
      setQuota(statusPayload.quota);
      if (statusPayload.activeJob) {
        setActiveJob(statusPayload.activeJob);
      } else if (jobsList.length > 0 && !activeJob) {
        setActiveJob(jobsList[0]);
      }
      setRecentJobs(jobsList);

      if (!statusPayload.quota.apiKeyConfigured) {
        setApiErrorBanner({
          code: 'MISSING_API_KEY',
          missingRequirement: 'YOUTUBE_API_KEY',
          message:
            'YOUTUBE_API_KEY is not configured in server environment secrets. Live YouTube Data API v3 search, 20-resource test verification, and batch discovery are paused until a valid Google YouTube Data API v3 key is provisioned on the server.',
        });
      } else {
        setApiErrorBanner(null);
      }
    } catch (err: any) {
      setApiErrorBanner({
        code: err?.code,
        missingRequirement: err?.missingRequirement,
        message: err?.message || 'Unable to contact YouTube Discovery Engine.',
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadStagedQueue = async (filterOverride?: DiscoveredCourseReviewStatus | 'All') => {
    setLoadingQueue(true);
    try {
      const effectiveFilter = filterOverride ?? queueFilter;
      const items = await discoveryService.listDiscoveredCourses(effectiveFilter, 200);
      setStagedQueue(items);
      setSelectedIds(new Set());
    } catch (err: any) {
      console.warn('Could not load discovered queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadEngineStatus();
    return () => {
      loopControlRef.current.running = false;
    };
  }, []);

  useEffect(() => {
    loadStagedQueue(queueFilter);
  }, [queueFilter]);

  const handleEngineError = (err: any, fallback: string) => {
    const code = err?.code;
    const message = err?.message || fallback;
    if (err?.quota) setQuota(err.quota);
    setApiErrorBanner({
      code,
      missingRequirement: err?.missingRequirement,
      message,
    });
    onNotify(message);
  };

  const runControlledBatchLoop = async () => {
    loopControlRef.current.running = true;
    setIsStepping(true);
    try {
      while (loopControlRef.current.running) {
        const res = await discoveryService.stepBatchJob(25, {
          email: adminEmail,
          uid: adminUid,
        });
        setActiveJob(res.job);
        setQuota(res.quota);
        if (res.importLog) {
          await onCoursesMutated();
        }
        await loadStagedQueue();

        if (
          res.job.status === 'completed' ||
          res.job.status === 'paused' ||
          res.job.status === 'stopped' ||
          res.job.status === 'error'
        ) {
          loopControlRef.current.running = false;
          if (res.job.status === 'completed') {
            await onLogActivity(
              'YouTube Discovery Job Completed',
              'discovery_jobs',
              res.job.id,
              `Discovered ${res.job.discoveredCount}, Imported ${res.job.importedCount}, Duplicates skipped ${res.job.duplicateCount}`
            );
            onNotify(`Discovery batch completed (${res.job.discoveredCount} candidates collected).`);
          }
          break;
        }
        // Gentle throttle between YouTube search pages to protect quota and network stability
        await new Promise((r) => setTimeout(r, 900));
      }
    } catch (err: any) {
      loopControlRef.current.running = false;
      handleEngineError(err, 'Automated discovery stopped due to an API or quota error.');
    } finally {
      setIsStepping(false);
      discoveryService.listRecentJobs(10).then(setRecentJobs).catch(() => {});
    }
  };

  const handleStartDiscovery = async () => {
    if (selectedCategories.length === 0) {
      onNotify('Select at least one education field or enter emerging keywords.');
      return;
    }
    if (selectedLanguages.length === 0) {
      onNotify('Select at least one target language.');
      return;
    }
    setApiErrorBanner(null);
    try {
      const emergingKeywords = emergingKeywordsRaw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      const { job, quota: updatedQuota } = await discoveryService.startBatchJob({
        autoApproveImport,
        selectedCategories,
        selectedLanguages,
        selectedModifiers: useAllModifiers
          ? DISCOVERY_COURSE_MODIFIERS
          : DISCOVERY_COURSE_MODIFIERS.slice(0, 6),
        emergingKeywords,
        includeVideos,
        includePlaylists,
        includeChannels,
        targetBatchLimit,
      });

      setActiveJob(job);
      setQuota(updatedQuota);
      await onLogActivity(
        'Start YouTube Discovery Job',
        'discovery_jobs',
        job.id,
        `Categories: ${selectedCategories.length}, Languages: ${selectedLanguages.join(', ')}, Target: ${targetBatchLimit}`
      );
      onNotify(`Started YouTube discovery job (${job.id}). Running controlled batches...`);
      await runControlledBatchLoop();
    } catch (err: any) {
      handleEngineError(err, 'Unable to start discovery job.');
    }
  };

  const handlePauseDiscovery = async () => {
    loopControlRef.current.running = false;
    try {
      const job = await discoveryService.pauseJob();
      if (job) setActiveJob(job);
      onNotify('Discovery paused cleanly.');
    } catch (err: any) {
      onNotify(err?.message || 'Failed to pause discovery.');
    }
  };

  const handleResumeDiscovery = async () => {
    setApiErrorBanner(null);
    try {
      const job = await discoveryService.resumeJob();
      if (job) {
        setActiveJob(job);
        onNotify('Resuming discovery job...');
        await runControlledBatchLoop();
      }
    } catch (err: any) {
      handleEngineError(err, 'Could not resume discovery job.');
    }
  };

  const handleStopDiscovery = async () => {
    loopControlRef.current.running = false;
    try {
      const job = await discoveryService.stopJob();
      if (job) setActiveJob(job);
      onNotify('Discovery stopped.');
      discoveryService.listRecentJobs(10).then(setRecentJobs).catch(() => {});
    } catch (err: any) {
      onNotify(err?.message || 'Failed to stop discovery.');
    }
  };

  const handleRunTestBatch20 = async () => {
    setIsRunningTest20(true);
    setApiErrorBanner(null);
    try {
      const res = await discoveryService.runTestBatch20({
        selectedCategories:
          selectedCategories.length > 0 ? selectedCategories.slice(0, 4) : ALL_70_DISCOVERY_CATEGORY_NAMES.slice(0, 4),
        selectedLanguages,
        includePlaylists,
      });
      setActiveJob(res.job);
      setQuota(res.quota);
      await onLogActivity(
        'YouTube Test Batch (20 Resources)',
        'discovery_jobs',
        res.job.id,
        `Collected ${res.items.length} candidates (${res.duplicateCount} duplicates flagged)`
      );
      setQueueFilter('Pending Review');
      await loadStagedQueue('Pending Review');
      onNotify(`Test batch finished: ${res.items.length} resources staged for verification.`);
    } catch (err: any) {
      handleEngineError(err, 'Test batch failed.');
    } finally {
      setIsRunningTest20(false);
    }
  };

  const handleDirectYouTubeSearch = async (useNextPage = false) => {
    const q = searchQuery.trim() || `${searchCategory} complete course`;
    setSearchingYouTube(true);
    setApiErrorBanner(null);
    try {
      const res = await discoveryService.searchYouTube({
        query: q,
        category: searchCategory,
        languageLabel: searchLanguage,
        searchType: searchFormat,
        pageToken: useNextPage ? directNextPageToken : undefined,
        maxResults: 20,
      });
      setDirectSearchResults((prev) => (useNextPage ? [...prev, ...res.items] : res.items));
      setDirectNextPageToken(res.nextPageToken);
      setDirectTotalResults(res.totalResults);
      setQuota(res.quota);

      if (res.items.length > 0) {
        await discoveryService.saveDiscoveredCandidates(res.items);
        if (queueFilter === 'Pending Review') await loadStagedQueue('Pending Review');
      }
      onNotify(
        `YouTube search returned ${res.items.length} unique educational resources (${res.duplicatesSkipped} duplicates skipped).`
      );
    } catch (err: any) {
      handleEngineError(err, 'YouTube Data API v3 search failed.');
    } finally {
      setSearchingYouTube(false);
    }
  };

  const handleApproveAndImport = async (itemsToImport: DiscoveredCourse[]) => {
    if (itemsToImport.length === 0) return;
    setImportingSelected(true);
    setImportProgress({ processed: 0, total: itemsToImport.length, imported: 0, duplicates: 0, failed: 0, percent: 0 });
    try {
      const { importLog } = await discoveryService.approveAndImportCourses(
        itemsToImport,
        { email: adminEmail, uid: adminUid },
        (p) => setImportProgress(p)
      );
      await onLogActivity(
        'Approve & Import Discovered Courses',
        'courses',
        importLog.id,
        `Imported ${importLog.importedCount} verified courses (${importLog.duplicateCount} duplicates, ${importLog.failedCount} failed)`
      );
      await Promise.all([onCoursesMutated(), loadStagedQueue()]);
      onNotify(
        `Published ${importLog.importedCount} unique courses to OpenFrame Marketplace (${importLog.duplicateCount} duplicates prevented).`
      );
    } catch (err: any) {
      onNotify(err?.message || 'Failed approving discovered courses.');
    } finally {
      setImportingSelected(false);
      setTimeout(() => setImportProgress(null), 4000);
    }
  };

  const handleReject = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      await discoveryService.rejectDiscoveredCourses(ids);
      await loadStagedQueue();
      onNotify(`Rejected ${ids.length} discovered item(s).`);
    } catch (err: any) {
      onNotify(err?.message || 'Failed updating status.');
    }
  };

  const handleAuditDuplicates = async () => {
    setAuditingDuplicates(true);
    try {
      const res = await discoveryService.runDuplicateAuditOnPending();
      await loadStagedQueue();
      onNotify(`Duplicate audit checked ${res.checked} pending items and flagged ${res.flaggedDuplicates} duplicate(s).`);
    } catch (err: any) {
      onNotify(err?.message || 'Duplicate audit failed.');
    } finally {
      setAuditingDuplicates(false);
    }
  };

  const totalPublished = counters?.totalCoursesAvailable ?? 0;
  const baseCount = counters?.baseCatalogTotal ?? 0;
  const newlyAdded = counters?.newlyAddedCourses ?? 0;
  const remainingToward100k = Math.max(0, TARGET_CATALOG_MILESTONE - totalPublished);
  const progressPct = Math.min(100, Math.round((totalPublished / TARGET_CATALOG_MILESTONE) * 1000) / 10);
  const activeGoalLabel =
    totalPublished >= TARGET_CATALOG_MILESTONE
      ? `100,000+ Target Achieved (Continuous Expansion Active)`
      : `Target: ${TARGET_CATALOG_MILESTONE.toLocaleString()} Unique Courses (${remainingToward100k.toLocaleString()} remaining)`;

  const pendingCount = stagedQueue.filter((c) => c.reviewStatus === 'Pending Review').length;
  const dupFlaggedCount = stagedQueue.filter((c) => c.reviewStatus === 'Duplicate').length;
  const failedStagedCount = stagedQueue.filter((c) => c.reviewStatus === 'Failed').length;

  const filteredTaxonomyFields = DISCOVERY_EDUCATION_FIELDS.filter((f) => {
    const q = categoryPickerQuery.toLowerCase().trim();
    if (!q) return true;
    return f.name.toLowerCase().includes(q) || f.domainGroup.toLowerCase().includes(q);
  });

  const selectedCandidates = stagedQueue.filter((c) => selectedIds.has(c.id));

  return (
    <div className="space-y-6">
      {/* API Credential / Quota Error Banner (Honest Reporting — No Fake Results) */}
      {apiErrorBanner && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold text-amber-950 text-sm">
                {apiErrorBanner.missingRequirement
                  ? `Missing Server Requirement: ${apiErrorBanner.missingRequirement}`
                  : `YouTube Data API v3 Notice (${apiErrorBanner.code || 'ERROR'})`}
              </div>
              <p className="text-amber-900 leading-relaxed">{apiErrorBanner.message}</p>
              {apiErrorBanner.missingRequirement === 'YOUTUBE_API_KEY' && (
                <p className="text-amber-800">
                  Set <code className="px-1.5 py-0.5 rounded bg-amber-100 font-mono font-semibold">YOUTUBE_API_KEY</code> in the environment Secrets configuration and refresh status. No synthetic or fabricated YouTube links will be generated.
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={loadEngineStatus}
            disabled={loadingStatus}
            className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
            <span>Re-check API Status</span>
          </button>
        </div>
      )}

      {/* 100,000 Course Progress Tracker & Quota Telemetry */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Global YouTube Course Discovery & Import Engine
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{activeGoalLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
              <span className="font-semibold text-slate-600">YouTube Data API v3:</span>
              {quota?.apiKeyConfigured ? (
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="font-bold text-rose-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Missing Key
                </span>
              )}
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 tabular-nums">
              <span className="text-slate-500">Quota Today:</span>{' '}
              <strong className="text-slate-900">
                {(quota?.unitsUsedToday ?? 0).toLocaleString()} / {(quota?.dailyLimit ?? 10000).toLocaleString()}
              </strong>{' '}
              <span className="text-slate-400">units</span>
            </div>
          </div>
        </div>

        {/* 100,000 Milestone Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs tabular-nums">
            <span className="font-semibold text-slate-700">
              Live Published Catalog Progress ({totalPublished.toLocaleString()} / {TARGET_CATALOG_MILESTONE.toLocaleString()}+)
            </span>
            <span className="font-bold text-blue-700">{progressPct}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${Math.max(2, Math.min(100, progressPct))}%` }}
            />
          </div>
        </div>

        {/* 7 Required Live Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Existing Catalog</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {counters ? baseCount.toLocaleString() : '...'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Newly Imported</div>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5 tabular-nums">
              +{counters ? newlyAdded.toLocaleString() : '...'}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Job Discovered</div>
            <div className="text-lg font-extrabold text-blue-700 mt-0.5 tabular-nums">
              {(activeJob?.discoveredCount ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Verified Resources</div>
            <div className="text-lg font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {(activeJob?.verifiedCount ?? 0).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Duplicates Prevented</div>
            <div className="text-lg font-extrabold text-amber-700 mt-0.5 tabular-nums">
              {((activeJob?.duplicateCount ?? 0) + dupFlaggedCount).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Failed / Invalid</div>
            <div className="text-lg font-extrabold text-rose-700 mt-0.5 tabular-nums">
              {((activeJob?.failedCount ?? 0) + failedStagedCount).toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 text-white">
            <div className="text-[10px] font-semibold text-cyan-300 uppercase">Remaining to 100K</div>
            <div className="text-lg font-extrabold mt-0.5 tabular-nums">
              {counters ? remainingToward100k.toLocaleString() : '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Automated Batch Discovery Console + Direct YouTube Search */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left: Batch Discovery Engine Controls */}
        <div className="xl:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Batch YouTube Discovery Scope (70+ Fields x 16 Modifiers x Multi-Language)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Controlled batch queries with automatic nextPageToken pagination, exponential backoff, and O(1) duplicate suppression.
              </p>
            </div>
            {activeJob && (
              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border uppercase tracking-wider shrink-0 ${
                  activeJob.status === 'running'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : activeJob.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : activeJob.status === 'paused'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : activeJob.status === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Job: {activeJob.status}
              </span>
            )}
          </div>

          {/* 70+ Categories Multi-Select */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-bold text-slate-800 tabular-nums">
                Education Categories Selected ({selectedCategories.length} / {DISCOVERY_EDUCATION_FIELDS.length})
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={categoryPickerQuery}
                  onChange={(e) => setCategoryPickerQuery(e.target.value)}
                  placeholder="Filter 70+ fields..."
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] w-40"
                />
                <button
                  type="button"
                  onClick={() => setSelectedCategories(ALL_70_DISCOVERY_CATEGORY_NAMES)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  Select All 70
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap gap-1.5">
              {filteredTaxonomyFields.map((field) => {
                const selected = selectedCategories.includes(field.name);
                return (
                  <button
                    key={field.name}
                    type="button"
                    onClick={() =>
                      setSelectedCategories((prev) =>
                        selected ? prev.filter((c) => c !== field.name) : [...prev, field.name]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {field.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emerging Keywords + Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Emerging Subjects & Custom Queries (comma-separated)
              </label>
              <input
                type="text"
                value={emergingKeywordsRaw}
                onChange={(e) => setEmergingKeywordsRaw(e.target.value)}
                placeholder="e.g. AI Agents, Quantum Computing, EV Tech"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Batch Target Limit (Candidates per Run)
              </label>
              <select
                value={targetBatchLimit}
                onChange={(e) => setTargetBatchLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value={50}>50 Resources (Quick Sweep)</option>
                <option value={100}>100 Resources (Standard Batch)</option>
                <option value={250}>250 Resources (Multi-Category Batch)</option>
                <option value={500}>500 Resources (High-Volume Batch)</option>
                <option value={1000}>1,000 Resources (Max Single Job)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="block font-bold text-slate-800">Languages</label>
            <div className="flex flex-wrap gap-1.5">
              {DISCOVERY_LANGUAGES.map((lang) => {
                const active = selectedLanguages.includes(lang.label);
                return (
                  <button
                    key={lang.label}
                    type="button"
                    onClick={() =>
                      setSelectedLanguages((prev) =>
                        active ? prev.filter((l) => l !== lang.label) : [...prev, lang.label]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource Formats & Workflow Mode */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs pt-1 border-t border-slate-100">
            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeVideos}
                onChange={(e) => setIncludeVideos(e.target.checked)}
              />
              <span>Full Course Videos</span>
            </label>
            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includePlaylists}
                onChange={(e) => setIncludePlaylists(e.target.checked)}
              />
              <span>Playlists</span>
            </label>
            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeChannels}
                onChange={(e) => setIncludeChannels(e.target.checked)}
              />
              <span>Educational Channels</span>
            </label>
            <label className="flex items-center gap-1.5 font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={useAllModifiers}
                onChange={(e) => setUseAllModifiers(e.target.checked)}
              />
              <span>All 16 Search Modifiers</span>
            </label>
            <label className="flex items-center gap-1.5 font-semibold text-blue-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApproveImport}
                onChange={(e) => setAutoApproveImport(e.target.checked)}
              />
              <span>Auto-Approve & Publish Valid Courses</span>
            </label>
          </div>

          {/* Discovery Engine Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              type="button"
              disabled={isRunningTest20 || isStepping}
              onClick={handleRunTestBatch20}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{isRunningTest20 ? 'Running 20-Item Test...' : 'Run Test Batch (20 Resources)'}</span>
            </button>

            <button
              type="button"
              disabled={isStepping || isRunningTest20}
              onClick={handleStartDiscovery}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isStepping ? 'Discovering Batches...' : 'Start Discovery'}</span>
            </button>

            {activeJob?.status === 'running' && (
              <button
                type="button"
                onClick={handlePauseDiscovery}
                className="px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

            {(activeJob?.status === 'paused' || activeJob?.status === 'error') && (
              <button
                type="button"
                onClick={handleResumeDiscovery}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
            )}

            {(activeJob?.status === 'running' || activeJob?.status === 'paused') && (
              <button
                type="button"
                onClick={handleStopDiscovery}
                className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Direct Targeted YouTube Search + Pagination */}
        <div className="xl:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Youtube className="w-4 h-4 text-rose-600" />
              <span>Direct YouTube Educational Search</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Search live YouTube videos, playlists, or channels with nextPageToken pagination and stage verified matches.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDirectYouTubeSearch(false);
                }}
                placeholder="e.g. Generative AI complete course MIT, Tally GST Hindi..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <select
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {ALL_70_DISCOVERY_CATEGORY_NAMES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={searchLanguage}
                onChange={(e) => setSearchLanguage(e.target.value)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {DISCOVERY_LANGUAGES.map((l) => (
                  <option key={l.label} value={l.label}>
                    {l.label}
                  </option>
                ))}
              </select>

              <select
                value={searchFormat}
                onChange={(e) => setSearchFormat(e.target.value as any)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="video">Videos</option>
                <option value="playlist">Playlists</option>
                <option value="channel">Channels</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={searchingYouTube}
                onClick={() => handleDirectYouTubeSearch(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{searchingYouTube ? 'Searching...' : 'Search YouTube'}</span>
              </button>

              {directNextPageToken && (
                <button
                  type="button"
                  disabled={searchingYouTube}
                  onClick={() => handleDirectYouTubeSearch(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Next Page (nextPageToken)
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {directSearchResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Run a YouTube query to preview live verified courses before importing.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                <div className="text-[11px] text-slate-500 flex justify-between tabular-nums">
                  <span>{directSearchResults.length} unique candidate(s) fetched</span>
                  {directTotalResults !== undefined && (
                    <span>~{directTotalResults.toLocaleString()} YouTube results</span>
                  )}
                </div>
                {directSearchResults.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {item.youtubeChannelName} · {item.language} · {item.duration || item.courseType}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApproveAndImport([item])}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discovered Courses Review, Verification & Duplicate Audit Queue */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Discovered Course Verification & Import Queue</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {stagedQueue.length} item(s) loaded · {pendingCount} awaiting approval · Certificate eligibility stays false unless verified in source metadata
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={queueFilter}
              onChange={(e) => setQueueFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
            >
              <option value="Pending Review">Pending Review</option>
              <option value="All">All Staged Items</option>
              <option value="Imported">Imported</option>
              <option value="Duplicate">Duplicates Prevented</option>
              <option value="Failed">Failed / Invalid</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              type="button"
              disabled={auditingDuplicates}
              onClick={handleAuditDuplicates}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{auditingDuplicates ? 'Auditing...' : 'Detect Duplicates'}</span>
            </button>

            <button
              type="button"
              disabled={importingSelected || selectedCandidates.length === 0}
              onClick={() => handleApproveAndImport(selectedCandidates)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Approve Selected ({selectedCandidates.length})</span>
            </button>

            <button
              type="button"
              disabled={importingSelected || pendingCount === 0}
              onClick={() =>
                handleApproveAndImport(stagedQueue.filter((c) => c.reviewStatus === 'Pending Review'))
              }
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve & Import All Pending ({pendingCount})</span>
            </button>

            <button
              type="button"
              disabled={selectedIds.size === 0}
              onClick={() => handleReject(Array.from(selectedIds))}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            <button
              type="button"
              onClick={() => loadStagedQueue()}
              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
              title="Refresh review queue"
            >
              <RefreshCw className={`w-4 h-4 ${loadingQueue ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {importProgress && (
          <div className="px-5 py-3 bg-blue-50 border-b border-blue-200 text-xs flex items-center justify-between gap-4 tabular-nums">
            <span className="font-semibold text-blue-900">
              Publishing verified courses: {importProgress.processed} / {importProgress.total} ({importProgress.imported} imported, {importProgress.duplicates} duplicates skipped)
            </span>
            <span className="font-bold text-blue-800">{importProgress.percent}%</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    checked={stagedQueue.length > 0 && selectedIds.size === stagedQueue.length}
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? new Set(stagedQueue.map((item) => item.id)) : new Set()
                      )
                    }
                  />
                </th>
                <th className="py-3 px-3">Course Title & Format</th>
                <th className="py-3 px-3">Category & Language</th>
                <th className="py-3 px-3">Channel & Source Link</th>
                <th className="py-3 px-3">Duration / Cert</th>
                <th className="py-3 px-3">Verification & Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingQueue ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Loading discovered course candidates...
                  </td>
                </tr>
              ) : stagedQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No staged YouTube courses in &ldquo;{queueFilter}&rdquo;. Use Run Test Batch (20 Resources), Search YouTube, or Start Discovery once YOUTUBE_API_KEY is active.
                  </td>
                </tr>
              ) : (
                stagedQueue.map((c) => {
                  const checked = selectedIds.has(c.id);
                  const sourceHref = c.youtubePlaylistUrl || c.youtubeUrl || c.youtubeChannelUrl;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(selectedIds);
                            if (e.target.checked) next.add(c.id);
                            else next.delete(c.id);
                            setSelectedIds(next);
                          }}
                        />
                      </td>
                      <td className="py-3 px-3 max-w-sm">
                        <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          {c.courseType === 'youtube_playlist' ? (
                            <span className="text-indigo-700 font-semibold flex items-center gap-1">
                              <ListVideo className="w-3 h-3" /> Playlist
                            </span>
                          ) : (
                            <span className="text-rose-700 font-semibold flex items-center gap-1">
                              <Youtube className="w-3 h-3" /> Video
                            </span>
                          )}
                          <span>· {c.level}</span>
                          {c.emergingSubjects && c.emergingSubjects.length > 0 && (
                            <span className="text-blue-700 font-medium">
                              · Emerging: {c.emergingSubjects[0]}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{c.category}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> {c.language}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">{c.youtubeChannelName}</div>
                        {sourceHref ? (
                          <a
                            href={sourceHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span>View Original YouTube Source</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-rose-600">No valid URL</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{c.duration || 'Self-Paced'}</div>
                        <div className="text-[10px] text-slate-500">
                          {c.certificateEligibility ? 'Verified Cert Mention' : 'No Source Cert Claim'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            c.reviewStatus === 'Imported'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : c.reviewStatus === 'Pending Review'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : c.reviewStatus === 'Duplicate'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {c.reviewStatus}
                        </span>
                        {c.duplicateReason && (
                          <div className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] truncate" title={c.duplicateReason}>
                            {c.duplicateReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.reviewStatus === 'Pending Review' && (
                            <>
                              <button
                                type="button"
                                disabled={importingSelected}
                                onClick={() => handleApproveAndImport([c])}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer disabled:opacity-40"
                              >
                                Approve & Import
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject([c.id])}
                                className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-semibold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Discovery Jobs History */}
      {recentJobs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-slate-700" />
            <span>Recent YouTube Discovery Runs</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Job ID & Mode</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Discovered</th>
                  <th className="py-2 px-3">Imported</th>
                  <th className="py-2 px-3">Duplicates</th>
                  <th className="py-2 px-3">Failed</th>
                  <th className="py-2 px-3">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 tabular-nums">
                {recentJobs.map((j) => (
                  <tr key={j.id}>
                    <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                      {j.id} <span className="text-[10px] text-slate-400">({j.mode})</span>
                    </td>
                    <td className="py-2 px-3 font-semibold">{j.status}</td>
                    <td className="py-2 px-3 text-blue-700 font-bold">{j.discoveredCount}</td>
                    <td className="py-2 px-3 text-emerald-700 font-bold">{j.importedCount}</td>
                    <td className="py-2 px-3 text-amber-700">{j.duplicateCount}</td>
                    <td className="py-2 px-3 text-rose-700">{j.failedCount}</td>
                    <td className="py-2 px-3 text-slate-500">{new Date(j.startedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
