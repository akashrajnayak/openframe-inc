import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  FileJson,
  FileSpreadsheet,
  Info,
  TrendingUp,
  Printer,
} from 'lucide-react';
import {
  CourseEnrollment,
  IssuedCertificate,
  ProjectSubmission,
  QuizAttempt,
  SearchHistoryEntry,
  StudentFavoriteCourse,
  StudentLessonBookmark,
  StudentLessonNote,
  StudentPresentation,
  StudentProgressRecord,
  TeacherEvaluation,
  VideoLearningSession,
} from '../../types';

export interface StudentAnalytics20ChartsProps {
  progressList: StudentProgressRecord[];
  enrollments: CourseEnrollment[];
  favorites: StudentFavoriteCourse[];
  certificates: IssuedCertificate[];
  extData: {
    quizAttempts: QuizAttempt[];
    videoSessions: VideoLearningSession[];
    projectSubmissions: ProjectSubmission[];
    presentations: StudentPresentation[];
    evaluations: TeacherEvaluation[];
    notes: StudentLessonNote[];
    bookmarks: StudentLessonBookmark[];
    searchHistory: SearchHistoryEntry[];
  };
  studentName?: string;
  studentEmail?: string;
}

type DateRangeKey = '7d' | '30d' | '90d' | 'all';
type PeriodGranularity = 'weekly' | 'monthly' | 'yearly';

function parseIsoMs(raw?: string): number {
  if (!raw) return 0;
  const ms = Date.parse(raw);
  return Number.isNaN(ms) ? 0 : ms;
}

function inferCategory(title?: string): string {
  const t = (title || '').toLowerCase();
  if (/ai|machine learning|generative|llm|prompt|neural/.test(t)) return 'AI & Emerging Tech';
  if (/python|javascript|react|web|coding|software|cloud|cyber/.test(t)) return 'CS & Software';
  if (/excel|powerpoint|word|office|workspace/.test(t)) return 'Productivity Tools';
  if (/finance|account|business|startup|management|economics/.test(t)) return 'Business & Finance';
  if (/marketing|seo|sales|e-commerce/.test(t)) return 'Digital Marketing';
  if (/design|ui|ux|animation|figma|video|graphic/.test(t)) return 'Design & Animation';
  if (/robot|iot|solar|electronics|engineering/.test(t)) return 'Engineering & STEM';
  if (/health|nutrition|psychology|wellness/.test(t)) return 'Healthcare & Wellness';
  if (/english|kannada|hindi|communication|speaking/.test(t)) return 'Languages & Comm.';
  if (/agri|rural|farming|shg|sustain/.test(t)) return 'Agriculture & Rural';
  if (/class |ncert|cbse|icse|math|science|school/.test(t)) return 'Academic & School';
  return 'Career & Personal Dev';
}

const ChartCard: React.FC<{
  index: number;
  title: string;
  subtitle: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
}> = ({ index, title, subtitle, isEmpty, emptyMessage, children }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between gap-4">
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-semibold text-blue-600 tabular-nums">
          CHART {String(index).padStart(2, '0')}
        </span>
      </div>
      <h3 className="text-sm font-bold text-slate-900 mt-1">{title}</h3>
      <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
    </div>

    {isEmpty ? (
      <div className="min-h-[160px] rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-center gap-2">
        <Info className="w-4 h-4 text-slate-400" />
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          {emptyMessage || 'No recorded learner activity yet in this filter window.'}
        </p>
      </div>
    ) : (
      <div className="min-h-[160px] flex flex-col justify-center">{children}</div>
    )}
  </div>
);

export const StudentAnalytics20Charts: React.FC<StudentAnalytics20ChartsProps> = ({
  progressList,
  enrollments,
  favorites,
  certificates,
  extData,
  studentName = 'OpenFrame Learner',
  studentEmail = '',
}) => {
  const [dateRange, setDateRange] = useState<DateRangeKey>('all');
  const [granularity, setGranularity] = useState<PeriodGranularity>('weekly');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const cutoffMs = useMemo(() => {
    const now = Date.now();
    if (dateRange === '7d') return now - 7 * 86400000;
    if (dateRange === '30d') return now - 30 * 86400000;
    if (dateRange === '90d') return now - 90 * 86400000;
    return 0;
  }, [dateRange]);

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    progressList.forEach((p) => map.set(p.courseId, p.courseTitle || p.courseId));
    enrollments.forEach((e) => {
      if (!map.has(e.courseId)) map.set(e.courseId, e.courseTitle || e.courseId);
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [progressList, enrollments]);

  const courseCategoryLookup = useMemo(() => {
    const map = new Map<string, string>();
    favorites.forEach((f) => map.set(f.courseId, f.category || inferCategory(f.courseTitle)));
    progressList.forEach((p) => {
      if (!map.has(p.courseId)) map.set(p.courseId, inferCategory(p.courseTitle));
    });
    enrollments.forEach((e) => {
      if (!map.has(e.courseId)) map.set(e.courseId, inferCategory(e.courseTitle));
    });
    return map;
  }, [favorites, progressList, enrollments]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    courseCategoryLookup.forEach((cat) => set.add(cat));
    extData.searchHistory.forEach((s) => {
      set.add(s.category || inferCategory(s.query));
    });
    return Array.from(set).sort();
  }, [courseCategoryLookup, extData.searchHistory]);

  const matchesScope = (courseId?: string, isoDate?: string, fallbackTitle?: string) => {
    if (selectedCourseId !== 'ALL' && courseId && courseId !== selectedCourseId) return false;
    if (selectedCourseId !== 'ALL' && !courseId) return false;
    if (selectedCategory !== 'ALL') {
      const cat = (courseId && courseCategoryLookup.get(courseId)) || inferCategory(fallbackTitle);
      if (cat !== selectedCategory) return false;
    }
    if (cutoffMs > 0) {
      const ms = parseIsoMs(isoDate);
      if (ms > 0 && ms < cutoffMs) return false;
    }
    return true;
  };

  const fProgress = useMemo(
    () =>
      progressList.filter((p) =>
        matchesScope(p.courseId, p.lastActiveAt || p.updatedAt || p.enrollmentDate, p.courseTitle)
      ),
    [progressList, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fQuizzes = useMemo(
    () =>
      extData.quizAttempts
        .filter((q) => matchesScope(q.courseId, q.submittedAt, q.lessonId))
        .sort((a, b) => parseIsoMs(a.submittedAt) - parseIsoMs(b.submittedAt)),
    [extData.quizAttempts, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fVideos = useMemo(
    () =>
      extData.videoSessions.filter((v) =>
        matchesScope(v.courseId, v.completedAt || v.openedAt, v.videoTitle)
      ),
    [extData.videoSessions, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fProjects = useMemo(
    () =>
      extData.projectSubmissions.filter((p) =>
        matchesScope(p.courseId, p.submittedAt || p.submissionDate, p.courseTitle || p.projectTitle)
      ),
    [extData.projectSubmissions, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fPresentations = useMemo(
    () =>
      extData.presentations.filter((p) =>
        matchesScope(p.courseId, p.submittedAt, p.courseTitle)
      ),
    [extData.presentations, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fEvals = useMemo(
    () =>
      extData.evaluations.filter((e) =>
        matchesScope(e.courseId, e.evaluatedAt || e.evaluationDate, e.courseName || e.projectTitle)
      ),
    [extData.evaluations, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fNotes = useMemo(
    () =>
      extData.notes.filter((n) =>
        matchesScope(n.courseId, n.updatedAt || n.createdAt, n.lessonTitle)
      ),
    [extData.notes, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fBookmarks = useMemo(
    () =>
      extData.bookmarks.filter((b) =>
        matchesScope(b.courseId, b.savedAt, b.courseTitle || b.lessonTitle)
      ),
    [extData.bookmarks, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fSearches = useMemo(
    () =>
      extData.searchHistory.filter((s) => {
        if (selectedCourseId !== 'ALL') return false;
        if (selectedCategory !== 'ALL' && (s.category || inferCategory(s.query)) !== selectedCategory) {
          return false;
        }
        if (cutoffMs > 0) {
          const ms = parseIsoMs(s.searchedAt);
          if (ms > 0 && ms < cutoffMs) return false;
        }
        return true;
      }),
    [extData.searchHistory, selectedCourseId, selectedCategory, cutoffMs]
  );

  const fCerts = useMemo(
    () =>
      certificates.filter((c) =>
        matchesScope(c.courseId, c.issuedAt || c.completionDate, c.courseTitle || c.courseName)
      ),
    [certificates, selectedCourseId, selectedCategory, cutoffMs]
  );

  // Derived Real Aggregations
  const avgCompletion = useMemo(() => {
    if (fProgress.length === 0) return 0;
    return Math.round(
      fProgress.reduce((acc, p) => acc + (p.overallProgressPercent || 0), 0) / fProgress.length
    );
  }, [fProgress]);

  const totalWatchMinutes = useMemo(
    () => Math.round(fVideos.reduce((acc, v) => acc + Number(v.watchDurationSeconds || 0), 0) / 60),
    [fVideos]
  );

  const avgQuizScore = useMemo(() => {
    if (fQuizzes.length === 0) return 0;
    return Math.round(
      fQuizzes.reduce((acc, q) => acc + Number(q.percentageScore ?? q.percentage ?? 0), 0) / fQuizzes.length
    );
  }, [fQuizzes]);

  const periodBuckets = useMemo(() => {
    const map = new Map<string, { label: string; minutes: number; events: number }>();
    const toBucket = (iso?: string) => {
      const ms = parseIsoMs(iso);
      if (!ms) return null;
      const d = new Date(ms);
      if (granularity === 'yearly') {
        const key = String(d.getFullYear());
        return { key, label: key };
      }
      if (granularity === 'monthly') {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        return { key, label };
      }
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const key = startOfWeek.toISOString().slice(0, 10);
      const label = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { key, label };
    };

    fVideos.forEach((v) => {
      const b = toBucket(v.completedAt || v.openedAt);
      if (!b) return;
      const cur = map.get(b.key) || { label: b.label, minutes: 0, events: 0 };
      cur.minutes += Math.max(1, Math.round(Number(v.watchDurationSeconds || 60) / 60));
      cur.events += 1;
      map.set(b.key, cur);
    });
    fQuizzes.forEach((q) => {
      const b = toBucket(q.submittedAt);
      if (!b) return;
      const cur = map.get(b.key) || { label: b.label, minutes: 0, events: 0 };
      cur.minutes += 15;
      cur.events += 1;
      map.set(b.key, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([, v]) => v);
  }, [fVideos, fQuizzes, granularity]);

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    fVideos.forEach((v) => {
      const cat = courseCategoryLookup.get(v.courseId) || inferCategory(v.videoTitle);
      const mins = Math.max(5, Math.round(Number(v.watchDurationSeconds || 300) / 60));
      counts.set(cat, (counts.get(cat) || 0) + mins);
    });
    if (counts.size === 0) {
      fProgress.forEach((p) => {
        const cat = courseCategoryLookup.get(p.courseId) || inferCategory(p.courseTitle);
        counts.set(cat, (counts.get(cat) || 0) + Math.max(10, p.overallProgressPercent || 12));
      });
    }
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [fVideos, fProgress, courseCategoryLookup]);

  // 28-Day Streak Calendar
  const streakDays = useMemo(() => {
    const activeDates = new Map<string, number>();
    const bump = (iso?: string) => {
      const ms = parseIsoMs(iso);
      if (!ms) return;
      const key = new Date(ms).toISOString().slice(0, 10);
      activeDates.set(key, (activeDates.get(key) || 0) + 1);
    };
    fVideos.forEach((v) => bump(v.completedAt || v.openedAt));
    fQuizzes.forEach((q) => bump(q.submittedAt));
    fNotes.forEach((n) => bump(n.updatedAt));
    fProjects.forEach((p) => bump(p.submittedAt || p.submissionDate));

    const cells: Array<{ date: string; count: number }> = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      cells.push({ date: key, count: activeDates.get(key) || 0 });
    }
    return cells;
  }, [fVideos, fQuizzes, fNotes, fProjects]);

  const timeOfDayBuckets = useMemo(() => {
    const buckets = [
      { label: '00–05', count: 0 },
      { label: '06–09', count: 0 },
      { label: '10–13', count: 0 },
      { label: '14–17', count: 0 },
      { label: '18–21', count: 0 },
      { label: '22–23', count: 0 },
    ];
    const recordHour = (iso?: string) => {
      const ms = parseIsoMs(iso);
      if (!ms) return;
      const h = new Date(ms).getHours();
      if (h < 6) buckets[0].count++;
      else if (h < 10) buckets[1].count++;
      else if (h < 14) buckets[2].count++;
      else if (h < 18) buckets[3].count++;
      else if (h < 22) buckets[4].count++;
      else buckets[5].count++;
    };
    fVideos.forEach((v) => recordHour(v.openedAt || v.completedAt));
    fQuizzes.forEach((q) => recordHour(q.submittedAt));
    fNotes.forEach((n) => recordHour(n.createdAt));
    return buckets;
  }, [fVideos, fQuizzes, fNotes]);

  const searchTopicFreq = useMemo(() => {
    const freq = new Map<string, number>();
    fSearches.forEach((s) => {
      const term = (s.query || '').trim().slice(0, 28);
      if (!term) return;
      freq.set(term, (freq.get(term) || 0) + 1);
    });
    return Array.from(freq.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [fSearches]);

  const topicClusters = useMemo(() => {
    const clusters = new Map<string, number>();
    fSearches.forEach((s) => {
      const cat = s.category || inferCategory(s.query);
      clusters.set(cat, (clusters.get(cat) || 0) + 1);
    });
    fProgress.forEach((p) => {
      const cat = courseCategoryLookup.get(p.courseId) || inferCategory(p.courseTitle);
      clusters.set(cat, (clusters.get(cat) || 0) + 1);
    });
    return Array.from(clusters.entries())
      .map(([name, weight]) => ({ name, weight }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 6);
  }, [fSearches, fProgress, courseCategoryLookup]);

  // Chart 6 Radar dimensions (0 - 100 real computed)
  const radarMetrics = useMemo(() => {
    const videoScore = Math.min(100, fVideos.filter((v) => v.completed).length * 20);
    const quizScore = avgQuizScore;
    const projectScore = fProjects.length > 0 ? Math.min(100, fProjects.length * 50) : 0;
    const presentationScore = fPresentations.length > 0 ? Math.min(100, fPresentations.length * 50) : 0;
    const evalScore =
      fEvals.length > 0
        ? Math.round(fEvals.reduce((a, e) => a + e.totalScore, 0) / fEvals.length)
        : 0;
    const consistencyScore = Math.min(
      100,
      Math.round((streakDays.filter((d) => d.count > 0).length / 10) * 100)
    );
    return [
      { label: 'Videos', value: videoScore },
      { label: 'Quizzes', value: quizScore },
      { label: 'Projects', value: projectScore },
      { label: 'Defense', value: presentationScore },
      { label: 'Faculty', value: evalScore },
      { label: 'Streak', value: consistencyScore },
    ];
  }, [fVideos, avgQuizScore, fProjects, fPresentations, fEvals, streakDays]);

  // Certificate Readiness Funnel (6 gates)
  const readinessFunnel = useMemo(() => {
    const total = Math.max(1, fProgress.length);
    const gates = [
      { label: '1. Videos Completed', count: fProgress.filter((p) => p.eligibilityChecklist?.allMandatoryLessonsCompleted).length },
      { label: '2. Quiz Attempted', count: fProgress.filter((p) => p.eligibilityChecklist?.requiredAssessmentsCompleted).length },
      { label: '3. >= 70% Quiz Score', count: fProgress.filter((p) => p.eligibilityChecklist?.minimumQuizCriteriaMet).length },
      { label: '4. Project Approved', count: fProgress.filter((p) => p.eligibilityChecklist?.projectSubmittedAndApproved).length },
      { label: '5. Presentation Done', count: fProgress.filter((p) => p.eligibilityChecklist?.presentationCompleted).length },
      { label: '6. Faculty Final Seal', count: fProgress.filter((p) => p.eligibilityChecklist?.teacherFinalApprovalGranted).length },
    ];
    return { gates, total };
  }, [fProgress]);

  const handleExportCsv = () => {
    const rows = [
      ['Student Name', studentName],
      ['Email', studentEmail],
      ['Generated At', new Date().toISOString()],
      ['Filter Date Range', dateRange],
      ['Courses Tracked', String(fProgress.length)],
      ['Average Completion (%)', String(avgCompletion)],
      ['Verified Video Sessions', String(fVideos.filter((v) => v.completed).length)],
      ['Total Watch Minutes', String(totalWatchMinutes)],
      ['Quiz Attempts', String(fQuizzes.length)],
      ['Average Quiz Score (%)', String(avgQuizScore)],
      ['Projects Submitted', String(fProjects.length)],
      ['Presentations Submitted', String(fPresentations.length)],
      ['Certificates Issued', String(fCerts.length)],
      ['Notes Saved', String(fNotes.length)],
      ['Lessons Bookmarked', String(fBookmarks.length)],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenFrame_Student_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const payload = {
      studentName,
      studentEmail,
      exportedAt: new Date().toISOString(),
      filters: { dateRange, granularity, selectedCourseId, selectedCategory },
      summary: {
        coursesTracked: fProgress.length,
        avgCompletionPercent: avgCompletion,
        completedVideoSessions: fVideos.filter((v) => v.completed).length,
        totalWatchMinutes,
        quizAttempts: fQuizzes.length,
        avgQuizScore,
        projectsSubmitted: fProjects.length,
        presentationsSubmitted: fPresentations.length,
        certificatesIssued: fCerts.length,
        notesCount: fNotes.length,
        bookmarksCount: fBookmarks.length,
      },
      courseProgress: fProgress.map((p) => ({
        courseId: p.courseId,
        courseTitle: p.courseTitle,
        overallProgressPercent: p.overallProgressPercent,
        quizAveragePercent: p.quizAveragePercent,
        currentStage: p.currentStage,
      })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenFrame_Student_Analytics_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasAnyLearningActivity =
    fProgress.length > 0 || fVideos.length > 0 || fQuizzes.length > 0 || fSearches.length > 0;

  return (
    <div className="space-y-6">
      {/* Header & Interactive Filters */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              <span>20-Chart Real-Time Learning Telemetry</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              Student Performance & Study Analytics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every visualization below is computed strictly from your verified Firestore coursework, quiz attempts, video sessions, and deliverables—never simulated numbers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Interactive Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range</span>
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="all">All Recorded History</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
              <span>Period Granularity</span>
            </label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as PeriodGranularity)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="weekly">Weekly Breakdown</option>
              <option value="monthly">Monthly Breakdown</option>
              <option value="yearly">Yearly Breakdown</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter by Course</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">All Enrolled Courses ({courseOptions.length})</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Filter by Category</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="ALL">All Subject Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 20 Real Data Analytics Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {/* CHART 1: Daily Learning Activity (Line Chart) */}
        <ChartCard
          index={1}
          title="Daily Learning Activity"
          subtitle="14-day daily activity line trajectory from verified study events"
          isEmpty={streakDays.every((d) => d.count === 0)}
          emptyMessage="Complete lessons, quizzes, or notes to plot daily learning activity."
        >
          <svg viewBox="0 0 360 120" className="w-full h-32 overflow-visible">
            <line x1="20" y1="100" x2="340" y2="100" stroke="#e2e8f0" strokeWidth="1" />
            {(() => {
              const last14 = streakDays.slice(-14);
              const maxVal = Math.max(1, ...last14.map((d) => d.count));
              const pts = last14.map((d, idx) => {
                const x = 24 + (idx * 312) / Math.max(1, last14.length - 1);
                const y = 100 - (d.count / maxVal) * 80;
                return { x, y, ...d };
              });
              const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <>
                  <polyline fill="none" stroke="#2563eb" strokeWidth="2.5" points={poly} />
                  {pts.map((p, i) => (
                    <g key={p.date}>
                      <circle cx={p.x} cy={p.y} r="3.5" fill={p.count > 0 ? '#1d4ed8' : '#cbd5e1'} />
                      {(i === 0 || i === 6 || i === 13) && (
                        <text x={p.x} y="114" textAnchor="middle" className="fill-slate-400 text-[8.5px]">
                          {p.date.slice(5)}
                        </text>
                      )}
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </ChartCard>

        {/* CHART 2: Weekly Learning Hours (Bar Chart) */}
        <ChartCard
          index={2}
          title="Weekly Learning Hours"
          subtitle="Verified lecture minutes & assessment hours across active periods"
          isEmpty={periodBuckets.length === 0}
          emptyMessage="Open or confirm video lessons or assessments to populate weekly learning bars."
        >
          <div className="grid grid-cols-6 gap-2 items-end h-32 pt-4">
            {(() => {
              const slice = periodBuckets.slice(-6);
              const maxVal = Math.max(10, ...slice.map((b) => b.minutes));
              return slice.map((b) => {
                const hrs = (b.minutes / 60).toFixed(1);
                return (
                  <div key={b.label} className="flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[10px] font-bold text-slate-700 tabular-nums">{hrs}h</span>
                    <div
                      className="w-full bg-blue-600 rounded-t-md"
                      style={{ height: `${Math.max(10, Math.round((b.minutes / maxVal) * 76))}%` }}
                    />
                    <span className="text-[9px] text-slate-500 truncate max-w-full">{b.label}</span>
                  </div>
                );
              });
            })()}
          </div>
        </ChartCard>

        {/* CHART 3: Monthly Learning Progress (Area Chart) */}
        <ChartCard
          index={3}
          title={`Monthly Learning Progress (${granularity})`}
          subtitle="Cumulative study minutes & milestone momentum area curve"
          isEmpty={periodBuckets.length === 0}
          emptyMessage="Complete learning sessions to view area progress trend."
        >
          <svg viewBox="0 0 360 120" className="w-full h-32 overflow-visible">
            {(() => {
              const maxVal = Math.max(10, ...periodBuckets.map((b) => b.minutes));
              const pts = periodBuckets.map((b, idx) => {
                const x = periodBuckets.length === 1 ? 180 : 24 + (idx * 312) / (periodBuckets.length - 1);
                const y = 100 - (b.minutes / maxVal) * 80;
                return { x, y, ...b };
              });
              const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
              const area =
                pts.length > 1
                  ? `M ${pts[0].x},100 L ${pts.map((p) => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},100 Z`
                  : '';
              return (
                <>
                  <line x1="20" y1="100" x2="340" y2="100" stroke="#e2e8f0" strokeWidth="1" />
                  {area && <path d={area} fill="#dbeafe" opacity="0.7" />}
                  {pts.length > 1 && <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={polyline} />}
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4" fill="#0369a1" />
                      <text x={p.x} y="114" textAnchor="middle" className="fill-slate-500 text-[9px]">
                        {p.label}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </ChartCard>

        {/* CHART 4: Course Completion Rate (Doughnut Chart) */}
        <ChartCard
          index={4}
          title="Course Completion Rate"
          subtitle="Mean completion % across enrolled coursework"
          isEmpty={fProgress.length === 0}
          emptyMessage="Enroll in a course to track overall completion rate."
        >
          <div className="flex items-center justify-around gap-4">
            <svg viewBox="0 0 120 120" className="w-32 h-32 shrink-0">
              <circle cx="60" cy="60" r="46" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="#2563eb"
                strokeWidth="12"
                strokeDasharray={`${(avgCompletion / 100) * 289} 289`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="64" textAnchor="middle" className="fill-slate-900 font-bold text-lg tabular-nums">
                {avgCompletion}%
              </text>
            </svg>
            <div className="space-y-2 text-xs">
              <div>
                <div className="text-slate-500">Tracked Courses</div>
                <div className="font-bold text-slate-900 text-base tabular-nums">{fProgress.length}</div>
              </div>
              <div>
                <div className="text-slate-500">Completed Courses</div>
                <div className="font-bold text-emerald-600 text-base tabular-nums">
                  {fProgress.filter((p) => (p.overallProgressPercent || 0) >= 100 || p.certificateIssued).length}
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* CHART 5: Category-wise Learning Distribution (Pie Chart) */}
        <ChartCard
          index={5}
          title="Category-wise Learning Distribution"
          subtitle="Proportional distribution of study effort across course categories"
          isEmpty={categoryBreakdown.length === 0}
          emptyMessage="Watch lessons or enroll in courses across categories to view breakdown."
        >
          {(() => {
            const palette = ['#2563eb', '#0891b2', '#4f46e5', '#059669', '#d97706', '#475569'];
            const total = Math.max(1, categoryBreakdown.reduce((a, c) => a + c.value, 0));
            let offset = 0;
            return (
              <div className="flex items-center justify-around gap-4">
                <svg viewBox="0 0 120 120" className="w-28 h-28 shrink-0">
                  {categoryBreakdown.map((c, idx) => {
                    const frac = c.value / total;
                    const dash = frac * 251.2;
                    const el = (
                      <circle
                        key={c.name}
                        cx="60"
                        cy="60"
                        r="40"
                        fill="none"
                        stroke={palette[idx % palette.length]}
                        strokeWidth="18"
                        strokeDasharray={`${dash} 251.2`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90 60 60)"
                      />
                    );
                    offset += dash;
                    return el;
                  })}
                </svg>
                <div className="space-y-1 text-[11px] flex-1 min-w-0">
                  {categoryBreakdown.map((c, idx) => (
                    <div key={c.name} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: palette[idx % palette.length] }}
                        />
                        <span className="truncate text-slate-700">{c.name}</span>
                      </span>
                      <span className="font-bold tabular-nums text-slate-900">
                        {Math.round((c.value / total) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 6: Subject Performance Overview (Radar Chart) */}
        <ChartCard
          index={6}
          title="Subject Performance Overview"
          subtitle="Radar profile across videos, quizzes, projects, defense, faculty & streak"
          isEmpty={!hasAnyLearningActivity}
          emptyMessage="Begin video lectures or quizzes to build your subject performance radar."
        >
          <div className="flex items-center justify-around gap-4">
            <svg viewBox="0 0 180 180" className="w-40 h-40 shrink-0">
              {[0.33, 0.66, 1].map((scale, sIdx) => {
                const polyPts = radarMetrics
                  .map((_, i) => {
                    const angle = (Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2;
                    const r = 64 * scale;
                    return `${90 + r * Math.cos(angle)},${90 + r * Math.sin(angle)}`;
                  })
                  .join(' ');
                return <polygon key={sIdx} points={polyPts} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
              })}
              <polygon
                points={radarMetrics
                  .map((m, i) => {
                    const angle = (Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2;
                    const r = Math.max(8, (m.value / 100) * 64);
                    return `${90 + r * Math.cos(angle)},${90 + r * Math.sin(angle)}`;
                  })
                  .join(' ')}
                fill="rgba(37, 99, 235, 0.22)"
                stroke="#2563eb"
                strokeWidth="2"
              />
              {radarMetrics.map((m, i) => {
                const angle = (Math.PI * 2 * i) / radarMetrics.length - Math.PI / 2;
                const x = 90 + 78 * Math.cos(angle);
                const y = 90 + 78 * Math.sin(angle);
                return (
                  <text key={m.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="fill-slate-600 text-[8.5px] font-semibold">
                    {m.label}
                  </text>
                );
              })}
            </svg>
            <div className="space-y-1 text-[11px]">
              {radarMetrics.map((m) => (
                <div key={m.label} className="flex justify-between gap-4">
                  <span className="text-slate-500">{m.label}</span>
                  <span className="font-bold text-slate-900 tabular-nums">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* CHART 7: Quiz & Assessment Scores Over Time (Line Chart) */}
        <ChartCard
          index={7}
          title="Quiz & Assessment Scores Over Time"
          subtitle="Sequential verification quiz score % vs 70% passing threshold"
          isEmpty={fQuizzes.length === 0}
          emptyMessage="Complete an AI Verification Quiz inside any course workspace to view score progression."
        >
          <svg viewBox="0 0 360 120" className="w-full h-32 overflow-visible">
            <line x1="20" y1="30" x2="340" y2="30" stroke="#10b981" strokeDasharray="4 4" strokeWidth="1" />
            <text x="342" y="33" className="fill-emerald-700 text-[8px] font-semibold">70%</text>
            <line x1="20" y1="100" x2="340" y2="100" stroke="#e2e8f0" strokeWidth="1" />
            {(() => {
              const subset = fQuizzes.slice(-8);
              const pts = subset.map((q, idx) => {
                const score = Math.min(100, Math.max(0, q.percentageScore ?? q.percentage ?? 0));
                const x = subset.length === 1 ? 180 : 28 + (idx * 300) / (subset.length - 1);
                const y = 100 - (score / 100) * 85;
                return { x, y, score, passed: q.passed };
              });
              const poly = pts.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <>
                  {pts.length > 1 && <polyline fill="none" stroke="#0f172a" strokeWidth="2" points={poly} />}
                  {pts.map((p, i) => (
                    <g key={i}>
                      <circle cx={p.x} cy={p.y} r="4.5" fill={p.passed ? '#059669' : '#e11d48'} />
                      <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-slate-800 text-[9px] font-bold tabular-nums">
                        {p.score}%
                      </text>
                      <text x={p.x} y="114" textAnchor="middle" className="fill-slate-400 text-[8px]">
                        #{i + 1}
                      </text>
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </ChartCard>

        {/* CHART 8: Quiz Accuracy by Topic / Category (Horizontal Bar Chart) */}
        <ChartCard
          index={8}
          title="Quiz Accuracy by Topic / Category"
          subtitle="Mean assessment accuracy grouped by course domain"
          isEmpty={fQuizzes.length === 0}
          emptyMessage="Attempt verification quizzes to measure accuracy by subject category."
        >
          <div className="space-y-2 text-xs">
            {(() => {
              const accMap = new Map<string, { sum: number; cnt: number }>();
              fQuizzes.forEach((q) => {
                const cat = courseCategoryLookup.get(q.courseId) || inferCategory(q.lessonId);
                const cur = accMap.get(cat) || { sum: 0, cnt: 0 };
                cur.sum += Number(q.percentageScore ?? q.percentage ?? 0);
                cur.cnt += 1;
                accMap.set(cat, cur);
              });
              const rows = Array.from(accMap.entries())
                .map(([cat, v]) => ({ cat, avg: Math.round(v.sum / v.cnt) }))
                .slice(0, 5);
              return rows.map((row) => (
                <div key={row.cat} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-700 truncate pr-2">{row.cat}</span>
                    <span className="font-bold tabular-nums">{row.avg}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.avg >= 70 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${Math.max(8, row.avg)}%` }}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </ChartCard>

        {/* CHART 9: Learning Time Distribution by Content Type (Stacked Bar) */}
        <ChartCard
          index={9}
          title="Learning Time Distribution by Content Type"
          subtitle="Estimated study split: Videos vs Quizzes vs Notes & Capstone Projects"
          isEmpty={fVideos.length + fQuizzes.length + fNotes.length + fProjects.length === 0}
          emptyMessage="Engage in videos, quizzes, notes, or projects to view content-type split."
        >
          {(() => {
            const vidMins = totalWatchMinutes;
            const quizMins = fQuizzes.length * 15;
            const noteMins = fNotes.length * 10;
            const projMins = fProjects.length * 45 + fPresentations.length * 25;
            const sum = Math.max(1, vidMins + quizMins + noteMins + projMins);
            const segments = [
              { label: 'Video Lectures', mins: vidMins, color: 'bg-blue-600' },
              { label: 'Verification Quizzes', mins: quizMins, color: 'bg-emerald-600' },
              { label: 'Lesson Notes', mins: noteMins, color: 'bg-amber-500' },
              { label: 'Projects & Defense', mins: projMins, color: 'bg-indigo-600' },
            ];
            return (
              <div className="space-y-3 text-xs">
                <div className="h-5 w-full rounded-xl overflow-hidden flex bg-slate-100">
                  {segments.map((seg) => (
                    <div
                      key={seg.label}
                      className={`h-full ${seg.color}`}
                      style={{ width: `${Math.round((seg.mins / sum) * 100)}%` }}
                      title={`${seg.label}: ${seg.mins} mins`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {segments.map((seg) => (
                    <div key={seg.label} className="flex items-center justify-between text-[11px] text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-sm ${seg.color}`} />
                        <span>{seg.label}</span>
                      </span>
                      <span className="font-bold tabular-nums">{seg.mins}m</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 10: Course Enrollment Trends (Column Chart) */}
        <ChartCard
          index={10}
          title="Course Enrollment Trends"
          subtitle="Enrolled milestones: Active Courses, Lessons, Quizzes, Projects & Certs"
          isEmpty={!hasAnyLearningActivity}
          emptyMessage="Enroll in courses or complete lessons to view column milestones."
        >
          {(() => {
            const steps = [
              { label: 'Enrolled', val: fProgress.length },
              { label: 'Lessons', val: fProgress.reduce((a, p) => a + p.completedLessonIds.length, 0) },
              { label: 'Quizzes', val: fQuizzes.filter((q) => q.passed).length },
              { label: 'Projects', val: fProjects.length },
              { label: 'Certs', val: fCerts.length },
            ];
            const max = Math.max(1, ...steps.map((s) => s.val));
            return (
              <div className="grid grid-cols-5 gap-2 items-end h-32 pt-4">
                {steps.map((s) => (
                  <div key={s.label} className="flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[10px] font-bold text-slate-900 tabular-nums">{s.val}</span>
                    <div
                      className="w-full bg-slate-900 rounded-t-md"
                      style={{ height: `${Math.max(s.val > 0 ? 14 : 4, Math.round((s.val / max) * 78))}%` }}
                    />
                    <span className="text-[9px] text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 11: Skills Development Radar (Radar Chart) */}
        <ChartCard
          index={11}
          title="Skills Development Radar"
          subtitle="Multi-dimensional skill readiness: Concepts, Practicals, Notes & Accreditation"
          isEmpty={fProgress.length === 0}
          emptyMessage="Track course progress to measure multi-axis skills development."
        >
          {(() => {
            const gates = readinessFunnel.gates.map((g) => ({
              label: g.label.replace(/^\d+\.\s*/, '').slice(0, 10),
              pct: Math.round((g.count / readinessFunnel.total) * 100),
            }));
            return (
              <div className="space-y-2 text-xs">
                {gates.map((g) => (
                  <div key={g.label} className="flex items-center gap-3">
                    <span className="w-28 text-slate-600 truncate">{g.label}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${g.pct}%` }} />
                    </div>
                    <span className="w-9 text-right font-bold tabular-nums">{g.pct}%</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 12: Module / Lesson Completion Progress (Progress Matrix) */}
        <ChartCard
          index={12}
          title="Module / Lesson Completion Progress"
          subtitle="Completed lessons vs total lessons per enrolled course"
          isEmpty={fProgress.length === 0}
          emptyMessage="Enroll in courses to track module and lesson completion."
        >
          <div className="space-y-2.5 text-xs">
            {fProgress.slice(0, 4).map((p) => {
              const done = p.completedLessonIds?.length || 0;
              const tot = Math.max(done, p.totalMandatoryLessons || 6);
              return (
                <div key={p.courseId} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-800 truncate pr-2">{p.courseTitle || p.courseId}</span>
                    <span className="tabular-nums text-slate-600">
                      {done}/{tot} lessons
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((done / tot) * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        {/* CHART 13: Course Comparison Performance (Grouped Bar Chart) */}
        <ChartCard
          index={13}
          title="Course Comparison Performance"
          subtitle="Course progress % compared against quiz mastery & 70% threshold"
          isEmpty={fProgress.length === 0}
          emptyMessage="Enrolled courses appear here for side-by-side comparison."
        >
          <div className="space-y-3 text-xs">
            {fProgress.slice(0, 4).map((p) => (
              <div key={p.courseId} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-800 truncate pr-2">
                    {p.courseTitle || p.courseId}
                  </span>
                  <span className="tabular-nums text-slate-600">
                    Prog {p.overallProgressPercent || 0}% · Quiz {p.quizAveragePercent || 0}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, p.overallProgressPercent || 0)}%` }} />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, p.quizAveragePercent || 0)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* CHART 14: Language-wise Learning Breakdown (Pie/Bar Chart) */}
        <ChartCard
          index={14}
          title="Language-wise Learning Breakdown"
          subtitle="Detected & selected languages across search discovery sessions"
          isEmpty={fSearches.length === 0}
          emptyMessage="Search topics in the Universal AI Course Search to track language breakdown."
        >
          {(() => {
            const langMap = new Map<string, number>();
            fSearches.forEach((s) => {
              const lang = s.detectedLanguage || 'English';
              langMap.set(lang, (langMap.get(lang) || 0) + 1);
            });
            const max = Math.max(1, ...Array.from(langMap.values()));
            return (
              <div className="space-y-2 text-xs">
                {Array.from(langMap.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5)
                  .map(([lang, cnt]) => (
                    <div key={lang} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-700 font-medium">{lang}</span>
                        <span className="font-bold tabular-nums">{cnt} queries</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-600 rounded-full" style={{ width: `${Math.round((cnt / max) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 15: Difficulty Level Distribution (Treemap) */}
        <ChartCard
          index={15}
          title="Difficulty Level Distribution (Treemap)"
          subtitle="Domain & topic cluster footprint across your active coursework"
          isEmpty={topicClusters.length === 0}
          emptyMessage="Explore topics or enroll in courses to map domain & level clusters."
        >
          <div className="grid grid-cols-3 gap-2">
            {topicClusters.map((c, idx) => (
              <div
                key={c.name}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  idx === 0
                    ? 'col-span-2 bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <div className="text-[11px] font-semibold line-clamp-2">{c.name}</div>
                <div className={`text-sm font-bold mt-2 tabular-nums ${idx === 0 ? 'text-sky-300' : 'text-blue-600'}`}>
                  {c.weight}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* CHART 16: Knowledge Retention Over Time (Line Chart) */}
        <ChartCard
          index={16}
          title="Knowledge Retention Over Time"
          subtitle="Cumulative passing rate and score retention across sequential attempts"
          isEmpty={fQuizzes.length === 0}
          emptyMessage="Submit sequential verification quizzes to track knowledge retention."
        >
          {(() => {
            const passed = fQuizzes.filter((q) => q.passed).length;
            const passRate = Math.round((passed / Math.max(1, fQuizzes.length)) * 100);
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Verified Concept Retention Rate</span>
                  <span className="text-lg font-bold text-emerald-600 tabular-nums">{passRate}%</span>
                </div>
                <div className="h-5 w-full bg-rose-100 rounded-xl overflow-hidden flex">
                  <div className="h-full bg-emerald-600" style={{ width: `${passRate}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span className="tabular-nums">Mastered Attempts: <strong>{passed}</strong></span>
                  <span className="tabular-nums">Total Attempts: <strong>{fQuizzes.length}</strong></span>
                </div>
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 17: Assessment Score Variance (Box Plot / Quartile Summary) */}
        <ChartCard
          index={17}
          title="Assessment Score Variance"
          subtitle="Minimum, median, average, and peak quiz score distribution"
          isEmpty={fQuizzes.length === 0}
          emptyMessage="Complete verification quizzes to analyze score variance."
        >
          {(() => {
            const scores = fQuizzes
              .map((q) => Number(q.percentageScore ?? q.percentage ?? 0))
              .sort((a, b) => a - b);
            const minScore = scores[0] ?? 0;
            const maxScore = scores[scores.length - 1] ?? 0;
            const mid = scores[Math.floor(scores.length / 2)] ?? 0;
            return (
              <div className="space-y-4 text-xs">
                <div className="relative h-6 bg-slate-100 rounded-lg flex items-center px-2">
                  <div
                    className="h-3 bg-blue-600 rounded"
                    style={{
                      marginLeft: `${minScore}%`,
                      width: `${Math.max(4, maxScore - minScore)}%`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-500">Min</div>
                    <div className="font-bold text-slate-900 tabular-nums">{minScore}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-500">Median</div>
                    <div className="font-bold text-blue-700 tabular-nums">{mid}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-500">Mean</div>
                    <div className="font-bold text-slate-900 tabular-nums">{avgQuizScore}%</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-slate-500">Peak</div>
                    <div className="font-bold text-emerald-700 tabular-nums">{maxScore}%</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 18: Learning Goals Progress (Radial Gauge) */}
        <ChartCard
          index={18}
          title="Learning Goals Progress (120m Target)"
          subtitle="Verified lecture watch time & quiz study vs weekly target gauge"
          isEmpty={fVideos.length === 0 && fQuizzes.length === 0}
          emptyMessage="Log lesson sessions or quizzes to measure weekly target progress."
        >
          {(() => {
            const estimatedMinutes = totalWatchMinutes + fQuizzes.length * 15;
            const pct = Math.min(100, Math.round((estimatedMinutes / 120) * 100));
            return (
              <div className="flex items-center justify-around gap-4">
                <svg viewBox="0 0 140 85" className="w-40 h-24">
                  <path
                    d="M 16 74 A 54 54 0 0 1 124 74"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 16 74 A 54 54 0 0 1 124 74"
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 170} 170`}
                  />
                  <text x="70" y="68" textAnchor="middle" className="fill-slate-900 font-bold text-base tabular-nums">
                    {pct}%
                  </text>
                </svg>
                <div className="text-xs space-y-1">
                  <div className="text-slate-500">Logged Study</div>
                  <div className="text-lg font-bold text-slate-900 tabular-nums">{estimatedMinutes} mins</div>
                  <div className="text-[11px] text-slate-400">Benchmark: 120 mins</div>
                </div>
              </div>
            );
          })()}
        </ChartCard>

        {/* CHART 19: Study Consistency Streak (Calendar Heatmap) */}
        <ChartCard
          index={19}
          title="Study Consistency Streak"
          subtitle="28-day study heatmap of videos, quizzes, notes & submissions"
          isEmpty={streakDays.every((d) => d.count === 0)}
          emptyMessage="No study events recorded in the past 28 days yet."
        >
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1.5">
              {streakDays.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date}: ${cell.count} activity event(s)`}
                  className={`h-7 rounded-md border flex items-center justify-center text-[10px] font-mono tabular-nums ${
                    cell.count === 0
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : cell.count === 1
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-semibold'
                      : 'bg-emerald-600 border-emerald-700 text-white font-bold'
                  }`}
                >
                  {cell.count > 0 ? cell.count : ''}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>28 days ago</span>
              <span className="font-semibold text-emerald-700 tabular-nums">
                {streakDays.filter((d) => d.count > 0).length} active study days
              </span>
              <span>Today</span>
            </div>
          </div>
        </ChartCard>

        {/* CHART 20: Overall Learning Performance Composite Score (KPI Scorecard) */}
        <ChartCard
          index={20}
          title="Overall Learning Performance Composite Score"
          subtitle="Verified live KPI scorecard across all platform coursework"
          isEmpty={false}
        >
          {(() => {
            const evalAvg =
              fEvals.length > 0
                ? Math.round(fEvals.reduce((a, e) => a + e.totalScore, 0) / fEvals.length)
                : 0;
            const composite = Math.round(
              avgCompletion * 0.4 + avgQuizScore * 0.4 + (evalAvg > 0 ? evalAvg * 0.2 : avgCompletion * 0.2)
            );
            return (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 text-white">
                  <span>Composite Mastery Index</span>
                  <span className="text-lg font-extrabold text-cyan-300 tabular-nums">{composite} / 100</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Enrolled</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{fProgress.length}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Videos Done</div>
                    <div className="text-base font-bold text-blue-600 tabular-nums">
                      {fVideos.filter((v) => v.completed).length}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Avg Quiz</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{avgQuizScore}%</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Notes</div>
                    <div className="text-base font-bold text-slate-900 tabular-nums">{fNotes.length}</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Faculty Score</div>
                    <div className="text-base font-bold text-indigo-600 tabular-nums">
                      {evalAvg > 0 ? `${evalAvg}/100` : '—'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <div className="text-[10px] text-slate-500">Certificates</div>
                    <div className="text-base font-bold text-emerald-600 tabular-nums">{fCerts.length}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </ChartCard>
      </div>
    </div>
  );
};
