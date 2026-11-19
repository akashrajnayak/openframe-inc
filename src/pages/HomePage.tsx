import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  ArrowRight,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  BookOpen,
  Users,
  Sparkles,
  Award,
  Play,
  Bot,
  Search,
  Globe,
  Compass,
  Video,
  School,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { doc, onSnapshot, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, submitGeneralEnquiryToFirestore } from '../services/firebase';
import { storageService } from '../services/storageService';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { HomepageSchoolSection } from '../components/school/HomepageSchoolSection';
import { useAuth } from '../context/AuthContext';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';
import { marketplaceService } from '../services/marketplaceService';
import { initialBlogPosts } from '../data/initialData';
import { MarketplaceAutocompleteSuggestion, MarketplaceCourse } from '../types';
import { compute90PercentCoursePricing, formatInr } from '../utils/pricingEngine';
import {
  PDF_HERO_EXAMPLE_QUERIES,
  POPULAR_SEARCH_TOPICS,
  SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES,
  getRecentSearches,
  saveRecentSearch,
  normalizeAndExpandQuery,
} from '../utils/searchIntelligence';
import { EDUCATION_CLASSIFICATION_CATEGORIES } from '../data/educationClassificationData';

import heroDeskImg from '../assets/images/hero_editorial_desk_1794913769362.jpg';
import quinnWorkspaceImg from '../assets/images/quinn_ai_workspace_1794913771452.jpg';
import communityEditorialImg from '../assets/images/community_learning_editorial_1794913770856.jpg';

const FEATURED_FILTERS = [
  { id: 'all', label: 'All Programmes', categoryGroup: undefined },
  { id: 'tech', label: 'Technology & AI', categoryGroup: 'Technology' },
  { id: 'business', label: 'Business & Finance', categoryGroup: 'Business' },
  { id: 'academics', label: 'School & Academics', categoryGroup: 'Academics' },
  { id: 'skills', label: 'Languages & Career', categoryGroup: 'Life Skills' },
];

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();

  // Pop-up modal states
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);
  const [liveCourseCount, setLiveCourseCount] = useState<number | null>(null);

  // Featured Learning Programmes (Real marketplace data)
  const [featuredFilter, setFeaturedFilter] = useState<string>('all');
  const [featuredCourses, setFeaturedCourses] = useState<MarketplaceCourse[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState<boolean>(true);

  // Live Announcements for Community section (real Firestore fallback to curated blog)
  const [liveAnnouncements, setLiveAnnouncements] = useState<Array<{ id: string; title: string; summary: string; date: string; path: string }>>([]);

  // Universal Hero Search Bar state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroLanguage, setHeroLanguage] = useState('Auto-Detect Language');
  const [heroSuggestions, setHeroSuggestions] = useState<MarketplaceAutocompleteSuggestion[]>([]);
  const [heroSearchFocused, setHeroSearchFocused] = useState(false);
  const [heroRecentSearches] = useState<string[]>(() => getRecentSearches());

  useEffect(() => {
    const q = heroSearchQuery.trim();
    if (q.length < 2) {
      setHeroSuggestions([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await marketplaceService.autocompleteSearch(q);
        if (!cancelled) setHeroSuggestions(res.slice(0, 7));
      } catch {
        if (!cancelled) setHeroSuggestions([]);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [heroSearchQuery]);

  // Fetch real featured courses from marketplaceService
  useEffect(() => {
    let active = true;
    setLoadingFeatured(true);
    const selectedTab = FEATURED_FILTERS.find((f) => f.id === featuredFilter);
    marketplaceService
      .filterCourses({
        page: 1,
        pageSize: 6,
        sortBy: 'popular',
        categoryGroup: selectedTab?.categoryGroup,
      })
      .then((res) => {
        if (active) {
          setFeaturedCourses(res.courses || []);
          setLoadingFeatured(false);
        }
      })
      .catch(() => {
        if (active) setLoadingFeatured(false);
      });
    return () => {
      active = false;
    };
  }, [featuredFilter]);

  // Fetch real live announcements (falling back cleanly to published editorial blog posts)
  useEffect(() => {
    let active = true;
    getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3)))
      .then((snap) => {
        if (!active) return;
        const docs = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((item) => item.title);
        if (docs.length > 0) {
          setLiveAnnouncements(
            docs.map((item) => ({
              id: item.id,
              title: item.title,
              summary: item.message || item.description || 'Platform update from OpenFrame Education.',
              date: item.createdAt ? String(item.createdAt).slice(0, 10) : 'Recent',
              path: '/marketplace',
            }))
          );
        } else {
          setLiveAnnouncements(
            initialBlogPosts.slice(0, 3).map((post) => ({
              id: post.id,
              title: post.title,
              summary: post.excerpt,
              date: post.publishedDate,
              path: '/blog',
            }))
          );
        }
      })
      .catch(() => {
        if (!active) return;
        setLiveAnnouncements(
          initialBlogPosts.slice(0, 3).map((post) => ({
            id: post.id,
            title: post.title,
            summary: post.excerpt,
            date: post.publishedDate,
            path: '/blog',
          }))
        );
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const refreshCounter = () => {
      marketplaceService
        .getLiveMarketplaceCounters(true)
        .then((stats) => {
          if (active && typeof stats?.totalCoursesAvailable === 'number') {
            setLiveCourseCount(stats.totalCoursesAvailable);
          }
        })
        .catch(() => {});
    };

    refreshCounter();

    const unsubStats = onSnapshot(
      doc(db, 'marketplace_stats', 'global'),
      () => refreshCounter(),
      () => {}
    );

    return () => {
      active = false;
      unsubStats();
    };
  }, []);

  const [selectedEduCode, setSelectedEduCode] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J'>('G');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQ = heroSearchQuery.trim();
    if (cleanQ) saveRecentSearch(cleanQ);
    const params = new URLSearchParams();
    if (cleanQ) params.set('q', cleanQ);
    if (heroLanguage && heroLanguage !== 'Auto-Detect Language') {
      params.set('lang', heroLanguage.replace(/\s*\(.*\)$/, ''));
    }
    setHeroSearchFocused(false);
    navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`);
  };

  // Consultation quick capture state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: 'Education' as const,
    subject: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    storageService.saveInquiry({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      division: formData.division,
      subject: formData.subject || 'Consultation Request via Homepage',
      message: formData.message,
    });

    submitGeneralEnquiryToFirestore({
      fullName: formData.name,
      emailAddress: formData.email,
      mobileNumber: formData.phone || '—',
      city: 'Online Intake',
      state: 'India',
      enquiryCategory: formData.division,
      subject: formData.subject || 'Consultation Request via Homepage',
      message: formData.message,
      consentAccepted: true,
      submittedAt: new Date().toISOString(),
      status: 'New',
    }).catch(() => {});

    setFormSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      division: 'Education',
      subject: '',
      message: '',
    });
  };

  const servicesList = [
    {
      title: 'Online Video Courses',
      desc: 'Structured lectures in technology, academics, communication, and finance curated in 11+ languages.',
      icon: Video,
      path: '/marketplace',
      actionLabel: 'Explore Library',
    },
    {
      title: 'Structured Learning Pathways',
      desc: 'Guided 8-stage mastery track from video lessons and verification quizzes to capstone defense.',
      icon: Compass,
      path: '/education',
      actionLabel: 'View Pathways',
    },
    {
      title: 'Live Classes & Workshops',
      desc: 'Interactive faculty sessions, practical problem-solving labs, and peer project reviews.',
      icon: Users,
      path: '/school',
      actionLabel: 'Explore Cohorts',
    },
    {
      title: 'Certification Programmes',
      desc: 'Rubric-evaluated, QR-verifiable digital certificates backed by authentic assessment.',
      icon: Award,
      path: '/verify-certificate',
      actionLabel: 'Verify Credentials',
    },
    {
      title: 'School & College Partnerships',
      desc: 'Complete campus portal for LKG–12 schools, IQ/EQ/SQ diagnostics, attendance, and fee records.',
      icon: School,
      path: '/partner/school',
      actionLabel: 'Partner With Us',
    },
  ];

  const howSteps = [
    {
      num: '01',
      title: 'Choose Your Goal',
      desc: 'Select school foundations, career upskilling, or certification tracks tailored to your aspirations.',
      icon: Compass,
    },
    {
      num: '02',
      title: 'Discover Courses',
      desc: 'Search across thousands of curated video lessons and multilingual playlists with Quinn AI.',
      icon: Search,
    },
    {
      num: '03',
      title: 'Learn Step-by-Step',
      desc: 'Watch lectures on-site, take verification quizzes, and complete guided practical projects.',
      icon: BookOpen,
    },
    {
      num: '04',
      title: 'Track Progress',
      desc: 'Follow visual mastery analytics, earn faculty feedback, and unlock verified credentials.',
      icon: TrendingUp,
    },
  ];

  const audienceCards = [
    {
      title: 'Students',
      desc: 'Interactive video courses, AI mentorship, school syllabus mastery, and verified certificates.',
      icon: GraduationCap,
      accent: 'bg-[#2563EB]',
      path: '/portal/student',
      cta: 'Student Portal',
    },
    {
      title: 'Teachers',
      desc: 'Manage classes, grade projects on transparent rubrics, and configure custom quizzes.',
      icon: BookOpen,
      accent: 'bg-[#123D32]',
      path: '/portal/teacher',
      cta: 'Teacher Portal',
    },
    {
      title: 'Parents',
      desc: 'Clear visibility into daily study activity, assessment scores, attendance, and fee receipts.',
      icon: Users,
      accent: 'bg-teal-700',
      path: '/portal/parent',
      cta: 'Parent Portal',
    },
    {
      title: 'Schools & Institutions',
      desc: 'Dedicated multi-tenant campus portal for LKG–12 classrooms, teachers, and accreditation.',
      icon: School,
      accent: 'bg-[#14213D]',
      path: '/partner/school',
      cta: 'School Portal',
    },
    {
      title: 'NGO & Impact Partners',
      desc: 'Collaborate on digital literacy drives, HopeNest outreach, volunteer tracking, and learners.',
      icon: HeartHandshake,
      accent: 'bg-emerald-700',
      path: '/portal/ngo',
      cta: 'NGO Portal',
    },
    {
      title: 'Working Professionals',
      desc: 'Accelerate leadership, AI, Excel, and engineering readiness without pausing your career.',
      icon: Briefcase,
      accent: 'bg-indigo-700',
      path: '/portal/professional',
      cta: 'Professional Portal',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#18221F] flex flex-col">
      {/* ========================================================= */}
      {/* B. HERO SECTION + SMART AI SEARCH ENGINE                  */}
      {/* ========================================================= */}
      <section className="relative bg-[#FAF7F2] pt-10 sm:pt-14 pb-28 sm:pb-36 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Headline, Dual CTAs & Smart AI Course Search */}
            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                OpenFrame Education · Technology &amp; Learning Ecosystem
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-editorial font-semibold text-[#18221F] leading-[1.08] tracking-tight text-balance">
                Education That Opens{' '}
                <span className="italic text-[#123D32]">Every Possibility.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-xl text-pretty">
                Discover structured video courses, guided skill tracks, AI tutoring, and institutional learning — thoughtfully crafted for students, teachers, parents, schools, and lifelong learners.
              </p>

              {/* Smart AI Course Search Bar (Preserved & Styled in Light Editorial Craft) */}
              <div className="relative pt-1">
                <form
                  onSubmit={handleHeroSearchSubmit}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white border border-slate-200 rounded-2xl p-2 shadow-lg shadow-slate-900/5"
                >
                  <div className="flex items-center gap-2.5 flex-1 px-3 py-1.5">
                    <Search className="w-4 h-4 text-[#123D32] shrink-0" />
                    <input
                      type="text"
                      value={heroSearchQuery}
                      onChange={(e) => setHeroSearchQuery(e.target.value)}
                      onFocus={() => setHeroSearchFocused(true)}
                      onBlur={() => setTimeout(() => setHeroSearchFocused(false), 180)}
                      placeholder="What do you want to learn today?"
                      aria-label="Universal AI Course Search"
                      className="w-full bg-transparent text-sm text-[#18221F] placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F2] rounded-xl sm:w-44">
                    <Globe className="w-3.5 h-3.5 text-[#123D32] shrink-0" />
                    <select
                      value={heroLanguage}
                      onChange={(e) => setHeroLanguage(e.target.value)}
                      aria-label="Preferred learning language"
                      className="w-full bg-transparent text-xs font-medium text-[#18221F] focus:outline-none cursor-pointer"
                    >
                      {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.label}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Autocomplete Dropdown */}
                {heroSearchFocused && (heroSuggestions.length > 0 || heroSearchQuery.trim().length < 2) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {heroSearchQuery.trim().length >= 2 && normalizeAndExpandQuery(heroSearchQuery).correctionHint && (
                      <div className="px-4 py-2 bg-[#FAF7F2] text-[11px] text-[#123D32] font-medium">
                        {normalizeAndExpandQuery(heroSearchQuery).correctionHint}
                      </div>
                    )}

                    {heroSuggestions.length > 0 ? (
                      heroSuggestions.map((item, idx) => (
                        <button
                          key={`${item.type}-${item.label}-${idx}`}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setHeroSearchFocused(false);
                            if (item.type === 'course' && item.id) {
                              navigate(`/marketplace/${item.id}`);
                            } else {
                              const qp = new URLSearchParams();
                              qp.set('q', item.label);
                              if (heroLanguage !== 'Auto-Detect Language') {
                                qp.set('lang', heroLanguage.replace(/\s*\(.*\)$/, ''));
                              }
                              navigate(`/marketplace?${qp.toString()}`);
                            }
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#FAF7F2] flex items-center justify-between gap-2 text-xs text-[#18221F] cursor-pointer"
                        >
                          <span className="font-medium truncate">{item.label}</span>
                          <span className="text-[10px] uppercase tracking-wider text-[#2563EB] font-semibold shrink-0">
                            {item.type}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 space-y-3">
                        {heroRecentSearches.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                              Recently Searched
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {heroRecentSearches.slice(0, 5).map((rs) => (
                                <button
                                  key={rs}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setHeroSearchFocused(false);
                                    navigate(`/marketplace?q=${encodeURIComponent(rs)}`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#F5F5F2] hover:bg-slate-200 text-[11px] text-[#18221F] cursor-pointer"
                                >
                                  {rs}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#123D32]">
                            Popular Learning Topics
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {POPULAR_SEARCH_TOPICS.slice(0, 6).map((topic) => (
                              <button
                                key={topic}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setHeroSearchFocused(false);
                                  navigate(`/marketplace?q=${encodeURIComponent(topic)}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#123D32] hover:text-white border border-slate-200 text-[11px] text-[#18221F] transition-colors cursor-pointer"
                              >
                                {topic}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Quick clickable topic shortcuts */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-[#64748B]">
                  <span className="font-semibold text-[#18221F] mr-1">Try:</span>
                  {PDF_HERO_EXAMPLE_QUERIES.slice(0, 6).map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => navigate(`/marketplace?q=${encodeURIComponent(topic)}`)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#123D32] hover:text-white border border-slate-200 text-[#18221F] transition-colors cursor-pointer"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  to="/marketplace"
                  className="px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <span className="tabular-nums">
                    {liveCourseCount !== null
                      ? `Explore ${liveCourseCount.toLocaleString()}+ Courses`
                      : 'Explore Courses'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/portal"
                  className="px-6 py-3.5 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap"
                >
                  <span>Login / Get Started</span>
                </Link>

                {!currentUser && (
                  <GoogleSignInButton
                    role="student"
                    label="Continue with Google"
                    variant="light"
                    className="!w-auto px-5 py-3.5"
                    onSuccess={() => navigate('/portal/student')}
                  />
                )}

                <button
                  type="button"
                  onClick={() => navigate(heroSearchQuery.trim() ? `/qa?q=${encodeURIComponent(heroSearchQuery.trim())}` : '/qa')}
                  className="px-4 py-3.5 rounded-xl bg-white hover:bg-[#F5F5F2] border border-slate-300 text-[#123D32] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ask Quinn Q&amp;A
                </button>

                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(true)}
                  className="px-4 py-3.5 rounded-xl bg-white hover:bg-[#F5F5F2] border border-slate-300 text-[#18221F] text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                >
                  Apply for Admission
                </button>
              </div>
            </div>

            {/* Right Column: Large Framed Editorial Hero Photograph */}
            <div className="lg:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-200/80 bg-white">
                <img
                  src={heroDeskImg}
                  alt="Warm sunlit study desk with laptop displaying OpenFrame learning interface"
                  className="w-full h-[360px] sm:h-[440px] object-cover"
                />
                <div className="bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                  <div>
                    <div className="text-xs font-semibold text-[#123D32] uppercase tracking-wider">
                      Unified Learning Platform
                    </div>
                    <div className="text-sm font-semibold text-[#18221F]">
                      12 Universal Categories · 8 Dedicated Portals
                    </div>
                  </div>
                  <Link
                    to="/chatbot"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-blue-800 whitespace-nowrap"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Ask Quinn AI Mentor</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FLOATING 3-PILLAR STRIP (Reference Design Overlap Card)   */}
      {/* ========================================================= */}
      <div className="relative -mt-16 sm:-mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/school"
            className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-[#123D32] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-[#FAF7F2] text-[#123D32] flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#18221F] group-hover:text-[#123D32]">
                School &amp; Academic Foundations
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Complete LKG to Class 12 learning across CBSE, ICSE, and State boards with interactive notes, virtual labs, and multilingual study guides.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#123D32]">
              <span>Explore School Hub</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/marketplace"
            className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-[#2563EB] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#18221F] group-hover:text-[#2563EB]">
                Career, AI &amp; Skill Tracks
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Curated video courses across AI, Excel, Coding, Graphic Design, Finance, and Communication with structured verification quizzes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2563EB]">
              <span>Browse Marketplace</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/it-solutions"
            className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-[#14213D] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#14213D] flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-bold text-lg text-[#18221F] group-hover:text-[#14213D]">
                Enterprise Software &amp; Platforms
              </h2>
              <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                Custom enterprise engineering, CoreERP, EduLMS campus management systems, and verifiable QR certificate infrastructure.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#14213D]">
              <span>Enterprise Capabilities</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* C. SERVICES SECTION (5 Core Educational Offerings)        */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
              Platform Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] leading-tight">
              Everything You Need to Learn, Grow and Succeed.
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
              Five integrated pillars designed to transform curiosity into verified practical capability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {servicesList.map((svc) => {
              const Icon = svc.icon;
              return (
                <Link
                  key={svc.title}
                  to={svc.path}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#123D32] hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
                >
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F2] text-[#123D32] group-hover:bg-[#123D32] group-hover:text-white flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-[#18221F]">
                        {svc.title}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
                    <span>{svc.actionLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* C2. COMPLETE EDUCATION CLASSIFICATION (LKG TO PHD & SKILLS) */}
      {/* ========================================================= */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                Universal Education Taxonomy · Categories A–J
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F]">
                From Early Childhood (LKG) to Doctoral Research &amp; Career Skills
              </h2>
              <p className="text-sm text-[#64748B]">
                Select any qualification, degree programme, school grade, or skill track for instant personalized recommendations.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1 whitespace-nowrap"
            >
              <span>Open Intelligent Discovery Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
            {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => {
              const active = selectedEduCode === cat.code;
              return (
                <button
                  key={cat.code}
                  type="button"
                  onClick={() => setSelectedEduCode(cat.code)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? 'bg-[#123D32] text-white border-[#123D32] shadow-sm'
                      : 'bg-[#FAF7F2] text-[#18221F] border-slate-200 hover:border-[#123D32]'
                  }`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-emerald-200' : 'text-[#123D32]'}`}>
                    Cat {cat.code}
                  </div>
                  <div className="text-xs font-semibold mt-0.5 line-clamp-2">{cat.shortTitle}</div>
                </button>
              );
            })}
          </div>

          {(() => {
            const activeCat = EDUCATION_CLASSIFICATION_CATEGORIES.find((c) => c.code === selectedEduCode) || EDUCATION_CLASSIFICATION_CATEGORIES[0];
            return (
              <div className="bg-[#FAF7F2] border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#18221F]">
                      Category {activeCat.code}: {activeCat.title}
                    </h3>
                    <p className="text-sm text-[#64748B] mt-1">{activeCat.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/marketplace?level=${activeCat.code}`)}
                    className="px-5 py-2.5 bg-[#2563EB] text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Explore All {activeCat.shortTitle}
                  </button>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Supported Programmes, Classes &amp; Degrees
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {activeCat.programmes.slice(0, 24).map((prog) => (
                      <button
                        key={prog}
                        type="button"
                        onClick={() => navigate(`/marketplace?level=${activeCat.code}&degree=${encodeURIComponent(prog)}&q=${encodeURIComponent(prog)}`)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:border-[#123D32] hover:text-[#123D32] rounded-lg text-xs font-medium text-[#18221F] transition-colors cursor-pointer"
                      >
                        {prog}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ========================================================= */}
      {/* D. FEATURED LEARNING PROGRAMMES (Live Marketplace Data)   */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#F5F5F2] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                Curated Course Marketplace
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F]">
                Featured Learning Programmes
              </h2>
              <p className="text-sm text-[#64748B]">
                Real programmes loaded from the OpenFrame catalog with structured syllabi, YouTube video playlists, and assessment tracks.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FEATURED_FILTERS.map((tab) => {
                const isSelected = featuredFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFeaturedFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#123D32] text-white'
                        : 'bg-white text-[#18221F] border border-slate-200 hover:border-[#123D32]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl h-80 border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    <Link to={`/marketplace/${course.id}`} className="block relative aspect-video bg-slate-100 overflow-hidden">
                      <CourseThumbnail
                        src={course.thumbnailUrl || course.imageUrl}
                        alt={course.title}
                        category={course.category}
                        categoryGroup={course.categoryGroup}
                        youtubeVideoId={course.youtubeVideoId}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </Link>
                    <div className="p-6 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#123D32]">
                        <span className="truncate">{course.category}</span>
                        <span className="text-[#64748B] shrink-0">{course.level}</span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-[#18221F] line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                        <Link to={`/marketplace/${course.id}`}>{course.title}</Link>
                      </h3>
                      <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                        {course.shortDesc}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-[#FAF7F2]/60 border-t border-slate-100 flex items-center justify-between text-xs">
                    {(() => {
                      const p = compute90PercentCoursePricing({
                        category: course.category,
                        title: course.title,
                        level: course.level,
                        educationLevels: course.educationLevels,
                        existingPrice: course.price,
                      });
                      return (
                        <div className="font-semibold text-[#18221F] tabular-nums flex flex-wrap items-center gap-x-1.5">
                          <span>{formatInr(p.finalPriceInr)}</span>
                          <span className="text-[11px] text-slate-400 line-through font-normal">
                            {formatInr(p.marketBenchmarkPriceInr)}
                          </span>
                          <span className="text-[10px] font-bold text-[#123D32]">90% Off</span>
                          <span className="text-[#64748B] font-normal">· {course.duration}</span>
                        </div>
                      );
                    })()}
                    <Link
                      to={`/marketplace/${course.id}`}
                      className="font-semibold text-[#2563EB] hover:text-blue-800 flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>View Course</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => {
                const all = youtubeVideoService.getAllLibrary();
                setSelectedVideo(all[0] || null);
                setVideoPlaylist(all);
                setIsVideoModalOpen(true);
              }}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#123D32] hover:underline cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Featured YouTube Educational Lectures On-Site</span>
            </button>

            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#14213D] hover:bg-slate-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>Browse Full Course Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* E. HOW OPENFRAME WORKS (4 Connected Step Architecture)     */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
              Simple Guided Progression
            </div>
            <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F]">
              How OpenFrame Works
            </h2>
            <p className="text-sm text-[#64748B]">
              A calm, verifiable workflow guiding every learner from first search to recognized certification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 relative flex flex-col justify-between gap-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-[#123D32] text-white flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-editorial text-2xl font-semibold text-slate-300 tabular-nums">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-[#18221F]">
                      {step.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {idx < howSteps.length - 1 && (
                    <div className="hidden lg:flex items-center text-xs font-semibold text-[#123D32]">
                      <span>Next step →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* F. QUINN AI INTERACTIVE SHOWCASE                          */}
      {/* ========================================================= */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                Quinn AI Personal Tutor
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] leading-tight">
                Meet Quinn AI, Your Intelligent Learning Companion.
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Ask concept questions, get step-by-step Excel formulas, review code, prepare for school or technical exams, and build structured weekly study guides in over 11 languages.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-[#18221F]">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#123D32] shrink-0 mt-0.5" />
                  <span>Interactive topic breakdowns across school, technical, and business subjects</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#123D32] shrink-0 mt-0.5" />
                  <span>Direct mock quizzes and study plans synced with your learning track</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#123D32] shrink-0 mt-0.5" />
                  <span>Always ready across web and mobile inside every course workspace</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/chatbot"
                  className="px-6 py-3.5 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start Chatting With Quinn AI</span>
                </Link>
                <Link
                  to="/verify-certificate"
                  className="px-5 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F5F2] border border-slate-200 text-[#18221F] text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <ShieldCheck className="w-4 h-4 text-[#123D32]" />
                  <span>Verify Certificate</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-[#FAF7F2]">
                <img
                  src={quinnWorkspaceImg}
                  alt="Quinn AI personal mentor laptop workspace"
                  className="w-full h-[340px] sm:h-[420px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SCHOOL EDUCATION SYSTEM (LKG – CLASS 12)                  */}
      {/* ========================================================= */}
      <HomepageSchoolSection />

      {/* ========================================================= */}
      {/* G. BUILT FOR EVERYONE (6 Audience Cards)                  */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                8 Dedicated Portals
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F]">
                Built for Every Role in Education
              </h2>
              <p className="text-sm text-[#64748B]">
                Whether you learn at home, mentor students in class, manage a school campus, or run community outreach.
              </p>
            </div>
            <Link
              to="/portal"
              className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>View All 8 Portals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audienceCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.path}
                  className="bg-white rounded-2xl p-6 border border-slate-200/80 hover:border-[#2563EB] hover:shadow-lg transition-all flex flex-col justify-between gap-5 group"
                >
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-2xl ${card.accent} text-white flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[#18221F] group-hover:text-[#2563EB] transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#18221F] group-hover:text-[#2563EB]">
                    <span>{card.cta}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* H. COMMUNITY & COLLABORATION SECTION                      */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#F5F5F2] border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6">
              <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-white">
                <img
                  src={communityEditorialImg}
                  alt="Learners, faculty, and mentors collaborating around a sunlit studio table"
                  className="w-full h-[340px] sm:h-[400px] object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                OpenFrame Learning Community
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] leading-tight">
                Learning Is Better Together
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Follow live platform announcements, attend community workshops, explore faculty articles, and collaborate across HopeNest literacy programmes.
              </p>

              {/* Live announcements / blog feed */}
              <div className="space-y-3">
                {liveAnnouncements.map((item) => (
                  <Link
                    key={item.id}
                    to={item.path}
                    className="block bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#123D32] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-[#64748B] mb-1">
                      <span className="font-semibold text-[#123D32]">Platform Dispatch</span>
                      <span className="tabular-nums">{item.date}</span>
                    </div>
                    <div className="font-heading font-bold text-sm text-[#18221F] line-clamp-1">
                      {item.title}
                    </div>
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">{item.summary}</p>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/blog"
                  className="px-5 py-3 rounded-xl bg-[#14213D] hover:bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <span>Read Community Insights</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/hopenest"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-[#FAF7F2] border border-slate-300 text-[#18221F] text-xs font-semibold inline-flex items-center gap-2 whitespace-nowrap"
                >
                  <HeartHandshake className="w-4 h-4 text-[#123D32]" />
                  <span>HopeNest Foundation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* I. ABOUT OPENFRAME + CONSULTATION FORM (Reference Layout) */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* About OpenFrame Copy */}
            <div className="lg:col-span-5 space-y-6">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                About OpenFrame
              </div>
              <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] leading-tight">
                Building Opportunities Through Education and Technology
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                OpenFrame IT Solutions Private Limited (headquartered in Bengaluru, India) combines enterprise software engineering with practical, accessible digital learning — partnering alongside schools, universities, working professionals, and the legally independent HopeNest Global Foundation.
              </p>

              <div className="space-y-3 pt-1 text-xs text-[#18221F]">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="font-bold text-sm text-[#18221F]">Transparent Academic Standards</div>
                  <p className="text-[#64748B] mt-1">
                    Every certificate requires mandatory video completion, 15-question assessment verification, project submission, and educator evaluation.
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80">
                  <div className="font-bold text-sm text-[#18221F]">Independent Enterprise &amp; Non-Profit Alliance</div>
                  <p className="text-[#64748B] mt-1">
                    Custom software platforms, EduLMS campus enablement, and structured outreach across India.
                  </p>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap gap-4 text-xs font-semibold">
                <Link to="/about-us" className="text-[#2563EB] hover:underline inline-flex items-center gap-1">
                  <span>Corporate Overview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link to="/careers" className="text-[#123D32] hover:underline inline-flex items-center gap-1">
                  <span>Careers at OpenFrame</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Navy Inquiry Box (Reference Layout Bottom-Right Card) */}
            <div className="lg:col-span-7 bg-[#14213D] rounded-3xl p-8 sm:p-10 text-white shadow-2xl">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-300">
                Institutional &amp; Learner Support
              </div>
              <h3 className="text-2xl sm:text-3xl font-editorial font-semibold text-white mt-1.5">
                Schedule Your Consultation
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
                Connect with our education advisors, institutional partnership team, or software architects.
              </p>

              {formSubmitted ? (
                <div className="mt-6 p-6 rounded-2xl bg-white/10 border border-white/15 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto" />
                  <h4 className="font-heading font-bold text-lg text-white">Consultation Request Logged</h4>
                  <p className="text-xs text-slate-200 max-w-md mx-auto">
                    Thank you for contacting OpenFrame Education. Your inquiry has been saved to our institutional team for review.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs font-semibold text-blue-300 underline cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="mt-6 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Rao"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                        Area of Interest
                      </label>
                      <select
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value as any })}
                        className="w-full bg-[#0f1a30] border border-white/15 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-blue-400"
                      >
                        <option value="Education">OpenFrame Education &amp; Courses</option>
                        <option value="Partnerships">School / NGO Partnership</option>
                        <option value="IT Solutions">Enterprise IT &amp; Software</option>
                        <option value="Products">Digital Products (CoreERP / EduLMS)</option>
                        <option value="General">General Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Message / Requirements *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your learning goal, school onboarding request, or project scope..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/10 border border-white/15 rounded-xl p-3.5 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-5 rounded-xl bg-[#2563EB] hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Send Consultation Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* J. FINAL DARK GREEN CALL-TO-ACTION BAND                   */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#123D32] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
            Begin Today
          </div>
          <h2 className="text-3xl sm:text-5xl font-editorial font-semibold text-white leading-tight">
            Your Next Chapter Starts Here.
          </h2>
          <p className="text-sm sm:text-base text-emerald-100/80 max-w-xl mx-auto leading-relaxed">
            Join thousands of students, educators, parents, schools, and professionals building real capabilities on OpenFrame.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            {!currentUser && (
              <GoogleSignInButton
                role="student"
                label="Continue with Google"
                variant="light"
                className="!w-auto px-6 py-3.5 shadow-lg"
                onSuccess={() => navigate('/portal/student')}
              />
            )}
            <Link
              to="/portal?mode=register"
              className="px-7 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-500 text-white text-sm font-semibold shadow-lg transition-colors whitespace-nowrap"
            >
              Join OpenFrame
            </Link>
            <Link
              to="/marketplace"
              className="px-7 py-3.5 rounded-xl bg-white/12 hover:bg-white/20 border border-white/25 text-white text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* STUDENT REGISTRATION POP-UP MODAL */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle="OpenFrame Student Programme Admissions 2026–27"
        courseId="OF-ADMIT-HOME"
        courseCategory="Admissions"
      />

      {/* ON-SITE YOUTUBE VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        playlist={videoPlaylist}
        onSelectVideo={(vid) => setSelectedVideo(vid)}
        onApplyForCourse={() => {
          setIsVideoModalOpen(false);
          setIsRegModalOpen(true);
        }}
      />
    </div>
  );
};
