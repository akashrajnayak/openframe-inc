import React, { useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Layers,
  Play,
  Search,
  Tv,
  Upload,
} from 'lucide-react';
import { Link } from '../../router/RouterContext';
import type { MarketplaceCourse } from '../../types';
import {
  GITHUB_YOUTUBE_COURSE_COUNT,
  getGitHubInterestCategoryStats,
  queryGitHubYouTubeCourses,
} from '../../data/githubYoutubeCoursesCatalog';
import {
  EDUCATIONAL_YOUTUBE_CHANNELS,
  EDUCATIONAL_YOUTUBE_CHANNEL_LANGUAGES,
} from '../../data/educationalYouTubeChannelsData';
import { CourseThumbnail } from '../common/CourseThumbnail';
import { CourseEnrollmentModal } from '../common/CourseEnrollmentModal';
import { VideoPlayerModal } from '../common/VideoPlayerModal';
import type { ExtendedYouTubeVideo } from '../../services/youtubeVideoService';
import { formatInr } from '../../utils/pricingEngine';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';

export interface GitHubYouTubeCourseHubProps {
  /** Combined total displayed in header (15,521 OpenFrame + 7,008 GitHub YouTube = 22,529+) */
  combinedTotalCourses?: number;
  /** Optional initial search term synced from parent page */
  initialQuery?: string;
  /** Compact homepage mode vs full marketplace mode */
  mode?: 'homepage' | 'marketplace';
  /** Optional callback when a learner picks a channel to filter the wider marketplace */
  onSelectChannelForMarketplace?: (channelName: string, category: string) => void;
}

const POST_ENROLLMENT_STEPS = [
  { num: '01', label: 'Watch Lessons', icon: Play, desc: 'Curated YouTube modules' },
  { num: '02', label: 'Quiz', icon: HelpCircle, desc: 'Auto-graded assessment' },
  { num: '03', label: 'Projects', icon: Layers, desc: 'Hands-on skill builds' },
  { num: '04', label: 'Submission', icon: Upload, desc: 'Portfolio & URL review' },
  { num: '05', label: 'Score & Certification', icon: Award, desc: 'OpenFrame QR certificate' },
];

function mapCourseToVideo(course: MarketplaceCourse): ExtendedYouTubeVideo {
  const vidId = course.youtubeVideoId || 'JMUxmLyrhSk';
  const thumb = course.thumbnailUrl || course.imageUrl || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
  return {
    id: course.id,
    videoId: vidId,
    youtubeId: vidId,
    youtubeUrl: course.youtubeUrl || `https://www.youtube.com/watch?v=${vidId}`,
    title: course.title,
    channelTitle: course.youtubeChannelName || course.instructorName || 'OpenFrame YouTube Faculty',
    thumbnail: thumb,
    thumbnailUrl: thumb,
    duration: course.duration || '6h 30m',
    level: course.level === 'Advanced' ? 'Advanced' : course.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
    difficultyLevel: course.level === 'Advanced' ? 'Advanced' : course.level === 'Intermediate' ? 'Intermediate' : 'Beginner',
    subjectCategory: course.category,
    recommendedReason: course.shortDesc,
    rationale: course.shortDesc,
    embedUrl: `https://www.youtube-nocookie.com/embed/${vidId}`,
    keyTopicsCovered: course.skillsAcquired || [course.category],
  };
}

export const GitHubYouTubeCourseHub: React.FC<GitHubYouTubeCourseHubProps> = ({
  combinedTotalCourses = 22529,
  initialQuery = '',
  mode = 'marketplace',
  onSelectChannelForMarketplace,
}) => {
  const interestStats = useMemo(() => getGitHubInterestCategoryStats(), []);

  const [selectedInterest, setSelectedInterest] = useState<string>('All');
  const [selectedTier, setSelectedTier] = useState<'All' | 'Basics' | 'Intermediate' | 'Advanced'>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [localSearch, setLocalSearch] = useState<string>(initialQuery);
  const [page, setPage] = useState<number>(1);
  const [showChannelsPanel, setShowChannelsPanel] = useState<boolean>(false);

  const { currentUser } = useAuth();
  const [enrollCourse, setEnrollCourse] = useState<MarketplaceCourse | null>(null);
  const [paidCourseIds, setPaidCourseIds] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<ExtendedYouTubeVideo | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<ExtendedYouTubeVideo[]>([]);
  const [isVideoOpen, setIsVideoOpen] = useState<boolean>(false);
  const [enrolledNotice, setEnrolledNotice] = useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    if (!currentUser?.uid) {
      setPaidCourseIds(new Set());
      return;
    }
    lmsService
      .getStudentEnrollments(currentUser.uid)
      .then((enrs) => {
        if (!active) return;
        const paidSet = new Set(
          enrs.filter((e) => lmsService.isVerifiedPaidEnrollment(e)).map((e) => e.courseId.toLowerCase())
        );
        setPaidCourseIds(paidSet);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentUser?.uid]);

  const pageSize = mode === 'homepage' ? 9 : 12;

  const result = useMemo(
    () =>
      queryGitHubYouTubeCourses({
        category: selectedInterest,
        tier: selectedTier,
        language: selectedLanguage,
        channel: selectedChannel,
        query: localSearch,
        page,
        pageSize,
      }),
    [selectedInterest, selectedTier, selectedLanguage, selectedChannel, localSearch, page, pageSize]
  );

  const matchingChannels = useMemo(() => {
    const q = localSearch.trim().toLowerCase();
    return EDUCATIONAL_YOUTUBE_CHANNELS.filter((ch) => {
      if (selectedInterest !== 'All' && ch.category !== selectedInterest) return false;
      if (selectedLanguage !== 'All' && !ch.language.toLowerCase().includes(selectedLanguage.toLowerCase())) return false;
      if (q && !`${ch.name} ${ch.category} ${ch.language}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => b.subscriberCount - a.subscriberCount);
  }, [selectedInterest, selectedLanguage, localSearch]);

  const handleSelectInterest = (cat: string) => {
    setSelectedInterest(cat);
    setSelectedChannel('');
    setPage(1);
  };

  const handleWatchCourse = (course: MarketplaceCourse) => {
    const mapped = mapCourseToVideo(course);
    const playlist = result.courses.map(mapCourseToVideo);
    setActiveVideo(mapped);
    setVideoPlaylist(playlist.length > 0 ? playlist : [mapped]);
    setIsVideoOpen(true);
  };

  return (
    <div id="github-youtube-courses" className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6">
      {/* Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#123D32]">
            <Tv className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Certified Skill Development Courses by OpenFrame</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="tabular-nums text-slate-600">
              {GITHUB_YOUTUBE_COURSE_COUNT.toLocaleString()} GitHub YouTube Courses + 15,521 OpenFrame Courses ={' '}
              <strong className="text-slate-900">{combinedTotalCourses.toLocaleString()}+ Total</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 tracking-tight text-balance">
            7,008 YouTube Courses Indexed by OpenFrame Across 190 Educational Channels
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Pick your area of interest below to browse YouTube-style certified courses with thumbnails, on-site playback, and one-click enrollment. Pricing runs from <strong className="text-slate-900 tabular-nums">Basics ₹300</strong> to <strong className="text-slate-900 tabular-nums">Advanced ₹2,500</strong> — every enrolled track unlocks Quiz, Projects, Submission, Live Score, and OpenFrame Certification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowChannelsPanel((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              showChannelsPanel
                ? 'bg-[#123D32] text-white border-[#123D32]'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {showChannelsPanel
              ? 'Hide 190 Channels Directory'
              : `Browse 190 GitHub Channels (${matchingChannels.length})`}
          </button>
          {mode === 'homepage' && (
            <Link
              to="/marketplace?collection=github_youtube_7008"
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Open Full 22,529+ Catalog
            </Link>
          )}
        </div>
      </div>

      {/* Post-Enrollment 5-Stage Certified Pipeline Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#F8FAFC] border border-slate-200/80 rounded-xl p-3.5">
        {POST_ENROLLMENT_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.num} className="flex items-start gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#123D32] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {step.num}. {step.label}
                </div>
                <div className="text-[11px] text-slate-500 truncate">{step.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {enrolledNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{enrolledNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setEnrolledNotice(null)}
            className="text-emerald-700 hover:underline font-semibold shrink-0 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Interest Category Selector (All 14 GitHub Educational Channel Categories) */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-800">
            Choose Your Interest Category
          </span>
          <span className="text-slate-500 tabular-nums">
            Showing {result.courses.length} of {result.total.toLocaleString()} YouTube courses
            {selectedInterest !== 'All' ? ` · ${selectedInterest}` : ''}
            {selectedChannel ? ` · Channel: ${selectedChannel}` : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleSelectInterest('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              selectedInterest === 'All'
                ? 'bg-[#0B1930] text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Interests ({GITHUB_YOUTUBE_COURSE_COUNT.toLocaleString()})
          </button>
          {interestStats.map((stat) => {
            const active = selectedInterest === stat.category;
            return (
              <button
                key={stat.category}
                type="button"
                onClick={() => handleSelectInterest(stat.category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  active
                    ? 'bg-[#123D32] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {stat.category} ({stat.courseCount.toLocaleString()})
              </button>
            );
          })}
        </div>
      </div>

      {/* Pricing Tier (Basics ₹300 → Advanced ₹2,500) + Language + Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
          {(
            [
              { id: 'All', label: 'All Tiers (₹300–₹2,500)' },
              { id: 'Basics', label: 'Basics · ₹300' },
              { id: 'Intermediate', label: 'Intermediate · ₹950–₹1,450' },
              { id: 'Advanced', label: 'Advanced · ₹2,500' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setSelectedTier(t.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                selectedTier === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1 md:justify-end">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search Python, AI, Physics, NetworkChuck..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedLanguage}
            onChange={(e) => {
              setSelectedLanguage(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by channel language"
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Languages</option>
            {EDUCATIONAL_YOUTUBE_CHANNEL_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {(selectedChannel || localSearch || selectedInterest !== 'All' || selectedTier !== 'All' || selectedLanguage !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSelectedInterest('All');
                setSelectedTier('All');
                setSelectedLanguage('All');
                setSelectedChannel('');
                setLocalSearch('');
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Optional Expandable 190 GitHub Channels Directory */}
      {showChannelsPanel && (
        <div className="border-t border-b border-slate-200 py-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-900">
              190 Verified Educational YouTube Channels (GitHub Directory)
            </span>
            <span className="text-slate-500 tabular-nums">
              Click any channel to filter its indexed OpenFrame certified courses
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {matchingChannels.map((ch) => {
              const isSelected = selectedChannel.toLowerCase() === ch.name.toLowerCase();
              return (
                <div
                  key={ch.id}
                  className={`p-3 rounded-xl border transition-colors flex flex-col justify-between gap-2 ${
                    isSelected
                      ? 'border-[#123D32] bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">{ch.name}</div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5 tabular-nums">
                      {ch.category} · {ch.subscribers} · {ch.language}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChannel(isSelected ? '' : ch.name);
                        setPage(1);
                        if (!isSelected && onSelectChannelForMarketplace) {
                          onSelectChannelForMarketplace(ch.name, ch.category);
                        }
                      }}
                      className="font-semibold text-[#123D32] hover:underline cursor-pointer whitespace-nowrap"
                    >
                      {isSelected ? 'Clear Filter' : 'View Courses'}
                    </button>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <a
                      href={ch.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 whitespace-nowrap"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* YouTube-Style Course Grid */}
      {result.courses.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
          <div className="text-sm font-bold text-slate-800">No YouTube courses match that filter</div>
          <p className="text-xs text-slate-500">
            Clear your search or switch to All Interests to browse all 7,008 indexed courses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.courses.map((course) => {
            const tierLabel =
              course.price <= 300
                ? 'Basics'
                : course.price >= 2500
                ? 'Advanced'
                : 'Intermediate';
            return (
              <article
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-400 transition-colors flex flex-col justify-between group"
              >
                <div>
                  {/* 16:9 YouTube-Style Thumbnail with Play Overlay & Duration */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <CourseThumbnail
                      src={course.thumbnailUrl || course.imageUrl}
                      alt={course.title}
                      category={course.category}
                      categoryGroup={course.categoryGroup}
                      youtubeVideoId={course.youtubeVideoId}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <button
                      type="button"
                      onClick={() => handleWatchCourse(course)}
                      aria-label={`Watch ${course.title}`}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    >
                      <span className="w-11 h-11 rounded-full bg-black/70 group-hover:bg-rose-600 text-white flex items-center justify-center transition-colors">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </button>
                    <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium">
                      <span className="truncate font-mono text-slate-200">{course.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] tabular-nums shrink-0">
                        {course.duration}
                      </span>
                    </div>
                  </div>

                  {/* Clean Metadata & Title (Zero-Pill Discipline) */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="truncate font-semibold text-[#123D32]">
                        {course.category}
                      </span>
                      <span className="shrink-0 tabular-nums font-bold text-slate-900">
                        {tierLabel} · {formatInr(course.price)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                      <Link to={`/marketplace/${course.id}`}>{course.title}</Link>
                    </h3>

                    <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500">
                      {course.youtubeChannelUrl ? (
                        <a
                          href={course.youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-slate-700 hover:text-rose-700 hover:underline truncate max-w-[160px]"
                        >
                          {course.youtubeChannelName}
                        </a>
                      ) : (
                        <span className="font-semibold text-slate-700 truncate">
                          {course.youtubeChannelName}
                        </span>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{course.language || 'English'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-0.5 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                      Includes Quiz · Projects · Submission · Score · OpenFrame Certificate
                    </div>
                  </div>
                </div>

                {/* Action Bar: Pay First -> Open Learning Workspace */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleWatchCourse(course)}
                    className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Preview</span>
                  </button>

                  {paidCourseIds.has(course.id.toLowerCase()) ? (
                    <>
                      <Link
                        to={`/learn/${encodeURIComponent(course.id)}`}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Open Learning Workspace</span>
                      </Link>
                      <Link
                        to="/student/dashboard"
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <span>My Learning</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setEnrollCourse(course)}
                        className="flex-1 py-2 px-3 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Pay {formatInr(course.price)} First</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEnrollCourse(course)}
                        className="py-2 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                        title="Pay first to unlock Quiz, Projects, Submission & Certification Workspace"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                        <span>Workspace</span>
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {result.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="text-slate-600 tabular-nums">
            Page <strong className="text-slate-900">{result.page}</strong> of{' '}
            <strong className="text-slate-900">{result.totalPages.toLocaleString()}</strong>{' '}
            · {result.total.toLocaleString()} indexed YouTube courses
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              disabled={page >= result.totalPages}
              onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg bg-[#0B1930] hover:bg-slate-800 text-white font-semibold inline-flex items-center gap-1 cursor-pointer disabled:opacity-40 whitespace-nowrap"
            >
              <span>Next Page</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Enrollment Modal (Pay First via Razorpay -> Auto-Redirect to Open Learning Workspace) */}
      <CourseEnrollmentModal
        isOpen={Boolean(enrollCourse)}
        onClose={() => setEnrollCourse(null)}
        course={enrollCourse}
        onEnrolled={(enr) => {
          const title = enrollCourse?.title || 'course';
          if (enr?.courseId) {
            setPaidCourseIds((prev) => new Set([...Array.from(prev), enr.courseId.toLowerCase()]));
          }
          setEnrollCourse(null);
          setEnrolledNotice(
            `Payment verified for "${title}"! Redirecting to Open Learning Workspace (Modules, Quiz, Projects, Score & OpenFrame Certificate).`
          );
        }}
      />

      {/* On-Site YouTube Video Player Modal */}
      <VideoPlayerModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        video={activeVideo}
        playlist={videoPlaylist}
        onSelectVideo={(vid) => setActiveVideo(vid)}
        onApplyForCourse={() => {
          const matched = result.courses.find((c) => c.id === activeVideo?.id) || result.courses[0];
          setIsVideoOpen(false);
          if (matched) setEnrollCourse(matched);
        }}
      />
    </div>
  );
};
