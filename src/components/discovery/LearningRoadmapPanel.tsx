import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Youtube,
  Bookmark,
  ExternalLink,
  ArrowRight,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { VisualLearningRoadmap, MarketplaceCourse, YouTubeVideoRecommendation } from '../../types';
import { lmsService } from '../../services/lmsService';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import { compute90PercentCoursePricing, formatInr } from '../../utils/pricingEngine';

interface LearningRoadmapPanelProps {
  roadmap: VisualLearningRoadmap | null;
  availableCourses?: MarketplaceCourse[];
  onEnrollCourse?: (course: MarketplaceCourse) => void;
  onWatchVideo?: (video: YouTubeVideoRecommendation) => void;
}

export const LearningRoadmapPanel: React.FC<LearningRoadmapPanelProps> = ({
  roadmap,
  availableCourses = [],
  onEnrollCourse,
  onWatchVideo,
}) => {
  const { currentUser } = useAuth();
  const { navigate } = useRouter();
  const [completedStages, setCompletedStages] = useState<Record<number, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!roadmap) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <Layers className="w-8 h-8 text-[#123D32] mx-auto mb-3" />
        <h3 className="font-editorial text-2xl font-bold text-[#18221F] mb-2">
          Search any topic or skill to generate your 8-Stage Roadmap
        </h3>
        <p className="text-sm text-slate-600 max-w-lg mx-auto">
          Quinn AI builds a visual step-by-step progression with durations, milestones, matched OpenFrame courses, and external YouTube video lectures.
        </p>
      </div>
    );
  }

  const toggleStage = (stageNum: number) => {
    setCompletedStages((prev) => ({
      ...prev,
      [stageNum]: !prev[stageNum],
    }));
  };

  const completedCount = roadmap.stages.filter((s) => completedStages[s.stageNumber]).length;
  const progressPct = roadmap.stages.length > 0 ? Math.round((completedCount / roadmap.stages.length) * 100) : 0;

  const handleSaveRoadmap = async () => {
    setSaving(true);
    setSavedNotice(null);
    try {
      await lmsService.saveAiLearningPath({
        id: roadmap.id,
        topic: roadmap.topic,
        language: 'English',
        title: `${roadmap.topic} — 8-Stage Interactive Roadmap`,
        overview: `${roadmap.targetOutcome} (${roadmap.totalEstimatedDuration})`,
        aiDisclaimer: roadmap.nonDegreeDisclaimer,
        sourceMode: roadmap.generatedBy === 'gemini' ? 'gemini' : 'structured_fallback',
        createdByUid: currentUser?.uid,
        approvedByAdmin: false,
        modules: roadmap.stages.map((st) => ({
          moduleNumber: st.stageNumber,
          level: st.stageNumber <= 3 ? 'Beginner' : st.stageNumber <= 6 ? 'Intermediate' : 'Advanced',
          title: st.title,
          objectives: st.topics,
          summary: `${st.focusSummary} (${st.estimatedDuration})`,
          practiceExercises: [st.milestoneAssignment],
          videoIds: st.youtubeResources.map((v) => v.videoId).filter(Boolean),
        })),
        createdAt: roadmap.createdAt || new Date().toISOString(),
      });

      await lmsService.logDiscoveryAnalyticsEvent({
        userId: currentUser?.uid,
        eventType: 'roadmap_save',
        query: roadmap.topic,
        degreeOrClass: roadmap.educationContext,
        subject: roadmap.topic,
      });

      setSavedNotice('Roadmap saved to your Learning Profile & AI Library.');
    } catch {
      setSavedNotice('Unable to persist roadmap right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#123D32] mb-1.5">
              Interactive 8-Stage Learning Roadmap
            </p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#18221F] tracking-tight">
              {roadmap.topic} Mastery Track
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">{roadmap.targetOutcome}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500 mt-3">
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-[#123D32]" /> {roadmap.totalEstimatedDuration}
              </span>
              {roadmap.educationContext && <span>Context: {roadmap.educationContext}</span>}
              <span className="tabular-nums">
                Progress: {completedCount} / {roadmap.stages.length} stages ({progressPct}%)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveRoadmap}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#123D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0D2E25] transition-colors whitespace-nowrap disabled:opacity-60"
            >
              <Bookmark className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Roadmap to Profile'}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 h-2 bg-[#F5F5F2] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#123D32] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {savedNotice && (
          <div className="mt-4 px-4 py-2.5 bg-[#FAF7F2] border border-[#123D32]/20 rounded-xl text-xs font-medium text-[#123D32]">
            {savedNotice}
          </div>
        )}

        <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-[#FAF7F2] border border-slate-200 rounded-xl text-xs text-slate-600">
          <AlertCircle className="w-4 h-4 text-[#14213D] shrink-0 mt-0.5" />
          <span>{roadmap.nonDegreeDisclaimer}</span>
        </div>
      </div>

      {/* 8-Stage Timeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {roadmap.stages.map((stage) => {
          const isDone = Boolean(completedStages[stage.stageNumber]);
          const matchedCourses = stage.recommendedCourseIds
            .map((cid) => availableCourses.find((c) => c.id === cid))
            .filter((c): c is MarketplaceCourse => Boolean(c));

          return (
            <div
              key={stage.stageNumber}
              className={`bg-white border rounded-2xl p-6 transition-all ${
                isDone ? 'border-[#123D32] bg-[#FAF7F2]/60' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32] tabular-nums">
                    Stage {stage.stageNumber} · {stage.estimatedDuration}
                  </p>
                  <h3 className="font-heading text-lg font-bold text-[#18221F] mt-1">
                    {stage.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStage(stage.stageNumber)}
                  aria-label={`Mark stage ${stage.stageNumber} complete`}
                  className="text-slate-400 hover:text-[#123D32] transition-colors shrink-0 mt-0.5"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-[#123D32]" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-600 mt-2">{stage.focusSummary}</p>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-700">
                <div>
                  <span className="font-semibold text-[#18221F]">Focus Topics: </span>
                  {stage.topics.join(' · ')}
                </div>
                <div>
                  <span className="font-semibold text-[#18221F]">Milestone: </span>
                  {stage.milestoneAssignment}
                </div>
              </div>

              {/* Linked OpenFrame Courses */}
              {matchedCourses.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    OpenFrame Course Modules
                  </p>
                  {matchedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between gap-2 p-2.5 bg-[#FAF7F2] border border-slate-200 rounded-xl"
                    >
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/marketplace/${encodeURIComponent(course.id)}`)}
                          className="text-xs font-semibold text-[#18221F] hover:text-[#2563EB] truncate block text-left"
                        >
                          {course.title}
                        </button>
                        {(() => {
                          const p = compute90PercentCoursePricing({
                            category: course.category,
                            title: course.title,
                            level: course.level,
                            educationLevels: course.educationLevels,
                            existingPrice: course.price,
                          });
                          return (
                            <p className="text-[11px] text-slate-500 tabular-nums">
                              <span className="font-semibold text-[#18221F]">{formatInr(p.finalPriceInr)}</span>{' '}
                              <span className="line-through text-slate-400">{formatInr(p.marketBenchmarkPriceInr)}</span> · 90% Off · {course.duration}
                            </p>
                          );
                        })()}
                      </div>
                      {onEnrollCourse && (
                        <button
                          type="button"
                          onClick={() => onEnrollCourse(course)}
                          className="px-3 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Linked External YouTube Lecture */}
              {stage.youtubeResources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    External YouTube Lecture
                  </p>
                  {stage.youtubeResources.slice(0, 1).map((vid) => (
                    <div
                      key={vid.videoId}
                      className="flex items-center justify-between gap-2 p-2.5 bg-white border border-slate-200 rounded-xl"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Youtube className="w-4 h-4 text-red-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#18221F] truncate">{vid.title}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {vid.channelTitle} · {vid.duration}
                          </p>
                        </div>
                      </div>
                      {onWatchVideo ? (
                        <button
                          type="button"
                          onClick={() => onWatchVideo(vid)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 text-xs font-semibold text-[#18221F] rounded-lg hover:border-[#123D32] whitespace-nowrap shrink-0"
                        >
                          Watch <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <a
                          href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-300 text-xs font-semibold text-[#18221F] rounded-lg hover:border-[#123D32] whitespace-nowrap shrink-0"
                        >
                          Watch <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
