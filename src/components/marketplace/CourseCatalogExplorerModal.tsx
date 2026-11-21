import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Filter,
  Layers,
  ListVideo,
  Play,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  Tv,
  X,
  Check,
  ArrowUpRight,
} from 'lucide-react';
import type { MarketplaceCourse } from '../../types';
import type { ExtendedYouTubeVideo } from '../../services/youtubeVideoService';
import {
  buildCatalogCsvExport,
  CatalogPriceBand,
  CatalogSegment,
  CatalogSortOption,
  queryCatalogDirectory,
} from '../../services/catalogDirectoryService';
import { CourseThumbnail } from '../common/CourseThumbnail';
import { formatInr } from '../../utils/pricingEngine';

export interface CatalogApplyPayload {
  segment: CatalogSegment;
  domainGroup: string;
  category: string;
  level: string;
  query: string;
}

interface CourseCatalogExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSegment?: CatalogSegment;
  initialQuery?: string;
  paidCourseIds?: Set<string>;
  onEnrollCourse: (course: MarketplaceCourse) => void;
  onNavigateCourse: (courseId: string) => void;
  onWatchCourseVideo: (video: ExtendedYouTubeVideo, playlist: ExtendedYouTubeVideo[]) => void;
  onApplyFiltersToPage: (payload: CatalogApplyPayload) => void;
}

const SEGMENT_TABS: Array<{
  id: CatalogSegment;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'All Courses', shortLabel: 'All', icon: Layers },
  { id: 'professional', label: 'Professional', shortLabel: 'Professional', icon: Briefcase },
  { id: 'youtube', label: 'YouTube Courses', shortLabel: 'YouTube', icon: Tv },
  { id: 'youtube_playlist', label: 'YouTube Playlists', shortLabel: 'Playlists', icon: ListVideo },
];

function buildVideoPayloadFromCourse(course: MarketplaceCourse): {
  video: ExtendedYouTubeVideo;
  playlist: ExtendedYouTubeVideo[];
} {
  const primaryVid =
    course.youtubeVideoId ||
    course.recommendedVideos?.[0]?.videoId ||
    course.modules?.[0]?.videoIds?.[0] ||
    '_uQrJ0TkZlc';

  const makeItem = (vid: string, title: string, idx: number): ExtendedYouTubeVideo => ({
    id: `cat-${course.id}-${idx}`,
    youtubeId: vid,
    videoId: vid,
    title,
    channelTitle: course.youtubeChannelName || course.instructorName || 'OpenFrame Educator',
    duration: course.duration || '45m',
    recommendedReason: course.shortDesc || course.description || `Curated lecture for ${course.category}.`,
    thumbnail: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
    thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${vid}?rel=0`,
    youtubeUrl: `https://www.youtube.com/watch?v=${vid}`,
    subjectCategory: course.category,
    keyTopicsCovered: (course.skillsAcquired && course.skillsAcquired.length > 0
      ? course.skillsAcquired
      : [course.category, course.subcategory || 'Applied Skills']
    ).slice(0, 4),
    level: (course.level === 'All Levels' ? 'Beginner' : course.level) as 'Beginner' | 'Intermediate' | 'Advanced',
  });

  const playlist: ExtendedYouTubeVideo[] = [];
  const seen = new Set<string>();

  if (Array.isArray(course.modules) && course.modules.length > 0) {
    course.modules.forEach((m, idx) => {
      const mVid = m.videoIds?.[0] || primaryVid;
      if (mVid && !seen.has(`${mVid}-${idx}`)) {
        seen.add(`${mVid}-${idx}`);
        playlist.push(makeItem(mVid, m.title || `${course.title} — Part ${idx + 1}`, idx + 1));
      }
    });
  }

  if (playlist.length === 0) {
    playlist.push(makeItem(primaryVid, course.title, 1));
  }

  return {
    video: playlist[0],
    playlist,
  };
}

export const CourseCatalogExplorerModal: React.FC<CourseCatalogExplorerModalProps> = ({
  isOpen,
  onClose,
  initialSegment = 'all',
  initialQuery = '',
  paidCourseIds,
  onEnrollCourse,
  onNavigateCourse,
  onWatchCourseVideo,
  onApplyFiltersToPage,
}) => {
  const [segment, setSegment] = useState<CatalogSegment>(initialSegment);
  const [query, setQuery] = useState(initialQuery);
  const [domainGroup, setDomainGroup] = useState('All');
  const [category, setCategory] = useState('All');
  const [categoryFilterText, setCategoryFilterText] = useState('');
  const [level, setLevel] = useState('All');
  const [priceBand, setPriceBand] = useState<CatalogPriceBand>('all');
  const [sortBy, setSortBy] = useState<CatalogSortOption>('popular');
  const [page, setPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);

  // Sync initial segment/query when opened
  useEffect(() => {
    if (isOpen) {
      setSegment(initialSegment);
      setQuery(initialQuery);
      setPage(1);
      setExportStatus(null);
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, initialSegment, initialQuery]);

  // Lock background scroll and bind Escape key
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  const result = useMemo(() => {
    if (!isOpen) return null;
    return queryCatalogDirectory({
      segment,
      query,
      domainGroup,
      category,
      level,
      priceBand,
      sortBy,
      page,
      pageSize: 15,
    });
  }, [isOpen, segment, query, domainGroup, category, level, priceBand, sortBy, page]);

  const visibleCategories = useMemo(() => {
    if (!result) return [];
    const filter = categoryFilterText.trim().toLowerCase();
    if (!filter) return result.categoryFacets;
    return result.categoryFacets.filter(
      (c) => c.name.toLowerCase().includes(filter) || c.group.toLowerCase().includes(filter)
    );
  }, [result, categoryFilterText]);

  if (!isOpen || !result) return null;

  const hasActiveFilters =
    query.trim().length > 0 ||
    domainGroup !== 'All' ||
    category !== 'All' ||
    level !== 'All' ||
    priceBand !== 'all';

  const handleResetFilters = () => {
    setQuery('');
    setDomainGroup('All');
    setCategory('All');
    setCategoryFilterText('');
    setLevel('All');
    setPriceBand('all');
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    listScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCsv = () => {
    const { csvContent, exportedCount, totalMatching } = buildCatalogCsvExport({
      segment,
      query,
      domainGroup,
      category,
      level,
      priceBand,
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeSegment = segment === 'all' ? 'all-22529' : segment;
    link.href = url;
    link.setAttribute('download', `openframe-catalog-${safeSegment}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportStatus(
      totalMatching > exportedCount
        ? `Downloaded ${exportedCount.toLocaleString()} of ${totalMatching.toLocaleString()} rows`
        : `Downloaded ${exportedCount.toLocaleString()} rows`
    );
    window.setTimeout(() => setExportStatus(null), 3500);
  };

  const startIdx = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const endIdx = Math.min(result.total, result.page * result.pageSize);

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] w-screen h-dvh bg-white flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="catalog-explorer-title"
    >
      <div className="relative w-full h-full bg-white flex flex-col overflow-hidden">
        {/* TOP HEADER & SEARCH BAR */}
        <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2
                  id="catalog-explorer-title"
                  className="text-base sm:text-lg font-bold tracking-tight text-white truncate"
                >
                  OpenFrame Course Catalog
                </h2>
                <p className="text-xs text-slate-400 tabular-nums truncate">
                  {result.segmentCounts.all.toLocaleString()} total courses ·{' '}
                  {result.segmentCounts.professional.toLocaleString()} professional ·{' '}
                  {result.segmentCounts.youtube.toLocaleString()} YouTube ·{' '}
                  {result.segmentCounts.youtube_playlist.toLocaleString()} playlists
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                {exportStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="tabular-nums">{exportStatus}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Export CSV</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close course catalog"
                className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 PRIMARY CATALOG SEGMENTS + INLINE SEARCH */}
          <div className="mt-3.5 flex flex-col lg:flex-row lg:items-center gap-3">
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar"
              role="tablist"
              aria-label="Catalog segments"
            >
              {SEGMENT_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = segment === tab.id;
                const count = result.segmentCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSegment(tab.id);
                      setCategory('All');
                      setDomainGroup('All');
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                      active
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                    <span
                      className={`tabular-nums text-[11px] font-bold ${
                        active ? 'text-cyan-100' : 'text-slate-400'
                      }`}
                    >
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by course title, channel, category, or ID (e.g. Python, Excel, Playlist)..."
                aria-label="Filter courses inside catalog"
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setPage(1);
                  }}
                  aria-label="Clear catalog search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* BODY: 2-COLUMN DIRECTORY */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
          {/* LEFT NAVIGATION RAIL */}
          <aside
            className={`${
              showMobileFilters ? 'block' : 'hidden'
            } lg:block lg:col-span-4 xl:col-span-3 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto p-4 space-y-5 max-h-[45vh] lg:max-h-none`}
          >
            {/* Domain Groups */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Domains
                </h3>
                {domainGroup !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setDomainGroup('All');
                      setCategory('All');
                      setPage(1);
                    }}
                    className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 cursor-pointer"
                  >
                    All
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setDomainGroup('All');
                    setCategory('All');
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    domainGroup === 'All'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="truncate">All Domains</span>
                  <span className="tabular-nums text-[11px] opacity-80">
                    {result.domainFacets.reduce((acc, d) => acc + d.count, 0).toLocaleString()}
                  </span>
                </button>
                {result.domainFacets.map((d) => {
                  const active = domainGroup === d.name;
                  return (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() => {
                        setDomainGroup(d.name);
                        setCategory('All');
                        setPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-cyan-50 text-cyan-900 font-semibold border border-cyan-200'
                          : 'text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <span className="truncate">{d.name}</span>
                      <span className="tabular-nums text-[11px] text-slate-500">
                        {d.count.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level & Grant Fee Filters */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 pt-3 border-t border-slate-200">
              <div>
                <label
                  htmlFor="catalog-level-select"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  Skill Level
                </label>
                <select
                  id="catalog-level-select"
                  value={level}
                  onChange={(e) => {
                    setLevel(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels Track</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="catalog-price-select"
                  className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  90% Grant Fee Band
                </label>
                <select
                  id="catalog-price-select"
                  value={priceBand}
                  onChange={(e) => {
                    setPriceBand(e.target.value as CatalogPriceBand);
                    setPage(1);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Grant Fees (₹300 – ₹2,500)</option>
                  <option value="under_800">Foundations (₹300 – ₹799)</option>
                  <option value="mid_800_1499">Degree & Applied (₹800 – ₹1,499)</option>
                  <option value="pro_1500_2500">Professional & PG (₹1,500 – ₹2,500)</option>
                </select>
              </div>
            </div>

            {/* Categories Index */}
            <div className="pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 tabular-nums">
                  Categories ({result.categoryFacets.length})
                </h3>
                {category !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory('All');
                      setPage(1);
                    }}
                    className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <input
                type="text"
                value={categoryFilterText}
                onChange={(e) => setCategoryFilterText(e.target.value)}
                placeholder="Find category..."
                aria-label="Filter category list"
                className="w-full mb-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-cyan-500"
              />

              <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                {visibleCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3 text-center">No matching categories</p>
                ) : (
                  visibleCategories.map((cat) => {
                    const active = category === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => {
                          setCategory(active ? 'All' : cat.name);
                          setPage(1);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                          active
                            ? 'bg-cyan-600 text-white font-semibold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span
                          className={`tabular-nums text-[11px] shrink-0 ${
                            active ? 'text-cyan-100' : 'text-slate-400'
                          }`}
                        >
                          {cat.count.toLocaleString()}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT CATALOG DIRECTORY PANE */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col min-h-0">
            {/* Results Toolbar */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((v) => !v)}
                  className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
                </button>

                <div className="text-xs text-slate-600 tabular-nums">
                  Showing <strong className="text-slate-900">{startIdx.toLocaleString()}–{endIdx.toLocaleString()}</strong> of{' '}
                  <strong className="text-slate-900">{result.total.toLocaleString()}</strong> courses
                  {category !== 'All' && (
                    <span className="text-cyan-700 font-semibold"> in {category}</span>
                  )}
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  aria-label="Sort catalog courses"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as CatalogSortOption);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="popular">Sort: Most Popular</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="price_low">Sort: Fee Low to High</option>
                  <option value="price_high">Sort: Fee High to Low</option>
                  <option value="title_az">Sort: Title A–Z</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    onApplyFiltersToPage({
                      segment,
                      domainGroup,
                      category,
                      level,
                      query,
                    });
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open in Marketplace Grid</span>
                </button>
              </div>
            </div>

            {/* Course List */}
            <div ref={listScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {result.items.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                  <p className="text-sm font-semibold text-slate-900">
                    No courses match your current catalog filters.
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try broadening your search keywords or switching back to All Courses.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    Reset Catalog Filters
                  </button>
                </div>
              ) : (
                result.items.map((course) => {
                  const isPlaylist =
                    course.courseType === 'youtube_playlist' || Boolean(course.youtubePlaylistId);
                  const isYouTube =
                    isPlaylist ||
                    course.courseType === 'youtube_video' ||
                    Boolean(course.youtubeVideoId);
                  const formatText = isPlaylist
                    ? 'YouTube Playlist'
                    : isYouTube
                    ? 'YouTube Course'
                    : 'Professional Track';
                  const isPaid = Boolean(paidCourseIds?.has(course.id.toLowerCase()));
                  const benchmark = course.marketBenchmarkPrice || course.price * 10;

                  return (
                    <article
                      key={course.id}
                      className="bg-white rounded-xl border border-slate-200 hover:border-cyan-400/70 hover:shadow-sm transition-all p-3.5 sm:p-4 flex flex-col sm:flex-row gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-44 aspect-video rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        <CourseThumbnail
                          src={course.thumbnailUrl || course.imageUrl}
                          alt={course.title}
                          category={course.category}
                          categoryGroup={course.categoryGroup}
                          youtubeVideoId={course.youtubeVideoId}
                          className="w-full h-full object-cover"
                        />
                        {isYouTube && (
                          <button
                            type="button"
                            onClick={() => {
                              const { video, playlist } = buildVideoPayloadFromCourse(course);
                              onWatchCourseVideo(video, playlist);
                            }}
                            aria-label={`Play preview for ${course.title}`}
                            className="absolute inset-0 bg-slate-950/30 hover:bg-slate-950/50 flex items-center justify-center transition-colors cursor-pointer group"
                          >
                            <span className="w-9 h-9 rounded-full bg-white/95 text-slate-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                              <Play className="w-4 h-4 fill-slate-900 ml-0.5" />
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2.5">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => onNavigateCourse(course.id)}
                              className="text-left text-sm font-bold text-slate-900 hover:text-cyan-700 leading-snug line-clamp-2 cursor-pointer"
                            >
                              {course.title}
                            </button>

                            <div className="text-right shrink-0 tabular-nums">
                              <div className="text-sm font-extrabold text-slate-900">
                                {formatInr(course.price)}
                              </div>
                              <div className="text-[11px] text-slate-400 line-through">
                                {formatInr(benchmark)}
                              </div>
                            </div>
                          </div>

                          {/* Clean zero-pill metadata line */}
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
                            <span
                              className={`font-semibold ${
                                isPlaylist
                                  ? 'text-indigo-700'
                                  : isYouTube
                                  ? 'text-rose-700'
                                  : 'text-cyan-700'
                              }`}
                            >
                              {formatText}
                            </span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span className="font-medium text-slate-700">{course.category}</span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span>{course.level}</span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span className="tabular-nums">{course.duration}</span>
                            <span className="text-slate-300" aria-hidden="true">·</span>
                            <span className="truncate max-w-[200px]">
                              {course.youtubeChannelName || course.instructorName}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                            <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                              {course.rating.toFixed(1)}
                            </span>
                            <span>{(course.enrolledCount || 0).toLocaleString()} learners</span>
                            <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
                              {course.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isYouTube && (
                              <button
                                type="button"
                                onClick={() => {
                                  const { video, playlist } = buildVideoPayloadFromCourse(course);
                                  onWatchCourseVideo(video, playlist);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                              >
                                <Play className="w-3 h-3 text-rose-600" />
                                <span>{isPlaylist ? 'Play Series' : 'Preview'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onNavigateCourse(course.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                            >
                              <span>Syllabus</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                isPaid
                                  ? onNavigateCourse(course.id)
                                  : onEnrollCourse(course)
                              }
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                                isPaid
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                              }`}
                            >
                              <span>{isPaid ? 'Open Workspace' : `Enroll ${formatInr(course.price)}`}</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* FOOTER PAGINATION */}
            <footer className="bg-white border-t border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500 tabular-nums">
                Page <strong className="text-slate-900">{result.page.toLocaleString()}</strong> of{' '}
                <strong className="text-slate-900">{result.totalPages.toLocaleString()}</strong>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={result.page <= 1}
                  onClick={() => handlePageChange(Math.max(1, result.page - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={result.page >= result.totalPages}
                  onClick={() => handlePageChange(Math.min(result.totalPages, result.page + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
