import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Tv,
  ListVideo,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { ExtendedYouTubeVideo, MASTER_YOUTUBE_LIBRARY } from '../../services/youtubeVideoService';
import { CourseThumbnail } from './CourseThumbnail';
import { useRouter } from '../../router/RouterContext';
import { cacheYouTubeCourse } from '../../services/marketplaceService';
import { compute90PercentCoursePricing } from '../../utils/pricingEngine';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: ExtendedYouTubeVideo | null;
  playlist?: ExtendedYouTubeVideo[];
  onSelectVideo?: (video: ExtendedYouTubeVideo) => void;
  onApplyForCourse?: (courseTitle: string, category: string) => void;
  onOpenQuinnAI?: (prompt: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  video,
  playlist = [],
  onSelectVideo,
  onApplyForCourse,
  onOpenQuinnAI
}) => {
  const { navigate } = useRouter();
  const [currentVideo, setCurrentVideo] = useState<ExtendedYouTubeVideo | null>(video);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (video) {
      setCurrentVideo(video);
    }
  }, [video]);

  if (!isOpen || !currentVideo) return null;

  const currentYoutubeId = currentVideo.youtubeId || currentVideo.videoId || 'JMUxmLyrhSk';
  const embedUrl = currentVideo.embedUrl?.includes('videoseries?list=')
    ? `${currentVideo.embedUrl}${currentVideo.embedUrl.includes('?') ? '&' : '?'}autoplay=1&rel=0&modestbranding=1`
    : `https://www.youtube-nocookie.com/embed/${currentYoutubeId}?autoplay=1&rel=0&modestbranding=1`;

  // Merge provided playlist with curated master list for rich exploration
  const activePlaylist = playlist.length > 0 ? playlist : MASTER_YOUTUBE_LIBRARY.slice(0, 10);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const navigateToCourseWorkspace = (withEnroll: boolean) => {
    const knownCatalogId =
      currentVideo.id && /^(?:OF-|github-yt-|ai-path-|disc-|yt-)/i.test(currentVideo.id)
        ? currentVideo.id
        : `yt-${currentYoutubeId}`;
    const priced = compute90PercentCoursePricing({
      category: currentVideo.subjectCategory || 'Digital Skills & Productivity',
      title: currentVideo.title,
      level: currentVideo.level || 'Beginner',
    });
    const thumb =
      currentVideo.thumbnailUrl ||
      currentVideo.thumbnail ||
      `https://i.ytimg.com/vi/${currentYoutubeId}/hqdefault.jpg`;
    cacheYouTubeCourse({
      id: knownCatalogId,
      title: currentVideo.title,
      category: currentVideo.subjectCategory || 'Digital Skills & Productivity',
      categories: [currentVideo.subjectCategory || 'Digital Skills & Productivity'],
      categoryGroup: 'Technology',
      subcategory: currentVideo.subjectCategory || 'Video Course',
      level: (currentVideo.level as any) || 'Beginner',
      duration: currentVideo.duration || 'Self-Paced',
      estimatedHours: 4,
      pricingTier: priced.pricingTier,
      price: priced.finalPriceInr,
      marketBenchmarkPrice: priced.marketBenchmarkPrice,
      discountPercent: priced.discountPercent,
      isFree: false,
      status: 'Published',
      courseType: 'youtube_video',
      contentType: 'Full course',
      instructorName: currentVideo.channelTitle || 'YouTube Educator',
      youtubeChannelName: currentVideo.channelTitle || 'YouTube Educator',
      youtubeVideoId: currentYoutubeId,
      youtubeUrl: `https://www.youtube.com/watch?v=${currentYoutubeId}`,
      language: 'English',
      rating: 4.8,
      enrolledCount: 1200,
      certificateEligibility: true,
      thumbnailUrl: thumb,
      imageUrl: thumb,
      shortDesc: currentVideo.recommendedReason || currentVideo.rationale || `Structured certified course for ${currentVideo.title}.`,
      description: currentVideo.recommendedReason || currentVideo.rationale || `Structured certified course for ${currentVideo.title}.`,
      learningObjectives: currentVideo.keyTopicsCovered || ['Watch guided video lessons', 'Complete verification quiz', 'Submit practical project'],
      targetAudience: 'Students, professionals, and self-paced learners',
      skillsAcquired: currentVideo.keyTopicsCovered || ['Applied Mastery'],
      practicalProjects: [`Capstone Project: ${currentVideo.title}`],
      assessmentMethod: 'Verification Quiz + Project Submission + Score & Certification',
      certificateNote: 'Eligible for OpenFrame QR-verified certificate upon completion.',
      updatedAt: new Date().toISOString(),
      modules: [
        {
          moduleNumber: 1,
          title: currentVideo.title,
          duration: currentVideo.duration || '2 Hours',
          lessons: currentVideo.keyTopicsCovered || ['Core Video Lecture', 'Practical Application', 'Verification Assessment'],
          videoIds: [currentYoutubeId],
        },
      ],
      recommendedVideos: [
        {
          id: knownCatalogId,
          videoId: currentYoutubeId,
          youtubeId: currentYoutubeId,
          youtubeUrl: `https://www.youtube.com/watch?v=${currentYoutubeId}`,
          title: currentVideo.title,
          channelTitle: currentVideo.channelTitle || 'YouTube Educator',
          thumbnail: thumb,
          thumbnailUrl: thumb,
          duration: currentVideo.duration || 'Tutorial',
          level: (currentVideo.level as any) || 'Beginner',
          recommendedReason: currentVideo.recommendedReason || currentVideo.rationale || 'Primary course video lesson.',
          embedUrl: `https://www.youtube-nocookie.com/embed/${currentYoutubeId}`,
        },
      ],
    });
    onClose();
    navigate(`/learn/${encodeURIComponent(knownCatalogId)}${withEnroll ? '?enroll=1&autoplay=1' : '?autoplay=1'}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-red-600/90 text-white flex items-center justify-center shadow">
              <Tv className="w-4 h-4" />
            </div>
            <div className="truncate text-left">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center space-x-1.5">
                <span>OpenFrame Video Hub</span>
                <span>•</span>
                <span>Play on Site</span>
                <span>•</span>
                <span className="text-slate-400">{currentVideo.subjectCategory}</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
                {currentVideo.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                showPlaylistDrawer ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Toggle Playlist"
            >
              <ListVideo className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lectures ({activePlaylist.length})</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Share Link"
            >
              {copyFeedback ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Grid: Player + Sidebar Playlist */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-900">
          {/* Video Player Column */}
          <div className={`${showPlaylistDrawer ? 'lg:col-span-8' : 'lg:col-span-12'} flex flex-col overflow-y-auto`}>
            {/* 16:9 Responsive Player */}
            <div className="relative w-full aspect-video bg-black shrink-0">
              <iframe
                src={embedUrl}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>

            {/* Video Details & Meta */}
            <div className="p-4 sm:p-6 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <h1 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {currentVideo.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-xs text-slate-400 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                      {currentVideo.channelTitle}
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{currentVideo.duration}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px]">
                      {currentVideo.level || 'All Levels'}
                    </span>
                  </div>
                </div>

                {/* Primary Actions: Organize with Quinn AI & Direct Enroll Now */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateToCourseWorkspace(false)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Organize with Quinn AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onApplyForCourse) {
                        onApplyForCourse(currentVideo.title, currentVideo.subjectCategory);
                      } else {
                        navigateToCourseWorkspace(true);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Enroll Now &middot; Pay via Razorpay</span>
                  </button>
                </div>
              </div>

              {/* Rationale & Educational Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Academic Curriculum Insight</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {currentVideo.recommendedReason || currentVideo.rationale}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs space-y-1.5">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                    <Layers className="w-3 h-3" />
                    <span>Key Topics Covered</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {(currentVideo.keyTopicsCovered || ['Theory', 'Implementation', 'Case Study', 'Projects']).map((topic, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-700/80 text-slate-200 text-[10px]">
                        • {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 90%-Off OpenFrame Grant & Certification Notice */}
              <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-200">
                <div className="space-y-0.5">
                  <div className="font-semibold text-white text-xs">90% OpenFrame Grant · Verified Certificate Track (₹300–₹2,500)</div>
                  <div className="text-[11px] text-blue-300">
                    Enroll to complete structured modules inside OpenFrame, pass the verification test (&ge;70%), verify your certificate address, and earn your QR-verified certificate.
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateToCourseWorkspace(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    Open Modules &amp; Quiz
                  </button>
                  {onApplyForCourse && (
                    <button
                      onClick={() => onApplyForCourse(currentVideo.title, currentVideo.subjectCategory)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      Enroll &amp; Certify
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Sidebar */}
          {showPlaylistDrawer && (
            <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col bg-slate-950/80 overflow-hidden">
              <div className="p-3.5 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300 font-semibold">
                <div className="flex items-center space-x-2">
                  <ListVideo className="w-4 h-4 text-cyan-400" />
                  <span>Curated Lecture Playlist</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
                  {activePlaylist.length} Lectures
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activePlaylist.map((item, idx) => {
                  const isSelected = item.videoId === currentVideo.videoId || item.youtubeId === currentVideo.youtubeId;
                  return (
                    <div
                      key={item.id || idx}
                      onClick={() => {
                        setCurrentVideo(item);
                        if (onSelectVideo) onSelectVideo(item);
                      }}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 text-left ${
                        isSelected
                          ? 'bg-blue-950/70 border-blue-500/80 ring-1 ring-blue-500/50 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      {/* Thumbnail with overlay play icon */}
                      <div className="relative w-24 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-800">
                        <CourseThumbnail
                          src={item.thumbnail || item.thumbnailUrl}
                          alt={item.title}
                          category={item.subjectCategory}
                          youtubeVideoId={item.videoId || item.youtubeId}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-cyan-400 text-slate-950' : 'bg-white/80 text-slate-900'}`}>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded text-[9px] font-mono bg-black/80 text-white">
                          {item.duration}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-[10px] font-semibold text-cyan-400 truncate">
                          {item.channelTitle}
                        </div>
                        <div className={`text-xs font-semibold line-clamp-2 leading-snug ${isSelected ? 'text-white font-bold' : 'text-slate-300'}`}>
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                          <span>{item.subjectCategory}</span>
                          <span>•</span>
                          <span>{item.level || 'Beginner'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
