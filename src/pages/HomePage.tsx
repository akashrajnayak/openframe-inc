import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  ArrowRight,
  Code2,
  GraduationCap,
  Layers,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Server,
  Database,
  Cloud,
  Cpu,
  Smartphone,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  BookOpen,
  Users,
  Sparkles,
  Award,
  Play,
  Tv,
  Video,
  PhoneCall,
  Bot,
  Brain,
  Search,
  Globe
} from 'lucide-react';
import {
  initialSolutions,
  initialEducationPrograms,
  initialProducts,
  initialBlogPosts,
  initialCareerOpenings,
  initialLocations,
} from '../data/initialData';
import { storageService } from '../services/storageService';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, submitGeneralEnquiryToFirestore } from '../services/firebase';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';
import { marketplaceService } from '../services/marketplaceService';
import { HomepageSchoolSection } from '../components/school/HomepageSchoolSection';
import { MarketplaceAutocompleteSuggestion } from '../types';
import {
  PDF_HERO_EXAMPLE_QUERIES,
  SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES,
  UNIVERSAL_12_CATEGORIES,
} from '../utils/searchIntelligence';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();

  // Pop-up modal states
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);
  const [liveCourseCount, setLiveCourseCount] = useState<number | null>(null);

  // Universal Hero Search Bar state
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [heroLanguage, setHeroLanguage] = useState('Auto-Detect Language');
  const [heroSuggestions, setHeroSuggestions] = useState<MarketplaceAutocompleteSuggestion[]>([]);
  const [heroSearchFocused, setHeroSearchFocused] = useState(false);

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

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearchQuery.trim()) params.set('q', heroSearchQuery.trim());
    if (heroLanguage && heroLanguage !== 'Auto-Detect Language') {
      params.set('lang', heroLanguage.replace(/\s*\(.*\)$/, ''));
    }
    setHeroSearchFocused(false);
    navigate(`/marketplace${params.toString() ? `?${params.toString()}` : ''}`);
  };

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
      () => {
        refreshCounter();
      },
      (err) => {
        console.warn('Marketplace stats listener fallback:', err);
      }
    );

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshCounter();
      }
    };
    window.addEventListener('focus', refreshCounter);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      active = false;
      unsubStats();
      window.removeEventListener('focus', refreshCounter);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);

  // Consultation quick capture state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    division: 'IT Solutions' as const,
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
      status: 'New'
    }).catch(() => {});

    setFormSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      division: 'IT Solutions',
      subject: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ========================================================= */}
      {/* 1. HERO SECTION                                           */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white pt-16 pb-28 sm:pb-36 overflow-hidden">
        {/* Subtle geometric grid backdrop */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38BDF8 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Ambient light glow behind headline */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/40 text-sky-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              Technology | Education | Innovation
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.15] text-balance">
              Empowering Businesses.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-200 to-indigo-300">
                Transforming Education.
              </span>{' '}
              Building a Digital Future.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed text-pretty">
              OpenFrame IT Solutions Private Limited delivers technology-driven solutions, software development, digital platforms, education and skill development initiatives.
            </p>

            {/* Universal AI Course Search Bar */}
            <div className="max-w-3xl mx-auto pt-2 relative text-left">
              <form
                onSubmit={handleHeroSearchSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white/10 backdrop-blur-md border border-blue-400/35 rounded-2xl p-2 shadow-2xl shadow-black/30"
              >
                <div className="flex items-center gap-2.5 flex-1 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-white/10">
                  <Search className="w-4 h-4 text-sky-400 shrink-0" />
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    onFocus={() => setHeroSearchFocused(true)}
                    onBlur={() => setTimeout(() => setHeroSearchFocused(false), 180)}
                    placeholder="What do you want to learn today?"
                    aria-label="Universal AI Course Search"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-950/60 rounded-xl border border-white/10 sm:w-52">
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  <select
                    value={heroLanguage}
                    onChange={(e) => setHeroLanguage(e.target.value)}
                    aria-label="Preferred learning language"
                    className="w-full bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.label} className="bg-slate-900 text-white">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <span>Search Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {heroSearchFocused && heroSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-800">
                  {heroSuggestions.map((item, idx) => (
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
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-800 flex items-center justify-between gap-2 text-xs text-slate-200 cursor-pointer"
                    >
                      <span className="font-medium truncate">{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wider text-sky-400 shrink-0">
                        {item.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {PDF_HERO_EXAMPLE_QUERIES.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => {
                      const qp = new URLSearchParams({ q: topic });
                      if (heroLanguage !== 'Auto-Detect Language') {
                        qp.set('lang', heroLanguage.replace(/\s*\(.*\)$/, ''));
                      }
                      navigate(`/marketplace?${qp.toString()}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-sky-500/25 border border-white/15 hover:border-sky-400/50 text-[11px] font-medium text-slate-200 transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Prominent Primary Call-To-Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 max-w-3xl mx-auto">
              <Link
                to="/marketplace"
                className="w-full sm:w-auto px-7 py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group text-center"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="tabular-nums">
                  {liveCourseCount !== null
                    ? `Explore ${liveCourseCount.toLocaleString()} Courses & AI LMS`
                    : 'Explore Course Marketplace & AI LMS'}
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/it-solutions"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-[#0F2042] hover:bg-[#152a55] border border-blue-500/40 hover:border-sky-400/60 shadow-lg shadow-black/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-center"
              >
                <Cpu className="w-5 h-5 text-sky-400" />
                <span>Enterprise IT Solutions</span>
              </Link>

              <Link
                to="/chatbot"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/40 shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2 text-center"
              >
                <Bot className="w-5 h-5 text-cyan-200" />
                <span>Chat with Quinn AI</span>
              </Link>

              <Link
                to="/contact"
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm sm:text-base font-semibold text-slate-200 bg-white/10 hover:bg-white/20 border border-white/20 hover:text-white backdrop-blur-md transition-all flex items-center justify-center gap-2 text-center"
              >
                <Phone className="w-4 h-4 text-sky-300" />
                <span>Get in Touch</span>
              </Link>
            </div>

            {/* Quick Interactive Portal Access Buttons */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Direct Access:</span>

              <button
                onClick={() => setIsRegModalOpen(true)}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-cyan-200" />
                <span>Apply for Admission (Pop-up)</span>
              </button>

              <button
                onClick={() => {
                  const all = youtubeVideoService.getAllLibrary();
                  setSelectedVideo(all[0] || null);
                  setVideoPlaylist(all);
                  setIsVideoModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-600 hover:from-blue-600 hover:to-sky-500 border border-sky-400/30 shadow-md shadow-blue-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-sky-200 text-sky-200" />
                <span>Play YouTube Lectures On Site</span>
              </button>
              
              <Link
                to="/school"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 border border-indigo-400/50 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <BookOpen className="w-3.5 h-3.5 text-sky-200" />
                <span>School Education (LKG–12)</span>
              </Link>

              <Link
                to="/chatbot"
                className="px-3 py-1.5 rounded-full text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quinn AI Chatbot</span>
              </Link>

              <Link
                to="/learn/OF-AI-001"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-sky-300 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 hover:border-sky-400/80 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3 h-3 fill-current text-sky-400" />
                <span>Quinn AI Course Learning</span>
              </Link>

              <Link
                to="/animation-course"
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-200 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-400/50 hover:border-cyan-400 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-300" />
                <span>Swift UI Animations &amp; Charts (ZIP)</span>
              </Link>

              <Link
                to="/student/dashboard"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 hover:border-emerald-400/80 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Student Portal (8 Stages)</span>
              </Link>

              <Link
                to="/teacher/dashboard"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 hover:border-indigo-400/80 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Teacher Evaluation Portal</span>
              </Link>

              <Link
                to="/verify-certificate/OF-CERT-2026-8812"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 hover:border-amber-400/80 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Verify Certificate</span>
              </Link>

              <Link
                to="/work-with-us"
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Work With Us</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* OVERLAPPING PILLARS STRIP (Inspired by Reference Design)   */}
      {/* ========================================================= */}
      <div className="relative -mt-16 sm:-mt-20 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-blue-300 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Enterprise IT & Software
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Custom software engineering, cloud architecture, resilient data pipelines, and scalable web and mobile business platforms.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">6 Core Practice Areas</span>
              <Link to="/it-solutions" className="text-xs font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                <span>Discover</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-sky-300 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Education & Skill Training
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Professional software fellowships, cloud engineering bootcamps, and institutional tech laboratory curriculum enablement.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">Industry-Aligned Pedagogy</span>
              <Link to="/education" className="text-xs font-semibold text-sky-600 group-hover:text-sky-700 flex items-center gap-1">
                <span>Programs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl shadow-slate-900/5 border border-slate-200/80 hover:border-indigo-300 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              Proprietary Digital Products
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Modular enterprise suites including OpenFrame CoreERP, EduLMS academic portal, CloudPulse monitor, and CollabFlow dispatch.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500">4 Enterprise Platforms</span>
              <Link to="/products" className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1">
                <span>View Suites</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* UNIVERSAL 12 CATEGORIES (A-L) & AI DISCOVERY SECTIONS    */}
      {/* ========================================================= */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* 1. 12 Popular Universal Categories Grid (A-L) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Universal AI Course Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
                12 Popular Learning Categories (A–L)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Explore structured video lectures, verification quizzes, and guided practical projects across technology, academics, finance, languages, and vocational tracks.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 shrink-0"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {UNIVERSAL_12_CATEGORIES.map((cat) => (
              <Link
                key={cat.code}
                to={`/marketplace?group=${encodeURIComponent(cat.domainGroup)}&q=${encodeURIComponent(cat.featuredQueries[0] || '')}`}
                className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      Track {cat.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">{cat.domainGroup}</span>
                  </div>
                  <h3 className="font-heading font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{cat.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                  <span>Explore {cat.featuredQueries[0]}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 2. Curated YouTube Educational Video Showcase */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">On-Site Video Learning</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
                Curated Educational YouTube Lectures
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Watch public educational lectures directly on OpenFrame with channel attribution, structured study notes, and companion quizzes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const all = youtubeVideoService.getAllLibrary();
                setSelectedVideo(all[0] || null);
                setVideoPlaylist(all);
                setIsVideoModalOpen(true);
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Open Video Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {youtubeVideoService.getAllLibrary().slice(0, 4).map((vid) => (
              <button
                key={vid.id}
                type="button"
                onClick={() => {
                  const all = youtubeVideoService.getAllLibrary();
                  setSelectedVideo(vid);
                  setVideoPlaylist(all);
                  setIsVideoModalOpen(true);
                }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={vid.thumbnailUrl || vid.thumbnail}
                    alt={vid.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-blue-700 flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-semibold">
                    {vid.duration}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-blue-600">{vid.subjectCategory}</div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-700">
                      {vid.title}
                    </h3>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                    Channel: {vid.channelTitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Quinn AI Personal Tutor & Certificate Verification Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#071326] to-[#11274E] text-white rounded-2xl p-6 sm:p-8 border border-blue-800/60 flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Bot className="w-4 h-4" />
                <span>Quinn AI Personal Learning Mentor</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                Multilingual Tutoring, Excel Formula Help &amp; Interview Prep
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Get step-by-step concept breakdowns, practice mock tests, study plans, and lesson revision summaries across 11+ Indian &amp; global languages.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/chatbot"
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Bot className="w-4 h-4" />
                <span>Launch Quinn AI Tutor</span>
              </Link>
              <Link
                to="/student/dashboard"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4 text-sky-300" />
                <span>Student 8-Stage Portal</span>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between space-y-5">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Verifiable Credentials &amp; Rubric Defense</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
                6-Condition Verification &amp; QR Certificate Registry
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Every OpenFrame certificate requires video completion, passing scores on a 15-question verification quiz, capstone submission, presentation defense, and faculty rubric evaluation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/verify-certificate/OF-CERT-2026-8812"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Verify Certificate ID</span>
              </Link>
              <Link
                to="/student/register"
                className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5"
              >
                <span>7-Step Student Admission</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SCHOOL EDUCATION (LKG – CLASS 12)                         */}
      {/* ========================================================= */}
      <HomepageSchoolSection />

      {/* ========================================================= */}
      {/* 2. ABOUT OPENFRAME                                        */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Corporate Profile
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-slate-900 leading-tight">
              About OpenFrame IT Solutions
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              OpenFrame IT Solutions Private Limited is an Indian technology and education enterprise headquartered in Bengaluru. We operate with a dual focus: architecting mission-critical digital systems for commercial enterprises, and empowering students and working professionals with industry-aligned technological proficiencies.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our engineering philosophy emphasizes architectural integrity, maintainable code standards, and transparent delivery. Rather than generic abstractions, we provide direct, accountable technical capability across enterprise software, cloud infrastructure, and practical skill enablement.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-lg bg-slate-100/80 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Focus</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Enterprise Tech Solutions</div>
                <div className="text-xs text-slate-600 mt-1">Custom software, cloud, and modern mobile/web platforms.</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-100/80 border border-slate-200">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Educational Focus</div>
                <div className="text-sm font-bold text-slate-900 mt-1">Skill & Tech Education</div>
                <div className="text-xs text-slate-600 mt-1">Hands-on fellowships, campus labs, and corporate upskilling.</div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/about-us"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Read Full Corporate Overview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Visual Showcase Box */}
          <div className="bg-[#0B1930] rounded-2xl p-8 text-white relative shadow-2xl border border-blue-900/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-6 border-b border-blue-900/60">
              <div>
                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Corporate Identity</span>
                <h4 className="text-lg font-heading font-bold text-white mt-0.5">OpenFrame IT Solutions Pvt Ltd</h4>
              </div>
              <div className="px-2.5 py-1 rounded bg-blue-900/60 border border-blue-700/50 text-[11px] text-sky-300 font-medium">
                Active Organization
              </div>
            </div>

            <div className="py-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Technology-First Architecture</div>
                  <div className="text-xs text-slate-400 mt-0.5">Engineered using clean design patterns, defensive programming, and rigorous data modeling.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Practical Education Model</div>
                  <div className="text-xs text-slate-400 mt-0.5">Moving beyond rote theory with live sandbox laboratories and actual software engineering workflows.</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-white">Independent Social Collaboration</div>
                  <div className="text-xs text-slate-400 mt-0.5">Independent technical advisory collaboration with HopeNest Global Foundation (distinct legal entity).</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Incorporated in India</span>
              <span>CIN Registration Placeholder</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. OUR BUSINESS DIVISIONS                                 */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Structure</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Our Core Business Divisions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Structured operational units delivering focused value across software engineering, digital products, education, and social ecosystem collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                1. IT & Software Solutions
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Enterprise software architecture, cloud orchestration, web and mobile platform engineering, data pipelines, and technical advisory.
              </p>
              <Link to="/it-solutions" className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>View Capabilities</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                2. OpenFrame Education
              </h3>
              <p className="text-[11px] font-semibold text-blue-600 mt-0.5">
                "Learn Today. Build Tomorrow."
              </p>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Academic tutoring, technology & programming, STEM education, creative skills, and professional certification programmes for K-12 to graduates.
              </p>
              <Link to="/education" className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <span>Explore 7 Programme Categories</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                3. Digital Products & Platforms
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Proprietary platforms including Life Smart Card, StudyNotePro, LearnXcel, TalentHub, and LinkX digital networking.
              </p>
              <Link to="/products" className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>Explore Products Catalogue</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                4. HopeNest Collaboration
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Independent collaboration with HopeNest Global Foundation (an autonomous non-profit) for digital literacy and education access.
              </p>
              <Link to="/hopenest" className="mt-4 text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                <span>Foundation Details</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. IT & SOFTWARE SOLUTIONS HIGHLIGHTS                     */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Engineering</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              IT & Software Solutions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              From enterprise platforms to high-availability cloud systems, we build software designed for long-term maintainability and operational resilience.
            </p>
          </div>
          <Link
            to="/it-solutions"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start md:self-auto"
          >
            <span>View All 6 Solutions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {initialSolutions.slice(0, 3).map((sol) => (
            <div
              key={sol.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="p-6">
                <div className="text-xs text-blue-600 font-semibold tracking-wide uppercase mb-1">
                  Enterprise Capability
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  {sol.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {sol.shortDesc}
                </p>

                <div className="mt-4 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Core Modules:
                  </div>
                  {sol.capabilities.slice(0, 3).map((cap, i) => (
                    <div key={i} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">Production Architecture</span>
                <Link
                  to="/it-solutions"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Learn More</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. OPENFRAME EDUCATION                                    */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#0A192F] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Pedagogy</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white mt-1">
              OpenFrame Education & Skill Development
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Bridging the gap between conventional computer science theory and production software engineering through practical labs, real code reviews, and industry tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialEducationPrograms.slice(0, 2).map((prog) => (
              <div
                key={prog.id}
                className="bg-[#0F2042] rounded-xl p-6 border border-blue-800/50 hover:border-sky-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-sky-300 mb-2">
                    <span className="font-semibold">{prog.level}</span>
                    <span className="text-slate-400">{prog.duration}</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white">
                    {prog.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {prog.summary}
                  </p>

                  <div className="mt-4 pt-4 border-t border-blue-900/60 space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Highlights:
                    </div>
                    {prog.highlights.slice(0, 3).map((hl, i) => (
                      <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-900/60 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{prog.format}</span>
                  <Link
                    to="/education"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                  >
                    View Curriculum
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/animation-course"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <Layers className="w-4 h-4 text-cyan-200" />
              <span>Swift UI Animations, Graphs &amp; Charts (ZIP + Lab)</span>
            </Link>
            <Link
              to="/education"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300"
            >
              <span>Explore all academic partnerships &amp; specialized programs</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. OUR DIGITAL PRODUCTS                                   */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Product Portfolio</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
            Our Proprietary Digital Platforms
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Engineered internally by OpenFrame for operational excellence, enterprise resource management, and academic assessment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {initialProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {prod.status}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-lg text-slate-900 mt-3">
                  {prod.name}
                </h3>
                <div className="text-xs font-medium text-slate-500 mt-0.5">
                  {prod.tagline}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Modular Web Suite</span>
                <Link
                  to="/products"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. HOPENEST GLOBAL FOUNDATION (CRITICAL SEPARATION RULE)  */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-100 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-semibold uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                <span>Legally Distinct Non-Profit Entity</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                HopeNest Global Foundation
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                HopeNest Global Foundation is an autonomous, independent non-profit organization established to foster digital literacy, youth empowerment, and equal education opportunities for underprivileged communities.
              </p>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Independent Collaboration Notice:</strong>
                OpenFrame IT Solutions Private Limited and HopeNest Global Foundation maintain strict separate legal identities and autonomous governing boards. OpenFrame provides independent technology advisory and curriculum contributions to HopeNest initiatives under structured non-profit collaboration agreements.
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foundation Focus</div>
              <div className="text-base font-bold text-slate-900">Digital Access & Literacy</div>
              <p className="text-xs text-slate-600">
                Community learning centers, foundational digital literacy workshops, and educational enablement.
              </p>
              <Link
                to="/hopenest"
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <span>Learn About HopeNest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. HOW WE WORK (Inspired by Process Flow in Uploaded Image)*/}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Execution</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              How We Work
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We apply an engineering-led engagement cycle designed for predictability, transparent milestones, and zero architectural ambiguity.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                  01
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">Initial Consultation & Requirements</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Comprehensive scoping of technical requirements, architectural constraints, and institutional objectives.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-200">
                  02
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">Strategic Architecture & System Blueprint</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Authoring data schemas, system blueprints, interface prototypes, and milestone timelines.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-200">
                  03
                </div>
                <div>
                  <h4 className="font-heading font-bold text-slate-900 text-sm">Disciplined Execution & Delivery</h4>
                  <p className="text-xs text-slate-600 mt-0.5">Sprint-driven development, automated code verification, deployment, and ongoing technical support.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consultation Capture Card (Direct Design Reference Match) */}
          <div className="lg:col-span-7 bg-[#0B1930] rounded-2xl p-8 sm:p-10 text-white shadow-2xl border border-blue-900/60">
            <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Inquiry</span>
            <h3 className="text-2xl font-heading font-bold text-white mt-1">
              Schedule Your Consultation
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Connect directly with our engineering or educational advisory team to discuss your project.
            </p>

            {formSubmitted ? (
              <div className="mt-6 p-6 rounded-xl bg-blue-900/40 border border-blue-500/40 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-sky-400 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-white">Inquiry Received</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Thank you for reaching out to OpenFrame IT Solutions Private Limited. Your consultation details have been logged in our system. Our team will review and respond shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setFormSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-sky-300 underline"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#071326] border border-blue-900 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Corporate / Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#071326] border border-blue-900 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#071326] border border-blue-900 rounded-lg px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Division of Interest
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value as any })}
                      className="w-full bg-[#071326] border border-blue-900 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="IT Solutions">IT & Software Solutions</option>
                      <option value="Education">OpenFrame Education</option>
                      <option value="Products">Digital Products (CoreERP / EduLMS)</option>
                      <option value="Partnerships">Institutional / Corporate Partnership</option>
                      <option value="General">General Corporate Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Project Scope / Requirements Summary *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Briefly describe your software specifications, educational lab requirements, or consultation timeline..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#071326] border border-blue-900 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wide uppercase transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <span>Request Official Consultation</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. LATEST BLOG ARTICLES                                   */}
      {/* ========================================================= */}
      <section className="py-16 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Thought Leadership</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
                Latest Insights & Articles
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Technical perspectives, architectural patterns, and pedagogical reflections from our engineering and education teams.
              </p>
            </div>
            <Link
              to="/blog"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start md:self-auto"
            >
              <span>Explore All Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialBlogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-blue-600">{post.category}</span>
                    <span>·</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                    <Link to="/blog" className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{post.publishedDate}</span>
                  <Link
                    to="/blog"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Read Article</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. CAREER OPPORTUNITIES                                  */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B1930] to-[#0D234A] rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-blue-900/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Join Our Organization</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                Build The Future of Technology & Education
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                We are actively looking for disciplined software engineers, cloud architects, curriculum leads, and operational coordinators to join our centers in Bengaluru, Hyderabad, and Pune.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {initialCareerOpenings.map((job) => (
                  <span
                    key={job.id}
                    className="text-xs bg-blue-900/60 border border-blue-700/40 text-slate-300 px-3 py-1 rounded-md"
                  >
                    {job.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 text-left lg:text-right">
              <Link
                to="/careers"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-blue-600/40 transition-all"
              >
                <span>Explore Careers & Apply</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 11. WORK WITH US (PARTNERSHIPS)                           */}
      {/* ========================================================= */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Collaborate</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Work With Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Flexible partnership models tailored for enterprise clients, universities, independent mentors, and technology vendors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
              <Briefcase className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-heading font-bold text-sm text-slate-900">Enterprise Clients</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Contractual software engineering, dedicated development squads, and enterprise infrastructure modernization.
              </p>
              <Link to="/work-with-us" className="mt-3 block text-xs font-semibold text-blue-600 hover:text-blue-800">
                Partner with us →
              </Link>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
              <BookOpen className="w-6 h-6 text-sky-600 mb-3" />
              <h3 className="font-heading font-bold text-sm text-slate-900">Academic Institutions</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Campus software labs, curriculum modernization, faculty enablement, and student hackathon mentorship.
              </p>
              <Link to="/work-with-us" className="mt-3 block text-xs font-semibold text-sky-600 hover:text-sky-800">
                Institutional Tie-ups →
              </Link>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
              <Users className="w-6 h-6 text-indigo-600 mb-3" />
              <h3 className="font-heading font-bold text-sm text-slate-900">Technical Mentors</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Industry practitioners conducting expert masterclasses, project code reviews, and capstone evaluations.
              </p>
              <Link to="/work-with-us" className="mt-3 block text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Join Faculty Network →
              </Link>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
              <ShieldCheck className="w-6 h-6 text-teal-600 mb-3" />
              <h3 className="font-heading font-bold text-sm text-slate-900">Technology Partners</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Cloud providers, tool vendors, and open ecosystem collaborators building joint integrations.
              </p>
              <Link to="/work-with-us" className="mt-3 block text-xs font-semibold text-teal-600 hover:text-teal-800">
                Ecosystem Inquiry →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 12. CONTACT INFORMATION & PAN-INDIA LOCATIONS             */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Offices</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Contact Information & Locations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Visit our corporate headquarters in Bengaluru or connect with our regional development and education hubs in Hyderabad and Pune.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialLocations.map((loc) => (
              <div
                key={loc.id}
                className={`bg-white rounded-xl p-6 border ${
                  loc.isHeadquarters ? 'border-blue-400 shadow-md ring-1 ring-blue-400/20' : 'border-slate-200'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                    {loc.city}, {loc.state}
                  </span>
                  {loc.isHeadquarters && (
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Corporate HQ
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-slate-900 text-base">
                  {loc.name}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {loc.address}, PIN: {loc.pincode}
                </p>

                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{loc.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{loc.email}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/contact"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <span>Contact Corporate Office</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0B1930] hover:bg-[#071326] text-white text-xs font-semibold tracking-wide uppercase transition-colors"
            >
              <span>Go to Full Corporate Contact Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
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

      {/* "PLAY ON MY SITE" YOUTUBE VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        playlist={videoPlaylist}
        onSelectVideo={(vid) => setSelectedVideo(vid)}
        onApplyForCourse={(title, cat) => {
          setIsVideoModalOpen(false);
          setIsRegModalOpen(true);
        }}
      />
    </div>
  );
};
