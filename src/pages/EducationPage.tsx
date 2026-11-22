import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  GraduationCap,
  BookOpen,
  Code2,
  Brain,
  Palette,
  Briefcase,
  TrendingUp,
  Cpu,
  Search,
  CheckCircle2,
  ArrowRight,
  School,
  Laptop,
  Users,
  Award,
  Calendar,
  Clock,
  Sparkles,
  Layers,
  FileCheck,
  Video,
  FileText,
  Compass,
  X,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  Check,
  Building,
  UserCheck,
  Download,
  Share2,
  Eye,
  PhoneCall,
  Mail,
  Zap,
  HeartHandshake,
  Heart,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Play,
  Tv
} from 'lucide-react';
import {
  EDUCATION_CATEGORIES_33,
  OFFICIAL_PRICING_PLANS,
  OFFICIAL_BROCHURES,
  PROGRAMME_HIGHLIGHTS,
  EducationCategoryItem,
  OfficialBrochureItem,
  PricingPlanItem
} from '../data/educationData';
import { storageService } from '../services/storageService';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { CourseEnrollmentModal } from '../components/common/CourseEnrollmentModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';
import { MarketplaceCourse } from '../types';

export const EducationPage: React.FC = () => {
  const router = useRouter();

  // Search & Filters for Course Catalogue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Pricing Tab Toggle: 'tuition' (2026-27 Pricing Brochure) vs 'subscriptions' (Corporate Brochure Page 28 & 29)
  const [pricingTab, setPricingTab] = useState<'tuition' | 'subscriptions'>('tuition');

  // Modal States
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<EducationCategoryItem | null>(null);
  const [selectedBrochureForViewer, setSelectedBrochureForViewer] = useState<OfficialBrochureItem | null>(null);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [enquiryCourseName, setEnquiryCourseName] = useState('');

  // Admission, Paid Razorpay Enrollment & YouTube Video Pop-up Modal States
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regCourseTitle, setRegCourseTitle] = useState('OpenFrame Education Academic Programme');
  const [enrollModalCourse, setEnrollModalCourse] = useState<MarketplaceCourse | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);

  const openRazorpayEnrollmentForEducationItem = (item: EducationCategoryItem) => {
    const feeMatch = String(item.officialFee || '').replace(/,/g, '').match(/\d+/);
    const parsedPrice = feeMatch ? Math.max(50, Number(feeMatch[0])) : 300;
    const courseObj: MarketplaceCourse = {
      id: `OF-EDU-${item.id}`,
      title: item.name,
      category: item.group || 'Education',
      categoryGroup: 'Education',
      level: item.level || 'Beginner',
      duration: 'Self-Paced',
      price: parsedPrice,
      marketBenchmarkPrice: parsedPrice * 10,
      discountPercent: 90,
      isFree: false,
      language: 'English',
      description: item.fullDesc || item.shortDesc,
      skillsAcquired: item.modules?.slice(0, 4) || [item.group],
      status: 'Published',
    };
    setSelectedCourseForModal(null);
    setEnrollModalCourse(courseObj);
  };

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Enquiry Form state
  const [enquiryForm, setEnquiryForm] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    studentClass: 'Class 6th – 8th',
    interestedProgramme: '',
    message: ''
  });
  const [enquirySubmitted, setEnquirySubmitted] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShareBrochure = async (brochure: OfficialBrochureItem) => {
    const fullUrl = `${window.location.origin}${brochure.pdfUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: brochure.title,
          text: brochure.subtitle,
          url: fullUrl
        });
        showToast('Brochure link shared successfully!');
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(fullUrl);
    showToast(`Copied download link for "${brochure.title}" to clipboard!`);
  };

  const handleOpenEnquiry = (courseName?: string) => {
    setEnquiryCourseName(courseName || 'OpenFrame Education Programmes');
    setEnquiryForm(prev => ({
      ...prev,
      interestedProgramme: courseName || 'Academic Tuition (2026–27)'
    }));
    setEnquirySubmitted(false);
    setIsEnquiryModalOpen(true);
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.fullName || !enquiryForm.mobileNumber) return;

    // Save to storageService general enquiries
    storageService.saveGeneralEnquiry({
      fullName: enquiryForm.fullName,
      emailAddress: enquiryForm.emailAddress || 'not-provided@openframe.in',
      mobileNumber: enquiryForm.mobileNumber,
      enquiryCategory: 'Education & Courses',
      subject: `Course Enquiry: ${enquiryForm.interestedProgramme}`,
      message: `[Grade/Class: ${enquiryForm.studentClass}] ${enquiryForm.message || 'Interested in enrolling in this programme.'}`,
      city: 'Website Enquiry',
      state: 'Karnataka',
      consentAccepted: true,
      status: 'New'
    });

    setEnquirySubmitted(true);
  };

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return EDUCATION_CATEGORIES_33.filter((course) => {
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = course.name.toLowerCase().includes(q);
        const matchesDesc = course.shortDesc.toLowerCase().includes(q) || course.fullDesc.toLowerCase().includes(q);
        const matchesModules = course.modules.some(m => m.toLowerCase().includes(q));
        const matchesBadge = course.badge.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesModules && !matchesBadge) {
          return false;
        }
      }

      // Category Group Filter
      if (selectedGroup !== 'All' && course.categoryGroup !== selectedGroup) {
        return false;
      }

      // Grade Filter
      if (selectedGrade !== 'All') {
        if (!course.targetGrades.includes(selectedGrade) && !course.targetGrades.includes('All')) {
          return false;
        }
      }

      // Level Filter
      if (selectedLevel !== 'All' && course.level !== selectedLevel && course.level !== 'All Levels') {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedGroup, selectedGrade, selectedLevel]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 animate-fade-in text-sm">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0F2342] text-white pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Institution badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs sm:text-sm font-medium tracking-wide">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>OpenFrame Education • In Collaboration with HopeNest Global Foundation</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                  Learn. Develop.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                    Achieve.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl font-medium text-slate-200">
                  Building Future-Ready Students, Skilled Professionals and Confident Entrepreneurs.
                </p>
              </div>

              {/* Supporting narrative */}
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
                OpenFrame Education provides a complete, technology-enabled learning ecosystem. From Classes 1st to 12th school tuition in 9 core subjects to 100+ practical skill certifications, 1-on-1 personal mentoring, and continuous IQ/EQ/SQ assessments, our programmes empower every learner to thrive academically and professionally.
              </p>

              {/* Official Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-3 sm:gap-3.5 items-center">
                <button
                  onClick={() => {
                    setRegCourseTitle('OpenFrame Education Academic Programme');
                    setIsRegModalOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-cyan-500/25 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <GraduationCap className="w-5 h-5 text-cyan-200" />
                  <span>Apply for Admission (Pop-up Form)</span>
                </button>

                <button
                  onClick={() => {
                    const all = youtubeVideoService.getAllLibrary();
                    setSelectedVideo(all[0] || null);
                    setVideoPlaylist(all);
                    setIsVideoModalOpen(true);
                  }}
                  className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Play YouTube Lectures On Site</span>
                </button>

                <Link
                  to="/marketplace"
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span>15,500+ Course Marketplace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/chatbot"
                  className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-700/80 hover:from-cyan-500 hover:to-blue-600 text-white border border-cyan-400/40 font-bold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Brain className="w-4 h-4 text-cyan-200" />
                  <span>Qwen AI Assistant</span>
                </Link>

                <Link
                  to="/learn/OF-AI-001"
                  className="px-5 py-3.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 font-bold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start with Quinn AI</span>
                </Link>

                <Link
                  to="/student/dashboard"
                  className="px-5 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-bold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2"
                >
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>Student Portal</span>
                </Link>

                <button
                  onClick={() => scrollToSection('programmes-catalogue')}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 cursor-pointer backdrop-blur-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>33 Core Pillars</span>
                </button>

                <button
                  onClick={() => scrollToSection('pricing-section')}
                  className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 text-cyan-300" />
                  <span>Tuition Pricing</span>
                </button>

                <button
                  onClick={() => scrollToSection('brochure-centre')}
                  className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm sm:text-base transition-all duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Brochures</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-300">15,500+</div>
                  <div className="text-xs text-slate-400">Listed Courses (110+ Cats)</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold text-cyan-400">₹300/mo</div>
                  <div className="text-xs text-slate-400">Starting Tuition Fee</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold text-white">9 Subjects</div>
                  <div className="text-xs text-slate-400">Classes 1st – 12th</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xl sm:text-2xl font-bold text-amber-400">DIPP153945</div>
                  <div className="text-xs text-slate-400">Startup India DPIIT</div>
                </div>
              </div>
            </div>

            {/* Right Visual Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-2 border-cyan-500/30 bg-slate-900 group">
                <img
                  src="/assets/images/hero_banner.jpg"
                  alt="OpenFrame Education Students Learning"
                  className="w-full h-80 sm:h-96 lg:h-[460px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-[#071326]/40 to-transparent" />

                {/* Floating pill over image */}
                <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl text-left">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>Complete Learning Ecosystem</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Academic Excellence + 100 Practical Skills + 1-on-1 Personal Mentoring + IQ/EQ/SQ Student Development.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PROGRAMME HIGHLIGHTS (9 VISUAL SPOTLIGHTS)            */}
      {/* ======================================================== */}
      <section className="py-20 bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <span>9 Comprehensive Learning Pillars</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Programme Highlights & Focus Areas
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Every programme is structured to meet students at their exact stage of growth, combining rigorous syllabus concepts with modern industry skills and personal mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMME_HIGHLIGHTS.map((item) => (
              <div
                key={item.id}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/80 overflow-hidden shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col group text-left"
              >
                {/* Photo Header */}
                <div className="relative h-48 overflow-hidden bg-slate-950">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/20" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-cyan-600/90 text-white text-xs font-semibold backdrop-blur-sm shadow">
                    {item.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-cyan-400 mt-1 mb-2">
                      {item.tagline}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Bullet features */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                      {item.keyFeatures.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA button */}
                  <div className="pt-2">
                    <button
                      onClick={() => scrollToSection(item.targetId)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-700 hover:bg-cyan-600 text-white text-xs font-semibold transition-colors duration-200 flex items-center justify-center space-x-1.5 cursor-pointer group-hover:bg-cyan-600"
                    >
                      <span>{item.actionLabel}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. OFFICIAL BROCHURE DOWNLOAD CENTRE                     */}
      {/* ======================================================== */}
      <section id="brochure-centre" className="py-20 bg-gradient-to-b from-slate-900 to-[#071326] text-white border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Publication Repository</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              OPENFRAME EDUCATION – OFFICIAL BROCHURES
            </h2>
            <p className="text-slate-300 text-base leading-relaxed">
              Access and download the official brochures detailing complete student tuition fees, course categories, 100+ skill curriculum outlines, mentoring packages, and corporate accreditation details.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {OFFICIAL_BROCHURES.map((brochure) => (
              <div
                key={brochure.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 sm:p-8 flex flex-col md:flex-row gap-6 shadow-xl hover:border-cyan-500/40 transition-all duration-300 text-left"
              >
                {/* Cover Preview Image */}
                <div className="w-full md:w-48 shrink-0 flex flex-col items-center">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-600 group w-44 md:w-full">
                    <img
                      src={brochure.coverImage}
                      alt={brochure.title}
                      className="w-full h-64 md:h-64 object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                         onClick={() => setSelectedBrochureForViewer(brochure)}>
                      <span className="px-3 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-bold shadow flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-700 text-cyan-300 text-[11px] font-medium">
                      {brochure.pageCount} Pages • {brochure.fileSize}
                    </span>
                  </div>
                </div>

                {/* Brochure Metadata & Actions */}
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                      {brochure.publicationYear}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white mt-1 leading-snug">
                      {brochure.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-300 mt-1">
                      {brochure.subtitle}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                      {brochure.description}
                    </p>

                    {/* Highlights bullet points */}
                    <div className="mt-3.5 space-y-1.5 pt-3 border-t border-slate-700/60">
                      {brochure.highlights.map((h, hIdx) => (
                        <div key={hIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions: View Online, Download PDF, Share Document */}
                  <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => setSelectedBrochureForViewer(brochure)}
                      className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Online</span>
                    </button>

                    <a
                      href={brochure.pdfUrl}
                      download
                      className="py-2.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 text-center"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download PDF</span>
                    </a>

                    <button
                      onClick={() => handleShareBrochure(brochure)}
                      className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-white/10"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-300" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. ATTRACTIVE OFFICIAL PRICING SECTION                   */}
      {/* ======================================================== */}
      <section id="pricing-section" className="py-20 bg-slate-100/90 text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <span>Verified Official Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Transparent, Affordable Programme Pricing
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Official tuition plans and skill development subscriptions matching the published pricing catalogues. No hidden fees or inflated price points.
            </p>

            {/* Toggle Switch */}
            <div className="pt-4 inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300 shadow-inner">
              <button
                onClick={() => setPricingTab('tuition')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  pricingTab === 'tuition'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <School className="w-4 h-4" />
                <span>2026–27 Academic & Skill Tuition</span>
              </button>

              <button
                onClick={() => setPricingTab('subscriptions')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center space-x-2 cursor-pointer ${
                  pricingTab === 'subscriptions'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>100+ Skills & Mentoring Subscriptions</span>
              </button>
            </div>
          </div>

          {/* TAB 1: 2026–27 ACADEMIC TUITION & STANDALONE */}
          {pricingTab === 'tuition' && (
            <div className="space-y-12">
              {/* Monthly Tuition Plans */}
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Academic Tuition Plans (Classes 1st to 12th Standard)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Strengthen academic concepts across 9 core subjects with expert guidance (Source: Pricing Catalogue 2026–27, Page 2 & 5)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {OFFICIAL_PRICING_PLANS.filter(p => p.category === 'academic').map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-2xl p-7 transition-all duration-300 flex flex-col justify-between text-left ${
                        plan.isPopular
                          ? 'border-2 border-blue-600 shadow-2xl ring-4 ring-blue-500/10'
                          : 'border border-slate-300 shadow-lg'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-extrabold uppercase tracking-wider shadow">
                          ★ Most Popular
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                            {plan.badge}
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 mt-1">
                            {plan.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{plan.idealFor}</p>
                        </div>

                        {/* Price */}
                        <div className="py-2 border-t border-b border-slate-100">
                          <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                          <span className="text-slate-500 text-xs ml-2 font-medium">/{plan.frequency}</span>
                        </div>

                        {/* Feature list */}
                        <div className="space-y-2.5 pt-2">
                          {plan.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 space-y-2">
                        <Link
                          to={`/join/student?course=${encodeURIComponent(plan.title)}`}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center block transition-all shadow ${
                            plan.isPopular
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Enrol for {plan.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 text-center">
                          {plan.sourceDocument}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 9 Subjects Offered Badge Grid */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-sm">
                <div className="text-left mb-4">
                  <h4 className="text-base font-bold text-slate-900">
                    Subjects Offered in Academic Tuition
                  </h4>
                  <p className="text-xs text-slate-500">
                    Choose any combination of subjects for State and CBSE syllabus coaching:
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    'Mathematics',
                    'Science (Physics/Chem/Bio)',
                    'English Language & Lit',
                    'Kannada Bhasha',
                    'Hindi Language',
                    'Social Science & History',
                    'Computer Science',
                    'General Knowledge',
                    'Board Exam Preparation',
                    'Doubt Resolution Clinics'
                  ].map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Standalone Programme Fee Summary (Skill ₹1,200, Mentoring ₹500, IQ/EQ/SQ ₹300, Special from ₹499) */}
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800">
                    Specialized Skill, Mentoring & Assessment Fees
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Structured certifications and continuous student development options (Source: Pricing Catalogue Page 3, 4 & 5)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {OFFICIAL_PRICING_PLANS.filter(p => p.category === 'standalone').map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-6 border border-slate-300 shadow flex flex-col justify-between text-left"
                    >
                      <div className="space-y-3">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                          {item.badge}
                        </span>
                        <h4 className="text-xl font-bold text-slate-900 mt-1">
                          {item.title}
                        </h4>
                        <div className="text-3xl font-extrabold text-slate-900">
                          {item.price}{' '}
                          <span className="text-xs text-slate-500 font-normal">({item.frequency})</span>
                        </div>
                        <p className="text-xs text-slate-600">{item.idealFor}</p>

                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          {item.features.map((f, i) => (
                            <div key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5">
                        <Link
                          to={`/join/student?course=${encodeURIComponent(item.title)}`}
                          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs text-center block transition-colors"
                        >
                          Enrol for {item.title}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 100+ SKILLS & MENTORING SUBSCRIPTIONS (From Corporate Brochure Page 28 & 29) */}
          {pricingTab === 'subscriptions' && (
            <div className="space-y-14">
              {/* 100+ Skills Subscription Plans */}
              <div>
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                    Corporate Brochure Page 28
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    100 Skill Development Programme Subscriptions
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
                    A comprehensive, industry-aligned skill ecosystem from basic life skills to advanced technologies.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {OFFICIAL_PRICING_PLANS.filter(p => p.category === 'skills_subscription').map((sub) => (
                    <div
                      key={sub.id}
                      className={`relative bg-white rounded-2xl p-7 transition-all duration-300 flex flex-col justify-between text-left ${
                        sub.isPopular
                          ? 'border-2 border-purple-600 shadow-2xl ring-4 ring-purple-500/10'
                          : 'border border-slate-300 shadow-lg'
                      }`}
                    >
                      {sub.isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow">
                          ★ Most Popular
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
                            {sub.badge}
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 mt-1">
                            {sub.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{sub.idealFor}</p>
                        </div>

                        <div className="py-2 border-t border-b border-slate-100">
                          <span className="text-4xl font-extrabold text-slate-900">{sub.price}</span>
                          <span className="text-slate-500 text-xs ml-2 font-medium">/{sub.frequency}</span>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {sub.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 space-y-2">
                        <Link
                          to={`/join/student?course=${encodeURIComponent(sub.title)}`}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center block transition-all shadow ${
                            sub.isPopular
                              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Get {sub.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 text-center">
                          {sub.sourceDocument}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mentoring Subscription Plans */}
              <div>
                <div className="text-center mb-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-2">
                    Corporate Brochure Page 29
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Mentoring Programme Subscriptions
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xl mx-auto mt-1">
                    One-to-one mentorship, personalised coaching, study planning, and student guidance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {OFFICIAL_PRICING_PLANS.filter(p => p.category === 'mentoring_subscription').map((ment) => (
                    <div
                      key={ment.id}
                      className={`relative bg-white rounded-2xl p-7 transition-all duration-300 flex flex-col justify-between text-left ${
                        ment.isPopular
                          ? 'border-2 border-cyan-600 shadow-2xl ring-4 ring-cyan-500/10'
                          : 'border border-slate-300 shadow-lg'
                      }`}
                    >
                      {ment.isPopular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-extrabold uppercase tracking-wider shadow">
                          ★ Most Popular
                        </div>
                      )}

                      <div className="space-y-4">
                        <div>
                          <div className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">
                            {ment.badge}
                          </div>
                          <h4 className="text-2xl font-bold text-slate-900 mt-1">
                            {ment.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{ment.idealFor}</p>
                        </div>

                        <div className="py-2 border-t border-b border-slate-100">
                          <span className="text-4xl font-extrabold text-slate-900">{ment.price}</span>
                          <span className="text-slate-500 text-xs ml-2 font-medium">/{ment.frequency}</span>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          {ment.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-700">
                              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-6 space-y-2">
                        <Link
                          to={`/join/student?course=${encodeURIComponent(ment.title)}`}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-center block transition-all shadow ${
                            ment.isPopular
                              ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          Choose {ment.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 text-center">
                          {ment.sourceDocument}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6-Step Enrolment Process (Page 5) */}
          <div className="mt-16 bg-white rounded-2xl p-8 border border-slate-300 shadow-sm text-left">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Simple & Transparent</span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                Official Student Enrolment Process (6 Steps)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { step: '1', title: 'Register Student', desc: 'Fill in basic student details and contact information' },
                { step: '2', title: 'Choose Plan', desc: 'Select academic tuition, skill course, or subscription' },
                { step: '3', title: 'Complete Payment', desc: 'Secure fee confirmation via approved official receipt' },
                { step: '4', title: 'Attend Orientation', desc: 'Introductory orientation briefing with academic coordinators' },
                { step: '5', title: 'Start Learning', desc: 'Access live classes, study materials & practice exercises' },
                { step: '6', title: 'Track & Certify', desc: 'Periodic progress reports and OpenFrame certification' }
              ].map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center mb-3">
                    {s.step}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1">{s.title}</h5>
                    <p className="text-[11px] text-slate-500 leading-normal">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. VISUAL COURSE CATALOGUE (ALL 33 CATEGORIES)           */}
      {/* ======================================================== */}
      <section id="programmes-catalogue" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-100 border border-cyan-300 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
              <span>Complete Curriculum Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore All 33 Programme Categories
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              Browse our complete catalogue spanning K-12 academic coaching, programming, artificial intelligence, robotics, creative media, executive communication, and rural empowerment.
            </p>
          </div>

          {/* Working Search & Multi-parameter Filters */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm mb-12 space-y-5 text-left">
            {/* Top row: search + reset */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-8 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by programme name, topic or skill (e.g., Python, Mathematics, Robotics, AI, Canva)..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-4 flex items-center justify-end space-x-3">
                <div className="text-xs font-semibold text-slate-500">
                  Showing <span className="text-blue-600 font-bold">{filteredCourses.length}</span> of {EDUCATION_CATEGORIES_33.length} programmes
                </div>
                {(searchQuery || selectedGroup !== 'All' || selectedGrade !== 'All' || selectedLevel !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGroup('All');
                      setSelectedGrade('All');
                      setSelectedLevel('All');
                    }}
                    className="text-xs font-medium text-rose-600 hover:underline cursor-pointer"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Category Domain Filter Pills */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-500 mb-2">Category Domain:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  'All',
                  'Academic',
                  'Technology',
                  'Professional',
                  'Creative',
                  'Intelligence',
                  'Business',
                  'STEM',
                  'Wellbeing'
                ].map((grp) => (
                  <button
                    key={grp}
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedGroup === grp
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {grp === 'All' ? 'All Domains' : grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Age & Level Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Target Grade / Stage:</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Grades (Classes 1st to College+)</option>
                  <option value="Classes 1st – 5th">Classes 1st – 5th (Primary)</option>
                  <option value="Classes 6th – 8th">Classes 6th – 8th (Middle)</option>
                  <option value="Classes 9th – 10th">Classes 9th – 10th (Secondary)</option>
                  <option value="Classes 11th – 12th">Classes 11th – 12th (Senior Secondary)</option>
                  <option value="College+">College & Professionals</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Proficiency Level:</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">No matching programmes found</h4>
              <p className="text-xs text-slate-500">Try adjusting your search terms or clearing the domain filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroup('All');
                  setSelectedGrade('All');
                  setSelectedLevel('All');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-md hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Image & Badge Header */}
                  <div>
                    <div className="relative h-44 overflow-hidden bg-slate-900">
                      <img
                        src={course.imageUrl}
                        alt={course.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-sm shadow">
                          {course.badge}
                        </span>
                        {course.isPopular && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-900 text-[10px] font-extrabold uppercase shadow">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-2.5 left-3 text-[11px] text-cyan-300 font-medium">
                        {course.targetGrades} ({course.ageBracket})
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-3">
                      <div>
                        <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                          {course.categoryGroup}
                        </span>
                        <h4 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors mt-0.5">
                          {course.name}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {course.shortDesc}
                      </p>

                      {/* Key modules snapshot */}
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-700">Curriculum Highlights:</div>
                        {course.modules.slice(0, 3).map((m, mIdx) => (
                          <div key={mIdx} className="flex items-start space-x-1.5 text-[11px] text-slate-600">
                            <span className="text-blue-500 font-bold shrink-0">•</span>
                            <span className="line-clamp-1">{m}</span>
                          </div>
                        ))}
                      </div>

                      {/* Fee indicator */}
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Official Fee:</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {course.officialFee}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-6 pt-0 border-t border-slate-100 mt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedCourseForModal(course)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>View Syllabus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openRazorpayEnrollmentForEducationItem(course)}
                      className="py-2.5 px-3 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-1 text-center shadow cursor-pointer"
                    >
                      <span>Pay &amp; Enrol</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. TEACHER & INSTITUTIONAL PARTNERSHIP SECTION           */}
      {/* ======================================================== */}
      <section className="py-16 bg-slate-900 text-white border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Join as Educator */}
            <div className="bg-slate-800/90 rounded-2xl p-8 border border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Join OpenFrame as an Educator or Mentor</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Are you an experienced school teacher, coding instructor, corporate mentor, or psychologist? Join our faculty network to conduct interactive live batches, 1-on-1 mentoring sessions, and develop future-ready learners.
              </p>
              <div className="pt-2">
                <Link
                  to="/join/teacher"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow"
                >
                  <span>Apply as an Educator / Trainer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Institutional & School Partnerships */}
            <div className="bg-slate-800/90 rounded-2xl p-8 border border-slate-700 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">School & Institutional Alliances</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Bring OpenFrame Education’s STEM labs, robotics curricula, LMS, and teacher training to your school campus. We collaborate with private schools, colleges, and NGOs across Karnataka and India.
              </p>
              <div className="pt-2">
                <Link
                  to="/partner/school"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow"
                >
                  <span>Request Institutional Partnership</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Legal Collaboration Transparency Note */}
          <div className="mt-12 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <strong className="text-slate-300">Section 8 Institutional Collaboration:</strong> OpenFrame Education operates as a technology vertical of OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260, DPIIT: DIPP153945). Grassroots community skill development, rural livelihood programmes, and educational scholarships are delivered in formal non-profit institutional alliance with HopeNest Global Foundation, maintaining distinct governance and accounts.
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. DETAILED COURSE MODAL                                 */}
      {/* ======================================================== */}
      {selectedCourseForModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 text-left animate-scale-up">
            {/* Header image banner */}
            <div className="relative h-48 sm:h-56 overflow-hidden bg-slate-900 rounded-t-2xl">
              <img
                src={selectedCourseForModal.imageUrl}
                alt={selectedCourseForModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />
              <button
                onClick={() => setSelectedCourseForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white text-xs font-bold uppercase tracking-wider">
                  {selectedCourseForModal.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedCourseForModal.name}
                </h3>
                <div className="text-xs text-cyan-300 mt-1">
                  Target: {selectedCourseForModal.targetGrades} ({selectedCourseForModal.ageBracket}) • Level: {selectedCourseForModal.level}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Detailed description */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Programme Overview
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {selectedCourseForModal.fullDesc}
                </p>
              </div>

              {/* Curriculum Breakdown */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Comprehensive Curriculum Outline
                </h4>
                <div className="space-y-2">
                  {selectedCourseForModal.modules.map((m, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Target Learning Outcomes
                </h4>
                <div className="space-y-1.5">
                  {selectedCourseForModal.learningOutcomes.map((out, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-600">
                      <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{out}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration & Fee metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-[11px] font-medium text-blue-700">Official Programme Fee</div>
                  <div className="text-sm font-bold text-blue-900 mt-0.5">
                    {selectedCourseForModal.officialFee}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                  <div className="text-[11px] font-medium text-slate-600">Certification & Verification</div>
                  <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                    {selectedCourseForModal.certificationNote}
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex flex-wrap gap-3 items-center justify-end">
                <button
                  onClick={() => {
                    const cName = selectedCourseForModal.name;
                    setSelectedCourseForModal(null);
                    handleOpenEnquiry(cName);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Quick Enquiry
                </button>

                <button
                  type="button"
                  onClick={() => openRazorpayEnrollmentForEducationItem(selectedCourseForModal)}
                  className="px-6 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold transition-colors flex items-center space-x-1.5 shadow cursor-pointer"
                >
                  <span>Pay via Razorpay &amp; Enrol</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. EMBEDDED RESPONSIVE PDF VIEWER MODAL                  */}
      {/* ======================================================== */}
      {selectedBrochureForViewer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative bg-slate-900 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-cyan-500/30 text-white animate-scale-up">
            {/* Top Toolbar */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-left">
                <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                    {selectedBrochureForViewer.title}
                  </h3>
                  <div className="text-xs text-slate-400">
                    {selectedBrochureForViewer.pageCount} Pages • {selectedBrochureForViewer.fileSize} • {selectedBrochureForViewer.publicationYear}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={selectedBrochureForViewer.pdfUrl}
                  download
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </a>

                <button
                  onClick={() => handleShareBrochure(selectedBrochureForViewer)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Share Brochure"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setSelectedBrochureForViewer(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close Viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe Body */}
            <div className="flex-1 bg-slate-950 relative overflow-hidden">
              <iframe
                src={`${selectedBrochureForViewer.pdfUrl}#toolbar=1&navpanes=0`}
                title={selectedBrochureForViewer.title}
                className="w-full h-full border-none"
              />
            </div>

            {/* Footer Notice */}
            <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>If preview does not display on your browser, use the download button to view offline.</span>
              <span className="text-cyan-400 font-medium">OpenFrame IT Solutions Private Limited</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 9. QUICK ENQUIRY MODAL                                   */}
      {/* ======================================================== */}
      {isEnquiryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-300 text-left animate-scale-up">
            <button
              onClick={() => setIsEnquiryModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {enquirySubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Enquiry Received!</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Thank you, <span className="font-semibold text-slate-800">{enquiryForm.fullName}</span>. An OpenFrame academic counselor will contact you at <span className="font-semibold text-slate-800">{enquiryForm.mobileNumber}</span> within 24 business hours.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setIsEnquiryModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-5">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Education Admission Desk
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Enquire for {enquiryCourseName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Speak with our academic team for batch schedules, personalized tuition, or scholarships.
                  </p>
                </div>

                <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Full Name of Parent / Student *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.fullName}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, fullName: e.target.value })}
                      placeholder="e.g. Anand Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={enquiryForm.mobileNumber}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, mobileNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={enquiryForm.emailAddress}
                        onChange={(e) => setEnquiryForm({ ...enquiryForm, emailAddress: e.target.value })}
                        placeholder="parent@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Current Grade / Student Class
                    </label>
                    <select
                      value={enquiryForm.studentClass}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, studentClass: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Classes 1st – 5th">Classes 1st – 5th (Primary)</option>
                      <option value="Classes 6th – 8th">Classes 6th – 8th (Middle School)</option>
                      <option value="Classes 9th – 10th">Classes 9th – 10th (Secondary Boards)</option>
                      <option value="Classes 11th – 12th">Classes 11th – 12th (Senior Secondary Science/Commerce)</option>
                      <option value="College Degree / Professional">College Degree / Young Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Specific Questions or Learning Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={enquiryForm.message}
                      onChange={(e) => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                      placeholder="Mention preferred subjects (Math, Science, Python, etc.) or specific coaching goals..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md"
                    >
                      Submit Course Enquiry
                    </button>
                    <div className="text-[11px] text-slate-400 text-center mt-2">
                      Official helpline: +91 63621 63070 • support@openframeeducation.com
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAID COURSE RAZORPAY CHECKOUT MODAL */}
      <CourseEnrollmentModal
        isOpen={Boolean(enrollModalCourse)}
        onClose={() => setEnrollModalCourse(null)}
        course={enrollModalCourse}
      />

      {/* STUDENT REGISTRATION POP-UP MODAL */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle={regCourseTitle}
        courseId="OF-EDU-2026"
        courseCategory="Education"
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
          setRegCourseTitle(title);
          setIsRegModalOpen(true);
        }}
      />
    </div>
  );
};
