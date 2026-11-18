import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  BookOpen,
  Star,
  Clock,
  Layers,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  ArrowRight,
  SlidersHorizontal,
  X,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Flame,
  Briefcase,
  Play,
  Tv,
  Bot,
  Heart,
  ListVideo,
  Globe,
  UserCheck,
  Tag,
  Bookmark,
  Calendar,
  Eye,
  AlertCircle,
  Brain,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  marketplaceService,
  ALL_MARKETPLACE_CATEGORIES,
  SUPPORTED_COURSE_LANGUAGES
} from '../services/marketplaceService';
import {
  MarketplaceCourse,
  MarketplaceCourseStatus,
  MarketplaceCounters,
  MarketplaceCategory,
  MarketplaceAutocompleteSuggestion,
  MarketplaceCourseType,
  CourseContentType,
  AiLearningPath,
  EducationCategoryCode,
  QuinnDiscoveryResponse
} from '../types';
import { CORPORATE_CONTENT_TYPES } from '../data/corporateTrainingTaxonomy';
import {
  EDUCATION_CLASSIFICATION_CATEGORIES,
  EDUCATION_CATEGORY_BY_CODE,
  getAllProgrammesForCategory
} from '../data/educationClassificationData';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { CourseEnrollmentModal } from '../components/common/CourseEnrollmentModal';
import { LearningRoadmapPanel } from '../components/discovery/LearningRoadmapPanel';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';
import { useAuth } from '../context/AuthContext';
import { lmsService } from '../services/lmsService';
import { quinnAiService } from '../services/quinnAiService';
import {
  UNIVERSAL_12_CATEGORIES,
  EXCEL_TOPIC_GROUPS,
  POPULAR_SEARCH_TOPICS,
  detectQueryLanguage,
  normalizeAndExpandQuery,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches
} from '../utils/searchIntelligence';

export const CourseMarketplacePage: React.FC = () => {
  const router = useRouter();
  const { currentUser, studentProfile } = useAuth();

  // Paginated courses state (never loads all 15k–1M records at once)
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Live Database & Server Counters + Dynamic Categories
  const [counters, setCounters] = useState<MarketplaceCounters | null>(null);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [savingFavId, setSavingFavId] = useState<string | null>(null);

  // Generic Admissions Modal vs Course Checkout & Enrollment Modal
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regModalData, setRegModalData] = useState<{ title: string; id: string; category: string }>({
    title: 'General Programme',
    id: '',
    category: 'Information Technology'
  });
  const [enrollModalCourse, setEnrollModalCourse] = useState<MarketplaceCourse | null>(null);

  // Video Player Pop-up Modal State
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);

  // Filter params
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<MarketplaceAutocompleteSuggestion[]>([]);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [courseTypeFilter, setCourseTypeFilter] = useState<'all' | MarketplaceCourseType>('all');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | CourseContentType>('all');
  const [libraryCollectionFilter, setLibraryCollectionFilter] = useState<'all' | 'corporate_training'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [selectedPricingTier, setSelectedPricingTier] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [publicationDate, setPublicationDate] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [certificateOnly, setCertificateOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high' | 'newest'>('popular');

  // Education Classification (A–J), Degree, Access Type & Unified Discovery State
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<'All' | EducationCategoryCode>('All');
  const [selectedDegreeProgramme, setSelectedDegreeProgramme] = useState('All');
  const [selectedAccessType, setSelectedAccessType] = useState<'all' | 'free' | 'paid'>('all');
  const [unifiedViewTab, setUnifiedViewTab] = useState<
    'all_results' | 'openframe_courses' | 'youtube_videos' | 'learning_paths' | 'related_skills'
  >('all_results');
  const [discoveryResult, setDiscoveryResult] = useState<QuinnDiscoveryResponse | null>(null);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  // Search Intelligence, Excel Pills, Live YouTube & AI Course Organizer State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [recommendedQuickCourses, setRecommendedQuickCourses] = useState<MarketplaceCourse[]>([]);
  const [selectedExcelTopic, setSelectedExcelTopic] = useState('All Excel Topics');
  const [liveYoutubeEnabled, setLiveYoutubeEnabled] = useState(true);
  const [liveYoutubeResults, setLiveYoutubeResults] = useState<any[]>([]);
  const [liveYoutubeLoading, setLiveYoutubeLoading] = useState(false);
  const [liveYoutubeLoadingMore, setLiveYoutubeLoadingMore] = useState(false);
  const [liveYoutubePageToken, setLiveYoutubePageToken] = useState<string | null>(null);
  const [liveYoutubeError, setLiveYoutubeError] = useState<string | null>(null);
  const [liveYoutubeNote, setLiveYoutubeNote] = useState<string | null>(null);
  const [activeYouTubeQuery, setActiveYouTubeQuery] = useState('');
  const [aiPathOpen, setAiPathOpen] = useState(false);
  const [aiPathLoading, setAiPathLoading] = useState(false);
  const [aiPathData, setAiPathData] = useState<AiLearningPath | null>(null);
  const [aiModuleCount, setAiModuleCount] = useState<3 | 6 | 9>(3);
  const [savingAiPath, setSavingAiPath] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const runIntelligentDiscovery = async (
    rawQuery: string,
    opts?: {
      levelOverride?: 'All' | EducationCategoryCode;
      degreeOverride?: string;
      accessOverride?: 'all' | 'free' | 'paid';
      langOverride?: string;
    }
  ) => {
    const q = rawQuery.trim();
    const lvl = opts?.levelOverride ?? selectedEducationLevel;
    const deg = opts?.degreeOverride ?? selectedDegreeProgramme;
    const access = opts?.accessOverride ?? selectedAccessType;
    const lang = opts?.langOverride ?? selectedLanguage;
    if (q.length < 2 && lvl === 'All' && deg === 'All') {
      setDiscoveryResult(null);
      return;
    }

    setDiscoveryLoading(true);
    try {
      const effectiveQuery = q.length >= 2 ? q : deg !== 'All' ? deg : EDUCATION_CATEGORY_BY_CODE[lvl as EducationCategoryCode]?.title || 'Courses';
      const resp = await quinnAiService.discoverAndRecommend({
        query: effectiveQuery,
        studentProfile: studentProfile || undefined,
        filters: {
          educationLevel: lvl !== 'All' ? lvl : undefined,
          degree: deg !== 'All' ? deg : undefined,
          accessType: access,
          language: lang !== 'All' ? lang : undefined,
        },
      });
      setDiscoveryResult(resp);

      lmsService
        .logDiscoveryAnalyticsEvent({
          userId: currentUser?.uid,
          eventType: 'search',
          query: effectiveQuery,
          educationLevelCode: resp.parsedIntent.educationLevelCode || (lvl !== 'All' ? lvl : undefined),
          degreeOrClass: resp.parsedIntent.degreeOrClass || (deg !== 'All' ? deg : undefined),
          subject: resp.parsedIntent.desiredSkill || resp.parsedIntent.primarySubject,
        })
        .catch(() => {});
    } catch {
      // Keep catalog responsive on fallback
    } finally {
      setDiscoveryLoading(false);
    }
  };

  const hasInitializedYoutubeRef = useRef(false);

  const mapLiveYoutubeToExtended = (yt: any, topicFallback?: string): ExtendedYouTubeVideo => {
    const vidId = yt.videoId || yt.youtubeId || yt.id || 'JMUxmLyrhSk';
    const thumb = yt.thumbnail || yt.thumbnailUrl || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
    return {
      id: yt.id || `yt-${vidId}`,
      videoId: vidId,
      youtubeId: vidId,
      title: yt.title || 'Educational Video Lecture',
      channelTitle: yt.channelTitle || 'YouTube Educator',
      thumbnail: thumb,
      thumbnailUrl: thumb,
      duration: yt.duration || 'Tutorial',
      level: yt.level === 'Advanced' ? 'Advanced' : yt.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
      subjectCategory: selectedCategory !== 'All' ? selectedCategory : 'OpenFrame Discovery',
      recommendedReason: yt.recommendedReason || 'Discovered via OpenFrame YouTube Search',
      embedUrl:
        yt.embedUrl ||
        (yt.playlistId || yt.playlistInfo?.playlistId
          ? `https://www.youtube-nocookie.com/embed/videoseries?list=${yt.playlistId || yt.playlistInfo?.playlistId}`
          : `https://www.youtube-nocookie.com/embed/${vidId}`),
      keyTopicsCovered: [topicFallback || searchQuery.trim() || yt.title || 'Learning Topic'],
    };
  };

  // Explicit YouTube Data API v3 Search (ONLY on initial cached arrival, explicit submit, suggestion click, chip/category click, URL load, or Retry/Load More — NEVER on keystrokes)
  const runLiveYouTubeSearch = async (
    rawQuery: string,
    options?: {
      pageToken?: string | null;
      append?: boolean;
      languageOverride?: string;
      channelOverride?: string;
      categoryOverride?: string;
      skipSaveRecent?: boolean;
      autoOrganize?: boolean;
      targetModuleCount?: 3 | 6 | 9;
    }
  ): Promise<any[]> => {
    const q = rawQuery.trim();
    const ch = (options?.channelOverride ?? selectedChannel).trim();
    if (!liveYoutubeEnabled || (q.length < 2 && !ch)) {
      if (!options?.append) {
        setLiveYoutubeResults([]);
        setLiveYoutubePageToken(null);
        setLiveYoutubeError(null);
        setLiveYoutubeNote(null);
        setActiveYouTubeQuery('');
      }
      return [];
    }

    const isAppend = Boolean(options?.append && options?.pageToken);
    if (isAppend) {
      setLiveYoutubeLoadingMore(true);
    } else {
      setLiveYoutubeLoading(true);
      setLiveYoutubeError(null);
      setActiveYouTubeQuery(q || ch);
    }

    let incomingVideos: any[] = [];
    try {
      const detected = detectQueryLanguage(q);
      const langBase = options?.languageOverride ?? selectedLanguage;
      const langParam = langBase !== 'All' ? langBase : detected.label;
      const queryToSend =
        selectedExcelTopic !== 'All Excel Topics' && q.toLowerCase().includes('excel')
          ? `${q} ${selectedExcelTopic}`
          : q;

      const res = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToSend,
          category: (options?.categoryOverride ?? selectedCategory) !== 'All' ? (options?.categoryOverride ?? selectedCategory) : '',
          language: langParam,
          channel: ch || undefined,
          duration: selectedDuration !== 'All' ? selectedDuration : 'any',
          publicationDate,
          searchType: courseTypeFilter === 'youtube_playlist' ? 'playlist' : 'video',
          pageToken: options?.pageToken || undefined,
          maxResults: 6,
          includePlaylists: true,
        }),
      });

      if (!res.ok) {
        throw new Error('Unable to reach YouTube search gateway.');
      }

      const data = await res.json();
      incomingVideos = Array.isArray(data.videos) ? data.videos : [];
      setLiveYoutubeResults((prev) => {
        if (!isAppend) return incomingVideos;
        const seen = new Set(prev.map((item) => item.videoId || item.id));
        return [...prev, ...incomingVideos.filter((item: any) => !seen.has(item.videoId || item.id))];
      });
      setLiveYoutubePageToken(data.nextPageToken || null);
      setLiveYoutubeError(data.retryable && data.error ? data.error : null);
      setLiveYoutubeNote(data.notice || null);

      if (!isAppend && !options?.skipSaveRecent && q.length >= 2) {
        setRecentSearches(saveRecentSearch(q));
        if (currentUser?.uid) {
          lmsService
            .recordSearchHistory({
              userId: currentUser.uid,
              query: q,
              detectedLanguage: detected.label,
              category: selectedCategory !== 'All' ? selectedCategory : undefined,
              resultCount: incomingVideos.length,
            })
            .catch(() => {});
        }
      }
    } catch (err: any) {
      if (!isAppend) setLiveYoutubeResults([]);
      setLiveYoutubeError(err?.message || 'YouTube Data API request failed.');
    } finally {
      setLiveYoutubeLoading(false);
      setLiveYoutubeLoadingMore(false);
    }

    if (options?.autoOrganize && !isAppend) {
      const targetCnt = options?.targetModuleCount ?? (/\bexcel\b/i.test(q) ? 6 : aiModuleCount);
      await handleGenerateAiPath(targetCnt, incomingVideos, q || ch, options?.languageOverride);
    }

    return incomingVideos;
  };

  const executeUnifiedDiscoverySearch = (
    rawTopic: string,
    opts?: {
      languageOverride?: string;
      channelOverride?: string;
      categoryOverride?: string;
      targetModuleCount?: 3 | 6 | 9;
      scroll?: boolean;
    }
  ) => {
    const clean = rawTopic.trim();
    setIsSearchFocused(false);
    if (clean.length < 2 && !(opts?.channelOverride ?? selectedChannel).trim()) return;
    const isExcel = /\bexcel\b/i.test(clean);
    const nextModuleCount = opts?.targetModuleCount ?? (isExcel ? 6 : aiModuleCount);
    if (isExcel) setAiModuleCount(6);
    runIntelligentDiscovery(clean, {
      langOverride: opts?.languageOverride,
    });
    runLiveYouTubeSearch(clean, {
      languageOverride: opts?.languageOverride,
      channelOverride: opts?.channelOverride,
      categoryOverride: opts?.categoryOverride,
      autoOrganize: true,
      targetModuleCount: nextModuleCount,
    });
    if (opts?.scroll !== false) {
      window.scrollTo({ top: 440, behavior: 'smooth' });
    }
  };

  // Parse URL query params on route change or run initial cached YouTube preload when arriving cleanly
  useEffect(() => {
    const qIdx = router.currentPath.indexOf('?');
    if (qIdx === -1) {
      if (!hasInitializedYoutubeRef.current) {
        hasInitializedYoutubeRef.current = true;
        const starterTopic =
          studentProfile?.preferredCategories?.[0] ||
          studentProfile?.degreeOrClass ||
          studentProfile?.qualification ||
          'Artificial Intelligence Python Programming';
        runLiveYouTubeSearch(starterTopic, {
          skipSaveRecent: true,
          autoOrganize: false,
        });
      }
      return;
    }
    const sp = new URLSearchParams(router.currentPath.slice(qIdx + 1));
    const qParam = sp.get('q');
    const catParam = sp.get('cat') || sp.get('category');
    const langParam = sp.get('lang');
    const groupParam = sp.get('group');
    const levelParam = sp.get('level') as EducationCategoryCode | null;
    const degreeParam = sp.get('degree');
    const viewParam = sp.get('view');
    const cleanLang =
      langParam && langParam !== 'auto' && langParam !== 'Auto-Detect Language'
        ? langParam.replace(/\s*\(.*\)$/, '')
        : undefined;

    if (levelParam && EDUCATION_CATEGORY_BY_CODE[levelParam]) {
      setSelectedEducationLevel(levelParam);
    }
    if (degreeParam) {
      setSelectedDegreeProgramme(degreeParam);
    }
    if (viewParam === 'roadmap') {
      setUnifiedViewTab('learning_paths');
    }

    if (qParam !== null) {
      setSearchQuery(qParam);
      const isExcel = /\bexcel\b/i.test(qParam);
      if (isExcel) {
        setAiModuleCount(6);
      }
      if (qParam.trim().length >= 2) {
        hasInitializedYoutubeRef.current = true;
        setRecentSearches(saveRecentSearch(qParam));
        runLiveYouTubeSearch(qParam, {
          languageOverride: cleanLang,
          categoryOverride: catParam || undefined,
          autoOrganize: true,
          targetModuleCount: isExcel ? 6 : aiModuleCount,
        });
        runIntelligentDiscovery(qParam, {
          levelOverride: levelParam && EDUCATION_CATEGORY_BY_CODE[levelParam] ? levelParam : undefined,
          degreeOverride: degreeParam || undefined,
          langOverride: cleanLang,
        });
      }
    } else if ((levelParam && EDUCATION_CATEGORY_BY_CODE[levelParam]) || degreeParam) {
      hasInitializedYoutubeRef.current = true;
      runIntelligentDiscovery('', {
        levelOverride: levelParam && EDUCATION_CATEGORY_BY_CODE[levelParam] ? levelParam : 'All',
        degreeOverride: degreeParam || 'All',
        langOverride: cleanLang,
      });
      const eduTopic =
        degreeParam ||
        (levelParam && EDUCATION_CATEGORY_BY_CODE[levelParam]?.title) ||
        'Academic Curriculum Foundations';
      runLiveYouTubeSearch(eduTopic, {
        languageOverride: cleanLang,
        skipSaveRecent: true,
        autoOrganize: false,
      });
    }

    if (catParam) setSelectedCategory(catParam);
    if (groupParam) setSelectedGroup(groupParam);
    if (cleanLang) setSelectedLanguage(cleanLang);
  }, [router.currentPath]);

  // Mobile filters drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Load live counters & dynamic categories once on mount
  useEffect(() => {
    let active = true;
    Promise.all([
      marketplaceService.getLiveMarketplaceCounters().catch(() => null),
      marketplaceService.getCategories().catch(() => []),
      marketplaceService.filterCourses({ tab: 'recommended', page: 1, pageSize: 4 }).catch(() => ({ courses: [] })),
    ]).then(([liveStats, catList, recRes]) => {
      if (!active) return;
      if (liveStats) setCounters(liveStats);
      if (catList && catList.length > 0) setCategories(catList);
      if (recRes?.courses) setRecommendedQuickCourses(recRes.courses);
    });
    return () => {
      active = false;
    };
  }, []);

  // Load student's saved favourites & bookmarks when authenticated
  useEffect(() => {
    const targetUid = currentUser?.uid || 'guest_learner';
    let active = true;
    if (currentUser) {
      marketplaceService
        .getStudentFavorites(currentUser.uid)
        .then((favs) => {
          if (!active) return;
          setFavoriteIds(new Set(favs.map((f) => f.courseId)));
        })
        .catch(() => {});
    } else {
      setFavoriteIds(new Set());
    }
    lmsService
      .getStudentBookmarks(targetUid)
      .then((bms) => {
        if (!active) return;
        setBookmarkedIds(new Set(bms.map((b) => b.courseId)));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Debounced server + Firestore autocomplete search
  useEffect(() => {
    if (!isSearchFocused) return;
    let cancelled = false;
    setIsAutocompleting(true);
    const timer = setTimeout(async () => {
      try {
        const res = await marketplaceService.autocompleteSearch(searchQuery);
        if (!cancelled) {
          setAutocompleteSuggestions(res);
        }
      } catch {
        // Keep current suggestions on transient error
      } finally {
        if (!cancelled) setIsAutocompleting(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, isSearchFocused]);

  // Fetch paginated courses whenever filters change
  const fetchFilteredCourses = async (pageToFetch = currentPage) => {
    setIsLoading(true);
    try {
      const result = await marketplaceService.filterCourses({
        query: searchQuery,
        tab: activeTab,
        category: selectedCategory,
        subcategory: selectedSubcategory !== 'All' ? selectedSubcategory : undefined,
        categoryGroup: selectedGroup,
        educationLevel: selectedEducationLevel !== 'All' ? selectedEducationLevel : undefined,
        degree: selectedDegreeProgramme !== 'All' ? selectedDegreeProgramme : undefined,
        accessType: selectedAccessType,
        courseType: courseTypeFilter,
        contentType: contentTypeFilter,
        libraryCollection: libraryCollectionFilter,
        language: selectedLanguage,
        pricingTier: selectedPricingTier,
        level: selectedLevel,
        duration: selectedDuration,
        instructor: selectedInstructor.trim() || undefined,
        channel: selectedChannel.trim() || undefined,
        status: selectedStatus,
        publicationDate,
        certificateOnly,
        sortBy,
        page: pageToFetch,
        pageSize: 24
      });

      setCourses(result.courses);
      setTotalCourses(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (err) {
      console.error('Error fetching marketplace courses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMoreCourses = async () => {
    if (isLoadingMore || currentPage >= totalPages) return;
    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const result = await marketplaceService.filterCourses({
        query: searchQuery,
        tab: activeTab,
        category: selectedCategory,
        subcategory: selectedSubcategory !== 'All' ? selectedSubcategory : undefined,
        categoryGroup: selectedGroup,
        educationLevel: selectedEducationLevel !== 'All' ? selectedEducationLevel : undefined,
        degree: selectedDegreeProgramme !== 'All' ? selectedDegreeProgramme : undefined,
        accessType: selectedAccessType,
        courseType: courseTypeFilter,
        contentType: contentTypeFilter,
        libraryCollection: libraryCollectionFilter,
        language: selectedLanguage,
        pricingTier: selectedPricingTier,
        level: selectedLevel,
        duration: selectedDuration,
        instructor: selectedInstructor.trim() || undefined,
        channel: selectedChannel.trim() || undefined,
        status: selectedStatus,
        publicationDate,
        certificateOnly,
        sortBy,
        page: nextPage,
        pageSize: 24,
      });
      setCourses((prev) => {
        const seen = new Set(prev.map((c) => c.id));
        const appended = result.courses.filter((c) => !seen.has(c.id));
        return [...prev, ...appended];
      });
      setTotalCourses(result.total);
      setTotalPages(result.totalPages);
      setCurrentPage(result.page);
    } catch (err) {
      console.error('Error loading more courses:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchFilteredCourses(1);
  }, [
    searchQuery,
    activeTab,
    selectedCategory,
    selectedSubcategory,
    selectedGroup,
    selectedEducationLevel,
    selectedDegreeProgramme,
    selectedAccessType,
    courseTypeFilter,
    contentTypeFilter,
    libraryCollectionFilter,
    selectedLanguage,
    selectedPricingTier,
    selectedLevel,
    selectedDuration,
    selectedInstructor,
    selectedChannel,
    selectedStatus,
    publicationDate,
    certificateOnly,
    sortBy
  ]);

  const handleGenerateAiPath = async (
    overrideCount?: 3 | 6 | 9,
    videosOverride?: any[],
    topicOverride?: string,
    languageOverride?: string
  ) => {
    const topic =
      (topicOverride ?? searchQuery).trim() ||
      activeYouTubeQuery.trim() ||
      (selectedCategory !== 'All' ? selectedCategory : 'Applied Data & AI Skills');
    const videosSource = Array.isArray(videosOverride) ? videosOverride : liveYoutubeResults;
    const countToUse = overrideCount ?? aiModuleCount;
    const langBase = languageOverride ?? selectedLanguage;
    setAiPathOpen(true);
    setAiPathLoading(true);
    try {
      const generated = await quinnAiService.organizeCoursePath({
        query: topic,
        language: langBase !== 'All' ? langBase : detectQueryLanguage(topic).label,
        videos: videosSource.slice(0, 9),
        moduleCount: countToUse,
      });
      if (generated) {
        setAiPathData(generated);
      }
    } finally {
      setAiPathLoading(false);
    }
  };

  const handleSaveAiPath = async () => {
    if (!aiPathData) return;
    setSavingAiPath(true);
    try {
      await lmsService.saveAiLearningPath({
        ...aiPathData,
        createdByUid: currentUser?.uid,
      });
      showToast('AI Learning Path saved to your OpenFrame workspace!');
    } finally {
      setSavingAiPath(false);
    }
  };

  const handleToggleBookmarkCourse = async (e: React.MouseEvent, courseId: string, title: string, category: string, ytId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    const uid = currentUser?.uid || 'guest_learner';
    const saved = await lmsService.toggleLessonBookmark({
      studentId: uid,
      courseId,
      courseTitle: title,
      lessonId: 'overview',
      lessonTitle: `${title} — ${category}`,
      videoId: ytId,
    });
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(courseId);
      else next.delete(courseId);
      return next;
    });
    showToast(saved ? `Added "${title}" to My Learning.` : `Removed "${title}" from My Learning.`);
  };

  const formatViews = (v?: number) => {
    if (!v || v <= 0) return null;
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K views`;
    return `${v} views`;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchFilteredCourses(newPage);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
    setSelectedCategory('All');
    setSelectedSubcategory('All');
    setSelectedGroup('All');
    setSelectedEducationLevel('All');
    setSelectedDegreeProgramme('All');
    setSelectedAccessType('all');
    setUnifiedViewTab('all_results');
    setDiscoveryResult(null);
    setCourseTypeFilter('all');
    setContentTypeFilter('all');
    setLibraryCollectionFilter('all');
    setSelectedLanguage('All');
    setSelectedPricingTier('All');
    setSelectedLevel('All');
    setSelectedDuration('All');
    setSelectedInstructor('');
    setSelectedChannel('');
    setSelectedStatus('All');
    setPublicationDate('all');
    setCertificateOnly(false);
    setSelectedExcelTopic('All Excel Topics');
    setSortBy('popular');
    setLiveYoutubeResults([]);
    setLiveYoutubePageToken(null);
    setLiveYoutubeError(null);
    setActiveYouTubeQuery('');
    setAiPathData(null);
    setAiPathOpen(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSubcategory !== 'All' ||
    selectedGroup !== 'All' ||
    selectedEducationLevel !== 'All' ||
    selectedDegreeProgramme !== 'All' ||
    selectedAccessType !== 'all' ||
    courseTypeFilter !== 'all' ||
    contentTypeFilter !== 'all' ||
    libraryCollectionFilter !== 'all' ||
    selectedLanguage !== 'All' ||
    selectedPricingTier !== 'All' ||
    selectedLevel !== 'All' ||
    selectedDuration !== 'All' ||
    selectedInstructor.trim().length > 0 ||
    selectedChannel.trim().length > 0 ||
    selectedStatus !== 'All' ||
    publicationDate !== 'all' ||
    certificateOnly ||
    activeTab !== 'all' ||
    searchQuery.trim().length > 0;

  // Handlers for Popups & Favourites
  const handleOpenApply = (title: string, id: string, category: string) => {
    setRegModalData({ title, id, category });
    setIsRegModalOpen(true);
  };

  const handlePlayCourseVideo = (course: MarketplaceCourse) => {
    const directVideos: ExtendedYouTubeVideo[] = [];

    if (course.youtubePlaylistId) {
      directVideos.push({
        id: `pl-${course.youtubePlaylistId}`,
        videoId: course.youtubeVideoId || course.recommendedVideos?.[0]?.videoId || 'JMUxmLyrhSk',
        youtubeId: course.youtubeVideoId || course.recommendedVideos?.[0]?.videoId || 'JMUxmLyrhSk',
        title: `${course.title} — Playlist`,
        channelTitle: course.youtubeChannelName || course.instructorName || 'OpenFrame Partner Channel',
        thumbnail: course.thumbnailUrl || course.imageUrl,
        thumbnailUrl: course.thumbnailUrl || course.imageUrl,
        duration: course.duration || 'Playlist',
        level: course.level === 'Advanced' ? 'Advanced' : course.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
        subjectCategory: course.category,
        recommendedReason: `Official curated playlist for ${course.title}.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${course.youtubePlaylistId}`,
        keyTopicsCovered: course.skillsAcquired?.slice(0, 4) || [course.category]
      });
    }

    if (Array.isArray(course.recommendedVideos) && course.recommendedVideos.length > 0) {
      course.recommendedVideos.forEach((rv) => {
        directVideos.push({
          ...rv,
          subjectCategory: course.category,
          keyTopicsCovered: course.skillsAcquired?.slice(0, 4) || [course.category]
        });
      });
    } else if (course.youtubeVideoId && !course.youtubePlaylistId) {
      directVideos.push({
        id: `yt-${course.youtubeVideoId}`,
        videoId: course.youtubeVideoId,
        youtubeId: course.youtubeVideoId,
        title: course.title,
        channelTitle: course.youtubeChannelName || course.instructorName || 'OpenFrame Faculty',
        thumbnail: `https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`,
        thumbnailUrl: `https://i.ytimg.com/vi/${course.youtubeVideoId}/hqdefault.jpg`,
        duration: course.duration || 'Lecture',
        level: course.level === 'Advanced' ? 'Advanced' : course.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
        subjectCategory: course.category,
        recommendedReason: `Direct lecture video linked to ${course.title}.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${course.youtubeVideoId}`,
        keyTopicsCovered: course.skillsAcquired?.slice(0, 4) || [course.category]
      });
    }

    const fallbackVideos = youtubeVideoService.getVideosForCourse(course.id, course.category, course.title);
    const seen = new Set<string>();
    const combined = [...directVideos, ...fallbackVideos].filter((v) => {
      const key = `${v.embedUrl || ''}:${v.youtubeId || v.videoId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    setSelectedVideo(combined[0] || null);
    setVideoPlaylist(combined);
    setIsVideoModalOpen(true);
  };

  const handleOpenGlobalVideoHub = () => {
    const all = youtubeVideoService.getAllLibrary();
    setSelectedVideo(all[0] || null);
    setVideoPlaylist(all);
    setIsVideoModalOpen(true);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, course: MarketplaceCourse) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      showToast('Sign in to your student account to save favourite courses.');
      router.navigate(`/portal?role=student&redirect=${encodeURIComponent('/marketplace')}`);
      return;
    }

    setSavingFavId(course.id);
    try {
      const saved = await marketplaceService.toggleFavoriteCourse(currentUser.uid, course);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (saved) next.add(course.id);
        else next.delete(course.id);
        return next;
      });
      showToast(saved ? `Saved "${course.title}" to favourites.` : `Removed "${course.title}" from favourites.`);
    } catch (err: any) {
      showToast(err?.message || 'Unable to update favourite course.');
    } finally {
      setSavingFavId(null);
    }
  };

  const handleSelectSuggestion = (s: MarketplaceAutocompleteSuggestion) => {
    setIsSearchFocused(false);
    if (s.type === 'course' && s.id) {
      router.navigate(`/marketplace/${s.id}`);
      return;
    }
    if (s.type === 'category') {
      const cat = s.category || s.label;
      setSelectedCategory(cat);
      setSearchQuery('');
      runIntelligentDiscovery(cat);
      runLiveYouTubeSearch(cat, { categoryOverride: cat, autoOrganize: true });
    } else if (s.type === 'subcategory') {
      setSelectedSubcategory(s.label);
      setSearchQuery('');
      runIntelligentDiscovery(s.label);
      runLiveYouTubeSearch(s.label, { autoOrganize: true });
    } else if (s.type === 'language') {
      setSelectedLanguage(s.label);
      setSearchQuery('');
    } else if (s.type === 'channel') {
      setSelectedChannel(s.label);
      setSearchQuery('');
      runIntelligentDiscovery(s.label);
      runLiveYouTubeSearch(s.label, { channelOverride: s.label, autoOrganize: true });
    } else if (s.type === 'instructor') {
      setSelectedInstructor(s.label);
      setSearchQuery('');
      runIntelligentDiscovery(s.label);
      runLiveYouTubeSearch(s.label, { autoOrganize: true });
    } else {
      setSearchQuery(s.label);
      executeUnifiedDiscoverySearch(s.label, { scroll: false });
    }
    window.scrollTo({ top: 440, behavior: 'smooth' });
  };

  const getStatusBadge = (status: MarketplaceCourseStatus) => {
    switch (status) {
      case 'Published':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Published</span>;
      case 'Ready to Publish':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">Ready</span>;
      case 'Instructor Assigned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">Assigned</span>;
      case 'Content Development':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">In Dev</span>;
      case 'Planned':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">Planned</span>;
      case 'Draft':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">Draft</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Unavailable</span>;
    }
  };

  const categoryOptions = categories.length > 0
    ? categories
    : ALL_MARKETPLACE_CATEGORIES.map((name) => ({
        id: name,
        name,
        slug: name,
        domainGroup: '',
        description: '',
        subcategories: [],
        baseCourseCount: 0,
        customCourseCount: 0,
        totalCourseCount: 0,
        isSystemDefault: true,
        createdAt: '',
        updatedAt: ''
      }));

  const liveTotalLabel = counters ? counters.totalCoursesAvailable.toLocaleString() : '...';
  const liveCategoriesLabel = counters ? counters.categoriesCount.toLocaleString() : String(ALL_MARKETPLACE_CATEGORIES.length);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HERO STRIP */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0F2342] text-white pt-24 pb-12 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4">
            <Link to="/" className="hover:text-cyan-400">Home</Link>
            <span>/</span>
            <Link to="/education" className="hover:text-cyan-400">Education Hub</Link>
            <span>/</span>
            <span className="text-cyan-300 font-semibold tabular-nums">
              {counters ? `${counters.totalCoursesAvailable.toLocaleString()} Course Marketplace` : 'Course Marketplace'}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>OpenFrame Education • In Association with HopeNest Global Foundation</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight tabular-nums">
                {counters ? `${counters.totalCoursesAvailable.toLocaleString()} Online Course Marketplace` : 'OpenFrame Online Course Marketplace'}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
                Explore a scalable catalog of <strong className="text-white tabular-nums">{liveTotalLabel}</strong> courses across <strong className="text-white tabular-nums">{liveCategoriesLabel}</strong> specialized categories — including curated YouTube video courses, full playlists, multilingual tracks, practical capstones, and verified certification.
              </p>

              {/* Action Buttons in Hero */}
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={handleOpenGlobalVideoHub}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 hover:from-blue-600 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 border border-sky-400/30 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-sky-200 text-sky-200" />
                  <span>Play YouTube Lectures On Site</span>
                </button>

                <button
                  onClick={() => handleOpenApply('General Technology & Skill Development Programme', 'OF-ADMISSION-2026', 'Admissions')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center space-x-2 transition-all cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Apply for Admissions</span>
                </button>

                <Link
                  to="/animation-course"
                  className="px-4 py-2.5 rounded-xl bg-slate-800/95 hover:bg-slate-800 text-cyan-300 font-bold text-xs border border-cyan-500/40 flex items-center space-x-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Swift UI Animations &amp; Charts (ZIP Lab)</span>
                </Link>

                {currentUser && (
                  <Link
                    to="/student/dashboard"
                    className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 font-semibold text-xs border border-slate-700 flex items-center space-x-1.5 transition-colors"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                    <span className="tabular-nums">My Favourites ({favoriteIds.size})</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Fast Autocomplete Search Box in Hero */}
            <div className="lg:col-span-5" ref={searchContainerRef}>
              <div className="bg-slate-900/95 backdrop-blur-md p-5 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Smart Course Autocomplete</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Courses · Channels · Instructors · Languages
                  </span>
                </div>

                {/* Input Container */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    executeUnifiedDiscoverySearch(searchQuery);
                  }}
                  className="relative flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      aria-label="Search any subject, course, degree, skill or topic"
                      onFocus={() => setIsSearchFocused(true)}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearchFocused(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setIsSearchFocused(false);
                      }}
                      placeholder="Search any subject, course, degree, skill or topic..."
                      className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                        aria-label="Clear search query"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Search
                  </button>

                  {/* AUTOCOMPLETE DROPDOWN */}
                  {isSearchFocused && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0B1E3F] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden divide-y divide-blue-900/60 text-left text-xs max-h-[440px] overflow-y-auto">
                      <div className="px-3.5 py-2 bg-[#071326] flex items-center justify-between text-[11px]">
                        <span className="font-bold text-cyan-300">
                          {isAutocompleting
                            ? 'Searching catalog index...'
                            : searchQuery.trim().length < 2
                            ? 'Popular, Recent & Recommended Courses'
                            : 'Live Catalog & YouTube Discovery'}
                        </span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {searchQuery.trim().length >= 2
                            ? `${autocompleteSuggestions.length} matches · Language: ${detectQueryLanguage(searchQuery).label}`
                            : 'Zero YouTube calls while typing'}
                        </span>
                      </div>

                      {searchQuery.trim().length >= 2 && normalizeAndExpandQuery(searchQuery).correctionHint && (
                        <div className="px-3.5 py-2 bg-blue-950/80 text-[11px] text-sky-300 font-medium">
                          {normalizeAndExpandQuery(searchQuery).correctionHint}
                        </div>
                      )}

                      {searchQuery.trim().length < 2 ? (
                        <div className="p-3 space-y-3">
                          {recentSearches.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                                Recently Searched Topics
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {recentSearches.slice(0, 6).map((rs) => (
                                  <button
                                    key={rs}
                                    type="button"
                                    onClick={() => {
                                      setSearchQuery(rs);
                                      executeUnifiedDiscoverySearch(rs);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] whitespace-nowrap cursor-pointer"
                                  >
                                    {rs}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-cyan-300">
                              Popular Searches
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {POPULAR_SEARCH_TOPICS.slice(0, 8).map((pop) => (
                                <button
                                  key={pop}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(pop);
                                    executeUnifiedDiscoverySearch(pop);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-blue-800/70 text-sky-200 text-[11px] whitespace-nowrap cursor-pointer"
                                >
                                  {pop}
                                </button>
                              ))}
                            </div>
                          </div>

                          {recommendedQuickCourses.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">
                                Recommended OpenFrame Courses
                              </div>
                              {recommendedQuickCourses.slice(0, 3).map((rc) => (
                                <button
                                  key={rc.id}
                                  type="button"
                                  onClick={() => {
                                    setIsSearchFocused(false);
                                    router.navigate(`/marketplace/${rc.id}`);
                                  }}
                                  className="w-full px-2.5 py-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between gap-2 text-[11px] text-white cursor-pointer"
                                >
                                  <span className="truncate font-medium">{rc.title}</span>
                                  <span className="text-[10px] text-emerald-300 shrink-0">{rc.category}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => executeUnifiedDiscoverySearch(searchQuery)}
                            className="w-full px-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-900/90 to-indigo-900/90 hover:from-cyan-800 hover:to-indigo-800 border border-cyan-500/40 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Tv className="w-4 h-4 text-rose-300 shrink-0" />
                              <span className="font-bold text-white truncate text-xs">
                                Search Live YouTube + Organize with Quinn AI for &ldquo;{searchQuery.trim()}&rdquo;
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-cyan-300 whitespace-nowrap shrink-0 flex items-center gap-1">
                              <span>Run</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </button>

                          {autocompleteSuggestions.length === 0 && !isAutocompleting ? (
                            <div className="p-3 text-slate-400 text-center text-[11px]">
                              Press Enter or click above to search Recommended Courses, Live YouTube &amp; Quinn AI Modules for &ldquo;{searchQuery}&rdquo;
                            </div>
                          ) : (
                            autocompleteSuggestions.map((s, idx) => (
                              <button
                                key={`${s.type}-${s.id || s.label}-${idx}`}
                                type="button"
                                onClick={() => handleSelectSuggestion(s)}
                                className="w-full px-3 py-2 rounded-xl hover:bg-cyan-950/70 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-300">
                                    {s.type === 'course' ? (
                                      s.courseType === 'youtube_playlist' ? (
                                        <ListVideo className="w-3.5 h-3.5" />
                                      ) : (
                                        <BookOpen className="w-3.5 h-3.5" />
                                      )
                                    ) : s.type === 'channel' ? (
                                      <Tv className="w-3.5 h-3.5 text-rose-400" />
                                    ) : s.type === 'instructor' ? (
                                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : s.type === 'language' ? (
                                      <Globe className="w-3.5 h-3.5 text-sky-400" />
                                    ) : (
                                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="font-semibold text-white group-hover:text-cyan-300 truncate text-xs">
                                      {s.label}
                                    </div>
                                    {s.sublabel && (
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {s.sublabel}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 shrink-0">
                                  {s.type}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      {/* Quinn AI Assistant Quick Access */}
                      <div className="p-3 bg-gradient-to-r from-blue-950/90 to-cyan-950/90 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-[11px] text-slate-300">
                            Need a personalized curriculum recommendation?
                          </span>
                        </div>

                        <Link
                          to="/chatbot"
                          onClick={() => setIsSearchFocused(false)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0"
                        >
                          <span>Ask Quinn AI</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </form>

                {/* Popular Quick Search Chips + Recent Searches */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mr-0.5">
                    Try:
                  </span>
                  {['What is Microeconomics?', 'Microsoft Excel', 'PowerPoint Presentation', 'Artificial Intelligence', 'Python', 'Hindi'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        if (chip === 'Hindi') {
                          setSelectedLanguage('Hindi');
                          setSearchQuery('');
                          if (searchQuery.trim()) {
                            runLiveYouTubeSearch(searchQuery, { languageOverride: 'Hindi', autoOrganize: true });
                          }
                        } else {
                          setSearchQuery(chip);
                          executeUnifiedDiscoverySearch(chip);
                        }
                      }}
                      className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors text-[10px] whitespace-nowrap cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecentSearches([]);
                      }}
                      className="ml-auto text-[10px] text-slate-400 hover:text-rose-300 cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* LIVE DATABASE COURSE COUNTER STRIP */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                label: 'Total Courses Available',
                value: counters ? counters.totalCoursesAvailable.toLocaleString() : '—',
                accent: 'text-cyan-300',
                onClick: () => clearAllFilters()
              },
              {
                label: 'Professional Programmes',
                value: counters ? counters.paidCourses.toLocaleString() : '—',
                accent: 'text-blue-300',
                onClick: () => {
                  setActiveTab('professional');
                }
              },
              {
                label: 'YouTube Courses',
                value: counters ? counters.youtubeCourses.toLocaleString() : '—',
                accent: 'text-rose-300',
                onClick: () => setActiveTab('youtube')
              },
              {
                label: 'Video Playlists',
                value: counters ? counters.videoPlaylists.toLocaleString() : '—',
                accent: 'text-indigo-300',
                onClick: () => setActiveTab('playlists')
              },
              {
                label: 'Newly Added Courses',
                value: counters ? counters.newlyAddedCourses.toLocaleString() : '—',
                accent: 'text-amber-300',
                onClick: () => {
                  setActiveTab('new');
                  setSortBy('newest');
                }
              }
            ].map((stat) => (
              <button
                key={stat.label}
                type="button"
                onClick={stat.onClick}
                className="p-3.5 rounded-xl bg-slate-900/75 border border-slate-700/80 hover:border-cyan-400/60 text-left transition-colors cursor-pointer"
              >
                <div className={`text-lg sm:text-xl font-extrabold tabular-nums ${stat.accent}`}>
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-0.5 leading-tight">
                  {stat.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* COLLECTION TABS STRIP */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-3 no-scrollbar text-xs font-semibold">
            {[
              { id: 'all', label: 'All Courses' },
              { id: 'corporate_library', label: 'Corporate Library (500)', icon: Briefcase },
              { id: 'youtube', label: 'YouTube Courses', icon: Tv },
              { id: 'playlists', label: 'Video Playlists', icon: ListVideo },
              { id: 'popular', label: 'Popular', icon: Flame },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'new', label: 'Newly Added', icon: Sparkles },
              { id: 'beginner', label: 'Beginner' },
              { id: 'professional', label: 'Professional', icon: Briefcase },
              { id: 'recommended', label: 'Recommended' },
              { id: 'career', label: 'Career Track' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected =
                tab.id === 'corporate_library'
                  ? libraryCollectionFilter === 'corporate_training'
                  : activeTab === tab.id && libraryCollectionFilter === 'all';
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'corporate_library') {
                      setLibraryCollectionFilter('corporate_training');
                      setActiveTab('all');
                    } else {
                      setLibraryCollectionFilter('all');
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA: FILTERS & COURSE GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden lg:block lg:col-span-3 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 text-left sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Filters & Facets</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Education Level Category (A–J) Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123D32] block">
                Education Level (Categories A–J)
              </label>
              <select
                value={selectedEducationLevel}
                onChange={(e) => {
                  const val = e.target.value as 'All' | EducationCategoryCode;
                  setSelectedEducationLevel(val);
                  setSelectedDegreeProgramme('All');
                  runIntelligentDiscovery(searchQuery, { levelOverride: val, degreeOverride: 'All' });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Education Levels (LKG to PhD &amp; Skills)</option>
                {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code}. {cat.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Degree / Class / Programme Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Degree / Class / Programme
              </label>
              <select
                value={selectedDegreeProgramme}
                onChange={(e) => {
                  const deg = e.target.value;
                  setSelectedDegreeProgramme(deg);
                  runIntelligentDiscovery(searchQuery, { degreeOverride: deg });
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Degrees &amp; Classes</option>
                {(selectedEducationLevel !== 'All'
                  ? getAllProgrammesForCategory(selectedEducationLevel)
                  : Array.from(new Set(EDUCATION_CLASSIFICATION_CATEGORIES.flatMap((c) => getAllProgrammesForCategory(c.code))))
                )
                  .slice(0, 80)
                  .map((prog) => (
                    <option key={prog} value={prog}>
                      {prog}
                    </option>
                  ))}
              </select>
            </div>

            {/* Access Type Filter (Free vs Paid) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Course Access Type</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-semibold">
                {(['all', 'free', 'paid'] as const).map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => {
                      setSelectedAccessType(acc);
                      runIntelligentDiscovery(searchQuery, { accessOverride: acc });
                    }}
                    className={`py-1.5 rounded-lg capitalize cursor-pointer transition-colors ${
                      selectedAccessType === acc
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {acc === 'all' ? 'All' : acc === 'free' ? 'Free' : 'Paid'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Dropdown (Dynamic) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block tabular-nums">
                Learning Category ({categoryOptions.length})
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('All');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}{cat.totalCourseCount > 0 ? ` (${cat.totalCourseCount.toLocaleString()})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Subcategory / Topic</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Subcategories</option>
                {Array.from(
                  new Set(
                    (selectedCategory !== 'All'
                      ? categoryOptions.find((c) => c.name === selectedCategory)?.subcategories || []
                      : categoryOptions.flatMap((c) => c.subcategories || [])
                    ).slice(0, 60)
                  )
                ).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Instructor & YouTube Channel Filters */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Instructor Name</label>
              <input
                type="text"
                value={selectedInstructor}
                onChange={(e) => setSelectedInstructor(e.target.value)}
                placeholder="Filter by instructor..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">YouTube Channel</label>
              <input
                type="text"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                placeholder="e.g. MIT, freeCodeCamp..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Course Format Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Course Format</label>
              <select
                value={courseTypeFilter}
                onChange={(e) => setCourseTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                <option value="youtube_video">YouTube Video Courses</option>
                <option value="youtube_playlist">YouTube Video Playlists</option>
                <option value="standard">Structured Curriculum Tracks</option>
              </select>
            </div>

            {/* Granular Content Type Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Content Type</label>
              <select
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Content Types</option>
                {CORPORATE_CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Languages</option>
                {SUPPORTED_COURSE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Category Domain Group */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Domain Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Domains</option>
                <option value="Technology">Technology & Software</option>
                <option value="Creative">Creative Arts & Design</option>
                <option value="Business">Business & Finance</option>
                <option value="Professional">Professional Skills & Career</option>
                <option value="Academic">Academic & K-12</option>
                <option value="STEM">STEM & Robotics</option>
                <option value="Intelligence">Intelligence (IQ/EQ/SQ)</option>
                <option value="Wellbeing">Wellbeing & Rural Skills</option>
              </select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Difficulty Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Duration Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Course Duration</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Durations</option>
                <option value="short">Short (Under 2 Hours)</option>
                <option value="medium">Medium (2 – 10 Hours)</option>
                <option value="long">Comprehensive (10+ Hours)</option>
                <option value="playlist">Full Playlist Series</option>
              </select>
            </div>

            {/* Publication Date Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Publication Date</span>
              </label>
              <select
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Any Time</option>
                <option value="week">Last 7 Days (This Week)</option>
                <option value="month">Last 30 Days (This Month)</option>
                <option value="year">This Year</option>
              </select>
            </div>

            {/* Certificate Eligible Toggle */}
            <label className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-xs font-bold text-slate-800">Certificate Eligible Only</span>
              <input
                type="checkbox"
                checked={certificateOnly}
                onChange={(e) => setCertificateOnly(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </label>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Availability Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Public Courses</option>
                <option value="Published">Published (Enrolment Open)</option>
                <option value="Ready to Publish">Ready to Publish</option>
                <option value="Instructor Assigned">Instructor Assigned</option>
                <option value="Content Development">Content Development</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
              <p>
                OpenFrame Education courses are conducted in association with HopeNest Global Foundation (Section 8 Non-Profit).
              </p>
              <p className="text-slate-400">
                Free public YouTube educational videos play via official YouTube embed players with channel attribution. OpenFrame never charges for watching free public YouTube videos; fees apply solely to OpenFrame certification, mentorship &amp; assessments.
              </p>
            </div>
          </aside>

          {/* MAIN RESULTS SECTION */}
          <section className="lg:col-span-9 space-y-6 text-left">
            {/* Unified Discovery View Switcher & Ask Q&A Bridge */}
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
                {[
                  { id: 'all_results', label: 'All Results' },
                  { id: 'openframe_courses', label: 'OpenFrame Courses' },
                  { id: 'youtube_videos', label: 'YouTube Videos' },
                  { id: 'learning_paths', label: '8-Stage Learning Path' },
                  { id: 'related_skills', label: 'Related Skills' },
                ].map((vt) => (
                  <button
                    key={vt.id}
                    type="button"
                    onClick={() => {
                      setUnifiedViewTab(vt.id as any);
                      if ((vt.id === 'learning_paths' || vt.id === 'related_skills') && !discoveryResult) {
                        runIntelligentDiscovery(searchQuery || (selectedCategory !== 'All' ? selectedCategory : 'Applied Digital & AI Skills'));
                      }
                    }}
                    className={`px-3.5 py-2 rounded-xl whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      unifiedViewTab === vt.id
                        ? 'bg-[#123D32] text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {vt.label}
                  </button>
                ))}
              </div>
              <Link
                to={`/qa${searchQuery.trim().length >= 2 ? `?q=${encodeURIComponent(searchQuery.trim())}` : ''}`}
                className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Ask Concept Q&amp;A</span>
              </Link>
            </div>

            {/* Parsed Educational Intent Banner + Quinn AI Discovery Loading */}
            {discoveryLoading && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center gap-3 text-xs text-slate-700">
                <RefreshCw className="w-4 h-4 animate-spin text-[#2563EB]" />
                <span>Quinn AI is analyzing your educational goal and ranking 7 recommendation categories + 8-stage roadmap...</span>
              </div>
            )}

            {discoveryResult && !discoveryLoading && (
              <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
                      Quinn AI Educational Intent Understanding
                    </div>
                    <h2 className="font-editorial text-lg sm:text-xl font-bold text-[#18221F] mt-0.5">
                      Personalized Recommendations for &ldquo;{discoveryResult.parsedIntent.desiredSkill || discoveryResult.parsedIntent.primarySubject || discoveryResult.parsedIntent.rawQuery}&rdquo;
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUnifiedViewTab('learning_paths')}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    View 8-Stage Learning Roadmap
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[11px] text-slate-500">Education Level</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {discoveryResult.parsedIntent.educationLevelCode
                        ? `${discoveryResult.parsedIntent.educationLevelCode}. ${EDUCATION_CATEGORY_BY_CODE[discoveryResult.parsedIntent.educationLevelCode]?.shortTitle || ''}`
                        : 'General / Multi-Level'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[11px] text-slate-500">Degree / Class</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {discoveryResult.parsedIntent.degreeOrClass || 'Open Programme'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[11px] text-slate-500">Target Skill / Topic</div>
                    <div className="font-bold text-[#123D32] mt-0.5 truncate">
                      {discoveryResult.parsedIntent.desiredSkill || discoveryResult.parsedIntent.primarySubject || 'Core Mastery'}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-200">
                    <div className="text-[11px] text-slate-500">Language &amp; Goal</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {discoveryResult.parsedIntent.preferredLanguage} · {discoveryResult.parsedIntent.careerGoal || 'Skill Growth'}
                    </div>
                  </div>
                </div>

                {/* 7 OpenFrame Recommendation Categories when viewing All Results */}
                {unifiedViewTab === 'all_results' && discoveryResult.recommendationGroups.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {discoveryResult.recommendationGroups
                      .filter((grp) => grp.courses.length > 0)
                      .map((grp) => (
                        <div key={grp.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                            <div>
                              <h3 className="text-sm font-bold text-[#18221F]">{grp.title}</h3>
                              <p className="text-[11px] text-slate-500">{grp.subtitle}</p>
                            </div>
                            <span className="text-[11px] font-semibold text-[#123D32] tabular-nums">
                              {grp.courses.length} matched courses
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {grp.courses.slice(0, 3).map((rec) => (
                              <div
                                key={`${grp.id}-${rec.course.id}`}
                                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 flex flex-col justify-between space-y-2.5"
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2 text-[11px]">
                                    <span className="font-semibold text-blue-700 truncate">{rec.course.category}</span>
                                    <span className="font-bold text-[#123D32] tabular-nums shrink-0">
                                      {rec.course.price > 0 ? `₹${rec.course.price.toLocaleString()}` : 'Free'}
                                    </span>
                                  </div>
                                  <Link
                                    to={`/marketplace/${rec.course.id}`}
                                    className="font-bold text-xs text-slate-900 hover:text-blue-700 line-clamp-2 block"
                                  >
                                    {rec.course.title}
                                  </Link>
                                  <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/70 rounded-lg px-2 py-1 leading-snug">
                                    {rec.whyRecommended}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setEnrollModalCourse(rec.course)}
                                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
                                  >
                                    Enroll Now
                                  </button>
                                  <Link
                                    to={`/marketplace/${rec.course.id}`}
                                    className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                                  >
                                    Syllabus
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* Unified View Tab: 8-Stage Learning Path */}
                {unifiedViewTab === 'learning_paths' && (
                  <LearningRoadmapPanel
                    roadmap={discoveryResult.roadmap}
                    availableCourses={discoveryResult.recommendationGroups.flatMap((g) => g.courses.map((c) => c.course))}
                    onEnrollCourse={(courseObj) => setEnrollModalCourse(courseObj)}
                    onWatchVideo={(vid) => {
                      const vidId = vid.videoId || vid.youtubeId || 'JMUxmLyrhSk';
                      const fallbackThumb = `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
                      const ext: ExtendedYouTubeVideo = {
                        id: vid.videoId || vid.id,
                        videoId: vidId,
                        youtubeId: vidId,
                        title: vid.title,
                        channelTitle: vid.channelTitle,
                        thumbnail: vid.thumbnail || vid.thumbnailUrl || fallbackThumb,
                        thumbnailUrl: vid.thumbnailUrl || vid.thumbnail || fallbackThumb,
                        duration: vid.duration || 'Tutorial',
                        level: vid.level === 'Advanced' ? 'Advanced' : vid.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
                        subjectCategory: discoveryResult.parsedIntent.primarySubject || 'Learning Path',
                        recommendedReason: vid.recommendedReason || 'External YouTube Resource',
                        embedUrl: vid.embedUrl || `https://www.youtube-nocookie.com/embed/${vidId}`,
                        keyTopicsCovered: [discoveryResult.parsedIntent.desiredSkill || 'Topic Mastery'],
                      };
                      setSelectedVideo(ext);
                      setVideoPlaylist([ext]);
                      setIsVideoModalOpen(true);
                    }}
                  />
                )}

                {/* Unified View Tab: Related Skills */}
                {unifiedViewTab === 'related_skills' && (
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
                    <h3 className="text-sm font-bold text-[#18221F]">Complementary &amp; Career-Boosting Skills</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {discoveryResult.relatedSkills.map((sk) => (
                        <div key={sk} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-2.5">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{sk}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              Recommended alongside {discoveryResult.parsedIntent.desiredSkill || discoveryResult.parsedIntent.primarySubject || 'your study track'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(sk);
                                setUnifiedViewTab('all_results');
                                executeUnifiedDiscoverySearch(sk);
                              }}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              Find Courses
                            </button>
                            <Link
                              to={`/qa?q=${encodeURIComponent(`What is ${sk} and how do I get started?`)}`}
                              className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                            >
                              Ask Q&amp;A
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 8: Matched YouTube Resources inside Discovery */}
                {(unifiedViewTab === 'all_results' || unifiedViewTab === 'youtube_videos') &&
                  discoveryResult.youtubeResources.length > 0 && (
                    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                            External YouTube Learning Resources
                          </div>
                          <p className="text-xs text-slate-500">
                            Curated educational lectures played via official YouTube embed with clear creator attribution.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {discoveryResult.youtubeResources.slice(0, 6).map((yt) => {
                          const vidId = yt.videoId || yt.youtubeId || 'JMUxmLyrhSk';
                          const ytThumb = yt.thumbnail || yt.thumbnailUrl || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
                          return (
                            <div
                              key={yt.id || vidId}
                              className="rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden flex flex-col justify-between"
                            >
                              <div>
                                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                  <img
                                    src={ytThumb}
                                    alt={yt.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-semibold">
                                    External YouTube Resource
                                  </span>
                                </div>
                                <div className="p-3 space-y-1">
                                  <div className="text-xs font-bold text-slate-900 line-clamp-2">{yt.title}</div>
                                  <div className="text-[11px] text-slate-600 truncate">{yt.channelTitle}</div>
                                </div>
                              </div>
                              <div className="px-3 pb-3 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const ext: ExtendedYouTubeVideo = {
                                      id: yt.id || `yt-${vidId}`,
                                      videoId: vidId,
                                      youtubeId: vidId,
                                      title: yt.title,
                                      channelTitle: yt.channelTitle,
                                      thumbnail: ytThumb,
                                      thumbnailUrl: ytThumb,
                                      duration: yt.duration || 'Tutorial',
                                      level: 'Beginner',
                                      subjectCategory: discoveryResult.parsedIntent.primarySubject || 'YouTube Resource',
                                      recommendedReason: yt.recommendedReason || 'External YouTube Resource',
                                      embedUrl: yt.embedUrl || `https://www.youtube-nocookie.com/embed/${vidId}`,
                                      keyTopicsCovered: [searchQuery.trim() || yt.title],
                                    };
                                    setSelectedVideo(ext);
                                    setVideoPlaylist([ext]);
                                    setIsVideoModalOpen(true);
                                  }}
                                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Watch Lecture</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleBookmarkCourse(e, `yt-${vidId}`, yt.title, 'External YouTube Resource', vidId)}
                                  className={`p-1.5 rounded-lg border text-[11px] cursor-pointer ${
                                    bookmarkedIds.has(`yt-${vidId}`)
                                      ? 'bg-blue-600 border-blue-600 text-white'
                                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                  }`}
                                  title="Save to Learning Plan"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(`yt-${vidId}`) ? 'fill-current' : ''}`} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Education Classification A–J Quick Strip */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#123D32] uppercase tracking-wider">
                  Education Classification (LKG to PhD &amp; Skills · A–J)
                </span>
                {selectedEducationLevel !== 'All' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEducationLevel('All');
                      setSelectedDegreeProgramme('All');
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    All Levels
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => {
                  const active = selectedEducationLevel === cat.code;
                  return (
                    <button
                      key={cat.code}
                      type="button"
                      onClick={() => {
                        setSelectedEducationLevel(cat.code);
                        setSelectedDegreeProgramme('All');
                        runIntelligentDiscovery(searchQuery, { levelOverride: cat.code, degreeOverride: 'All' });
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#123D32] text-white border-[#123D32]'
                          : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat.code}. {cat.shortTitle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 12 Universal Categories A–L Quick Filter Strip */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  12 Universal Subject Domains (A–L)
                </span>
                {selectedGroup !== 'All' && (
                  <button
                    type="button"
                    onClick={() => setSelectedGroup('All')}
                    className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Show All Groups
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {UNIVERSAL_12_CATEGORIES.map((uc) => {
                  const isActive = selectedGroup === uc.domainGroup && searchQuery.toLowerCase().includes((uc.featuredQueries[0] || '').split(' ')[0].toLowerCase());
                  return (
                    <button
                      key={uc.code}
                      type="button"
                      onClick={() => {
                        const qStr = uc.featuredQueries[0] || uc.name;
                        setSelectedGroup(uc.domainGroup);
                        setSearchQuery(qStr);
                        executeUnifiedDiscoverySearch(qStr, { scroll: false });
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                      }`}
                    >
                      {uc.code}. {uc.name.split(',')[0].split('&')[0].trim()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Microsoft Excel Structured Topic Pills (shown automatically when searching/browsing Excel) */}
            {(searchQuery.toLowerCase().includes('excel') || selectedCategory.toLowerCase().includes('excel')) && (
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 space-y-2">
                <div className="text-xs font-bold text-emerald-900">
                  Microsoft Excel Topic Modules
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {EXCEL_TOPIC_GROUPS.map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setSelectedExcelTopic(grp)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        selectedExcelTopic === grp
                          ? 'bg-emerald-700 text-white'
                          : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Spell-Tolerance Correction Hint Banner */}
            {searchQuery.trim().length >= 2 && normalizeAndExpandQuery(searchQuery).correctionHint && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-blue-900">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{normalizeAndExpandQuery(searchQuery).correctionHint}</span>
              </div>
            )}

            {/* Recommended OpenFrame Courses Strip (Displayed on arrival before intent search takes over) */}
            {!discoveryResult && recommendedQuickCourses.length > 0 && unifiedViewTab !== 'youtube_videos' && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Recommended OpenFrame Courses
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                      Enrollable Catalog Programmes with Guided Syllabi &amp; Certification
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                    {recommendedQuickCourses.length} featured picks
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {recommendedQuickCourses.slice(0, 4).map((rc) => (
                    <div
                      key={rc.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                          <span className="font-semibold text-blue-700 truncate">{rc.category}</span>
                          <span className="font-bold text-slate-900 tabular-nums shrink-0">
                            {rc.price > 0 ? `₹${rc.price.toLocaleString()}` : 'Free'}
                          </span>
                        </div>
                        <Link
                          to={`/marketplace/${rc.id}`}
                          className="font-bold text-xs text-slate-900 hover:text-blue-700 line-clamp-2 block leading-snug"
                        >
                          {rc.title}
                        </Link>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <span>{rc.level}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{rc.duration}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEnrollModalCourse(rc)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Enroll Now
                        </button>
                        <Link
                          to={`/marketplace/${rc.id}`}
                          className="py-1.5 px-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold whitespace-nowrap shrink-0"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Course Organizer Collapsible Studio Panel */}
            <div className="bg-white rounded-2xl border border-indigo-200 shadow-xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-blue-50/70 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    <Brain className="w-4 h-4" />
                    <span>Quinn AI Course Organizer</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    Structure &ldquo;{searchQuery.trim() || activeYouTubeQuery || (selectedCategory !== 'All' ? selectedCategory : 'Any Topic')}&rdquo; into a {aiModuleCount}-Module Course Path
                  </h3>
                  <p className="text-xs text-slate-600">
                    Organize live YouTube tutorials into Beginner, Intermediate, and Advanced modules with direct on-site video playback, exercises, and a mini-quiz.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <div className="inline-flex rounded-xl border border-indigo-200 bg-white p-0.5 text-[11px] font-semibold">
                    {([3, 6, 9] as const).map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => {
                          setAiModuleCount(cnt);
                          if (aiPathData || aiPathOpen || searchQuery.trim().length >= 2) {
                            handleGenerateAiPath(cnt, liveYoutubeResults);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                          aiModuleCount === cnt
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        {cnt} Modules
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiPath()}
                    disabled={aiPathLoading}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>{aiPathLoading ? 'Organizing...' : `Organize Into ${aiModuleCount} Modules`}</span>
                  </button>
                  {aiPathData && (
                    <button
                      type="button"
                      onClick={() => setAiPathOpen((prev) => !prev)}
                      className="p-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                      aria-label="Toggle AI path view"
                    >
                      {aiPathOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {aiPathOpen && (
                <div className="p-5 border-t border-indigo-100 space-y-4">
                  {aiPathLoading ? (
                    <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Quinn AI is organizing live YouTube videos into structured syllabus modules &amp; exercises...</span>
                    </div>
                  ) : aiPathData ? (() => {
                    const combinedVideoPool = [
                      ...liveYoutubeResults,
                      ...(discoveryResult?.youtubeResources || []),
                    ];
                    const findVideoById = (vidId: string) =>
                      combinedVideoPool.find(
                        (v) => v.videoId === vidId || v.youtubeId === vidId || v.id === vidId
                      );
                    const organizedVideos: ExtendedYouTubeVideo[] = [];
                    const seenOrganized = new Set<string>();
                    (aiPathData.modules || []).forEach((mod) => {
                      (mod.videoIds || []).forEach((vidId) => {
                        const raw = findVideoById(vidId);
                        if (raw) {
                          const key = raw.videoId || raw.youtubeId || raw.id;
                          if (key && !seenOrganized.has(key)) {
                            seenOrganized.add(key);
                            organizedVideos.push(mapLiveYoutubeToExtended(raw, aiPathData.topic));
                          }
                        }
                      });
                    });

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-base text-slate-900">{aiPathData.title}</h4>
                            <p className="text-xs text-slate-600 mt-0.5">{aiPathData.overview}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {organizedVideos.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedVideo(organizedVideos[0]);
                                  setVideoPlaylist(organizedVideos);
                                  setIsVideoModalOpen(true);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                                <span>Watch Module Playlist ({organizedVideos.length})</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleSaveAiPath}
                              disabled={savingAiPath}
                              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              {savingAiPath ? 'Saving...' : 'Save Learning Path'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(aiPathData.modules || []).map((mod, mIdx) => {
                            const modVideos = (mod.videoIds || [])
                              .map((vidId) => findVideoById(vidId))
                              .filter(Boolean);

                            return (
                              <div key={mIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                                    <span className="font-bold text-indigo-700 uppercase">
                                      Module {String(mIdx + 1).padStart(2, '0')} · {mod.level}
                                    </span>
                                    <span>#{mod.moduleNumber || mIdx + 1}</span>
                                  </div>
                                  <div className="text-sm font-bold text-slate-900 leading-snug">{mod.title}</div>
                                  <p className="text-xs text-slate-600">{mod.summary}</p>
                                  {Array.isArray(mod.objectives) && mod.objectives.length > 0 && (
                                    <ul className="space-y-1 pt-1 text-[11px] text-slate-700">
                                      {mod.objectives.slice(0, 3).map((obj, oIdx) => (
                                        <li key={oIdx} className="flex items-start gap-1.5">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                          <span>{obj}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {Array.isArray(mod.practiceExercises) && mod.practiceExercises.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                                      <strong className="text-slate-900">Exercise:</strong> {mod.practiceExercises[0]}
                                    </div>
                                  )}
                                </div>

                                {modVideos.length > 0 && (
                                  <div className="pt-2.5 border-t border-slate-200 space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                                      Assigned YouTube Lectures ({modVideos.length})
                                    </div>
                                    {modVideos.map((mv: any) => {
                                      const mvId = mv.videoId || mv.youtubeId || mv.id;
                                      const mvThumb = mv.thumbnail || mv.thumbnailUrl || `https://i.ytimg.com/vi/${mvId}/hqdefault.jpg`;
                                      return (
                                        <div
                                          key={mvId}
                                          className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-slate-200"
                                        >
                                          <img
                                            src={mvThumb}
                                            alt={mv.title}
                                            referrerPolicy="no-referrer"
                                            className="w-16 h-10 rounded object-cover shrink-0 bg-slate-900"
                                          />
                                          <div className="min-w-0 flex-1">
                                            <div className="text-[11px] font-semibold text-slate-900 line-clamp-1">
                                              {mv.title}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">
                                              {mv.channelTitle} · {mv.duration || 'Tutorial'}
                                            </div>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const ext = mapLiveYoutubeToExtended(mv, aiPathData.topic);
                                              setSelectedVideo(ext);
                                              setVideoPlaylist(organizedVideos.length > 0 ? organizedVideos : [ext]);
                                              setIsVideoModalOpen(true);
                                            }}
                                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                                          >
                                            <Play className="w-2.5 h-2.5 fill-current" />
                                            <span>Watch</span>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {aiPathData.modules?.some((m) => Boolean(m.miniQuizQuestion)) && (
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                            <div className="text-xs font-bold text-amber-900">Self-Check Mini-Quiz Questions</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              {aiPathData.modules
                                .filter((m) => m.miniQuizQuestion)
                                .map((m, qi) => (
                                  <div key={qi} className="p-3 rounded-lg bg-white border border-amber-200/80">
                                    <div className="font-semibold text-slate-900">{qi + 1}. {m.miniQuizQuestion!.question}</div>
                                    <div className="text-[11px] text-emerald-700 mt-1">
                                      Answer: {m.miniQuizQuestion!.correctAnswer}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                          {aiPathData.aiDisclaimer || 'AI-generated study path grounded strictly on available topic and video metadata.'}
                        </div>
                      </>
                    );
                  })() : null}
                </div>
              )}
            </div>

            {/* Live YouTube Discovery Section (Official YouTube Data API v3 — initial cached load + explicit search triggers) */}
            {(activeYouTubeQuery || liveYoutubeResults.length > 0 || searchQuery.trim().length >= 3) &&
              (unifiedViewTab === 'all_results' || unifiedViewTab === 'youtube_videos') && (
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider">
                      <Tv className="w-4 h-4" />
                      <span>Live YouTube Educational Resources</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activeYouTubeQuery
                        ? `Matched public tutorials & playlists for "${activeYouTubeQuery}"${selectedLanguage !== 'All' ? ` (${selectedLanguage})` : ''}.`
                        : `Click "Search YouTube Now" or press Enter to fetch live YouTube Data API v3 courses for "${searchQuery.trim()}".`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(searchQuery.trim().length >= 2 || activeYouTubeQuery.trim().length >= 2 || selectedChannel.trim()) && (
                      <button
                        type="button"
                        onClick={() =>
                          runLiveYouTubeSearch(searchQuery.trim() || activeYouTubeQuery, { autoOrganize: true })
                        }
                        disabled={liveYoutubeLoading}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        {liveYoutubeLoading ? 'Searching...' : activeYouTubeQuery ? 'Refresh + Re-Organize' : 'Search YouTube Now'}
                      </button>
                    )}
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={liveYoutubeEnabled}
                        onChange={(e) => setLiveYoutubeEnabled(e.target.checked)}
                        className="accent-blue-600"
                      />
                      <span>Include Live YouTube</span>
                    </label>
                  </div>
                </div>

                {liveYoutubeError && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs text-amber-900">
                    <span>{liveYoutubeError}</span>
                    <button
                      type="button"
                      onClick={() => runLiveYouTubeSearch(activeYouTubeQuery || searchQuery, { autoOrganize: true })}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 cursor-pointer"
                    >
                      Retry YouTube Search
                    </button>
                  </div>
                )}

                {liveYoutubeLoading ? (
                  <div className="text-xs text-slate-500 py-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Searching educational YouTube channels...</span>
                  </div>
                ) : liveYoutubeResults.length === 0 ? (
                  <div className="text-xs text-slate-500 py-2">
                    Showing indexed OpenFrame courses below. Press Enter or click &ldquo;Search YouTube Now&rdquo; to query YouTube Data API v3 directly.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {liveYoutubeResults.map((yt) => {
                        const vidId = yt.videoId || yt.youtubeId;
                        const isPl = Boolean(yt.playlistId || yt.playlistInfo?.playlistId);
                        const isSavedBm = bookmarkedIds.has(`yt-${vidId}`);
                        const formattedViews = formatViews(yt.viewCount);
                        return (
                          <div key={yt.id || vidId} className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden flex flex-col justify-between">
                            <div>
                              <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                <img
                                  src={yt.thumbnail || yt.thumbnailUrl || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`}
                                  alt={yt.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[10px] font-bold">
                                  {isPl ? 'External YouTube Playlist' : 'External YouTube Resource'}
                                </span>
                                {yt.level && (
                                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/85 text-cyan-300 text-[10px] font-semibold">
                                    {yt.level}
                                  </span>
                                )}
                              </div>
                              <div className="p-3.5 space-y-1.5">
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{yt.title}</h4>
                                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                                  {yt.channelThumbnail && (
                                    <img
                                      src={yt.channelThumbnail}
                                      alt={yt.channelTitle}
                                      referrerPolicy="no-referrer"
                                      className="w-4 h-4 rounded-full object-cover shrink-0"
                                    />
                                  )}
                                  <span className="truncate font-medium">{yt.channelTitle}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                                  <span>{formattedViews || yt.duration || 'Educational'}</span>
                                  {yt.publishedAt && <span>{new Date(yt.publishedAt).toLocaleDateString()}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="px-3.5 pb-3.5 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const fullPlaylist = liveYoutubeResults.map((item) =>
                                    mapLiveYoutubeToExtended(item, activeYouTubeQuery || searchQuery.trim())
                                  );
                                  const ext = mapLiveYoutubeToExtended(yt, activeYouTubeQuery || searchQuery.trim());
                                  setSelectedVideo(ext);
                                  setVideoPlaylist(fullPlaylist.length > 0 ? fullPlaylist : [ext]);
                                  setIsVideoModalOpen(true);
                                }}
                                className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Play Lesson</span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleToggleBookmarkCourse(e, `yt-${vidId}`, yt.title, searchQuery.trim() || 'YouTube Lesson', vidId)}
                                className={`p-1.5 rounded-lg border text-[11px] cursor-pointer ${
                                  isSavedBm
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                                }`}
                                title="Add to My Learning"
                              >
                                <Bookmark className={`w-3.5 h-3.5 ${isSavedBm ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {liveYoutubePageToken && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            runLiveYouTubeSearch(activeYouTubeQuery || searchQuery, {
                              pageToken: liveYoutubePageToken,
                              append: true,
                            })
                          }
                          disabled={liveYoutubeLoadingMore}
                          className="px-4 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 cursor-pointer disabled:opacity-50"
                        >
                          {liveYoutubeLoadingMore ? 'Loading More Videos...' : 'Load More YouTube Videos (+6)'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {liveYoutubeNote && (
                  <p className="text-[11px] text-slate-500">{liveYoutubeNote}</p>
                )}
              </div>
            )}

            {/* Top Results Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                <button
                  onClick={() => setIsFilterDrawerOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
                >
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span>Filters</span>
                </button>

                <div className="text-xs text-slate-600 tabular-nums">
                  Showing <strong className="text-slate-900">{courses.length}</strong> of{' '}
                  <strong className="text-blue-600">{totalCourses.toLocaleString()}</strong> matching courses
                  {selectedCategory !== 'All' && <span> in <em>{selectedCategory}</em></span>}
                  {selectedSubcategory !== 'All' && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      <span>{selectedSubcategory}</span>
                      <button onClick={() => setSelectedSubcategory('All')} className="hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="newest">Newest Additions</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Loading Indicator */}
            {isLoading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 space-y-3">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-800">Querying Indexed Course Catalog...</div>
                <div className="text-xs text-slate-500 tabular-nums">
                  Fetching paginated courses across {liveCategoriesLabel} categories...
                </div>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 space-y-4">
                <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No courses match your filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing some filters or searching for topics like &ldquo;AI&rdquo;, &ldquo;Python&rdquo;, or switching to all languages.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              /* Course Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => {
                  const isFav = favoriteIds.has(course.id);
                  const isYt = course.courseType === 'youtube_video' || Boolean(course.youtubeVideoId);
                  const isPlaylist = course.courseType === 'youtube_playlist' || Boolean(course.youtubePlaylistId);
                  const trackLabel =
                    course.price > 0
                      ? `₹${course.price.toLocaleString()}`
                      : 'Free';

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-lg hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Course Image Header */}
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                          <CourseThumbnail
                            src={course.thumbnailUrl || course.imageUrl}
                            alt={course.title}
                            category={course.category}
                            categoryGroup={course.categoryGroup}
                            youtubeVideoId={course.youtubeVideoId}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent" />

                          {/* ID & Status Badge */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[75%]">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/30">
                              {course.id}
                            </span>
                            {getStatusBadge(course.status)}
                            {isPlaylist ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-600 text-white flex items-center gap-1">
                                <ListVideo className="w-2.5 h-2.5" />
                                <span>Playlist</span>
                              </span>
                            ) : isYt ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white flex items-center gap-1">
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>YouTube</span>
                              </span>
                            ) : null}
                          </div>

                          {/* Save Favourite Toggle */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleFavorite(e, course)}
                            disabled={savingFavId === course.id}
                            className={`absolute top-2.5 right-2.5 p-1.5 rounded-full border transition-colors cursor-pointer ${
                              isFav
                                ? 'bg-rose-600 border-rose-400 text-white shadow'
                                : 'bg-slate-900/80 border-slate-600/80 text-slate-200 hover:bg-slate-800 hover:text-rose-300'
                            }`}
                            title={isFav ? 'Remove from favourites' : 'Save to favourites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                          </button>

                          {/* Category & Level bottom strip */}
                          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-cyan-300 font-medium">
                            <span className="truncate">{course.category}</span>
                            <span className="text-slate-200 font-mono shrink-0 ml-2">{course.level}</span>
                          </div>
                        </div>

                        {/* Course Body */}
                        <div className="p-5 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-blue-600 font-semibold uppercase tracking-wider truncate">
                              {course.subcategory}
                            </span>
                            <span className="font-bold shrink-0 text-slate-700 tabular-nums">
                              {trackLabel}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                            {course.title}
                          </h3>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {course.shortDesc}
                          </p>

                          {(course.youtubeChannelName || course.instructorName || course.language) && (
                            <div className="text-[11px] text-slate-500 flex items-center justify-between gap-2 pt-0.5 truncate">
                              <span className="truncate flex items-center gap-1.5">
                                {course.channelThumbnail && (
                                  <img
                                    src={course.channelThumbnail}
                                    alt={course.youtubeChannelName || 'Channel'}
                                    className="w-4 h-4 rounded-full object-cover shrink-0"
                                  />
                                )}
                                {course.youtubeChannelName && course.youtubeChannelUrl ? (
                                  <a
                                    href={course.youtubeChannelUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-rose-700 hover:underline font-medium truncate"
                                  >
                                    {course.youtubeChannelName}
                                  </a>
                                ) : course.youtubeChannelName ? (
                                  <span className="truncate">{course.youtubeChannelName}</span>
                                ) : (
                                  <span className="truncate">{course.instructorName || course.instructor?.name || 'OpenFrame Faculty'}</span>
                                )}
                              </span>
                              <span className="text-slate-400 shrink-0">{course.language || 'English'}</span>
                            </div>
                          )}

                          {/* Meta: Verified Reviews (only if present) + Views/Enrolled + Certificate + Duration */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
                            <div className="flex items-center space-x-2 tabular-nums">
                              {course.hasVerifiedReviews && (course.reviewCount ?? 0) > 0 && (
                                <span className="flex items-center space-x-1">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span className="font-bold text-slate-800">{course.rating}</span>
                                </span>
                              )}
                              {formatViews(course.viewCount) ? (
                                <span className="text-[11px] text-slate-500 flex items-center gap-0.5">
                                  <Eye className="w-3 h-3" />
                                  {formatViews(course.viewCount)}
                                </span>
                              ) : course.enrolledCount > 0 ? (
                                <span className="text-[11px] text-slate-500">{course.enrolledCount} enrolled</span>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                  {course.certificateEligibility ? 'Certificate Track' : 'Open Study'}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center space-x-1.5 text-slate-500 text-[11px] truncate">
                              {course.publishedDate && (
                                <span className="text-slate-400">{course.publishedDate.slice(0, 4)} ·</span>
                              )}
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Course Card Actions */}
                      <div className="p-4 pt-0 border-t border-slate-100 mt-2 space-y-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handlePlayCourseVideo(course)}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer shadow-xs"
                            title="Play Curated Lecture on Site"
                          >
                            <Play className="w-3 h-3 text-sky-400 fill-sky-400" />
                            <span>Play Lesson</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmarkCourse(e, course.id, course.title, course.category, course.youtubeVideoId)}
                            className={`p-1.5 rounded-xl border text-[11px] font-semibold transition-colors cursor-pointer ${
                              bookmarkedIds.has(course.id)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                            title={bookmarkedIds.has(course.id) ? 'Saved in My Learning' : 'Add to My Learning'}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${bookmarkedIds.has(course.id) ? 'fill-white' : ''}`} />
                          </button>

                          <Link
                            to={`/marketplace/${course.id}`}
                            className="flex-1 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1"
                          >
                            <span>Details</span>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                          </Link>

                          {(course.youtubePlaylistUrl || course.youtubeUrl) && (
                            <a
                              href={course.youtubePlaylistUrl || course.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
                              title="Open on YouTube"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setEnrollModalCourse(course)}
                            className="py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold transition-all flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
                          >
                            <GraduationCap className="w-3 h-3 text-cyan-300" />
                            <span>{course.price > 0 ? `Enroll (₹${course.price})` : 'Enroll Free'}</span>
                          </button>

                          <Link
                            to={`/learn/${course.id}`}
                            className="py-1.5 px-2 rounded-xl bg-amber-50 border border-amber-300/80 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition-colors flex items-center justify-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Quinn AI</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PAGINATION & LOAD MORE CONTROLS */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                {currentPage < totalPages && (
                  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <span className="text-xs text-slate-600 tabular-nums">
                      Showing <strong className="text-slate-900">{courses.length.toLocaleString()}</strong> of{' '}
                      <strong className="text-slate-900">{totalCourses.toLocaleString()}</strong> matching courses
                    </span>
                    <button
                      type="button"
                      onClick={handleLoadMoreCourses}
                      disabled={isLoadingMore}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMore ? 'animate-spin' : ''}`} />
                      <span>{isLoadingMore ? 'Loading Next 24...' : 'Load More Courses (+24)'}</span>
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 tabular-nums">
                    Page <strong className="text-slate-800">{currentPage.toLocaleString()}</strong> of{' '}
                    <strong className="text-slate-800">{totalPages.toLocaleString()}</strong> (24 courses per page)
                  </div>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center space-x-1 tabular-nums">
                      {currentPage > 2 && (
                        <button
                          onClick={() => handlePageChange(1)}
                          className="w-8 h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          1
                        </button>
                      )}
                      {currentPage > 3 && <span className="px-1 text-slate-400">...</span>}

                      {currentPage > 1 && (
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="w-8 h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {currentPage - 1}
                        </button>
                      )}

                      <button className="px-2.5 h-8 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs">
                        {currentPage}
                      </button>

                      {currentPage < totalPages && (
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="w-8 h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {currentPage + 1}
                        </button>
                      )}

                      {currentPage < totalPages - 2 && <span className="px-1 text-slate-400">...</span>}
                      {currentPage < totalPages - 1 && (
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="px-2 h-8 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          {totalPages.toLocaleString()}
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-300 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 text-xs font-semibold flex items-center space-x-1 cursor-pointer"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MOBILE FILTERS DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex justify-end">
          <div className="relative bg-white w-full max-w-sm h-full p-6 space-y-5 overflow-y-auto text-left shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Filter Courses</h3>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#123D32] block mb-1">
                  Education Level (Categories A–J)
                </label>
                <select
                  value={selectedEducationLevel}
                  onChange={(e) => {
                    const val = e.target.value as 'All' | EducationCategoryCode;
                    setSelectedEducationLevel(val);
                    setSelectedDegreeProgramme('All');
                    runIntelligentDiscovery(searchQuery, { levelOverride: val, degreeOverride: 'All' });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Education Levels (LKG to PhD &amp; Skills)</option>
                  {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.code}. {cat.shortTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Degree / Class / Programme</label>
                <select
                  value={selectedDegreeProgramme}
                  onChange={(e) => {
                    const deg = e.target.value;
                    setSelectedDegreeProgramme(deg);
                    runIntelligentDiscovery(searchQuery, { degreeOverride: deg });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Degrees &amp; Classes</option>
                  {(selectedEducationLevel !== 'All'
                    ? getAllProgrammesForCategory(selectedEducationLevel)
                    : Array.from(new Set(EDUCATION_CLASSIFICATION_CATEGORIES.flatMap((c) => getAllProgrammesForCategory(c.code))))
                  )
                    .slice(0, 80)
                    .map((prog) => (
                      <option key={prog} value={prog}>{prog}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Access Type</label>
                <select
                  value={selectedAccessType}
                  onChange={(e) => {
                    const acc = e.target.value as 'all' | 'free' | 'paid';
                    setSelectedAccessType(acc);
                    runIntelligentDiscovery(searchQuery, { accessOverride: acc });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="all">All (Free &amp; Paid)</option>
                  <option value="free">Free Courses</option>
                  <option value="paid">Paid Programmes</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Learning Category ({categoryOptions.length})
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedSubcategory('All');
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Categories</option>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}{c.totalCourseCount > 0 ? ` (${c.totalCourseCount.toLocaleString()})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Subcategory / Topic</label>
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Subcategories</option>
                  {Array.from(
                    new Set(
                      (selectedCategory !== 'All'
                        ? categoryOptions.find((c) => c.name === selectedCategory)?.subcategories || []
                        : categoryOptions.flatMap((c) => c.subcategories || [])
                      ).slice(0, 60)
                    )
                  ).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instructor Name</label>
                <input
                  type="text"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  placeholder="Filter by instructor..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">YouTube Channel</label>
                <input
                  type="text"
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  placeholder="Filter by YouTube channel..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Format</label>
                <select
                  value={courseTypeFilter}
                  onChange={(e) => setCourseTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="all">All Formats</option>
                  <option value="youtube_video">YouTube Video Courses</option>
                  <option value="youtube_playlist">YouTube Video Playlists</option>
                  <option value="standard">Structured Curriculum Tracks</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Content Type</label>
                <select
                  value={contentTypeFilter}
                  onChange={(e) => setContentTypeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="all">All Content Types</option>
                  {CORPORATE_CONTENT_TYPES.map((ct) => (
                    <option key={ct} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Languages</option>
                  {SUPPORTED_COURSE_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Domain Group</label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Domains</option>
                  <option value="Technology">Technology & Software</option>
                  <option value="Creative">Creative Arts & Design</option>
                  <option value="Business">Business & Finance</option>
                  <option value="Professional">Professional Skills & Career</option>
                  <option value="Academic">Academic & K-12</option>
                  <option value="STEM">STEM & Robotics</option>
                  <option value="Intelligence">Intelligence (IQ/EQ/SQ)</option>
                  <option value="Wellbeing">Wellbeing & Rural Skills</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Difficulty Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Durations</option>
                  <option value="short">Short (Under 2 Hours)</option>
                  <option value="medium">Medium (2 – 10 Hours)</option>
                  <option value="long">Comprehensive (10+ Hours)</option>
                  <option value="playlist">Full Playlist Series</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publication Date</label>
                <select
                  value={publicationDate}
                  onChange={(e) => setPublicationDate(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="all">Any Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <span className="font-bold text-slate-800">Certificate Eligible Only</span>
                <input
                  type="checkbox"
                  checked={certificateOnly}
                  onChange={(e) => setCertificateOnly(e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
              </label>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Availability Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800"
                >
                  <option value="All">All Public Courses</option>
                  <option value="Published">Published (Enrolment Open)</option>
                  <option value="Ready to Publish">Ready to Publish</option>
                  <option value="Instructor Assigned">Instructor Assigned</option>
                  <option value="Content Development">Content Development</option>
                  <option value="Planned">Planned</option>
                </select>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  onClick={clearAllFilters}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 font-semibold text-slate-700"
                >
                  Reset
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 font-bold text-white shadow-xs"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSE ENROLLMENT & PAYMENT CHECKOUT MODAL */}
      <CourseEnrollmentModal
        isOpen={Boolean(enrollModalCourse)}
        onClose={() => setEnrollModalCourse(null)}
        course={enrollModalCourse}
        onEnrolled={() => {
          setEnrollModalCourse(null);
          showToast('Course enrollment confirmed!');
        }}
      />

      {/* STUDENT REGISTRATION POP-UP MODAL (Admissions fallback) */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle={regModalData.title}
        courseId={regModalData.id}
        courseCategory={regModalData.category}
      />

      {/* "PLAY ON MY SITE" YOUTUBE VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        playlist={videoPlaylist}
        onSelectVideo={(vid) => setSelectedVideo(vid)}
        onApplyForCourse={(title, cat) => {
          setIsVideoModalOpen(false);
          handleOpenApply(title, 'VIDEO-SELECT', cat);
        }}
      />
    </div>
  );
};
