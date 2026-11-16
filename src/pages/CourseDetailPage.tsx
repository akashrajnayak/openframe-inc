import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  GraduationCap,
  Clock,
  Star,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Share2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Award,
  Zap,
  Building,
  HeartHandshake,
  Check,
  Sparkles,
  Lock,
  ExternalLink,
  Tag,
  HelpCircle,
  Play,
  Tv,
  PhoneCall,
  Video,
  Heart,
  Globe,
  ListVideo,
  Download,
  FileArchive,
  Bookmark,
  Bot,
  Send,
  X,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { marketplaceService } from '../services/marketplaceService';
import { lmsService } from '../services/lmsService';
import { quinnAiService } from '../services/quinnAiService';
import { IssuedCertificate, MarketplaceCourse } from '../types';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { youtubeVideoService, ExtendedYouTubeVideo } from '../services/youtubeVideoService';
import { useAuth } from '../context/AuthContext';

export const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState<MarketplaceCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveTotalCourses, setLiveTotalCourses] = useState<number>(15500);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavUpdating, setIsFavUpdating] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [earnedCert, setEarnedCert] = useState<IssuedCertificate | null>(null);

  // Inline Quinn AI Tutor drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'Hi! I am Quinn AI, your curriculum advisor. Ask me about prerequisites, outcomes, or concepts in this course.',
    },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Pop-up modals state
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [courseVideos, setCourseVideos] = useState<ExtendedYouTubeVideo[]>([]);

  // Extract courseId from URL: e.g. /marketplace/OF-CRS-0001
  const courseId = (() => {
    const clean = router.currentPath.split('?')[0].split('#')[0];
    const parts = clean.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  })();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    let isMounted = true;
    marketplaceService
      .getLiveMarketplaceCounters()
      .then((stats) => {
        if (isMounted && stats?.totalCoursesAvailable) {
          setLiveTotalCourses(stats.totalCoursesAvailable);
        }
      })
      .catch(() => {});

    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const found = await marketplaceService.getCourseById(courseId);
        if (isMounted) {
          setCourse(found);
          if (found) {
            const curated = youtubeVideoService.getVideosForCourse(found.id, found.category, found.title);
            const directList: ExtendedYouTubeVideo[] = [];

            if (found.youtubePlaylistId) {
              directList.push({
                id: `pl-${found.youtubePlaylistId}`,
                videoId: found.youtubeVideoId || found.recommendedVideos?.[0]?.videoId || 'JMUxmLyrhSk',
                youtubeId: found.youtubeVideoId || found.recommendedVideos?.[0]?.videoId || 'JMUxmLyrhSk',
                title: `${found.title} (Full YouTube Playlist)`,
                channelTitle: found.youtubeChannelName || found.instructorName || 'OpenFrame Partner Channel',
                thumbnail: found.thumbnailUrl || found.imageUrl,
                thumbnailUrl: found.thumbnailUrl || found.imageUrl,
                duration: found.duration || 'Playlist Series',
                level: found.level === 'Advanced' ? 'Advanced' : found.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
                subjectCategory: found.category,
                recommendedReason: `Official playlist curriculum linked directly to ${found.title}.`,
                embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${found.youtubePlaylistId}`,
                keyTopicsCovered: found.skillsAcquired?.slice(0, 4) || [found.category],
              });
            }

            if (Array.isArray(found.recommendedVideos)) {
              found.recommendedVideos.forEach((rv) => {
                directList.push({
                  ...rv,
                  subjectCategory: found.category,
                  keyTopicsCovered: found.skillsAcquired?.slice(0, 4) || [found.category],
                });
              });
            } else if (found.youtubeVideoId && !found.youtubePlaylistId) {
              directList.push({
                id: `yt-${found.youtubeVideoId}`,
                videoId: found.youtubeVideoId,
                youtubeId: found.youtubeVideoId,
                title: found.title,
                channelTitle: found.youtubeChannelName || found.instructorName || 'OpenFrame Faculty',
                thumbnail: `https://i.ytimg.com/vi/${found.youtubeVideoId}/hqdefault.jpg`,
                thumbnailUrl: `https://i.ytimg.com/vi/${found.youtubeVideoId}/hqdefault.jpg`,
                duration: found.duration || 'Lecture',
                level: found.level === 'Advanced' ? 'Advanced' : found.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
                subjectCategory: found.category,
                recommendedReason: `Primary curated lecture for ${found.title}.`,
                embedUrl: `https://www.youtube-nocookie.com/embed/${found.youtubeVideoId}`,
                keyTopicsCovered: found.skillsAcquired?.slice(0, 4) || [found.category],
              });
            }

            const seenIds = new Set<string>();
            const merged = [...directList, ...curated].filter((v) => {
              const key = `${v.embedUrl || ''}:${v.youtubeId || v.videoId}`;
              if (seenIds.has(key)) return false;
              seenIds.add(key);
              return true;
            });
            setCourseVideos(merged);
          }
        }
      } catch (err) {
        console.error('Error loading course details:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (courseId) {
      loadCourse();
    }
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    const targetUid = currentUser?.uid || 'guest_learner';
    if (!courseId) {
      setIsFavorite(false);
      setIsBookmarked(false);
      setEarnedCert(null);
      return;
    }
    let active = true;
    lmsService.getStudentBookmarks(targetUid).then((bms) => {
      if (active) setIsBookmarked(bms.some((b) => b.courseId === courseId));
    }).catch(() => {});

    if (currentUser) {
      marketplaceService.getStudentFavorites(currentUser.uid).then((favs) => {
        if (active) setIsFavorite(favs.some((f) => f.courseId === courseId));
      }).catch(() => {});
      lmsService.getCertificatesForStudent(currentUser.uid).then((certs) => {
        if (active) {
          const match = certs.find((c) => c.courseId === courseId && c.status === 'Issued') || null;
          setEarnedCert(match);
        }
      }).catch(() => {});
    } else {
      setIsFavorite(false);
      setEarnedCert(null);
    }
    return () => {
      active = false;
    };
  }, [currentUser?.uid, courseId]);

  const handleToggleMyLearning = async () => {
    if (!course) return;
    const uid = currentUser?.uid || 'guest_learner';
    const saved = await lmsService.toggleLessonBookmark({
      studentId: uid,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: 'overview',
      lessonTitle: `${course.title} (${course.category})`,
      videoId: course.youtubeVideoId,
    });
    setIsBookmarked(saved);
    showToast(saved ? 'Added to My Learning list!' : 'Removed from My Learning list.');
  };

  const handleAskInlineAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim() || !course) return;
    const promptText = aiInput.trim();
    const nextHist = [...aiMessages, { role: 'user' as const, text: promptText }];
    setAiMessages(nextHist);
    setAiInput('');
    setAiLoading(true);
    try {
      const reply = await quinnAiService.chatWithAssistant({
        message: promptText,
        courseTitle: course.title,
        lessonTopic: course.category,
        history: nextHist,
      });
      setAiMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!course) return;
    if (!currentUser) {
      showToast('Please sign in to save courses to your student dashboard.');
      router.navigate(`/portal?role=student&redirect=${encodeURIComponent(router.currentPath)}`);
      return;
    }
    setIsFavUpdating(true);
    try {
      const saved = await marketplaceService.toggleFavoriteCourse(currentUser.uid, course);
      setIsFavorite(saved);
      showToast(saved ? 'Saved to your Student Dashboard favourites!' : 'Removed from favourites.');
    } catch (err: any) {
      showToast(err?.message || 'Could not update favourites.');
    } finally {
      setIsFavUpdating(false);
    }
  };

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && course) {
      try {
        await navigator.share({
          title: course.title,
          text: course.shortDesc,
          url: url
        });
        showToast('Course link shared!');
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard.writeText(url);
    showToast('Copied course URL to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-slate-800">Loading Course Curriculum...</h2>
          <p className="text-xs text-slate-500">Retrieving course specification from central database...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 pb-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <HelpCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
          <p className="text-xs text-slate-600">
            The requested course ID <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-blue-600">{courseId}</code> does not exist in the marketplace catalog.
          </p>
          <div className="pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPublished = course.status === 'Published';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-cyan-500/40 flex items-center space-x-3 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP COURSE BANNER */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0F2342] text-white pt-24 pb-14 border-b border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb navigation */}
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-cyan-400">Home</Link>
            <span>/</span>
            <Link to="/education" className="hover:text-cyan-400">Education</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-cyan-400">Marketplace</Link>
            <span>/</span>
            <span className="text-cyan-300 font-semibold">{course.category}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              {/* Category & Status Metadata */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                  {course.category} • {course.subcategory}
                </span>
                {course.categories && course.categories.length > 1 && course.categories.filter((c) => c !== course.category).map((extraCat) => (
                  <span key={extraCat} className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-cyan-200 border border-slate-700">
                    {extraCat}
                  </span>
                ))}
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {course.id}
                </span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-600/30 text-blue-300 border border-blue-400/30">
                  {course.level}
                </span>
                {course.contentType && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-600/30 text-emerald-200 border border-emerald-400/30">
                    {course.contentType}
                  </span>
                )}
                {course.courseType === 'youtube_playlist' && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-600/40 text-indigo-200 border border-indigo-400/40 flex items-center gap-1">
                    <ListVideo className="w-3 h-3" />
                    <span>Video Playlist</span>
                  </span>
                )}
                {course.courseType === 'youtube_video' && (
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-600/40 text-rose-200 border border-rose-400/40 flex items-center gap-1">
                    <Play className="w-3 h-3 fill-current" />
                    <span>YouTube Course</span>
                  </span>
                )}
              </div>

              {/* Course Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Subheading / Short Description */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {course.shortDesc}
              </p>

              {/* Meta metrics */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white text-sm tabular-nums">{course.rating}</span>
                  <span className="text-slate-400 tabular-nums">({course.enrolledCount} enrolled)</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{course.language || 'English'}</span>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>
                    {course.publishedDate
                      ? `Published ${course.publishedDate.slice(0, 10)}`
                      : `Updated ${course.updatedAt?.slice(0, 10)}`}
                  </span>
                </div>

                {course.youtubeChannelName && (
                  <div className="flex items-center space-x-1.5">
                    <Tv className="w-4 h-4 text-rose-400" />
                    <span>
                      Channel:{' '}
                      {course.youtubeChannelUrl ? (
                        <a
                          href={course.youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-white hover:text-cyan-300 underline"
                        >
                          {course.youtubeChannelName}
                        </a>
                      ) : (
                        <strong className="text-white">{course.youtubeChannelName}</strong>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Instructor badge */}
              <div className="pt-2 flex items-center space-x-3 text-xs text-slate-300 border-t border-slate-700/60">
                <div className="w-8 h-8 rounded-full bg-white p-0.5 border border-blue-500/40 flex items-center justify-center shrink-0 overflow-hidden">
                  <img src="/openframe_official_logo.jpg" alt="OpenFrame" referrerPolicy="no-referrer" className="w-full h-full object-contain rounded-full" />
                </div>
                <div>
                  <div className="font-semibold text-white">{course.instructor?.name || 'OpenFrame Education Faculty'}</div>
                  <div className="text-slate-400 text-[11px]">{course.instructor?.role} • {course.instructor?.organization}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT CONTENT COLUMN (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8 text-left">
            {/* Animation Course ZIP Packs & Live Interactive Studio Callout */}
            {course.id.startsWith('OF-CRS-ANIM') && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      Included Source Files &amp; Interactive Sandbox
                    </div>
                    <h3 className="text-lg font-bold mt-0.5">
                      Course ZIP Archives, 12 Animated Charts &amp; 17 Swift UI Components
                    </h3>
                  </div>
                  <Link
                    to="/animation-course"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Open Interactive Studio</span>
                  </Link>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Download the complete Ramotion Swift UI animation repository archive, Swift Charts code, and spring physics solvers, or test every graph, chart, and animation live in your browser.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="/downloads/animation-course/swift-ui-animation-components-master-pack.zip"
                    download
                    className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download Master ZIP (31 KB)</span>
                  </a>
                  <a
                    href="/downloads/animation-course/03-animated-graphs-and-charts-pack.zip"
                    download
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>Graphs &amp; Charts ZIP</span>
                  </a>
                  <a
                    href="/downloads/animation-course/02-swift-ui-17-components-kit.zip"
                    download
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FileArchive className="w-3.5 h-3.5" />
                    <span>17 Swift Components ZIP</span>
                  </a>
                </div>
              </div>
            )}

            {/* What you will learn */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <span>What You Will Learn in This Course</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {course.learningObjectives.map((obj, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prerequisites & Expected Outcomes */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Prerequisites</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {course.level === 'Beginner' || course.level === 'All Levels'
                    ? 'No prior specialized background required. Basic familiarity with digital reading and web browsing is sufficient.'
                    : `Recommended foundational familiarity with ${course.category} concepts before attempting advanced modules.`}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Expected Outcomes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {course.descriptionBreakdown?.achieveAfterCompletion ||
                    `Complete structured video lessons, verify understanding through assessment quizzes, and earn eligibility for OpenFrame evaluation.`}
                </p>
              </div>
            </div>

            {/* Skills student will acquire */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Skills You Will Acquire</span>
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {course.skillsAcquired.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Course Curriculum & Modules */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Detailed Curriculum & Learning Modules
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {course.modules.length} Modules • {course.duration} Total Learning Time
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allOpen = Object.keys(expandedModules).length === course.modules.length;
                    if (allOpen) {
                      setExpandedModules({});
                    } else {
                      const all: Record<number, boolean> = {};
                      course.modules.forEach((_, idx) => (all[idx] = true));
                      setExpandedModules(all);
                    }
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  {Object.keys(expandedModules).length === course.modules.length ? 'Collapse All' : 'Expand All'}
                </button>
              </div>

              {/* Module Accordions */}
              <div className="space-y-3 pt-2">
                {course.modules.map((mod, mIdx) => {
                  const isOpen = !!expandedModules[mIdx];
                  return (
                    <div
                      key={mIdx}
                      className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50/50"
                    >
                      <button
                        onClick={() => toggleModule(mIdx)}
                        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-100/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {mod.moduleNumber}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-slate-800">
                            {mod.title}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-500">
                          <span>{mod.duration}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 py-3 bg-white border-t border-slate-200 space-y-2">
                          {mod.lessons.map((lesson, lIdx) => (
                            <div key={lIdx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                              <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                              <span>{lesson}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Structured Course Description (6 required facets) */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Comprehensive Course Description
              </h3>

              {course.descriptionBreakdown ? (
                <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      1. What You Will Learn
                    </h4>
                    <p>{course.descriptionBreakdown.whatStudentWillLearn}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      2. Why This Subject Matters
                    </h4>
                    <p>{course.descriptionBreakdown.whySubjectMatters}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      3. Topics Covered
                    </h4>
                    <p>{course.descriptionBreakdown.topicsCovered}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      4. Practical Skills Developed
                    </h4>
                    <p>{course.descriptionBreakdown.practicalSkillsDeveloped}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      5. Who Should Enrol
                    </h4>
                    <p>{course.descriptionBreakdown.whoShouldEnrol}</p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      6. What You Can Achieve After Completion
                    </h4>
                    <p>{course.descriptionBreakdown.achieveAfterCompletion}</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {course.description}
                </div>
              )}
            </div>

            {/* Practical Projects & Capstones */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>Practical Capstone Projects</span>
              </h3>
              <p className="text-xs text-slate-600">
                Build real-world artifacts to substantiate your learning and showcase on your portfolio:
              </p>
              <div className="space-y-2 pt-1">
                {course.practicalProjects.map((proj, pIdx) => (
                  <div key={pIdx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-start space-x-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center shrink-0 font-bold">
                      {pIdx + 1}
                    </span>
                    <span>{proj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment & Certification */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-blue-600" />
                <span>Assessment & Verified Certification</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>Method:</strong> {course.assessmentMethod}
              </p>
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Certificate Eligibility & Institutional Alliance</span>
                </div>
                <p className="text-[11px] text-blue-800 leading-normal">
                  {course.certificateNote}
                </p>
              </div>
            </div>

            {/* CURATED EDUCATIONAL YOUTUBE LECTURES (PLAY ON SITE) */}
            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center space-x-1.5">
                    <Tv className="w-3.5 h-3.5" />
                    <span>OpenFrame Curated Video Hub</span>
                    <span>•</span>
                    <span>Play on Site</span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Curated Educational YouTube Lectures</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-cyan-300 border border-blue-800">
                      {courseVideos.length} Lectures Available
                    </span>
                  </h3>
                </div>
                <button
                  onClick={() => {
                    if (courseVideos.length > 0) {
                      setSelectedVideo(courseVideos[0]);
                      setIsVideoModalOpen(true);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 border border-sky-400/30 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-blue-900/30 cursor-pointer self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5 fill-sky-200 text-sky-200" />
                  <span>Launch Player</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Watch curated lectures from premier engineering authorities (MIT OpenCourseWare, Stanford Online, DeepLearning.AI, Harvard CS50, freeCodeCamp) embedded directly on OpenFrame — no external redirects.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {courseVideos.slice(0, 4).map((vid, vIdx) => (
                  <div
                    key={vid.id || vIdx}
                    onClick={() => {
                      setSelectedVideo(vid);
                      setIsVideoModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                      <CourseThumbnail
                        src={vid.thumbnail || vid.thumbnailUrl}
                        alt={vid.title}
                        youtubeVideoId={vid.youtubeId || vid.videoId}
                        category={course.category}
                        categoryGroup={course.categoryGroup}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-blue-600/95 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/85 text-white">
                        {vid.duration}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-cyan-400">
                        {vid.channelTitle}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {vid.recommendedReason}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="text-cyan-300 font-medium">Play on Site</span>
                      <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px]">
                        {vid.level || 'Beginner'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT STICKY SIDEBAR (lg:col-span-4) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-6 text-left">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg space-y-5">
              {/* Image Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video shadow-xs">
                <CourseThumbnail
                  src={course.thumbnailUrl || course.imageUrl}
                  alt={course.title}
                  youtubeVideoId={course.youtubeVideoId}
                  category={course.category}
                  categoryGroup={course.categoryGroup}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-2 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow">
                  {course.pricingTier && String(course.pricingTier) !== 'Free' ? `${course.pricingTier} Track` : 'Academic Access Track'}
                </span>
              </div>

              {/* Consultation & Fee Guidance Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-200 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-[11px] font-mono uppercase tracking-wider text-blue-700 font-bold">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>{course.price > 0 ? 'Fee & Admission Policy' : 'Academic Access Policy'}</span>
                </div>
                <div className="text-xl font-extrabold text-slate-900 leading-tight">
                  {course.price > 0 ? `₹${course.price.toLocaleString()} Programme` : 'Open Academic Programme'}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pt-0.5">
                  {course.price === 0
                    ? 'Watch curated lectures, bookmark this course, and complete Quinn AI verification assessments immediately.'
                    : 'Course fees, customized project roadmap, batch timings, and merit scholarships are finalized during your 1-on-1 counseling call with our academic expert.'}
                </p>
              </div>

              {/* 7 Structured Course Action Buttons */}
              <div className="space-y-2.5 pt-1">
                {courseVideos.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedVideo(courseVideos[0]);
                      setIsVideoModalOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
                    <span>1. Play Lesson ({courseVideos.length} Videos)</span>
                  </button>
                )}

                <Link
                  to={`/learn/${course.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>2. Start Learning Workspace</span>
                </Link>

                <button
                  type="button"
                  onClick={handleToggleMyLearning}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors cursor-pointer border ${
                    isBookmarked
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                  <span>{isBookmarked ? '3. Saved in My Learning' : '3. Add to My Learning'}</span>
                </button>

                <button
                  onClick={() => setIsRegModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs text-center flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-200" />
                  <span>4. Enroll in OpenFrame Learning Path</span>
                </button>

                <Link
                  to={`/learn/${course.id}?tab=quiz`}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5. Take Assessment Quiz</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setAiDrawerOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-50 border border-amber-300/80 hover:bg-amber-100 text-amber-900 font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>6. Ask AI Tutor (Quinn AI)</span>
                </button>

                {earnedCert ? (
                  <button
                    type="button"
                    onClick={() => lmsService.downloadCertificatePdf(earnedCert)}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>7. Download Certificate ({earnedCert.certificateId})</span>
                  </button>
                ) : (
                  <Link
                    to={`/learn/${course.id}?tab=certificate`}
                    className="w-full py-2 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>7. Certificate Status (Check Eligibility)</span>
                  </Link>
                )}

                {(course.youtubePlaylistUrl || course.youtubeUrl) && (
                  <a
                    href={course.youtubePlaylistUrl || course.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-4 rounded-xl bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 font-bold text-xs text-center flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{course.youtubePlaylistUrl ? 'Open Full YouTube Playlist' : 'Watch Directly on YouTube'}</span>
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={isFavUpdating}
                    className={`py-2 px-3 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border ${
                      isFavorite
                        ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                        : 'bg-slate-100 border-transparent hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{isFavorite ? 'Saved' : 'Save Favourite'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                Free public YouTube educational videos play via official YouTube embed players. OpenFrame never charges to watch free public YouTube videos; fees apply strictly to structured assessments, mentorship &amp; OpenFrame certification.
              </p>

              {/* Features included */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Course Inclusions:
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>{course.duration} structured content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {course.certificateEligibility !== false
                      ? 'Verified OpenFrame Certificate Eligible'
                      : 'Open Learning Track (Non-Certificate)'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Practical capstone project review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>In association with HopeNest Foundation</span>
                </div>
              </div>
            </div>

            {/* Back to Marketplace */}
            <div className="text-center">
              <Link
                to="/marketplace"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="tabular-nums">Return to All {liveTotalCourses.toLocaleString()} Courses</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* STUDENT REGISTRATION POP-UP MODAL */}
      <StudentRegistrationModal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        courseTitle={course.title}
        courseId={course.id}
        courseCategory={course.category}
      />

      {/* "PLAY ON MY SITE" YOUTUBE VIDEO POP-UP MODAL */}
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={selectedVideo}
        playlist={courseVideos}
        onSelectVideo={(vid) => setSelectedVideo(vid)}
        onApplyForCourse={(title, cat) => {
          setIsVideoModalOpen(false);
          setIsRegModalOpen(true);
        }}
      />

      {/* INLINE QUINN AI TUTOR DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900">Quinn AI Course Advisor</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[260px]">{course.title}</div>
                </div>
              </div>
              <button type="button" onClick={() => setAiDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {aiMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[88%] leading-relaxed ${
                    m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100 text-slate-800 mr-auto'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {aiLoading && <div className="text-slate-500 text-xs">Quinn AI is replying...</div>}
            </div>
            <form onSubmit={handleAskInlineAi} className="p-4 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about syllabus, difficulty, or outcomes..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
