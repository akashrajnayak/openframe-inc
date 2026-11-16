import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Database,
  Edit,
  ExternalLink,
  Eye,
  FolderKanban,
  Layers,
  ListChecks,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  X,
  Youtube,
} from 'lucide-react';
import {
  CORPORATE_CONTENT_TYPES,
  CORPORATE_TRAINING_CATEGORIES,
  getCorporateCategoryByName,
} from '../../data/corporateTrainingTaxonomy';
import { discoveryService } from '../../services/discoveryService';
import {
  BatchImportProgress,
  marketplaceService,
  SUPPORTED_COURSE_LANGUAGES,
} from '../../services/marketplaceService';
import type {
  CourseContentType,
  DiscoveredCourse,
  DiscoveredCourseReviewStatus,
  DiscoveryQuotaStatus,
  MarketplaceCategory,
  MarketplaceCourse,
} from '../../types';
import { Link } from '../../router/RouterContext';
import { CourseThumbnail } from '../common/CourseThumbnail';

interface AdminCorporateTrainingLibraryProps {
  adminEmail: string;
  adminUid: string;
  onCoursesMutated: () => Promise<void>;
  onNotify: (msg: string) => void;
  onLogActivity: (action: string, collectionName: string, recordId?: string, details?: string) => Promise<void>;
}

type CorporateTab = 'discover' | 'search' | 'queue' | 'categories' | 'imported';

interface DiscoveryErrorEntry {
  timestamp: string;
  category: string;
  code: string;
  message: string;
}

const TARGET_LIBRARY_VIDEOS = 500;
const TARGET_CATEGORIES_COUNT = 20;

export const AdminCorporateTrainingLibrary: React.FC<AdminCorporateTrainingLibraryProps> = ({
  adminEmail,
  adminUid,
  onCoursesMutated,
  onNotify,
  onLogActivity,
}) => {
  const [activeTab, setActiveTab] = useState<CorporateTab>('discover');
  const [quota, setQuota] = useState<DiscoveryQuotaStatus | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // API diagnostic & error log state
  const [apiErrorBanner, setApiErrorBanner] = useState<{
    code?: string;
    missingRequirement?: string;
    message: string;
  } | null>(null);
  const [errorLogs, setErrorLogs] = useState<DiscoveryErrorEntry[]>([]);

  // Staged /discovered_courses & saved /courses corporate state
  const [stagedItems, setStagedItems] = useState<DiscoveredCourse[]>([]);
  const [importedCourses, setImportedCourses] = useState<MarketplaceCourse[]>([]);
  const [allCategories, setAllCategories] = useState<MarketplaceCategory[]>([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [loadingImported, setLoadingImported] = useState(false);

  // Batch runner controls (20 x 25 = 500)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CORPORATE_TRAINING_CATEGORIES.map((c) => c.name)
  );
  const [targetPerCategory, setTargetPerCategory] = useState<number>(25);
  const [batchLanguage, setBatchLanguage] = useState<string>('English');
  const [includePlaylists, setIncludePlaylists] = useState<boolean>(false);
  const [autoApproveImport, setAutoApproveImport] = useState<boolean>(true);
  const [batchState, setBatchState] = useState<'idle' | 'running' | 'paused' | 'stopped' | 'completed'>('idle');
  const [batchProgress, setBatchProgress] = useState<{
    processedCategories: number;
    totalCategories: number;
    currentCategory: string;
    discovered: number;
    imported: number;
    duplicates: number;
    failed: number;
  }>({
    processedCategories: 0,
    totalCategories: 0,
    currentCategory: '',
    discovered: 0,
    imported: 0,
    duplicates: 0,
    failed: 0,
  });
  const runnerControlRef = useRef<{ stop: boolean; pause: boolean }>({ stop: false, pause: false });

  // Search YouTube tab controls
  const [searchCategory, setSearchCategory] = useState<string>(CORPORATE_TRAINING_CATEGORIES[0].name);
  const [searchTopic, setSearchTopic] = useState<string>(CORPORATE_TRAINING_CATEGORIES[0].topics[0]);
  const [searchQuery, setSearchQuery] = useState<string>(CORPORATE_TRAINING_CATEGORIES[0].topics[0]);
  const [searchType, setSearchType] = useState<'video' | 'playlist'>('video');
  const [searchLanguage, setSearchLanguage] = useState<string>('English');
  const [searchingYouTube, setSearchingYouTube] = useState(false);
  const [searchResults, setSearchResults] = useState<DiscoveredCourse[]>([]);
  const [searchNextPageToken, setSearchNextPageToken] = useState<string | undefined>(undefined);
  const [searchTotalResults, setSearchTotalResults] = useState<number | undefined>(undefined);

  // Review Queue tab controls
  const [queueStatusFilter, setQueueStatusFilter] = useState<DiscoveredCourseReviewStatus | 'All'>('All');
  const [queueCategoryFilter, setQueueCategoryFilter] = useState<string>('All');
  const [selectedQueueIds, setSelectedQueueIds] = useState<Set<string>>(new Set());
  const [verifyingQueue, setVerifyingQueue] = useState(false);
  const [importingQueue, setImportingQueue] = useState(false);
  const [queueImportProgress, setQueueImportProgress] = useState<BatchImportProgress | null>(null);

  // Manage Categories tab controls
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    domainGroup: 'Business',
    description: '',
    topicsRaw: '',
  });
  const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MarketplaceCategory | null>(null);
  const [reassignTarget, setReassignTarget] = useState('');

  // Imported Videos tab filters
  const [importedSearch, setImportedSearch] = useState('');
  const [importedCategoryFilter, setImportedCategoryFilter] = useState('All');
  const [importedContentTypeFilter, setImportedContentTypeFilter] = useState<'All' | CourseContentType>('All');
  const [importedLevelFilter, setImportedLevelFilter] = useState('All');

  // Video Preview Modal
  const [previewResource, setPreviewResource] = useState<{
    title: string;
    videoId?: string;
    playlistId?: string;
    url?: string;
    channelName?: string;
    channelUrl?: string;
    duration?: string;
    publishedAt?: string;
    language?: string;
    level?: string;
    category?: string;
    topic?: string;
    contentType?: CourseContentType;
    description?: string;
    verificationStatus?: string;
  } | null>(null);

  const recordError = (category: string, err: any) => {
    const code = err?.code || 'DISCOVERY_API_ERROR';
    const message = err?.message || 'YouTube Data API v3 request failed.';
    setApiErrorBanner({
      code,
      missingRequirement: err?.missingRequirement,
      message,
    });
    if (err?.quota) setQuota(err.quota);
    setErrorLogs((prev) =>
      [
        {
          timestamp: new Date().toLocaleTimeString(),
          category,
          code,
          message,
        },
        ...prev,
      ].slice(0, 40)
    );
  };

  const refreshEngineStatus = async () => {
    try {
      const st = await discoveryService.getStatus();
      setQuota(st.quota);
      if (st.quota.lastErrorCode && st.quota.lastErrorMessage) {
        setApiErrorBanner({
          code: st.quota.lastErrorCode,
          missingRequirement: st.missingRequirement || undefined,
          message: st.quota.lastErrorMessage,
        });
      } else if (!st.quota.apiKeyConfigured) {
        setApiErrorBanner({
          code: 'MISSING_API_KEY',
          missingRequirement: 'YOUTUBE_API_KEY',
          message: 'YOUTUBE_API_KEY is not configured in server environment secrets.',
        });
      } else {
        setApiErrorBanner(null);
      }
    } catch (err: any) {
      recordError('API Health', err);
    }
  };

  const refreshAllData = async () => {
    setLoadingQueue(true);
    setLoadingImported(true);
    try {
      const [staged, imported, cats] = await Promise.all([
        discoveryService.listCorporateDiscoveredCourses('All', 800).catch(() => [] as DiscoveredCourse[]),
        marketplaceService.listCorporateImportedCourses(800).catch(() => [] as MarketplaceCourse[]),
        marketplaceService.getCategories().catch(() => [] as MarketplaceCategory[]),
      ]);
      setStagedItems(staged);
      setImportedCourses(imported);
      setAllCategories(cats);
    } finally {
      setLoadingQueue(false);
      setLoadingImported(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoadingInitial(true);
    Promise.all([refreshEngineStatus(), refreshAllData()]).finally(() => {
      if (active) setLoadingInitial(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Category imported metrics
  const importedByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of importedCourses) {
      const key = c.category;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [importedCourses]);

  const categoriesAtTargetCount = useMemo(() => {
    let count = 0;
    for (const def of CORPORATE_TRAINING_CATEGORIES) {
      if ((importedByCategory.get(def.name) || 0) >= def.targetVideos) count++;
    }
    return count;
  }, [importedByCategory]);

  const queueCounts = useMemo(() => {
    const pending = stagedItems.filter((i) => i.reviewStatus === 'Pending Review').length;
    const approved = stagedItems.filter((i) => i.reviewStatus === 'Approved').length;
    const verified = stagedItems.filter((i) => i.sourceVerificationStatus === 'Verified YouTube Resource').length;
    const duplicates = stagedItems.filter((i) => i.reviewStatus === 'Duplicate').length;
    const failed = stagedItems.filter((i) => i.reviewStatus === 'Failed').length;
    return { pending, approved, verified, duplicates, failed };
  }, [stagedItems]);

  const totalImportedCount = importedCourses.length;
  const progressPercent = Math.min(100, Math.round((totalImportedCount / TARGET_LIBRARY_VIDEOS) * 100));

  // Content type distribution across imported corporate videos
  const contentTypeCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ct of CORPORATE_CONTENT_TYPES) map[ct] = 0;
    for (const c of importedCourses) {
      const ct = c.contentType || 'Individual video';
      map[ct] = (map[ct] || 0) + 1;
    }
    return map;
  }, [importedCourses]);

  // ========================================================
  // TAB 1 ACTIONS: BATCH DISCOVERY (20 x 25 = 500)
  // ========================================================
  const runBatchCategories = async (categoriesToRun: string[]) => {
    if (categoriesToRun.length === 0) {
      onNotify('Select at least one corporate category to discover.');
      return;
    }

    runnerControlRef.current = { stop: false, pause: false };
    setBatchState('running');
    setBatchProgress({
      processedCategories: 0,
      totalCategories: categoriesToRun.length,
      currentCategory: categoriesToRun[0],
      discovered: 0,
      imported: 0,
      duplicates: 0,
      failed: 0,
    });

    let totalDiscovered = 0;
    let totalImported = 0;
    let totalDuplicates = 0;
    let totalFailed = 0;
    let processed = 0;

    for (const catName of categoriesToRun) {
      while (runnerControlRef.current.pause && !runnerControlRef.current.stop) {
        await new Promise((r) => setTimeout(r, 350));
      }
      if (runnerControlRef.current.stop) {
        setBatchState('stopped');
        break;
      }

      setBatchProgress((prev) => ({
        ...prev,
        currentCategory: catName,
      }));

      try {
        const corpDef = getCorporateCategoryByName(catName);
        const res = await discoveryService.discoverCorporateCategoryBatch({
          category: catName,
          topics: corpDef?.topics,
          targetCount: targetPerCategory,
          languageLabel: batchLanguage,
          includePlaylists,
          autoApproveImport,
          admin: { email: adminEmail, uid: adminUid },
        });

        setApiErrorBanner(null);
        if (res.quota) setQuota(res.quota);

        const importedNow = res.importLog?.importedCount || 0;
        const dupNow = res.duplicateCount + (res.importLog?.duplicateCount || 0);
        const failNow = res.failedCount + (res.importLog?.failedCount || 0);

        totalDiscovered += res.stagedItems.length;
        totalImported += importedNow;
        totalDuplicates += dupNow;
        totalFailed += failNow;
        processed++;

        setBatchProgress({
          processedCategories: processed,
          totalCategories: categoriesToRun.length,
          currentCategory: catName,
          discovered: totalDiscovered,
          imported: totalImported,
          duplicates: totalDuplicates,
          failed: totalFailed,
        });

        await refreshAllData();
        if (importedNow > 0) await onCoursesMutated();
      } catch (err: any) {
        recordError(catName, err);
        totalFailed++;
        processed++;
        setBatchProgress({
          processedCategories: processed,
          totalCategories: categoriesToRun.length,
          currentCategory: catName,
          discovered: totalDiscovered,
          imported: totalImported,
          duplicates: totalDuplicates,
          failed: totalFailed,
        });

        // Halt immediately on fatal auth / key / quota errors so we don't spam failing requests
        if (
          err?.code === 'API_KEY_REFERRER_BLOCKED' ||
          err?.code === 'MISSING_API_KEY' ||
          err?.code === 'INVALID_API_KEY' ||
          err?.code === 'YOUTUBE_API_DISABLED' ||
          err?.code === 'QUOTA_EXCEEDED' ||
          err?.code === 'QUOTA_LIMIT_GUARD'
        ) {
          runnerControlRef.current.stop = true;
          setBatchState('stopped');
          onNotify(`Stopped discovery: ${err?.message || 'YouTube API configuration issue.'}`);
          return;
        }
      }
    }

    if (!runnerControlRef.current.stop) {
      setBatchState('completed');
      onNotify(
        `Corporate discovery finished: ${totalDiscovered} staged, ${totalImported} published, ${totalDuplicates} duplicates skipped.`
      );
      await onLogActivity(
        'Corporate Library Batch Discovery',
        'discovered_courses',
        `batch-${categoriesToRun.length}`,
        `Categories: ${categoriesToRun.length}, Discovered: ${totalDiscovered}, Imported: ${totalImported}, Duplicates: ${totalDuplicates}`
      );
    }
  };

  // ========================================================
  // TAB 2 ACTIONS: DIRECT SEARCH YOUTUBE
  // ========================================================
  const handleDirectSearch = async (pageToken?: string) => {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) {
      onNotify('Enter a search topic or keyword.');
      return;
    }
    setSearchingYouTube(true);
    try {
      const res = await discoveryService.searchYouTube({
        query: cleanQuery,
        category: searchCategory,
        topic: searchTopic,
        libraryCollection: 'corporate_training',
        languageLabel: searchLanguage,
        searchType: searchType,
        pageToken,
        maxResults: 25,
      });
      setApiErrorBanner(null);
      setQuota(res.quota);
      setSearchResults(pageToken ? [...searchResults, ...res.items] : res.items);
      setSearchNextPageToken(res.nextPageToken);
      setSearchTotalResults(res.totalResults);
      onNotify(
        `Found ${res.items.length} real YouTube resources for "${cleanQuery}" (${res.duplicatesSkipped} duplicates skipped).`
      );
    } catch (err: any) {
      recordError(searchCategory, err);
      onNotify(err?.message || 'YouTube search failed.');
    } finally {
      setSearchingYouTube(false);
    }
  };

  const handleStageSearchItems = async (items: DiscoveredCourse[], importImmediately = false) => {
    if (items.length === 0) return;
    try {
      const tagged = items.map((item) => ({
        ...item,
        libraryCollection: 'corporate_training' as const,
        topic: item.topic || searchTopic,
      }));
      const res = await discoveryService.saveDiscoveredCandidates(
        tagged,
        importImmediately ? 'Approved' : 'Pending Review'
      );

      if (importImmediately) {
        const eligible = res.saved.filter((c) => c.reviewStatus === 'Approved');
        if (eligible.length > 0) {
          const imp = await discoveryService.approveAndImportCourses(eligible, {
            email: adminEmail,
            uid: adminUid,
          });
          onNotify(
            `Saved ${imp.importLog.importedCount} videos to /courses (${imp.importLog.duplicateCount} duplicates skipped).`
          );
          await onCoursesMutated();
        } else {
          onNotify(`All ${res.duplicateCount} selected resources already exist or failed validation.`);
        }
      } else {
        onNotify(
          `Staged ${res.saved.length} items to Review Queue (${res.duplicateCount} duplicates flagged).`
        );
      }

      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Failed saving discovered items.');
    }
  };

  // ========================================================
  // TAB 3 ACTIONS: REVIEW QUEUE (VERIFY, APPROVE, REJECT, IMPORT)
  // ========================================================
  const filteredQueue = useMemo(() => {
    return stagedItems.filter((item) => {
      if (queueStatusFilter !== 'All' && item.reviewStatus !== queueStatusFilter) return false;
      if (queueCategoryFilter !== 'All' && item.category !== queueCategoryFilter) return false;
      return true;
    });
  }, [stagedItems, queueStatusFilter, queueCategoryFilter]);

  const handleContentTypeChange = async (item: DiscoveredCourse, nextType: CourseContentType) => {
    setStagedItems((prev) =>
      prev.map((row) => (row.id === item.id ? { ...row, contentType: nextType } : row))
    );
    try {
      await discoveryService.updateDiscoveredCourseContentType(item.id, nextType);
      onNotify(`Updated contentType to "${nextType}".`);
    } catch (err: any) {
      onNotify(err?.message || 'Failed updating contentType.');
    }
  };

  const handleVerifyItems = async (items: DiscoveredCourse[]) => {
    if (items.length === 0) return;
    setVerifyingQueue(true);
    try {
      const res = await discoveryService.verifyYouTubeResources(items);
      setQuota(res.quota);
      setApiErrorBanner(null);
      onNotify(
        `Verified ${res.verifiedCount} live YouTube resources (${res.unavailableCount} unavailable, ${res.duplicateCount} duplicates flagged).`
      );
      await refreshAllData();
    } catch (err: any) {
      recordError('YouTube Verification', err);
      onNotify(err?.message || 'Verification failed.');
    } finally {
      setVerifyingQueue(false);
    }
  };

  const handleApproveOnly = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      await discoveryService.approveDiscoveredCourses(ids);
      onNotify(`Marked ${ids.length} item(s) as Approved.`);
      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Approval update failed.');
    }
  };

  const handleRejectItems = async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      await discoveryService.rejectDiscoveredCourses(ids);
      setSelectedQueueIds(new Set());
      onNotify(`Rejected ${ids.length} item(s).`);
      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Reject action failed.');
    }
  };

  const handleImportItems = async (items: DiscoveredCourse[]) => {
    const eligible = items.filter(
      (c) => c.reviewStatus !== 'Rejected' && c.reviewStatus !== 'Imported' && c.reviewStatus !== 'Duplicate'
    );
    if (eligible.length === 0) {
      onNotify('No eligible Pending or Approved items selected for import.');
      return;
    }
    setImportingQueue(true);
    setQueueImportProgress({ processed: 0, total: eligible.length, imported: 0, duplicates: 0, failed: 0, percent: 0 });
    try {
      const res = await discoveryService.approveAndImportCourses(
        eligible,
        { email: adminEmail, uid: adminUid },
        (p) => setQueueImportProgress(p)
      );
      setSelectedQueueIds(new Set());
      await onLogActivity(
        'Import Corporate Library Videos',
        'courses',
        res.importLog.id,
        `Imported ${res.importLog.importedCount} videos (${res.importLog.duplicateCount} duplicates skipped).`
      );
      onNotify(
        `Imported ${res.importLog.importedCount} video(s) into /courses (${res.importLog.duplicateCount} duplicates skipped).`
      );
      await Promise.all([refreshAllData(), onCoursesMutated()]);
    } catch (err: any) {
      onNotify(err?.message || 'Import to database failed.');
    } finally {
      setImportingQueue(false);
      setQueueImportProgress(null);
    }
  };

  // ========================================================
  // TAB 4 ACTIONS: MANAGE CATEGORIES
  // ========================================================
  const handleCreateCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryForm.name.trim()) return;
    try {
      const topics = newCategoryForm.topicsRaw
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const created = await marketplaceService.createCategory({
        name: newCategoryForm.name.trim(),
        domainGroup: newCategoryForm.domainGroup,
        description:
          newCategoryForm.description.trim() ||
          `Corporate skill development and management track in ${newCategoryForm.name.trim()}.`,
        subcategories: topics,
      });
      await onLogActivity('Create Corporate Category', 'course_categories', created.id, `Created "${created.name}"`);
      setNewCategoryForm({ name: '', domainGroup: 'Business', description: '', topicsRaw: '' });
      onNotify(`Category "${created.name}" created.`);
      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Could not create category.');
    }
  };

  const handleSaveCategoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await marketplaceService.updateCategory(editingCategory);
      await onLogActivity('Update Corporate Category', 'course_categories', editingCategory.id, `Updated "${editingCategory.name}"`);
      setEditingCategory(null);
      onNotify(`Updated category "${editingCategory.name}".`);
      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Failed updating category.');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await marketplaceService.deleteCategory(deletingCategory, reassignTarget || undefined);
      await onLogActivity('Delete Custom Category', 'course_categories', deletingCategory.id, `Deleted "${deletingCategory.name}"`);
      setDeletingCategory(null);
      setReassignTarget('');
      onNotify(`Removed custom category "${deletingCategory.name}".`);
      await refreshAllData();
    } catch (err: any) {
      onNotify(err?.message || 'Deletion safeguard prevented removal.');
    }
  };

  // ========================================================
  // TAB 5: IMPORTED VIDEOS FILTERING
  // ========================================================
  const filteredImported = useMemo(() => {
    const q = importedSearch.trim().toLowerCase();
    return importedCourses.filter((c) => {
      if (importedCategoryFilter !== 'All' && c.category !== importedCategoryFilter) return false;
      if (importedContentTypeFilter !== 'All' && (c.contentType || 'Individual video') !== importedContentTypeFilter) {
        return false;
      }
      if (importedLevelFilter !== 'All' && c.level !== importedLevelFilter) return false;
      if (q) {
        const hay = `${c.title} ${c.id} ${c.category} ${c.topic || ''} ${c.youtubeChannelName || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [importedCourses, importedSearch, importedCategoryFilter, importedContentTypeFilter, importedLevelFilter]);

  const currentSearchCatDef = getCorporateCategoryByName(searchCategory);
  const availableSearchTopics = currentSearchCatDef?.topics || [];

  const allCategoryChoices = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of CORPORATE_TRAINING_CATEGORIES) map.set(c.name, c.name);
    for (const c of allCategories) {
      if (!c.isSystemDefault && !map.has(c.name)) map.set(c.name, c.name);
    }
    return Array.from(map.values());
  }, [allCategories]);

  return (
    <div className="space-y-6 text-slate-800">
      {/* HEADER & 500-VIDEO PROGRESS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-600">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Corporate Management &amp; Employee Skill Development Library</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-slate-900">
              500-Video Corporate YouTube Training Engine (20 Categories × 25 Videos)
            </h2>
            <p className="text-xs text-slate-500 max-w-3xl">
              Discovers real, embeddable educational training videos across 20 employee role categories via Official YouTube Data API v3, classifies granular content types accurately, and saves verified videos alongside your 15,000 existing courses without modifying them.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                refreshEngineStatus();
                refreshAllData();
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInitial ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              disabled={batchState === 'running'}
              onClick={() => {
                setActiveTab('discover');
                runBatchCategories(CORPORATE_TRAINING_CATEGORIES.map((c) => c.name));
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-cyan-300" />
              <span>Run Full 20×25 Discovery (500)</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 text-white col-span-2 sm:col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
              <span>Library Target Progress</span>
              <span className="tabular-nums">{progressPercent}%</span>
            </div>
            <div className="text-2xl font-extrabold mt-1 tabular-nums">
              {totalImportedCount.toLocaleString()}{' '}
              <span className="text-sm font-medium text-slate-400">/ {TARGET_LIBRARY_VIDEOS}</span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Categories Ready</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {categoriesAtTargetCount} <span className="text-xs font-normal text-slate-500">/ {TARGET_CATEGORIES_COUNT}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">25 videos per category</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Staged Queue</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {stagedItems.length.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {queueCounts.pending} pending · {queueCounts.verified} verified
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Duplicates Blocked</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {queueCounts.duplicates.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Protected 15,000 catalog</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">API Quota Today</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {quota ? quota.remainingUnits.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
              {quota ? `of ${quota.dailyLimit.toLocaleString()} units` : 'Checking quota...'}
            </div>
          </div>
        </div>
      </div>

      {/* API DIAGNOSTIC / ERROR REPORTING BANNER */}
      {apiErrorBanner && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 space-y-3 text-xs text-amber-950">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-sm text-amber-950">
                  YouTube Data API v3 Access Diagnostic ({apiErrorBanner.code || 'API_ERROR'})
                </div>
                <p className="text-amber-900 leading-relaxed">{apiErrorBanner.message}</p>
                {apiErrorBanner.code === 'API_KEY_REFERRER_BLOCKED' && (
                  <p className="text-amber-800 leading-relaxed">
                    <strong>Note:</strong> Live discovery and verification automatically use verified public YouTube + oEmbed fallback whenever the Data API key has GCP HTTP referrer restrictions. To switch back to direct Google Data API v3 calls, set Application restrictions to <strong>None</strong> (or server IP) in Google Cloud Console and click Re-check API Status.
                  </p>
                )}
                {apiErrorBanner.code === 'MISSING_API_KEY' && (
                  <p className="text-amber-800 leading-relaxed">
                    <strong>Active Fallback:</strong> <code>YOUTUBE_API_KEY</code> is not configured in server secrets, so direct YouTube Data API v3 calls are unavailable. Category discovery, YouTube search, and video verification automatically use live YouTube Search + official YouTube oEmbed verification (never fabricated IDs). Add <code>YOUTUBE_API_KEY</code> to environment secrets to enable direct Data API v3 quota telemetry.
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={refreshEngineStatus}
              className="px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-semibold text-xs shrink-0 cursor-pointer"
            >
              Re-check API Status
            </button>
          </div>
        </div>
      )}

      {/* NAVIGATION SUB-TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex flex-wrap items-center gap-1.5">
        {[
          { id: 'discover' as CorporateTab, label: 'Discover Videos (20 × 25)', icon: Compass },
          { id: 'search' as CorporateTab, label: 'Search YouTube', icon: Search },
          { id: 'queue' as CorporateTab, label: `Review Queue (${stagedItems.length})`, icon: ListChecks },
          { id: 'categories' as CorporateTab, label: `Manage Categories (${allCategoryChoices.length})`, icon: Layers },
          { id: 'imported' as CorporateTab, label: `View Imported Videos (${totalImportedCount})`, icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                active ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: AUTOMATED 20 x 25 DISCOVERY ENGINE
         ===================================================================== */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Configuration & Runner */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Batch Discovery Controls</h3>
              <p className="text-slate-500 mt-0.5">
                Configure categories, videos per category, language, and verification behavior before running live discovery.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Videos Per Category</label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={targetPerCategory}
                  onChange={(e) => setTargetPerCategory(Math.max(1, Math.min(25, Number(e.target.value) || 25)))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Language</label>
                <select
                  value={batchLanguage}
                  onChange={(e) => setBatchLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {SUPPORTED_COURSE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={autoApproveImport}
                  onChange={(e) => setAutoApproveImport(e.target.checked)}
                />
                <span>Auto-approve &amp; save unique videos into /courses immediately</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includePlaylists}
                  onChange={(e) => setIncludePlaylists(e.target.checked)}
                />
                <span>Include curated YouTube training playlists alongside individual videos</span>
              </label>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={batchState === 'running' || selectedCategories.length === 0}
                onClick={() => runBatchCategories(selectedCategories)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  Discover {selectedCategories.length} Categor{selectedCategories.length === 1 ? 'y' : 'ies'} (
                  {(selectedCategories.length * targetPerCategory).toLocaleString()} Videos)
                </span>
              </button>

              {batchState === 'running' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      runnerControlRef.current.pause = !runnerControlRef.current.pause;
                      setBatchState(runnerControlRef.current.pause ? 'paused' : 'running');
                    }}
                    className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      runnerControlRef.current.stop = true;
                      setBatchState('stopped');
                    }}
                    className="px-3 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop</span>
                  </button>
                </>
              )}

              {batchState === 'paused' && (
                <button
                  type="button"
                  onClick={() => {
                    runnerControlRef.current.pause = false;
                    setBatchState('running');
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume</span>
                </button>
              )}
            </div>

            {/* Live Batch Progress Box */}
            {batchState !== 'idle' && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>
                    Status: <span className="uppercase">{batchState}</span>
                  </span>
                  <span className="tabular-nums">
                    {batchProgress.processedCategories} / {batchProgress.totalCategories} categories
                  </span>
                </div>
                {batchProgress.currentCategory && (
                  <div className="text-slate-600 truncate">
                    Processing: <strong className="text-slate-900">{batchProgress.currentCategory}</strong>
                  </div>
                )}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${
                        batchProgress.totalCategories > 0
                          ? Math.round((batchProgress.processedCategories / batchProgress.totalCategories) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 text-[11px] tabular-nums text-slate-600">
                  <div>
                    Staged: <strong className="text-slate-900">{batchProgress.discovered}</strong>
                  </div>
                  <div>
                    Imported: <strong className="text-emerald-700">{batchProgress.imported}</strong>
                  </div>
                  <div>
                    Dupes: <strong className="text-amber-700">{batchProgress.duplicates}</strong>
                  </div>
                  <div>
                    Failed: <strong className="text-rose-700">{batchProgress.failed}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Errors Log */}
            {errorLogs.length > 0 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>API Error Log ({errorLogs.length})</span>
                  <button
                    type="button"
                    onClick={() => setErrorLogs([])}
                    className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-[11px]">
                  {errorLogs.map((entry, idx) => (
                    <div key={`${entry.timestamp}-${idx}`} className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                      <div className="font-bold">
                        {entry.timestamp} · {entry.category} · {entry.code}
                      </div>
                      <div className="text-rose-800 line-clamp-2">{entry.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 20 Categories Checklist Grid */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">20 Corporate Role Training Categories (25 Videos Each)</h3>
                <p className="text-slate-500">Each category covers 25 role-specific skills with deduplicated YouTube discovery.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategories(CORPORATE_TRAINING_CATEGORIES.map((c) => c.name))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Select All 20
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[540px] overflow-y-auto pr-1">
              {CORPORATE_TRAINING_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat.name);
                const savedCount = importedByCategory.get(cat.name) || 0;
                const stagedCount = stagedItems.filter((s) => s.category === cat.name).length;
                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-2xl border transition-colors ${
                      isSelected ? 'bg-blue-50/50 border-blue-300' : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <label className="flex items-start gap-2 cursor-pointer min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            setSelectedCategories((prev) =>
                              prev.includes(cat.name) ? prev.filter((x) => x !== cat.name) : [...prev, cat.name]
                            )
                          }
                          className="mt-0.5"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {cat.order}. {cat.name}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                            {savedCount} / {cat.targetVideos} saved · {stagedCount} staged
                          </div>
                        </div>
                      </label>

                      <button
                        type="button"
                        disabled={batchState === 'running'}
                        onClick={() => runBatchCategories([cat.name])}
                        className="px-2 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 shrink-0 disabled:opacity-50 cursor-pointer"
                      >
                        Run 25
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: SEARCH YOUTUBE BY TOPIC & CATEGORY
         ===================================================================== */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate Category</label>
                <select
                  value={searchCategory}
                  onChange={(e) => {
                    const nextCat = e.target.value;
                    setSearchCategory(nextCat);
                    const def = getCorporateCategoryByName(nextCat);
                    if (def && def.topics.length > 0) {
                      setSearchTopic(def.topics[0]);
                      setSearchQuery(def.topics[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {allCategoryChoices.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Topic (25 Subtopics)</label>
                <select
                  value={searchTopic}
                  onChange={(e) => {
                    setSearchTopic(e.target.value);
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {availableSearchTopics.length > 0 ? (
                    availableSearchTopics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  ) : (
                    <option value={searchCategory}>{searchCategory}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">YouTube Resource Type</label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value as 'video' | 'playlist')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="video">Individual / Training Videos</option>
                  <option value="playlist">Playlists</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Language</label>
                <select
                  value={searchLanguage}
                  onChange={(e) => setSearchLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {SUPPORTED_COURSE_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDirectSearch();
                  }}
                  placeholder="Enter training topic, role skill, or YouTube course query..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="button"
                disabled={searchingYouTube}
                onClick={() => handleDirectSearch()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>{searchingYouTube ? 'Searching...' : 'Search YouTube'}</span>
              </button>

              {searchResults.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStageSearchItems(searchResults, false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-800 cursor-pointer"
                  >
                    Stage All ({searchResults.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStageSearchItems(searchResults, true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Import All ({searchResults.length})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Search Results List */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-slate-600">
              <span className="tabular-nums">
                {searchResults.length > 0
                  ? `${searchResults.length} real YouTube results fetched${
                      searchTotalResults ? ` (of ~${searchTotalResults.toLocaleString()} total)` : ''
                    }`
                  : 'Run a live YouTube Data API v3 search above to preview, classify content type, stage, or import videos.'}
              </span>
              {searchNextPageToken && (
                <button
                  type="button"
                  disabled={searchingYouTube}
                  onClick={() => handleDirectSearch(searchNextPageToken)}
                  className="px-3 py-1 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer"
                >
                  Load Next Page (nextPageToken)
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="divide-y divide-slate-100">
                {searchResults.map((item) => (
                  <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <CourseThumbnail
                        src={item.thumbnailUrl}
                        alt={item.title}
                        youtubeVideoId={item.youtubeVideoId}
                        category={item.category}
                        categoryGroup="Corporate Management & Leadership"
                        className="w-28 h-16 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.youtubeChannelName} · {item.category} · {item.contentType || 'Individual video'} ·{' '}
                          {item.duration || 'Self-Paced'}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewResource({
                            title: item.title,
                            videoId: item.youtubeVideoId,
                            playlistId: item.youtubePlaylistId,
                            url: item.youtubePlaylistUrl || item.youtubeUrl,
                            channelName: item.youtubeChannelName,
                            channelUrl: item.youtubeChannelUrl,
                            duration: item.duration,
                            publishedAt: item.publishedAt,
                            language: item.language,
                            level: item.level,
                            category: item.category,
                            topic: item.topic,
                            contentType: item.contentType,
                            description: item.description,
                            verificationStatus: item.sourceVerificationStatus,
                          })
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStageSearchItems([item], false)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-800 cursor-pointer"
                      >
                        Stage
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStageSearchItems([item], true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                      >
                        Import
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: REVIEW QUEUE (VERIFY, APPROVE, REJECT, CONTENT TYPE, IMPORT)
         ===================================================================== */}
      {activeTab === 'queue' && (
        <div className="space-y-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={queueStatusFilter}
                onChange={(e) => setQueueStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="All">All Queue Statuses ({stagedItems.length})</option>
                <option value="Pending Review">Pending Review ({queueCounts.pending})</option>
                <option value="Approved">Approved ({queueCounts.approved})</option>
                <option value="Imported">Imported</option>
                <option value="Duplicate">Duplicate ({queueCounts.duplicates})</option>
                <option value="Rejected">Rejected</option>
                <option value="Failed">Failed / Unavailable ({queueCounts.failed})</option>
              </select>

              <select
                value={queueCategoryFilter}
                onChange={(e) => setQueueCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All 20 Categories</option>
                {allCategoryChoices.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={verifyingQueue || filteredQueue.length === 0}
                onClick={() => {
                  const targets =
                    selectedQueueIds.size > 0
                      ? filteredQueue.filter((i) => selectedQueueIds.has(i.id))
                      : filteredQueue.slice(0, 50);
                  handleVerifyItems(targets);
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-800 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {verifyingQueue
                    ? 'Verifying...'
                    : `Verify ${selectedQueueIds.size > 0 ? `Selected (${selectedQueueIds.size})` : 'Batch (50)'}`}
                </span>
              </button>

              <button
                type="button"
                disabled={selectedQueueIds.size === 0}
                onClick={() => handleApproveOnly(Array.from(selectedQueueIds))}
                className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Approve Selected
              </button>

              <button
                type="button"
                disabled={importingQueue || selectedQueueIds.size === 0}
                onClick={() =>
                  handleImportItems(filteredQueue.filter((i) => selectedQueueIds.has(i.id)))
                }
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>
                  {importingQueue
                    ? 'Importing...'
                    : `Import Selected (${selectedQueueIds.size})`}
                </span>
              </button>

              <button
                type="button"
                disabled={selectedQueueIds.size === 0}
                onClick={() => handleRejectItems(Array.from(selectedQueueIds))}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-semibold disabled:opacity-40 cursor-pointer"
              >
                Reject Selected
              </button>
            </div>
          </div>

          {queueImportProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-blue-950 font-semibold tabular-nums">
              <span>
                Importing to /courses: {queueImportProgress.processed} / {queueImportProgress.total} processed
              </span>
              <span>
                Imported: {queueImportProgress.imported} · Duplicates: {queueImportProgress.duplicates}
              </span>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4 w-8">
                      <input
                        type="checkbox"
                        checked={
                          filteredQueue.length > 0 &&
                          filteredQueue.slice(0, 100).every((i) => selectedQueueIds.has(i.id))
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQueueIds(new Set(filteredQueue.slice(0, 100).map((i) => i.id)));
                          } else {
                            setSelectedQueueIds(new Set());
                          }
                        }}
                      />
                    </th>
                    <th className="py-3 px-3">Video &amp; Channel</th>
                    <th className="py-3 px-3">Category &amp; Topic</th>
                    <th className="py-3 px-3">Content Type</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3">Review Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingQueue ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        Loading staged YouTube resources...
                      </td>
                    </tr>
                  ) : filteredQueue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No staged corporate training videos match this filter yet.
                      </td>
                    </tr>
                  ) : (
                    filteredQueue.slice(0, 150).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selectedQueueIds.has(item.id)}
                            onChange={(e) => {
                              setSelectedQueueIds((prev) => {
                                const next = new Set(prev);
                                if (e.target.checked) next.add(item.id);
                                else next.delete(item.id);
                                return next;
                              });
                            }}
                          />
                        </td>

                        <td className="py-3 px-3 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            <CourseThumbnail
                              src={item.thumbnailUrl}
                              alt={item.title}
                              youtubeVideoId={item.youtubeVideoId}
                              category={item.category}
                              categoryGroup="Corporate Management & Leadership"
                              className="w-16 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 line-clamp-1">{item.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {item.youtubeChannelName} · {item.duration || 'Self-Paced'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{item.category}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {item.topic || item.subcategory}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <select
                            value={item.contentType || 'Individual video'}
                            onChange={(e) =>
                              handleContentTypeChange(item, e.target.value as CourseContentType)
                            }
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800"
                          >
                            {CORPORATE_CONTENT_TYPES.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              item.sourceVerificationStatus === 'Verified YouTube Resource'
                                ? 'text-emerald-700'
                                : item.sourceVerificationStatus === 'Unavailable'
                                ? 'text-rose-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {item.sourceVerificationStatus}
                          </span>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              item.reviewStatus === 'Imported'
                                ? 'text-emerald-700'
                                : item.reviewStatus === 'Approved'
                                ? 'text-blue-700'
                                : item.reviewStatus === 'Duplicate'
                                ? 'text-amber-700'
                                : item.reviewStatus === 'Rejected' || item.reviewStatus === 'Failed'
                                ? 'text-rose-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {item.reviewStatus}
                          </span>
                          {item.duplicateReason && (
                            <div className="text-[10px] text-slate-500 max-w-[160px] truncate" title={item.duplicateReason}>
                              {item.duplicateReason}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewResource({
                                  title: item.title,
                                  videoId: item.youtubeVideoId,
                                  playlistId: item.youtubePlaylistId,
                                  url: item.youtubePlaylistUrl || item.youtubeUrl,
                                  channelName: item.youtubeChannelName,
                                  channelUrl: item.youtubeChannelUrl,
                                  duration: item.duration,
                                  publishedAt: item.publishedAt,
                                  language: item.language,
                                  level: item.level,
                                  category: item.category,
                                  topic: item.topic,
                                  contentType: item.contentType,
                                  description: item.description,
                                  verificationStatus: item.sourceVerificationStatus,
                                })
                              }
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyItems([item])}
                              className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer"
                            >
                              Verify
                            </button>
                            {item.reviewStatus !== 'Imported' && item.reviewStatus !== 'Duplicate' && (
                              <>
                                {item.reviewStatus === 'Pending Review' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOnly([item.id])}
                                    className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-semibold cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleImportItems([item])}
                                  className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer"
                                >
                                  Import
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectItems([item.id])}
                                  className="px-2 py-1 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: MANAGE CATEGORIES (20 CORE + CUSTOM CREATE/EDIT/DELETE)
         ===================================================================== */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs">
          {/* Create Category Form */}
          <form
            onSubmit={handleCreateCustomCategory}
            className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-5 space-y-3"
          >
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Create Corporate Category</h3>
              <p className="text-slate-500 mt-0.5">Add new functional role categories beyond the core 20 matrix.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={newCategoryForm.name}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                placeholder="e.g. Logistics & Fleet Operations"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Domain Group</label>
              <select
                value={newCategoryForm.domainGroup}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, domainGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {['Business', 'Professional', 'Technology', 'Intelligence', 'Academic', 'STEM', 'Creative', 'Wellbeing'].map(
                  (g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Topics (comma-separated)</label>
              <input
                type="text"
                value={newCategoryForm.topicsRaw}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, topicsRaw: e.target.value })}
                placeholder="Dispatch planning, Fleet KPIs, Fuel tracking"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newCategoryForm.description}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </form>

          {/* 20 Core Corporate Categories + Custom */}
          <div className="lg:col-span-8 space-y-3">
            {CORPORATE_TRAINING_CATEGORIES.map((cat) => {
              const isOpen = expandedCategoryIds.has(cat.id);
              const savedCount = importedByCategory.get(cat.name) || 0;
              return (
                <div key={cat.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCategoryIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(cat.id)) next.delete(cat.id);
                          else next.add(cat.id);
                          return next;
                        })
                      }
                      className="flex items-center gap-2.5 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm">
                          {cat.order}. {cat.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {cat.domainGroup} · {cat.topics.length} defined topics · {savedCount} / {cat.targetVideos} videos imported
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSearchCategory(cat.name);
                        setSearchTopic(cat.topics[0]);
                        setSearchQuery(cat.topics[0]);
                        setActiveTab('search');
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 shrink-0 cursor-pointer"
                    >
                      Search Topics
                    </button>
                  </div>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {cat.topics.map((t, idx) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSearchCategory(cat.name);
                              setSearchTopic(t);
                              setSearchQuery(t);
                              setActiveTab('search');
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-700 text-[11px] truncate cursor-pointer"
                            title={`Search YouTube for "${t}"`}
                          >
                            {idx + 1}. {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Added Categories */}
            {allCategories
              .filter(
                (c) =>
                  !c.isSystemDefault &&
                  !CORPORATE_TRAINING_CATEGORIES.some((corp) => corp.name.toLowerCase() === c.name.toLowerCase())
              )
              .map((cat) => (
                <div key={cat.id} className="bg-white border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Custom · {cat.domainGroup} · {cat.totalCourseCount} courses
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingCategory(cat)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingCategory(cat)}
                      className="px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-50 font-semibold text-rose-700 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: VIEW IMPORTED VIDEOS
         ===================================================================== */}
      {activeTab === 'imported' && (
        <div className="space-y-4 text-xs">
          {/* Content Type Summary Strip */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-slate-600 font-medium">
              Granular Classification Breakdown ({importedCourses.length} saved videos):
            </div>
            <div className="flex flex-wrap items-center gap-3 tabular-nums text-[11px]">
              {CORPORATE_CONTENT_TYPES.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => setImportedContentTypeFilter(importedContentTypeFilter === ct ? 'All' : ct)}
                  className={`px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                    importedContentTypeFilter === ct
                      ? 'bg-slate-900 text-white border-slate-900 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ct}: <strong>{contentTypeCounts[ct] || 0}</strong>
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={importedSearch}
                onChange={(e) => setImportedSearch(e.target.value)}
                placeholder="Filter saved videos by title, channel, topic, or course ID..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <select
              value={importedCategoryFilter}
              onChange={(e) => setImportedCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="All">All Corporate Categories</option>
              {allCategoryChoices.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={importedContentTypeFilter}
              onChange={(e) => setImportedContentTypeFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="All">All Content Types</option>
              {CORPORATE_CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>

            <select
              value={importedLevelFilter}
              onChange={(e) => setImportedLevelFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>

          {/* Saved Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="py-3 px-4">Course ID</th>
                    <th className="py-3 px-3">Title &amp; Channel</th>
                    <th className="py-3 px-3">Category &amp; Topic</th>
                    <th className="py-3 px-3">Content Type</th>
                    <th className="py-3 px-3">Duration / Level</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingImported ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Loading corporate training library from Firestore /courses...
                      </td>
                    </tr>
                  ) : filteredImported.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        No corporate training videos have been imported yet. Use Discover Videos or Search YouTube to discover and save real training videos.
                      </td>
                    </tr>
                  ) : (
                    filteredImported.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                          {c.id}
                        </td>
                        <td className="py-3 px-3 max-w-sm">
                          <div className="flex items-center gap-2.5">
                            <CourseThumbnail
                              src={c.thumbnailUrl || c.imageUrl}
                              alt={c.title}
                              youtubeVideoId={c.youtubeVideoId}
                              category={c.category}
                              categoryGroup={c.categoryGroup}
                              className="w-16 h-10 rounded-lg object-cover bg-slate-900 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {c.youtubeChannelName || c.instructorName} · {c.language || 'English'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{c.category}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {c.topic || c.subcategory}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {c.contentType || 'Individual video'}
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {c.duration} · {c.level}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewResource({
                                  title: c.title,
                                  videoId: c.youtubeVideoId,
                                  playlistId: c.youtubePlaylistId,
                                  url: c.youtubePlaylistUrl || c.youtubeUrl,
                                  channelName: c.youtubeChannelName,
                                  channelUrl: c.youtubeChannelUrl,
                                  duration: c.duration,
                                  publishedAt: c.publishedDate,
                                  language: c.language,
                                  level: c.level,
                                  category: c.category,
                                  topic: c.topic,
                                  contentType: c.contentType,
                                  description: c.description,
                                  verificationStatus: c.sourceVerificationStatus,
                                })
                              }
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold text-slate-700 cursor-pointer"
                            >
                              Preview
                            </button>
                            <Link
                              to={`/marketplace/${c.id}`}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                            >
                              Open
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VIDEO PREVIEW MODAL (EMBEDDED YOUTUBE PLAYER + FULL METADATA)
         ===================================================================== */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  {previewResource.category || 'Corporate Training'} · {previewResource.contentType || 'Individual video'}
                </div>
                <h3 className="font-bold text-slate-900 text-sm truncate">{previewResource.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewResource(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              {(previewResource.playlistId || previewResource.videoId) && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <iframe
                    src={
                      previewResource.playlistId
                        ? `https://www.youtube-nocookie.com/embed/videoseries?list=${previewResource.playlistId}`
                        : `https://www.youtube-nocookie.com/embed/${previewResource.videoId}`
                    }
                    title={previewResource.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">YouTube ID</div>
                  <div className="font-mono font-bold text-slate-800 truncate">
                    {previewResource.playlistId || previewResource.videoId || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                  <div className="font-semibold text-slate-800">{previewResource.duration || 'Self-Paced'}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Published Date</div>
                  <div className="font-semibold text-slate-800">
                    {previewResource.publishedAt ? previewResource.publishedAt.slice(0, 10) : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Language &amp; Level</div>
                  <div className="font-semibold text-slate-800">
                    {previewResource.language || 'English'} · {previewResource.level || 'All Levels'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="text-slate-600">
                  Channel:{' '}
                  {previewResource.channelUrl ? (
                    <a
                      href={previewResource.channelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 hover:underline"
                    >
                      {previewResource.channelName}
                    </a>
                  ) : (
                    <strong className="text-slate-900">{previewResource.channelName}</strong>
                  )}
                  {previewResource.topic && <span className="ml-2 text-slate-400">· Topic: {previewResource.topic}</span>}
                </div>

                {previewResource.url && (
                  <a
                    href={previewResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                  >
                    <span>Open on YouTube</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {previewResource.description && (
                <div className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                  {previewResource.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOM CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleSaveCategoryEdit}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs"
          >
            <h3 className="font-bold text-slate-900 text-sm">Edit Category: {editingCategory.name}</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Domain Group</label>
              <select
                value={editingCategory.domainGroup}
                onChange={(e) => setEditingCategory({ ...editingCategory, domainGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {['Business', 'Professional', 'Technology', 'Intelligence', 'Academic', 'STEM', 'Creative', 'Wellbeing'].map(
                  (g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Topics (comma-separated)</label>
              <input
                type="text"
                value={editingCategory.subcategories.join(', ')}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    subcategories: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={editingCategory.description}
                onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CATEGORY SAFEGUARD MODAL */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Delete Category Safeguard: {deletingCategory.name}</span>
            </h3>
            {deletingCategory.customCourseCount > 0 ? (
              <div className="space-y-3">
                <p className="text-slate-600">
                  This category has <strong>{deletingCategory.customCourseCount}</strong> custom courses. Choose a replacement category first:
                </p>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">Select replacement category...</option>
                  {allCategories
                    .filter((c) => c.name !== deletingCategory.name)
                    .map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-slate-600">
                This custom category has 0 active courses and can be safely deleted.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingCategory(null);
                  setReassignTarget('');
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingCategory.customCourseCount > 0 && !reassignTarget}
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
