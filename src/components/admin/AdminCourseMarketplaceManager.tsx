import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  Database,
  ChevronLeft,
  ChevronRight,
  Layers,
  BarChart3,
  History,
  ShieldAlert,
  CheckCircle2,
  X,
  Youtube,
  ListVideo,
  Globe,
  Sparkles,
  FileSpreadsheet,
  FileJson,
  AlertTriangle,
  Eye,
  Send,
  Tag,
  Compass,
} from 'lucide-react';
import {
  marketplaceService,
  ALL_MARKETPLACE_CATEGORIES,
  MARKETPLACE_STATUSES,
  MARKETPLACE_PRICING_TIERS,
  SUPPORTED_COURSE_LANGUAGES,
  DOMAIN_GROUPS_BY_CATEGORY,
  BatchImportProgress,
  DuplicateCheckResult,
} from '../../services/marketplaceService';
import { AdminDiscoveryEnginePanel } from './AdminDiscoveryEnginePanel';
import {
  MarketplaceCourse,
  MarketplaceCounters,
  MarketplaceCategory,
  CourseImportLog,
  MarketplaceCourseStatus,
  EducationCategoryCode,
  EducationTaxonomyItem,
  RecommendationAnalyticsEvent,
} from '../../types';
import {
  EDUCATION_CLASSIFICATION_CATEGORIES,
  EDUCATION_CATEGORY_BY_CODE,
} from '../../data/educationClassificationData';
import { seedCoursesToFirestore } from '../../services/courseSeedService';
import { quinnAiService } from '../../services/quinnAiService';
import { lmsService } from '../../services/lmsService';

interface AdminCourseMarketplaceManagerProps {
  adminEmail: string;
  adminUid: string;
  onOpenMigrationModal: () => void;
  onNotify: (msg: string) => void;
  onLogActivity: (action: string, collectionName: string, recordId?: string, details?: string) => Promise<void>;
}

type ManagerSubTab =
  | 'published'
  | 'discovery'
  | 'drafts'
  | 'categories'
  | 'taxonomy'
  | 'discovery_analytics'
  | 'import'
  | 'history'
  | 'analytics';

export const AdminCourseMarketplaceManager: React.FC<AdminCourseMarketplaceManagerProps> = ({
  adminEmail,
  adminUid,
  onOpenMigrationModal,
  onNotify,
  onLogActivity,
}) => {
  const [subTab, setSubTab] = useState<ManagerSubTab>('published');
  const [counters, setCounters] = useState<MarketplaceCounters | null>(null);
  const [loadingCounters, setLoadingCounters] = useState(true);

  // Courses table state
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [courseTypeFilter, setCourseTypeFilter] = useState<'all' | 'standard' | 'youtube_video' | 'youtube_playlist'>('all');
  const [languageFilter, setLanguageFilter] = useState('All');

  // Categories
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [newCatForm, setNewCatForm] = useState({ name: '', domainGroup: 'Technology', description: '', subcategoriesRaw: '' });
  const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<MarketplaceCategory | null>(null);
  const [reassignTarget, setReassignTarget] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    danger?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Import state
  const [importMode, setImportMode] = useState<'csv' | 'json' | 'youtube_url' | 'youtube_playlist'>('csv');
  const [importText, setImportText] = useState('');
  const [youtubeBatchInput, setYoutubeBatchInput] = useState('');
  const [youtubeDefaultCategory, setYoutubeDefaultCategory] = useState('Artificial Intelligence');
  const [youtubeDefaultStatus, setYoutubeDefaultStatus] = useState<'Published' | 'Draft'>('Published');
  const [youtubeDefaultLanguage, setYoutubeDefaultLanguage] = useState('English');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<BatchImportProgress | null>(null);
  const [lastImportLog, setLastImportLog] = useState<CourseImportLog | null>(null);

  // Education Taxonomy (A–J) & Discovery Analytics State
  const [taxonomyItems, setTaxonomyItems] = useState<EducationTaxonomyItem[]>([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);
  const [savingTaxonomy, setSavingTaxonomy] = useState(false);
  const [taxonomyForm, setTaxonomyForm] = useState<{
    categoryCode: EducationCategoryCode;
    itemType: EducationTaxonomyItem['itemType'];
    name: string;
    parentGroup: string;
    description: string;
  }>({
    categoryCode: 'G',
    itemType: 'degree',
    name: '',
    parentGroup: '',
    description: '',
  });
  const [discoverySummary, setDiscoverySummary] = useState<{
    totalSearches: number;
    totalEvents: number;
    totalEnrollments: number;
    youtubeClicks: number;
    qaCount: number;
    topSearchedSubjects: Array<{ label: string; count: number }>;
    popularDegrees: Array<{ label: string; count: number }>;
    topRequestedSkills: Array<{ label: string; count: number }>;
    recentEvents: RecommendationAnalyticsEvent[];
  } | null>(null);
  const [loadingDiscoverySummary, setLoadingDiscoverySummary] = useState(false);

  const loadTaxonomy = async () => {
    setLoadingTaxonomy(true);
    try {
      const list = await marketplaceService.getCustomEducationTaxonomy();
      setTaxonomyItems(list);
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  const loadDiscoveryAnalytics = async () => {
    setLoadingDiscoverySummary(true);
    try {
      const summary = await lmsService.getDiscoveryAnalyticsSummary();
      setDiscoverySummary(summary);
    } finally {
      setLoadingDiscoverySummary(false);
    }
  };

  // Import history & duplicate checker
  const [importLogs, setImportLogs] = useState<CourseImportLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [dupProbeUrl, setDupProbeUrl] = useState('');
  const [dupProbeResult, setDupProbeResult] = useState<DuplicateCheckResult | null>(null);
  const [checkingDup, setCheckingDup] = useState(false);

  // Course Add/Edit modal
  const [editingCourse, setEditingCourse] = useState<Partial<MarketplaceCourse> | null>(null);
  const [ytResolveInput, setYtResolveInput] = useState('');
  const [resolvingYt, setResolvingYt] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [suggestingCategory, setSuggestingCategory] = useState(false);
  const [modalDupWarning, setModalDupWarning] = useState<DuplicateCheckResult | null>(null);
  const [isSeeding100, setIsSeeding100] = useState(false);

  const loadCounters = async (force = false) => {
    setLoadingCounters(true);
    try {
      const c = await marketplaceService.getLiveMarketplaceCounters(force);
      setCounters(c);
    } catch (err) {
      console.error('Failed loading live counters:', err);
    } finally {
      setLoadingCounters(false);
    }
  };

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const effectiveStatus =
        subTab === 'drafts'
          ? 'Draft'
          : statusFilter !== 'All'
          ? statusFilter
          : undefined;
      const res = await marketplaceService.filterCourses({
        query: searchQuery,
        category: categoryFilter,
        status: effectiveStatus,
        courseType: courseTypeFilter,
        language: languageFilter,
        sortBy: subTab === 'drafts' ? 'newest' : 'popular',
        page,
        pageSize: 20,
      });
      setCourses(res.courses);
      setTotalCount(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error('Failed loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await marketplaceService.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error('Failed loading categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const logs = await marketplaceService.getImportHistory(40);
      setImportLogs(logs);
    } catch (err) {
      console.error('Failed loading import history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadCounters(true);
  }, []);

  useEffect(() => {
    if (subTab === 'published' || subTab === 'drafts') {
      loadCourses();
    } else if (subTab === 'categories' || subTab === 'analytics') {
      loadCategories();
    } else if (subTab === 'history') {
      loadHistory();
    }
  }, [subTab, page, searchQuery, categoryFilter, statusFilter, courseTypeFilter, languageFilter]);

  const availableCategoryNames = categories.length > 0
    ? categories.map((c) => c.name)
    : ALL_MARKETPLACE_CATEGORIES;

  const handleSuggestCategoryWithQuinn = async () => {
    if (!editingCourse?.title?.trim()) {
      onNotify('Enter a Course Title first so Quinn AI can suggest the best category.');
      return;
    }
    setSuggestingCategory(true);
    try {
      const rec = await quinnAiService.recommendCategory({
        title: editingCourse.title,
        description: editingCourse.description || editingCourse.shortDesc || '',
        availableCategories: availableCategoryNames,
      });
      const prevCats = editingCourse.categories || [];
      setEditingCourse({
        ...editingCourse,
        category: rec.primaryCategory,
        subcategory: rec.subcategory || editingCourse.subcategory,
        categories: Array.from(new Set([rec.primaryCategory, ...(rec.additionalCategories || []), ...prevCats])),
      });
      onNotify(`Quinn AI suggested "${rec.primaryCategory}" (${rec.subcategory}): ${rec.reason}`);
    } catch {
      onNotify('Unable to generate AI category suggestion right now.');
    } finally {
      setSuggestingCategory(false);
    }
  };

  // Resolve YouTube URL in Add/Edit Modal
  const handleResolveYouTubeForModal = async () => {
    const targetUrl = ytResolveInput.trim() || editingCourse?.youtubePlaylistUrl || editingCourse?.youtubeUrl || '';
    if (!targetUrl) {
      onNotify('Enter a YouTube video or playlist URL first.');
      return;
    }
    setResolvingYt(true);
    setModalDupWarning(null);
    try {
      const resolved = await marketplaceService.resolveYouTubeCourse(targetUrl);
      const updatedFields: Partial<MarketplaceCourse> = {
        ...editingCourse,
        title: editingCourse?.title?.trim() ? editingCourse.title : resolved.title || editingCourse?.title || '',
        shortDesc:
          editingCourse?.shortDesc?.trim()
            ? editingCourse.shortDesc
            : (resolved.description || '').slice(0, 320) ||
              (resolved.title ? `Guided video course: ${resolved.title} by ${resolved.youtubeChannelName || 'YouTube Educator'}.` : ''),
        description:
          editingCourse?.description?.trim()
            ? editingCourse.description
            : resolved.description || resolved.title || '',
        youtubeUrl: resolved.youtubeUrl || editingCourse?.youtubeUrl,
        youtubeVideoId: resolved.youtubeVideoId,
        youtubePlaylistUrl: resolved.youtubePlaylistUrl || editingCourse?.youtubePlaylistUrl,
        youtubePlaylistId: resolved.youtubePlaylistId,
        youtubeChannelName: resolved.youtubeChannelName || editingCourse?.youtubeChannelName,
        instructorName:
          editingCourse?.instructorName && editingCourse.instructorName !== 'OpenFrame Academic Faculty'
            ? editingCourse.instructorName
            : resolved.youtubeChannelName || 'OpenFrame Academic Faculty',
        thumbnailUrl: resolved.thumbnailUrl || editingCourse?.thumbnailUrl,
        imageUrl: resolved.thumbnailUrl || editingCourse?.imageUrl,
        duration: resolved.duration || editingCourse?.duration || (resolved.itemCount ? `${resolved.itemCount} Lessons` : '12 Hours'),
        courseType: resolved.courseType,
        keywords: resolved.keywords && resolved.keywords.length > 0 ? resolved.keywords : editingCourse?.keywords,
      };
      setEditingCourse(updatedFields);

      // Immediate duplicate check
      const dup = await marketplaceService.checkDuplicate(updatedFields);
      setModalDupWarning(dup);
      onNotify(
        resolved.courseType === 'youtube_playlist'
          ? `Resolved playlist (${resolved.itemCount || 'linked'} videos) from ${resolved.youtubeChannelName || 'YouTube'}.`
          : `Resolved video metadata from ${resolved.youtubeChannelName || 'YouTube'}.`
      );
    } catch (err: any) {
      onNotify(err?.message || 'Could not resolve YouTube metadata.');
    } finally {
      setResolvingYt(false);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim()) return;
    setSavingCourse(true);
    try {
      const isNew = !editingCourse.id || editingCourse.id.startsWith('new-');
      if (isNew) {
        const cleanCopy = { ...editingCourse };
        delete cleanCopy.id;
        const saved = await marketplaceService.addCourse(cleanCopy);
        await onLogActivity('Add Marketplace Course', 'courses', saved.id, `Added "${saved.title}" (${saved.status})`);
        onNotify(`Added "${saved.title}" (${saved.id}) — Live counters updated.`);
      } else {
        const saved = await marketplaceService.updateCourse(editingCourse as MarketplaceCourse);
        await onLogActivity('Update Marketplace Course', 'courses', saved.id, `Updated "${saved.title}" (${saved.status})`);
        onNotify(`Updated "${saved.title}" (${saved.id}).`);
      }
      setEditingCourse(null);
      setYtResolveInput('');
      setModalDupWarning(null);
      await Promise.all([loadCounters(true), loadCourses()]);
    } catch (err: any) {
      onNotify(err?.message || 'Failed to save course.');
    } finally {
      setSavingCourse(false);
    }
  };

  const handleQuickStatusChange = async (course: MarketplaceCourse, nextStatus: MarketplaceCourseStatus) => {
    try {
      await marketplaceService.updateCourse({ ...course, status: nextStatus });
      await onLogActivity('Change Course Status', 'courses', course.id, `Set ${course.id} status to ${nextStatus}`);
      onNotify(`Course ${course.id} updated to "${nextStatus}".`);
      await Promise.all([loadCounters(true), loadCourses()]);
    } catch (err: any) {
      onNotify(err?.message || 'Failed updating status.');
    }
  };

  const handleDeleteCourse = (course: MarketplaceCourse) => {
    setConfirmDialog({
      title: 'Delete or Archive Course',
      message: `Are you sure you want to delete or archive "${course.title}" (${course.id})?`,
      confirmLabel: 'Confirm Remove',
      danger: true,
      onConfirm: async () => {
        try {
          await marketplaceService.deleteCourse(course.id);
          await onLogActivity('Delete Marketplace Course', 'courses', course.id, `Removed "${course.title}"`);
          onNotify(`Removed "${course.title}".`);
          await Promise.all([loadCounters(true), loadCourses()]);
        } catch (err: any) {
          onNotify(err?.message || 'Failed deleting course.');
        }
      },
    });
  };

  const handleFileUploadForImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImportText(reader.result);
        if (file.name.endsWith('.json')) setImportMode('json');
        else if (file.name.endsWith('.csv')) setImportMode('csv');
        onNotify(`Loaded "${file.name}" (${reader.result.length.toLocaleString()} bytes) ready for import.`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    setIsImporting(true);
    setImportProgress({ processed: 0, total: 0, imported: 0, duplicates: 0, failed: 0, percent: 0 });
    setLastImportLog(null);

    try {
      let records: Partial<MarketplaceCourse>[] = [];
      let sourceLabel = '';

      if (importMode === 'csv') {
        if (!importText.trim()) throw new Error('Paste CSV data or upload a .csv file.');
        records = marketplaceService.parseCsvToCourseRecords(importText);
        sourceLabel = `CSV Import (${records.length} rows)`;
      } else if (importMode === 'json') {
        if (!importText.trim()) throw new Error('Paste JSON array or upload a .json file.');
        const parsed = JSON.parse(importText);
        if (!Array.isArray(parsed)) throw new Error('JSON root must be an array of course objects.');
        records = parsed;
        sourceLabel = `JSON Import (${records.length} items)`;
      } else {
        // YouTube URLs or Playlists (1 per line)
        const urls = youtubeBatchInput
          .split(/\r?\n/)
          .map((u) => u.trim())
          .filter(Boolean);
        if (urls.length === 0) throw new Error('Enter at least one YouTube video or playlist URL.');

        for (let i = 0; i < urls.length; i++) {
          const url = urls[i];
          try {
            const resolved = await marketplaceService.resolveYouTubeCourse(url);
            if (importMode === 'youtube_playlist' && resolved.playlistVideos && resolved.playlistVideos.length > 0) {
              // Option: import playlist course + optionally keep playlist metadata
              records.push({
                title: resolved.title || `YouTube Playlist Course (${resolved.youtubePlaylistId})`,
                category: youtubeDefaultCategory,
                subcategory: `${youtubeDefaultCategory} Video Series`,
                shortDesc: resolved.description?.slice(0, 280) || `Complete YouTube playlist series (${resolved.itemCount || resolved.playlistVideos.length} lessons).`,
                description: resolved.description || `Complete curated playlist with ${resolved.playlistVideos.length} lectures.`,
                youtubePlaylistUrl: resolved.youtubePlaylistUrl,
                youtubePlaylistId: resolved.youtubePlaylistId,
                youtubeUrl: resolved.youtubeUrl,
                youtubeVideoId: resolved.youtubeVideoId,
                youtubeChannelName: resolved.youtubeChannelName || 'YouTube Educator',
                instructorName: resolved.youtubeChannelName || 'YouTube Educator',
                thumbnailUrl: resolved.thumbnailUrl,
                imageUrl: resolved.thumbnailUrl,
                courseType: 'youtube_playlist',
                language: youtubeDefaultLanguage,
                isFree: false,
                price: 0,
                pricingTier: 'Academic Access',
                status: youtubeDefaultStatus,
                duration: `${resolved.playlistVideos.length} Lessons`,
              });
            } else {
              records.push({
                title: resolved.title || `YouTube Course (${resolved.youtubePlaylistId || resolved.youtubeVideoId})`,
                category: youtubeDefaultCategory,
                subcategory: `${youtubeDefaultCategory} Video Track`,
                shortDesc: `Curated YouTube course from ${resolved.youtubeChannelName || 'YouTube Educator'}.`,
                description: resolved.description || `Structured video training sourced from ${url}.`,
                youtubeUrl: resolved.youtubeUrl,
                youtubeVideoId: resolved.youtubeVideoId,
                youtubePlaylistUrl: resolved.youtubePlaylistUrl,
                youtubePlaylistId: resolved.youtubePlaylistId,
                youtubeChannelName: resolved.youtubeChannelName || 'YouTube Educator',
                instructorName: resolved.youtubeChannelName || 'YouTube Educator',
                thumbnailUrl: resolved.thumbnailUrl,
                imageUrl: resolved.thumbnailUrl,
                courseType: resolved.courseType,
                language: youtubeDefaultLanguage,
                isFree: false,
                price: 0,
                pricingTier: 'Academic Access',
                status: youtubeDefaultStatus,
                duration: resolved.duration || '8 Hours',
                keywords: resolved.keywords,
              });
            }
          } catch {
            records.push({ title: '' }); // Count as failed row in batch report
          }
        }
        sourceLabel = `${importMode === 'youtube_playlist' ? 'YouTube Playlists' : 'YouTube URLs'} (${urls.length} links)`;
      }

      if (records.length === 0) {
        throw new Error('No valid course rows parsed.');
      }

      const log = await marketplaceService.batchImportCourses({
        records,
        sourceType: importMode,
        sourceLabel,
        importedBy: adminEmail,
        importedByUid: adminUid,
        onProgress: (p) => setImportProgress(p),
      });

      setLastImportLog(log);
      await onLogActivity(
        'Bulk Import Marketplace Courses',
        'course_import_logs',
        log.id,
        `Processed ${log.totalProcessed}: ${log.importedCount} imported, ${log.duplicateCount} duplicates, ${log.failedCount} failed.`
      );
      onNotify(`Import complete: ${log.importedCount} saved, ${log.duplicateCount} duplicates skipped.`);
      await loadCounters(true);
    } catch (err: any) {
      onNotify(err?.message || 'Batch import failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleRunDuplicateProbe = async () => {
    if (!dupProbeUrl.trim()) return;
    setCheckingDup(true);
    try {
      const val = dupProbeUrl.trim();
      const res = await marketplaceService.checkDuplicate(
        val.startsWith('http') ? { youtubeUrl: val, youtubePlaylistUrl: val } : { id: val, youtubeVideoId: val, youtubePlaylistId: val }
      );
      setDupProbeResult(res);
    } catch (err: any) {
      onNotify(err?.message || 'Duplicate check failed.');
    } finally {
      setCheckingDup(false);
    }
  };

  const handleExportCSV = async () => {
    const csv = await marketplaceService.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openframe_marketplace_courses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported course records to CSV.');
  };

  const handleExportJSON = async () => {
    const json = await marketplaceService.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openframe_marketplace_courses_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Exported course records to JSON.');
  };

  const handleSeed100 = () => {
    setConfirmDialog({
      title: 'Seed Initial 100 Base Courses',
      message: 'Seed the initial 100 base courses into Firestore /courses collection?',
      confirmLabel: 'Seed 100 Courses',
      onConfirm: async () => {
        setIsSeeding100(true);
        try {
          const res = await seedCoursesToFirestore();
          await onLogActivity('Seed 100 Base Courses', 'courses', 'batch-100', `Seeded ${res.count} base records.`);
          onNotify(`Seeded ${res.count} base course documents.`);
          await loadCounters(true);
        } catch (err: any) {
          onNotify(err?.message || 'Seeding failed.');
        } finally {
          setIsSeeding100(false);
        }
      },
    });
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const subs = newCatForm.subcategoriesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const created = await marketplaceService.createCategory({
        name: newCatForm.name,
        domainGroup: newCatForm.domainGroup,
        description: newCatForm.description,
        subcategories: subs,
      });
      await onLogActivity('Create Category', 'course_categories', created.id, `Created category "${created.name}"`);
      setNewCatForm({ name: '', domainGroup: 'Technology', description: '', subcategoriesRaw: '' });
      onNotify(`Category "${created.name}" created.`);
      await Promise.all([loadCategories(), loadCounters(true)]);
    } catch (err: any) {
      onNotify(err?.message || 'Could not create category.');
    }
  };

  const handleSaveCategoryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      await marketplaceService.updateCategory(editingCategory);
      await onLogActivity('Update Category', 'course_categories', editingCategory.id, `Updated "${editingCategory.name}"`);
      setEditingCategory(null);
      onNotify(`Category "${editingCategory.name}" updated.`);
      await loadCategories();
    } catch (err: any) {
      onNotify(err?.message || 'Failed updating category.');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      await marketplaceService.deleteCategory(deletingCategory, reassignTarget || undefined);
      await onLogActivity('Delete Category', 'course_categories', deletingCategory.id, `Deleted "${deletingCategory.name}"`);
      setDeletingCategory(null);
      setReassignTarget('');
      onNotify(`Category "${deletingCategory.name}" removed.`);
      await Promise.all([loadCategories(), loadCounters(true)]);
    } catch (err: any) {
      onNotify(err?.message || 'Deletion safeguard prevented operation.');
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = categorySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.domainGroup.toLowerCase().includes(q) ||
      c.subcategories.some((s) => s.toLowerCase().includes(q))
    );
  });

  const topCategories = [...categories]
    .sort((a, b) => b.totalCourseCount - a.totalCourseCount)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Live Dynamic Database Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 text-white col-span-2">
          <div className="text-[11px] font-semibold text-cyan-300 uppercase tracking-wider">
            Total Courses Available
          </div>
          <div className="text-2xl font-extrabold mt-1 tabular-nums">
            {loadingCounters || !counters ? '...' : counters.totalCoursesAvailable.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-300 mt-0.5 tabular-nums">
            {counters ? `${counters.baseCatalogTotal.toLocaleString()} base + ${counters.newlyAddedCourses.toLocaleString()} published additions` : 'Calculating live database count...'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider">Certified Tracks</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {loadingCounters ? '...' : (counters?.paidCourses ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Fee-based programmes</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">YouTube Courses</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {loadingCounters ? '...' : (counters?.youtubeCourses ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Video-integrated</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200">
          <div className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider">Video Playlists</div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {loadingCounters ? '...' : (counters?.videoPlaylists ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Multi-lesson series</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Newly Added</div>
          <div className="text-xl font-bold text-emerald-950 mt-1 tabular-nums">
            {loadingCounters ? '...' : `+${(counters?.newlyAddedCourses ?? 0).toLocaleString()}`}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Live published additions</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Drafts</div>
          <div className="text-xl font-bold text-amber-950 mt-1 tabular-nums">
            {loadingCounters ? '...' : (counters?.draftCourses ?? 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">Excluded from public</div>
        </div>
      </div>

      {/* Operations Header & 6 Subtabs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'published', label: 'Published Catalog', icon: Globe },
            { id: 'discovery', label: 'YouTube Discovery (100K)', icon: Compass },
            { id: 'drafts', label: `Draft Courses (${counters?.draftCourses ?? 0})`, icon: Eye },
            { id: 'categories', label: `Categories (${counters?.categoriesCount ?? ALL_MARKETPLACE_CATEGORIES.length})`, icon: Layers },
            { id: 'taxonomy', label: 'Education Taxonomy (A–J)', icon: Tag },
            { id: 'discovery_analytics', label: 'Discovery Analytics', icon: BarChart3 },
            { id: 'import', label: 'Bulk Import & YouTube', icon: Upload },
            { id: 'history', label: 'Import History & Dedup', icon: History },
            { id: 'analytics', label: 'Scale & Analytics', icon: BarChart3 },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setSubTab(t.id as ManagerSubTab);
                  setPage(1);
                  if (t.id === 'taxonomy') loadTaxonomy();
                  if (t.id === 'discovery_analytics') loadDiscoveryAnalytics();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setYtResolveInput('');
              setModalDupWarning(null);
              setEditingCourse({
                id: `new-${Date.now()}`,
                title: '',
                category: availableCategoryNames[0] || 'Artificial Intelligence',
                categories: [availableCategoryNames[0] || 'Artificial Intelligence'],
                subcategory: '',
                level: 'Beginner',
                duration: '12 Hours',
                language: 'English',
                instructorName: 'OpenFrame Academic Faculty',
                isFree: false,
                price: 0,
                pricingTier: 'Academic Access',
                status: 'Published',
                courseType: 'standard',
                certificateEligibility: true,
                shortDesc: '',
                learningObjectives: ['Master core principles', 'Complete practical project'],
                keywords: [],
              });
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('import')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>

          <button
            type="button"
            onClick={onOpenMigrationModal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>15,000 Seeder</span>
          </button>

          <button
            type="button"
            disabled={isSeeding100}
            onClick={handleSeed100}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isSeeding100 ? 'Seeding...' : 'Seed 100'}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadCounters(true);
              if (subTab === 'published' || subTab === 'drafts') loadCourses();
            }}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh live database counts"
          >
            <RefreshCw className={`w-4 h-4 ${loadingCounters || loadingCourses ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* TAB 1 & 2: PUBLISHED / DRAFT COURSE TABLE */}
      {(subTab === 'published' || subTab === 'drafts') && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by course title, ID, instructor, channel, language, or keyword..."
                  className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="All">All Categories ({availableCategoryNames.length})</option>
                {availableCategoryNames.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={courseTypeFilter}
                onChange={(e) => {
                  setCourseTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="all">All Formats</option>
                <option value="youtube_video">YouTube Video</option>
                <option value="youtube_playlist">YouTube Playlist</option>
                <option value="standard">Standard Course</option>
              </select>

              <select
                value={languageFilter}
                onChange={(e) => {
                  setLanguageFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="All">All Languages</option>
                {SUPPORTED_COURSE_LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>

              {subTab === 'published' && (
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="All">All Active Statuses</option>
                  {MARKETPLACE_STATUSES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <div className="tabular-nums">
                Showing <strong className="text-slate-900">{courses.length === 0 ? 0 : (page - 1) * 20 + 1}</strong>–
                <strong className="text-slate-900">{Math.min(page * 20, totalCount)}</strong> of{' '}
                <strong className="text-slate-900">{totalCount.toLocaleString()}</strong>{' '}
                {subTab === 'drafts' ? 'draft courses' : 'courses'}
              </div>
              <div className="tabular-nums text-slate-500">
                Page {page} of {totalPages.toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Course ID & Format</th>
                    <th className="py-3 px-4">Title, Categories & Channel</th>
                    <th className="py-3 px-4">Instructor & Language</th>
                    <th className="py-3 px-4">Access & Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCourses ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        Querying paginated catalog index...
                      </td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {subTab === 'drafts'
                          ? 'No draft courses currently in staging.'
                          : 'No courses match the active filters.'}
                      </td>
                    </tr>
                  ) : (
                    courses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-800">{c.id}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                            {c.courseType === 'youtube_playlist' ? (
                              <>
                                <ListVideo className="w-3 h-3 text-indigo-600" />
                                <span className="text-indigo-700 font-semibold">{c.contentType || 'Playlist'}</span>
                              </>
                            ) : c.courseType === 'youtube_video' ? (
                              <>
                                <Youtube className="w-3 h-3 text-rose-600" />
                                <span className="text-rose-700 font-semibold">{c.contentType || 'Individual video'}</span>
                              </>
                            ) : (
                              <span>{c.contentType || 'Standard'} · {c.isCustomAdded ? 'Custom' : 'Base'}</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-bold text-slate-900 line-clamp-1">{c.title}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {(c.categories && c.categories.length > 0 ? c.categories : [c.category]).join(', ')} · {c.subcategory}
                          </div>
                          {c.youtubeChannelName && (
                            <div className="text-[10px] text-rose-700 font-medium mt-0.5">
                              Channel: {c.youtubeChannelName}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-800">{c.instructorName || c.instructor?.name || 'OpenFrame Faculty'}</div>
                          <div className="text-[11px] text-slate-500">{c.language || 'English'} · {c.level}</div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-bold tabular-nums">
                            {c.price > 0 ? (
                              <span className="text-slate-900">₹{c.price.toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-blue-700">
                                {c.pricingTier && String(c.pricingTier) !== 'Free' ? c.pricingTier : 'Academic Access'}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{c.duration}</div>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${
                              c.status === 'Published'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : c.status === 'Draft'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {c.status === 'Published' ? (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(c, 'Draft')}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-semibold cursor-pointer"
                              >
                                Move to Draft
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleQuickStatusChange(c, 'Published')}
                                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold cursor-pointer"
                              >
                                Publish
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setYtResolveInput(c.youtubePlaylistUrl || c.youtubeUrl || '');
                                setModalDupWarning(null);
                                setEditingCourse({ ...c });
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                              title="Edit Course"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/marketplace/${c.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                              title="Open Course Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteCourse(c)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                              title="Delete Course"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="text-slate-600 tabular-nums">
                  Page {page} of {totalPages.toLocaleString()}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORY MANAGEMENT */}
      {subTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Create Category & Sync */}
          <div className="lg:col-span-4 space-y-4">
            <form onSubmit={handleCreateCategory} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">Create New Category</div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatForm.name}
                  onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  placeholder="e.g. Quantum Computing"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Domain Group</label>
                <select
                  value={newCatForm.domainGroup}
                  onChange={(e) => setNewCatForm({ ...newCatForm, domainGroup: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {['Technology', 'STEM', 'Creative', 'Business', 'Professional', 'Academic', 'Intelligence', 'Wellbeing'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subcategories (comma-separated)</label>
                <input
                  type="text"
                  value={newCatForm.subcategoriesRaw}
                  onChange={(e) => setNewCatForm({ ...newCatForm, subcategoriesRaw: e.target.value })}
                  placeholder="e.g. Qubits, Quantum Algorithms, Qiskit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatForm.description}
                  onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
                  placeholder="Curriculum scope..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Create Category
              </button>
            </form>

            <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-2.5 text-xs">
              <div className="font-bold text-sm">Safeguard & Sync Policy</div>
              <p className="text-slate-300 leading-relaxed">
                Categories containing base or custom courses cannot be deleted directly without reassigning custom records first, ensuring zero orphaned courses.
              </p>
              <button
                type="button"
                onClick={async () => {
                  const synced = await marketplaceService.syncDefaultCategoriesToFirestore();
                  onNotify(`Synchronized ${synced} categories into Firestore /course_categories.`);
                }}
                className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold cursor-pointer"
              >
                Sync All Categories to Firestore
              </button>
            </div>
          </div>

          {/* Right: Categories List */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm font-bold text-slate-900">
                Course Categories & Counts ({filteredCategories.length})
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3 px-4">Category & Domain</th>
                    <th className="py-3 px-4">Subcategories</th>
                    <th className="py-3 px-4 text-right">Courses</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingCategories ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">Loading categories...</td>
                    </tr>
                  ) : (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{cat.name}</div>
                          <div className="text-[11px] text-slate-500">{cat.domainGroup}</div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          {cat.subcategories.length > 0 ? (
                            <span className="text-slate-600">{cat.subcategories.join(', ')}</span>
                          ) : (
                            <span className="text-slate-400">Default domain tracks</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums">
                          <div className="font-bold text-slate-900">{cat.totalCourseCount.toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500">
                            {cat.baseCourseCount.toLocaleString()} base · {cat.customCourseCount.toLocaleString()} custom
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingCategory({ ...cat })}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                              title="Edit Category & Subcategories"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingCategory(cat)}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                              title="Delete Category (with safeguard)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* TAB 4: BULK IMPORT (CSV / JSON / YOUTUBE URL / PLAYLIST) */}
      {subTab === 'import' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Scalable Batch Course Import & Duplicate Prevention Engine
              </h3>
              <p className="text-slate-500 mt-0.5">
                Import 500–1,000+ course records via CSV, JSON, YouTube Video URLs, or YouTube Playlists with automatic ID deduplication.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'csv', label: 'CSV Batch', icon: FileSpreadsheet },
                { id: 'json', label: 'JSON Batch', icon: FileJson },
                { id: 'youtube_url', label: 'YouTube Video URLs', icon: Youtube },
                { id: 'youtube_playlist', label: 'YouTube Playlists', icon: ListVideo },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setImportMode(m.id as any)}
                    className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer ${
                      importMode === m.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(importMode === 'csv' || importMode === 'json') ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="font-bold text-slate-800">
                  Upload {importMode.toUpperCase()} File or Paste Payload (supports 500–1,000+ records per batch)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (importMode === 'csv') {
                        setImportText(
                          'title,category,subcategory,instructorName,language,level,duration,price,youtubeUrl,youtubeChannelName,status\n' +
                            '"Applied Generative AI Systems","Generative AI","LLM Engineering","Andrej Karpathy","English","Intermediate","2 Hours",0,"https://www.youtube.com/watch?v=wjZofJX0v4U","Andrej Karpathy","Published"\n' +
                            '"Full Stack React & TypeScript Engineering","Full Stack Development","Frontend Architecture","freeCodeCamp Faculty","English","Intermediate","4 Hours",0,"https://www.youtube.com/watch?v=bMknfKXIFA8","freeCodeCamp.org","Published"'
                        );
                      } else {
                        setImportText(
                          JSON.stringify(
                            [
                              {
                                title: 'Neural Networks & GPT Architecture Workshop',
                                category: 'Deep Learning',
                                subcategory: 'Transformers',
                                instructorName: 'Andrej Karpathy',
                                language: 'English',
                                level: 'Advanced',
                                duration: '2 Hours',
                                price: 0,
                                youtubeUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
                                youtubeChannelName: 'Andrej Karpathy',
                                status: 'Published',
                              },
                            ],
                            null,
                            2
                          )
                        );
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Load Sample Template
                  </button>
                  <label className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold cursor-pointer hover:bg-slate-800">
                    Choose File
                    <input
                      type="file"
                      accept=".csv,.json,.txt"
                      onChange={handleFileUploadForImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                rows={11}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={
                  importMode === 'csv'
                    ? 'title,category,subcategory,instructorName,language,level,duration,price,youtubeUrl,youtubePlaylistUrl,youtubeChannelName,status'
                    : '[{"title": "...", "category": "Artificial Intelligence", "price": 0, "youtubeUrl": "...", "status": "Published"}]'
                }
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] focus:bg-white focus:outline-hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Category</label>
                  <select
                    value={youtubeDefaultCategory}
                    onChange={(e) => setYoutubeDefaultCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {availableCategoryNames.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Language</label>
                  <select
                    value={youtubeDefaultLanguage}
                    onChange={(e) => setYoutubeDefaultLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {SUPPORTED_COURSE_LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
                  <select
                    value={youtubeDefaultStatus}
                    onChange={(e) => setYoutubeDefaultStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Published">Published (Increment Public Counter)</option>
                    <option value="Draft">Draft (Staging Only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Paste {importMode === 'youtube_playlist' ? 'YouTube Playlist URLs' : 'YouTube Video URLs'} (one URL per line)
                </label>
                <textarea
                  rows={8}
                  value={youtubeBatchInput}
                  onChange={(e) => setYoutubeBatchInput(e.target.value)}
                  placeholder={
                    importMode === 'youtube_playlist'
                      ? 'https://www.youtube.com/playlist?list=PL...\nhttps://www.youtube.com/playlist?list=PL...'
                      : 'https://www.youtube.com/watch?v=JMUxmLyrhSk\nhttps://www.youtube.com/watch?v=i_LwzRVP7bg'
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-[11px] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Import Progress */}
          {importProgress && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Import Progress ({importProgress.percent}%)</span>
                <span className="tabular-nums">
                  {importProgress.processed} / {importProgress.total} records
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${importProgress.percent}%` }}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 tabular-nums">
                <div>Processed: <strong>{importProgress.processed}</strong></div>
                <div className="text-emerald-700">Saved: <strong>{importProgress.imported}</strong></div>
                <div className="text-amber-700">Duplicates Skipped: <strong>{importProgress.duplicates}</strong></div>
                <div className="text-rose-700">Failed: <strong>{importProgress.failed}</strong></div>
              </div>
            </div>
          )}

          {lastImportLog && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Batch Import Recorded ({lastImportLog.status})</span>
              </div>
              <p className="text-emerald-800 tabular-nums">
                Processed {lastImportLog.totalProcessed} · Imported {lastImportLog.importedCount} · Duplicates Skipped {lastImportLog.duplicateCount} · Failed {lastImportLog.failedCount}
              </p>
              {lastImportLog.duplicatesSample.length > 0 && (
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <strong>Duplicate Samples:</strong>{' '}
                  {lastImportLog.duplicatesSample.slice(0, 3).map((d) => `${d.title || d.id} (${d.reason})`).join(' · ')}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              disabled={isImporting}
              onClick={handleExecuteImport}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isImporting ? 'Running Deduplicated Batch Import...' : 'Run Deduplicated Batch Import'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: IMPORT HISTORY & DUPLICATE DETECTION */}
      {subTab === 'history' && (
        <div className="space-y-6 text-xs">
          {/* Live Duplicate Detector Probe */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-3">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Duplicate Detection Probe (YouTube Video ID / Playlist ID / Course ID)</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={dupProbeUrl}
                onChange={(e) => setDupProbeUrl(e.target.value)}
                placeholder="Paste YouTube Video URL, Playlist URL, or Course ID (e.g. OF-CRS-00001)..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <button
                type="button"
                disabled={checkingDup}
                onClick={handleRunDuplicateProbe}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold cursor-pointer"
              >
                {checkingDup ? 'Checking...' : 'Check for Duplicate'}
              </button>
            </div>
            {dupProbeResult && (
              <div
                className={`p-3 rounded-xl border ${
                  dupProbeResult.isDuplicate
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                {dupProbeResult.isDuplicate
                  ? `Duplicate Found: ${dupProbeResult.reason}`
                  : 'Unique record — safe to import without duplication.'}
              </div>
            )}
          </div>

          {/* Import Logs Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-900 text-sm">Import History Logs</div>
              <button
                type="button"
                onClick={loadHistory}
                className="text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Refresh Logs
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4 text-right">Processed</th>
                    <th className="py-3 px-4 text-right">Imported</th>
                    <th className="py-3 px-4 text-right">Duplicates</th>
                    <th className="py-3 px-4 text-right">Failed</th>
                    <th className="py-3 px-4">Admin & Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">Loading import history...</td>
                    </tr>
                  ) : importLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">No batch imports recorded yet.</td>
                    </tr>
                  ) : (
                    importLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{log.sourceLabel || log.sourceType.toUpperCase()}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.id}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold tabular-nums">{log.totalProcessed}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700 tabular-nums">{log.importedCount}</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700 tabular-nums">{log.duplicateCount}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-700 tabular-nums">{log.failedCount}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{log.status}</div>
                          <div className="text-[10px] text-slate-500">{log.importedBy}</div>
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

      {/* TAB 6: SCALE & ANALYTICS */}
      {subTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Top 10 Categories by Course Volume</h3>
            <div className="space-y-3">
              {topCategories.map((cat) => {
                const maxVal = topCategories[0]?.totalCourseCount || 1;
                const pct = Math.max(8, Math.round((cat.totalCourseCount / maxVal) * 100));
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex justify-between font-medium text-slate-800">
                      <span>{cat.name}</span>
                      <span className="tabular-nums font-bold">{cat.totalCourseCount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Catalog Expansion Readiness (15K → 1M+)</h3>
            <div className="grid grid-cols-2 gap-3 tabular-nums">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Current Public Catalog</div>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {counters ? counters.totalCoursesAvailable.toLocaleString() : '...'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Tier-1 Milestone Target</div>
                <div className="text-xl font-bold text-blue-600 mt-1">100,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Tier-2 Milestone Target</div>
                <div className="text-xl font-bold text-indigo-600 mt-1">500,000</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-slate-500">Long-Term Capacity</div>
                <div className="text-xl font-bold text-emerald-700 mt-1">1,000,000+</div>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Indexed search tokens (`searchTokens`), O(1) duplicate keys (`/course_dedup_keys`), server-side paginated base search (`/api/marketplace/base-search`), and atomic aggregation counters ensure query response latency remains flat as the catalog scales from 15,000 toward 1,000,000+ records.
            </p>
          </div>
        </div>
      )}

      {/* TAB 7: GLOBAL YOUTUBE DISCOVERY ENGINE (100K+) */}
      {subTab === 'discovery' && (
        <AdminDiscoveryEnginePanel
          adminEmail={adminEmail}
          adminUid={adminUid}
          counters={counters}
          onCoursesMutated={async () => {
            await Promise.all([loadCounters(true), loadCategories()]);
          }}
          onNotify={onNotify}
          onLogActivity={onLogActivity}
        />
      )}

      {/* TAB 8: EDUCATION TAXONOMY (A–J) GOVERNANCE */}
      {subTab === 'taxonomy' && (
        <div className="space-y-6 text-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Add Custom Qualification, Degree, Stream, Subject or Specialization
                </h3>
                <p className="text-[11px] text-slate-500">
                  Extends OpenFrame Categories A–J (Early Childhood LKG through Doctoral &amp; Skill Development).
                </p>
              </div>
              <button
                type="button"
                onClick={loadTaxonomy}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer self-start"
              >
                Refresh Taxonomy
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!taxonomyForm.name.trim()) return;
                setSavingTaxonomy(true);
                try {
                  const catInfo = EDUCATION_CATEGORY_BY_CODE[taxonomyForm.categoryCode];
                  await marketplaceService.saveEducationTaxonomyItem({
                    categoryCode: taxonomyForm.categoryCode,
                    categoryTitle: catInfo?.title || `Category ${taxonomyForm.categoryCode}`,
                    itemType: taxonomyForm.itemType,
                    name: taxonomyForm.name,
                    parentGroup: taxonomyForm.parentGroup || undefined,
                    description: taxonomyForm.description || undefined,
                    createdByUid: adminUid,
                  });
                  await onLogActivity('CREATE_TAXONOMY', 'education_taxonomy', taxonomyForm.name, `Added ${taxonomyForm.itemType} under ${taxonomyForm.categoryCode}`);
                  onNotify(`Added "${taxonomyForm.name}" to Category ${taxonomyForm.categoryCode}.`);
                  setTaxonomyForm((prev) => ({ ...prev, name: '', parentGroup: '', description: '' }));
                  await loadTaxonomy();
                } catch (err: any) {
                  onNotify(err?.message || 'Unable to save taxonomy entry.');
                } finally {
                  setSavingTaxonomy(false);
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
            >
              <select
                value={taxonomyForm.categoryCode}
                onChange={(e) => setTaxonomyForm((p) => ({ ...p, categoryCode: e.target.value as EducationCategoryCode }))}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {EDUCATION_CLASSIFICATION_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}. {c.shortTitle}
                  </option>
                ))}
              </select>

              <select
                value={taxonomyForm.itemType}
                onChange={(e) => setTaxonomyForm((p) => ({ ...p, itemType: e.target.value as EducationTaxonomyItem['itemType'] }))}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="degree">Degree / Class</option>
                <option value="stream">Academic Stream</option>
                <option value="subject">Core Subject</option>
                <option value="specialization">Specialization / Skill</option>
                <option value="qualification">Qualification</option>
              </select>

              <input
                type="text"
                required
                value={taxonomyForm.name}
                onChange={(e) => setTaxonomyForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. B.Sc. Data Science / PUC Bio"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />

              <input
                type="text"
                value={taxonomyForm.parentGroup}
                onChange={(e) => setTaxonomyForm((p) => ({ ...p, parentGroup: e.target.value }))}
                placeholder="Parent group (e.g. Science)"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              />

              <button
                type="submit"
                disabled={savingTaxonomy}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {savingTaxonomy ? 'Saving...' : 'Add Taxonomy Item'}
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Custom Taxonomy Entries ({taxonomyItems.length})
            </h3>
            {loadingTaxonomy ? (
              <div className="py-6 text-slate-500">Loading education taxonomy...</div>
            ) : taxonomyItems.length === 0 ? (
              <div className="py-6 text-slate-500">
                Using baseline Categories A–J (LKG through PhD &amp; Professional Skills). Add custom entries above to extend dynamically.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {taxonomyItems.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-bold text-[#123D32]">
                        {item.categoryCode} · {item.itemType.toUpperCase()}
                      </div>
                      <div className="font-bold text-slate-900 mt-0.5">{item.name}</div>
                      {item.parentGroup && <div className="text-[11px] text-slate-500">Group: {item.parentGroup}</div>}
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await marketplaceService.deleteEducationTaxonomyItem(item.id);
                        setTaxonomyItems((prev) => prev.filter((x) => x.id !== item.id));
                        onNotify(`Removed "${item.name}".`);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete taxonomy item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: DISCOVERY & RECOMMENDATION ANALYTICS */}
      {subTab === 'discovery_analytics' && (
        <div className="space-y-6 text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Search, Q&amp;A, Enrollment &amp; YouTube Discovery Analytics
            </h3>
            <button
              type="button"
              onClick={loadDiscoveryAnalytics}
              disabled={loadingDiscoverySummary}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-semibold cursor-pointer disabled:opacity-50"
            >
              {loadingDiscoverySummary ? 'Refreshing...' : 'Refresh Analytics'}
            </button>
          </div>

          {discoverySummary ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 tabular-nums">
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-500">Total Searches</div>
                  <div className="text-xl font-bold text-slate-900 mt-1">{discoverySummary.totalSearches}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-500">Discovery Events</div>
                  <div className="text-xl font-bold text-blue-600 mt-1">{discoverySummary.totalEvents}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-500">Course Enrollments</div>
                  <div className="text-xl font-bold text-emerald-700 mt-1">{discoverySummary.totalEnrollments}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-500">YouTube Engagement</div>
                  <div className="text-xl font-bold text-rose-600 mt-1">{discoverySummary.youtubeClicks}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-4">
                  <div className="text-[11px] text-slate-500">Q&amp;A Questions Asked</div>
                  <div className="text-xl font-bold text-indigo-700 mt-1">{discoverySummary.qaCount}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2.5">
                  <h4 className="font-bold text-slate-900">Top Searched Subjects</h4>
                  {discoverySummary.topSearchedSubjects.length === 0 ? (
                    <p className="text-slate-500">No search logs recorded yet.</p>
                  ) : (
                    discoverySummary.topSearchedSubjects.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2 text-slate-700">{item.label}</span>
                        <span className="font-bold tabular-nums text-slate-900">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2.5">
                  <h4 className="font-bold text-slate-900">Popular Degree Programmes</h4>
                  {discoverySummary.popularDegrees.length === 0 ? (
                    <p className="text-slate-500">No degree queries recorded yet.</p>
                  ) : (
                    discoverySummary.popularDegrees.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2 text-slate-700">{item.label}</span>
                        <span className="font-bold tabular-nums text-slate-900">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2.5">
                  <h4 className="font-bold text-slate-900">Top Requested Skills</h4>
                  {discoverySummary.topRequestedSkills.length === 0 ? (
                    <p className="text-slate-500">No skill queries recorded yet.</p>
                  ) : (
                    discoverySummary.topRequestedSkills.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1 border-b border-slate-100">
                        <span className="truncate pr-2 text-slate-700">{item.label}</span>
                        <span className="font-bold tabular-nums text-slate-900">{item.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              Loading discovery analytics...
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT COURSE MODAL */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {editingCourse.id && !editingCourse.id.startsWith('new-')
                    ? `Edit Course (${editingCourse.id})`
                    : 'Add New Marketplace Course'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Auto-resolve YouTube links, assign multiple categories, configure access, and enforce uniqueness.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCourse(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* YouTube URL / Playlist Auto-Fill Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Youtube className="w-4 h-4 text-rose-600" />
                  <span>YouTube Video or Playlist URL (Optional — Auto-populates Title, Channel & Thumbnail)</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={ytResolveInput}
                    onChange={(e) => setYtResolveInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/playlist?list=..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl"
                  />
                  <button
                    type="button"
                    disabled={resolvingYt}
                    onClick={handleResolveYouTubeForModal}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>{resolvingYt ? 'Resolving...' : 'Fetch YouTube Metadata'}</span>
                  </button>
                </div>
                {modalDupWarning?.isDuplicate && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{modalDupWarning.reason}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="font-bold text-slate-700">Primary Category *</label>
                    <button
                      type="button"
                      disabled={suggestingCategory}
                      onClick={handleSuggestCategoryWithQuinn}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{suggestingCategory ? 'Suggesting...' : 'Quinn AI Suggest'}</span>
                    </button>
                  </div>
                  <select
                    value={editingCourse.category || availableCategoryNames[0]}
                    onChange={(e) => {
                      const nextPrimary = e.target.value;
                      const prevCats = editingCourse.categories || [];
                      setEditingCourse({
                        ...editingCourse,
                        category: nextPrimary,
                        categories: Array.from(new Set([nextPrimary, ...prevCats])),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {availableCategoryNames.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={editingCourse.subcategory || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, subcategory: e.target.value })}
                    placeholder="e.g. Prompt Engineering"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Language</label>
                  <select
                    value={editingCourse.language || 'English'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {SUPPORTED_COURSE_LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Category Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Additional Categories (Optional Multi-Category Tagging)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {availableCategoryNames.slice(0, 35).map((cat) => {
                    const selected = (editingCourse.categories || [editingCourse.category]).includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const current = editingCourse.categories || (editingCourse.category ? [editingCourse.category] : []);
                          const next = selected
                            ? current.filter((x) => x !== cat || x === editingCourse.category)
                            : [...current, cat];
                          setEditingCourse({ ...editingCourse, categories: next });
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                          selected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Instructor Name</label>
                  <input
                    type="text"
                    value={editingCourse.instructorName || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, instructorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">YouTube Channel Name</label>
                  <input
                    type="text"
                    value={editingCourse.youtubeChannelName || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, youtubeChannelName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={editingCourse.thumbnailUrl || editingCourse.imageUrl || ''}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        thumbnailUrl: e.target.value,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Education Classification Categories (A–J) + Degree Programmes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block font-bold text-[#123D32] mb-1">
                    Applicable Education Levels (Categories A–J)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => {
                      const active = (editingCourse.educationLevels || []).includes(cat.code);
                      return (
                        <button
                          key={cat.code}
                          type="button"
                          onClick={() => {
                            const current = editingCourse.educationLevels || [];
                            const next = active
                              ? current.filter((c) => c !== cat.code)
                              : [...current, cat.code];
                            setEditingCourse({ ...editingCourse, educationLevels: next });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer ${
                            active
                              ? 'bg-[#123D32] text-white border-[#123D32]'
                              : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {cat.code}. {cat.shortTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Degree / Class Programmes (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={(editingCourse.degreeProgrammes || []).join(', ')}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          degreeProgrammes: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      placeholder="e.g. BCA, B.Com, PUC, Class 10"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Prerequisites
                    </label>
                    <input
                      type="text"
                      value={editingCourse.prerequisites || ''}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          prerequisites: e.target.value,
                        })
                      }
                      placeholder="e.g. Basic Mathematics, Beginner Friendly"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={editingCourse.level || 'Beginner'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={editingCourse.duration || '12 Hours'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Fee (INR · 0 = Free)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCourse.price ?? 0}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value));
                      setEditingCourse({
                        ...editingCourse,
                        price: val,
                        isFree: val === 0,
                        pricingTier:
                          val === 0
                            ? 'Academic Access'
                            : String(editingCourse.pricingTier) === 'Free' || editingCourse.pricingTier === 'Academic Access'
                            ? 'Basic'
                            : editingCourse.pricingTier,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Publication Status *</label>
                  <select
                    value={editingCourse.status || 'Published'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {MARKETPLACE_STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-1">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCourse.certificateEligibility ?? true}
                    onChange={(e) => setEditingCourse({ ...editingCourse, certificateEligibility: e.target.checked })}
                  />
                  <span>Certificate Available</span>
                </label>
                <label className="flex items-center gap-2 font-semibold text-emerald-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editingCourse.price ?? 0) === 0}
                    onChange={(e) => {
                      const makeFree = e.target.checked;
                      setEditingCourse({
                        ...editingCourse,
                        price: makeFree ? 0 : (editingCourse.price && editingCourse.price > 0 ? editingCourse.price : 499),
                        isFree: makeFree,
                        pricingTier: makeFree ? 'Academic Access' : 'Basic',
                      });
                    }}
                  />
                  <span>Free Access Course (Price = ₹0)</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingCourse.shortDesc || ''}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      shortDesc: e.target.value,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Learning Objectives (1 per line)</label>
                  <textarea
                    rows={3}
                    value={(editingCourse.learningObjectives || []).join('\n')}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        learningObjectives: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Keywords (comma-separated)</label>
                  <textarea
                    rows={3}
                    value={(editingCourse.keywords || []).join(', ')}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCourse}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  {savingCourse ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form onSubmit={handleSaveCategoryEdit} className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Edit Category: {editingCategory.name}</h3>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Domain Group</label>
              <select
                value={editingCategory.domainGroup}
                onChange={(e) => setEditingCategory({ ...editingCategory, domainGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
              >
                {['Technology', 'STEM', 'Creative', 'Business', 'Professional', 'Academic', 'Intelligence', 'Wellbeing'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Subcategories (comma-separated)</label>
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
            {deletingCategory.baseCourseCount > 0 ? (
              <p className="text-slate-600 leading-relaxed">
                This category contains <strong>{deletingCategory.baseCourseCount.toLocaleString()}</strong> active base catalog courses. System safeguard prevents deleting populated core categories to protect existing student enrollments.
              </p>
            ) : deletingCategory.customCourseCount > 0 ? (
              <div className="space-y-3">
                <p className="text-slate-600">
                  This category contains <strong>{deletingCategory.customCourseCount}</strong> custom courses. Choose a category to reassign them before deletion:
                </p>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="">Select replacement category...</option>
                  {categories
                    .filter((c) => c.name !== deletingCategory.name)
                    .map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                </select>
              </div>
            ) : (
              <p className="text-slate-600">
                This category has 0 active courses and can be safely deleted.
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
              {deletingCategory.baseCourseCount === 0 && (
                <button
                  type="button"
                  disabled={deletingCategory.customCourseCount > 0 && !reassignTarget}
                  onClick={handleConfirmDeleteCategory}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-40 cursor-pointer"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className={`w-4 h-4 ${confirmDialog.danger ? 'text-rose-600' : 'text-blue-600'}`} />
              <span>{confirmDialog.title}</span>
            </h3>
            <p className="text-slate-600 leading-relaxed">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  fn();
                }}
                className={`px-4 py-2 rounded-xl text-white font-bold cursor-pointer ${
                  confirmDialog.danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
