import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Video,
  HelpCircle,
  FileCheck,
  Upload,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Download,
  ExternalLink,
  TrendingUp,
  Bell,
  Check,
  Heart,
  Trash2,
  Play,
  ListVideo,
  Compass,
  Clock,
  Bookmark,
  History,
  FileText,
  BarChart3,
  Settings,
  Send,
  RefreshCw,
  Plus,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db, stripUndefinedDeep } from '../services/firebase';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { lmsService } from '../services/lmsService';
import { quinnAiService } from '../services/quinnAiService';
import { marketplaceService } from '../services/marketplaceService';
import { getSchoolEnrollment } from '../services/schoolService';
import { SCHOOL_BOARDS, SCHOOL_CLASSES } from '../data/schoolCurriculumData';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { StudentAnalytics20Charts } from '../components/student/StudentAnalytics20Charts';
import {
  UNIVERSAL_12_CATEGORIES,
  SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES,
  clearRecentSearches,
} from '../utils/searchIntelligence';
import {
  LearningStage,
  StudentProgressRecord,
  QuinnPerformanceAnalysis,
  IssuedCertificate,
  LmsNotification,
  MarketplaceCourse,
  StudentFavoriteCourse,
  SchoolStudentEnrollment,
  CourseEnrollment,
  QuizAttempt,
  VideoLearningSession,
  ProjectSubmission,
  StudentPresentation,
  TeacherEvaluation,
  StudentLessonNote,
  StudentLessonBookmark,
  SearchHistoryEntry,
} from '../types';

type DashboardModuleId =
  | 'overview'
  | 'courses'
  | 'learning'
  | 'continue'
  | 'completed'
  | 'saved'
  | 'history'
  | 'recommended'
  | 'certificates'
  | 'assessments'
  | 'assignments'
  | 'notes'
  | 'tutor'
  | 'analytics'
  | 'notifications'
  | 'settings';

const DASHBOARD_MODULES: Array<{ id: DashboardModuleId; label: string; icon: any }> = [
  { id: 'overview', label: '1. Overview & 8-Stage Tracker', icon: Compass },
  { id: 'courses', label: '2. My Courses', icon: BookOpen },
  { id: 'learning', label: '3. My Learning', icon: Play },
  { id: 'continue', label: '4. Continue Learning', icon: Clock },
  { id: 'completed', label: '5. Completed Courses', icon: CheckCircle2 },
  { id: 'saved', label: '6. Saved Lessons & Favorites', icon: Bookmark },
  { id: 'history', label: '7. Learning History', icon: History },
  { id: 'recommended', label: '8. Recommended For You', icon: Sparkles },
  { id: 'certificates', label: '9. My Certificates', icon: Award },
  { id: 'assessments', label: '10. My Assessments', icon: HelpCircle },
  { id: 'assignments', label: '11. My Assignments & Defense', icon: FileCheck },
  { id: 'notes', label: '12. My Notes', icon: FileText },
  { id: 'tutor', label: '13. Quinn AI Tutor', icon: MessageSquare },
  { id: 'analytics', label: '14. Learning Analytics (20 Charts)', icon: BarChart3 },
  { id: 'notifications', label: '15. Notifications', icon: Bell },
  { id: 'settings', label: '16. Account & Privacy Settings', icon: Settings },
];

const STAGES: Array<{ id: LearningStage; label: string; number: number; icon: any }> = [
  { id: 'COURSE_ENROLLMENT', label: 'Course Enrollment', number: 1, icon: BookOpen },
  { id: 'VIDEO_LEARNING', label: 'Video Lectures', number: 2, icon: Video },
  { id: 'QUIZ_COMPLETION', label: 'AI Verification Quiz', number: 3, icon: HelpCircle },
  { id: 'PROJECT_ASSIGNMENT', label: 'Project Assigned', number: 4, icon: FileCheck },
  { id: 'PROJECT_SUBMISSION', label: 'Project Submission', number: 5, icon: Upload },
  { id: 'PRESENTATION', label: 'Presentation Defense', number: 6, icon: Video },
  { id: 'TEACHER_EVALUATION', label: 'Teacher Evaluation', number: 7, icon: Star },
  { id: 'CERTIFICATE', label: 'Accredited Certificate', number: 8, icon: Award },
];

const PERSONALIZATION_KEY = 'openframe_personalization_enabled_v1';

export const StudentDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, lmsUser, studentProfile, loading: authLoading } = useAuth();

  const [activeModule, setActiveModule] = useState<DashboardModuleId>('overview');
  const [progressList, setProgressList] = useState<StudentProgressRecord[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [activeCourseDetail, setActiveCourseDetail] = useState<MarketplaceCourse | null>(null);
  const [performance, setPerformance] = useState<QuinnPerformanceAnalysis | null>(null);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [notifications, setNotifications] = useState<LmsNotification[]>([]);
  const [favorites, setFavorites] = useState<StudentFavoriteCourse[]>([]);
  const [recommendedCatalog, setRecommendedCatalog] = useState<MarketplaceCourse[]>([]);
  const [liveTotalCourses, setLiveTotalCourses] = useState<number>(15500);
  const [schoolEnrollment, setSchoolEnrollment] = useState<SchoolStudentEnrollment | null>(null);

  const [extData, setExtData] = useState<{
    quizAttempts: QuizAttempt[];
    videoSessions: VideoLearningSession[];
    projectSubmissions: ProjectSubmission[];
    presentations: StudentPresentation[];
    evaluations: TeacherEvaluation[];
    notes: StudentLessonNote[];
    bookmarks: StudentLessonBookmark[];
    searchHistory: SearchHistoryEntry[];
  }>({
    quizAttempts: [],
    videoSessions: [],
    projectSubmissions: [],
    presentations: [],
    evaluations: [],
    notes: [],
    bookmarks: [],
    searchHistory: [],
  });

  const [loading, setLoading] = useState(true);

  // Module 8 Personalization State
  const [personalizationEnabled, setPersonalizationEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_KEY);
      return raw === null ? true : raw === 'true';
    } catch {
      return true;
    }
  });

  // Module 12 My Notes CRUD State
  const [noteCourseId, setNoteCourseId] = useState('GENERAL');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Module 13 Inline Quinn AI Tutor State
  const [tutorLang, setTutorLang] = useState('English');
  const [tutorInput, setTutorInput] = useState('');
  const [tutorBusy, setTutorBusy] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'Hello! I am Quinn AI, your academic study partner. Ask me to explain concepts, summarize lessons, quiz you, or help structure practical project milestones.',
    },
  ]);

  // Module 16 Account Preferences State
  const [prefLang, setPrefLang] = useState('English');
  const [prefCategories, setPrefCategories] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSavedMsg, setPrefsSavedMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadDashboard() {
      setLoading(true);
      const [allProg, enrs, certs, notifs, favs, stats, schEnr, ext, recRes] = await Promise.all([
        lmsService.getAllStudentProgress(currentUser!.uid),
        lmsService.getStudentEnrollments(currentUser!.uid),
        lmsService.getCertificatesForStudent(currentUser!.uid),
        lmsService.getNotifications(currentUser!.uid, currentUser!.email || undefined),
        marketplaceService.getStudentFavorites(currentUser!.uid),
        marketplaceService.getLiveMarketplaceCounters().catch(() => null),
        getSchoolEnrollment(currentUser!.uid).catch(() => null),
        lmsService.getStudentExtendedAnalyticsData(currentUser!.uid),
        marketplaceService.filterCourses({ tab: 'recommended', page: 1, pageSize: 12 }).catch(() => ({ courses: [] })),
      ]);

      if (!active) return;
      setProgressList(allProg);
      setEnrollments(enrs);
      setCertificates(certs);
      setNotifications(notifs);
      setFavorites(favs);
      setSchoolEnrollment(schEnr);
      setExtData(ext);
      setRecommendedCatalog(recRes.courses || []);

      if (stats?.totalCoursesAvailable) {
        setLiveTotalCourses(stats.totalCoursesAvailable);
      }
      if (allProg.length > 0) {
        setSelectedCourseId(allProg[0].courseId);
        setNoteCourseId(allProg[0].courseId);
      }
      setLoading(false);
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, authLoading]);

  const activeProgress = progressList.find((p) => p.courseId === selectedCourseId) || progressList[0] || null;

  useEffect(() => {
    if (!activeProgress || !currentUser) return;
    let active = true;

    async function hydrateActiveCourse() {
      const course = await marketplaceService.getCourseById(activeProgress!.courseId);
      if (active) setActiveCourseDetail(course);

      const qAttempts = await lmsService.getQuizAttempts(currentUser!.uid, activeProgress!.courseId);
      const perf = await quinnAiService.analyzePerformance({
        quizAttempts: qAttempts,
        completedLessons: activeProgress!.completedLessonIds.length,
        totalLessons: Math.max(1, activeProgress!.totalMandatoryLessons || 3),
        courseTitle: course?.title || activeProgress!.courseTitle || activeProgress!.courseId,
        evaluation: activeProgress!.teacherEvaluation
          ? {
              scores: activeProgress!.teacherEvaluation.rubricScores,
              totalScore: activeProgress!.teacherEvaluation.totalScore,
            }
          : undefined,
      });
      if (active) setPerformance(perf);
    }

    hydrateActiveCourse();
    return () => {
      active = false;
    };
  }, [activeProgress?.courseId, currentUser?.uid]);

  const continueCourses = useMemo(
    () =>
      [...progressList]
        .filter((p) => (p.overallProgressPercent || 0) < 100 && !p.certificateIssued)
        .sort((a, b) => (b.lastActiveAt || b.updatedAt || '').localeCompare(a.lastActiveAt || a.updatedAt || '')),
    [progressList]
  );

  const completedCourses = useMemo(
    () =>
      progressList.filter(
        (p) => (p.overallProgressPercent || 0) >= 100 || p.certificateIssued || p.completedStages.includes('CERTIFICATE')
      ),
    [progressList]
  );

  // Personalized recommendations with explainable rationale
  const personalizedRecommendations = useMemo(() => {
    const recentTopic = extData.searchHistory[0]?.query;
    const activeTopic = progressList[0]?.courseTitle;
    return recommendedCatalog.slice(0, 6).map((course, idx) => {
      let reason = 'Popular peer-verified certification track on OpenFrame';
      if (personalizationEnabled) {
        if (prefCategories.length > 0 && idx < 2) {
          reason = `Recommended based on your selected interest: ${prefCategories[idx % prefCategories.length]}`;
        } else if (recentTopic && idx % 2 === 0) {
          reason = `Related to your recent learning search: "${recentTopic}"`;
        } else if (activeTopic) {
          reason = `Complements your active study in "${activeTopic}"`;
        }
      }
      return { course, reason };
    });
  }, [recommendedCatalog, personalizationEnabled, prefCategories, extData.searchHistory, progressList]);

  const handleMarkNotifRead = async (id: string) => {
    await lmsService.markNotificationAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleRemoveFavorite = async (courseId: string) => {
    if (!currentUser) return;
    await marketplaceService.removeFavoriteCourse(currentUser.uid, courseId);
    setFavorites((prev) => prev.filter((f) => f.courseId !== courseId));
  };

  const handleRemoveBookmark = async (bm: StudentLessonBookmark) => {
    if (!currentUser) return;
    await lmsService.toggleLessonBookmark({
      studentId: currentUser.uid,
      courseId: bm.courseId,
      courseTitle: bm.courseTitle,
      lessonId: bm.lessonId,
      lessonTitle: bm.lessonTitle,
      videoId: bm.videoId,
    });
    setExtData((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((item) => item.id !== bm.id),
    }));
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !noteBody.trim()) return;
    setSavingNote(true);
    const saved = await lmsService.saveLessonNote({
      id: `${currentUser.uid}_${noteCourseId}_${Date.now()}`,
      studentId: currentUser.uid,
      courseId: noteCourseId,
      lessonId: noteTitle.trim() || 'personal-note',
      lessonTitle: noteTitle.trim() || 'Personal Study Note',
      content: noteBody.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setExtData((prev) => ({ ...prev, notes: [saved, ...prev.notes] }));
    setNoteTitle('');
    setNoteBody('');
    setSavingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!currentUser) return;
    await lmsService.deleteLessonNote(noteId, currentUser.uid);
    setExtData((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== noteId),
    }));
  };

  const handleSendTutorMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() || tutorBusy) return;
    const msg = tutorInput.trim();
    setTutorInput('');
    const nextHist = [...tutorMessages, { role: 'user' as const, text: msg }];
    setTutorMessages(nextHist);
    setTutorBusy(true);
    const reply = await quinnAiService.chatWithAssistant({
      message: msg,
      courseTitle: activeCourseDetail?.title || activeProgress?.courseTitle || 'OpenFrame Universal Learning',
      lessonTopic: activeProgress?.currentStage || 'General Study Support',
      language: tutorLang,
      history: nextHist.slice(-6),
    });
    setTutorMessages([...nextHist, { role: 'model', text: reply }]);
    setTutorBusy(false);
  };

  const handleTogglePersonalization = (next: boolean) => {
    setPersonalizationEnabled(next);
    try {
      localStorage.setItem(PERSONALIZATION_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const handleResetPersonalizationHistory = () => {
    clearRecentSearches();
    setPrefCategories([]);
    setExtData((prev) => ({ ...prev, searchHistory: [] }));
    setPrefsSavedMsg('Search & personalization history cleared cleanly.');
  };

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingPrefs(true);
    setPrefsSavedMsg('');
    try {
      const displayNameVal = studentProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Student Learner';
      await setDoc(
        doc(db, 'student_profiles', currentUser.uid),
        stripUndefinedDeep({
          uid: currentUser.uid,
          fullName: displayNameVal,
          preferredLanguage: prefLang,
          preferredCategories: prefCategories,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
      setPrefsSavedMsg('Learning preferences saved cleanly.');
    } catch {
      setPrefsSavedMsg('Preferences applied for current study session.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const getStageStatus = (stageId: LearningStage): 'completed' | 'active' | 'failed' | 'locked' => {
    if (!activeProgress) return 'locked';
    if (activeProgress.failedStages?.includes(stageId)) return 'failed';
    if (activeProgress.completedStages.includes(stageId)) return 'completed';
    if (activeProgress.currentStage === stageId) return 'active';
    return 'locked';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Student Learning Portal</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sign in with your student account to access enrolled courses, Quinn AI YouTube lectures, verification quizzes, 20 real-time analytics charts, notes, and certificates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/portal?role=student&redirect=/student/dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Sign In to Student Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const displayName = studentProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Student Learner';
  const regNo = studentProfile?.registrationNumber || lmsUser?.registrationNumber || '';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Student Profile Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-medium text-blue-600">
              OpenFrame Student Dashboard · {regNo}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl">
              Your 16-module AI learning hub: YouTube lecture discovery, Quinn AI tutor, verification quizzes, practical projects, real-time analytics, and verified credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeProgress && (
              <button
                type="button"
                onClick={() => navigate(`/learn/${activeProgress.courseId}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <span>Resume Active Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
            >
              Browse Courses
            </button>
          </div>
        </div>

        {/* School Education (LKG - Class 12) Quick Workspace Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-600">
              School Education Portal (LKG – 12th Standard)
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              {schoolEnrollment
                ? `${SCHOOL_CLASSES.find((c) => c.id === schoolEnrollment.classId)?.label || `Class ${schoolEnrollment.classId}`} · ${SCHOOL_BOARDS.find((b) => b.id === schoolEnrollment.boardId)?.shortName || schoolEnrollment.boardId}`
                : 'Select Your Board, Class (LKG–12) & Multilingual School Syllabus'}
            </h2>
            <p className="text-xs text-slate-500">
              {schoolEnrollment
                ? `${schoolEnrollment.medium} · ${schoolEnrollment.preferredLanguage} AI Tutor · ${schoolEnrollment.xpPoints || 0} XP · ${schoolEnrollment.streakDays || 1}-day streak`
                : 'Access Karnataka State Board, CBSE & ICSE chapter concepts, multilingual voice learning, 8-format quizzes & virtual labs.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(
                schoolEnrollment
                  ? `/school/class/${schoolEnrollment.classId}?board=${schoolEnrollment.boardId}`
                  : '/school'
              )
            }
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shrink-0 self-start sm:self-center whitespace-nowrap"
          >
            <span>{schoolEnrollment ? 'Open School Portal' : 'Explore School (LKG–12)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 16-Module Student Workspace Grid (Sidebar + Main Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Navigation (Mobile Dropdown + Desktop Sidebar) */}
          <aside className="lg:col-span-3 space-y-3">
            <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-3">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                Student Workspace Module
              </label>
              <select
                value={activeModule}
                onChange={(e) => setActiveModule(e.target.value as DashboardModuleId)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
              >
                {DASHBOARD_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden lg:block bg-white border border-slate-200 rounded-3xl p-3 space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                16 Learning Modules
              </div>
              {DASHBOARD_MODULES.map((m) => {
                const Icon = m.icon;
                const active = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setActiveModule(m.id)}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors text-left ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? 'text-sky-400' : 'text-slate-400'}`} />
                      <span className="truncate">{m.label}</span>
                    </span>
                    {m.id === 'notifications' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[10px] tabular-nums">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Active Module Workspace */}
          <main className="lg:col-span-9 space-y-6">
            {/* MODULE 1: WELCOME & OVERVIEW */}
            {activeModule === 'overview' && (
              <div className="space-y-6">
                {progressList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {progressList.map((p) => {
                      const active = p.courseId === activeProgress?.courseId;
                      return (
                        <button
                          key={p.courseId}
                          type="button"
                          onClick={() => setSelectedCourseId(p.courseId)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p.courseTitle || p.courseId} · <span className="tabular-nums">{p.overallProgressPercent || 0}%</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {progressList.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-4">
                    <BookOpen className="w-10 h-10 text-blue-600 mx-auto" />
                    <h2 className="text-lg font-bold text-slate-900">Start Your First AI-Guided Course</h2>
                    <p className="text-xs text-slate-600 max-w-md mx-auto">
                      You have not enrolled in any course yet. Launch our flagship AI course or explore over <span className="tabular-nums font-semibold">{liveTotalCourses.toLocaleString()}</span> industry courses.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/learn/OF-AI-001')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                      >
                        Launch Artificial Intelligence Fundamentals
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/marketplace')}
                        className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold"
                      >
                        Explore Course Catalog
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900">
                            8-Stage Learning & Certification Tracker
                          </h2>
                          <p className="text-xs text-slate-500">
                            {activeCourseDetail?.title || activeProgress?.courseTitle || activeProgress?.courseId}
                          </p>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 tabular-nums">
                          Overall Completion: <span className="text-blue-600 font-bold">{activeProgress?.overallProgressPercent || 0}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {STAGES.map((st) => {
                          const status = getStageStatus(st.id);
                          const Icon = st.icon;
                          return (
                            <div
                              key={st.id}
                              className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors ${
                                status === 'completed'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                                  : status === 'failed'
                                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                                  : status === 'active'
                                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${
                                    status === 'completed'
                                      ? 'bg-emerald-600 text-white'
                                      : status === 'failed'
                                      ? 'bg-rose-600 text-white'
                                      : status === 'active'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {st.number}
                                </span>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-[11px] font-semibold leading-tight">{st.label}</div>
                                <div className="text-[10px] font-semibold mt-1">
                                  {status === 'completed'
                                    ? 'Completed'
                                    : status === 'failed'
                                    ? 'Needs Revision'
                                    : status === 'active'
                                    ? 'In Progress'
                                    : 'Locked'}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs text-slate-500">
                              {activeProgress?.courseId} · Mentor: {activeProgress?.assignedTeacherName || 'OpenFrame Faculty Board'}
                            </div>
                            <h3 className="text-base font-bold text-slate-900 mt-1">
                              {activeCourseDetail?.title || activeProgress?.courseTitle}
                            </h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/learn/${activeProgress?.courseId}`)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap shrink-0"
                          >
                            Open Workspace
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3.5 bg-slate-50 rounded-2xl">
                            <div className="text-slate-500">Videos Verified</div>
                            <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                              {activeProgress?.videoSessionsCount || activeProgress?.completedLessonIds.length || 0}
                            </div>
                          </div>
                          <div className="p-3.5 bg-slate-50 rounded-2xl">
                            <div className="text-slate-500">Quiz Score</div>
                            <div className="text-lg font-bold text-blue-600 mt-1 tabular-nums">
                              {activeProgress?.quizAveragePercent || 0}%
                            </div>
                          </div>
                          <div className="p-3.5 bg-slate-50 rounded-2xl">
                            <div className="text-slate-500">Faculty Rubric</div>
                            <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                              {activeProgress?.teacherEvaluation ? `${activeProgress.teacherEvaluation.totalScore}/100` : 'Pending'}
                            </div>
                          </div>
                          <div className="p-3.5 bg-slate-50 rounded-2xl">
                            <div className="text-slate-500">Saved Notes</div>
                            <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                              {extData.notes.length}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-sky-400" />
                          <h3 className="text-sm font-bold">Quinn AI Performance</h3>
                        </div>
                        <div className="p-3.5 bg-white/10 rounded-2xl">
                          <div className="text-xs text-slate-300">Skill Development Index</div>
                          <div className="text-2xl font-bold mt-1 tabular-nums">
                            {performance?.skillDevelopmentScore || 0}%
                          </div>
                        </div>
                        {performance && (
                          <div className="text-xs space-y-2">
                            <div className="text-sky-300 font-semibold flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Focus Recommendation</span>
                            </div>
                            <p className="text-slate-200 leading-relaxed">
                              {performance.personalizedRecommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MODULE 2: MY COURSES */}
            {activeModule === 'courses' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Enrolled Courses ({progressList.length})</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/marketplace')}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    + Enroll in More Courses
                  </button>
                </div>
                {progressList.length === 0 ? (
                  <p className="text-xs text-slate-500">No enrolled courses yet. Start from the Marketplace.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {progressList.map((p) => (
                      <div key={p.courseId} className="p-4 border border-slate-200 rounded-2xl space-y-3 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="font-mono text-[11px] text-blue-600">{p.courseId}</div>
                            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{p.courseTitle || p.courseId}</h3>
                          </div>
                          <span className="font-bold text-slate-900 tabular-nums">{p.overallProgressPercent || 0}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.overallProgressPercent || 0}%` }} />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/learn/${p.courseId}`)}
                            className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-semibold"
                          >
                            Open Workspace
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/marketplace/${p.courseId}`)}
                            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold"
                          >
                            Course Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 3: MY LEARNING */}
            {activeModule === 'learning' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Study Checklist & Lesson Queue</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bookmarked individual lessons and active enrollments ready for immediate study.
                  </p>
                </div>
                <div className="space-y-3 text-xs">
                  {extData.bookmarks.length === 0 && enrollments.length === 0 ? (
                    <p className="text-slate-500">Bookmark any video lesson or enroll in a course to populate My Learning.</p>
                  ) : (
                    <>
                      {extData.bookmarks.map((bm) => (
                        <div key={bm.id} className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold text-blue-600">{bm.courseTitle}</div>
                            <div className="font-bold text-slate-900 text-sm">{bm.lessonTitle}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/learn/${bm.courseId}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold shrink-0"
                          >
                            Play Lesson
                          </button>
                        </div>
                      ))}
                      {enrollments.map((enr) => (
                        <div key={enr.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] text-slate-500">Enrolled {new Date(enr.enrolledAt).toLocaleDateString()}</div>
                            <div className="font-bold text-slate-900 text-sm">{enr.courseTitle}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/learn/${enr.courseId}`)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold shrink-0"
                          >
                            Continue
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 4: CONTINUE LEARNING */}
            {activeModule === 'continue' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">In-Progress Courses ({continueCourses.length})</h2>
                {continueCourses.length === 0 ? (
                  <p className="text-xs text-slate-500">No paused courses right now.</p>
                ) : (
                  <div className="space-y-3">
                    {continueCourses.map((c) => (
                      <div key={c.courseId} className="p-4 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{c.courseTitle || c.courseId}</div>
                          <div className="text-slate-500 mt-0.5">
                            Stage: {c.currentStage.replace(/_/g, ' ')} · Progress: <strong className="tabular-nums">{c.overallProgressPercent}%</strong>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/learn/${c.courseId}`)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Resume Now</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 5: COMPLETED COURSES */}
            {activeModule === 'completed' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">Completed Courses ({completedCourses.length})</h2>
                {completedCourses.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Courses appear here once all lessons, quizzes, capstone project, and faculty evaluation are completed (100%).
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {completedCourses.map((c) => (
                      <div key={c.courseId} className="p-4 border border-emerald-200 bg-emerald-50/40 rounded-2xl space-y-2">
                        <div className="font-bold text-emerald-950 text-sm">{c.courseTitle || c.courseId}</div>
                        <div className="text-emerald-700">100% Verified Completion</div>
                        {c.certificateId && (
                          <button
                            type="button"
                            onClick={() => navigate(`/verify-certificate/${c.certificateId}`)}
                            className="px-3.5 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold"
                          >
                            View Certificate ({c.certificateId})
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 6: SAVED LESSONS & FAVORITE COURSES */}
            {activeModule === 'saved' && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-blue-600" />
                    <span>Saved Individual Lessons ({extData.bookmarks.length})</span>
                  </h2>
                  {extData.bookmarks.length === 0 ? (
                    <p className="text-xs text-slate-500">No individual lessons bookmarked yet.</p>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      {extData.bookmarks.map((bm) => (
                        <div key={bm.id} className="p-3.5 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                          <div>
                            <div className="font-bold text-slate-900">{bm.lessonTitle}</div>
                            <div className="text-slate-500">{bm.courseTitle}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/learn/${bm.courseId}`)}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBookmark(bm)}
                              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600"
                              title="Remove bookmark"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                      <span>Saved Favourite Courses ({favorites.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/marketplace')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Explore Marketplace →
                    </button>
                  </div>
                  {favorites.length === 0 ? (
                    <p className="text-xs text-slate-500">Save courses from the Marketplace using the bookmark/heart button.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favorites.map((fav) => (
                        <div key={fav.id} className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between">
                          <div className="relative aspect-video bg-slate-900">
                            <CourseThumbnail src={fav.imageUrl} alt={fav.courseTitle} category={fav.category} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleRemoveFavorite(fav.courseId)}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-4 space-y-2 text-xs">
                            <div className="text-[11px] font-semibold text-blue-600 flex items-center gap-1">
                              {fav.courseType === 'youtube_playlist' && <ListVideo className="w-3 h-3" />}
                              <span>{fav.category}</span>
                            </div>
                            <h3 className="font-bold text-slate-900 line-clamp-2">{fav.courseTitle}</h3>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => navigate(`/learn/${fav.courseId}`)}
                                className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                              >
                                Open Workspace
                              </button>
                              <button
                                type="button"
                                onClick={() => navigate(`/marketplace/${fav.courseId}`)}
                                className="py-2 px-3 border border-slate-200 rounded-xl font-semibold text-slate-700"
                              >
                                Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 7: LEARNING HISTORY */}
            {activeModule === 'history' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">Recent Video Lecture Sessions ({extData.videoSessions.length})</h2>
                  {extData.videoSessions.length === 0 ? (
                    <p className="text-slate-500">No video sessions logged yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {extData.videoSessions.map((v) => (
                        <div key={v.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{v.videoTitle}</div>
                            <div className="text-slate-500">{v.courseId} · {v.completed ? 'Verified Done' : 'In Progress'}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/learn/${v.courseId}`)}
                            className="text-blue-600 font-semibold shrink-0"
                          >
                            Open
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">Topic Search History ({extData.searchHistory.length})</h2>
                  {extData.searchHistory.length === 0 ? (
                    <p className="text-slate-500">No searches recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                      {extData.searchHistory.map((s) => (
                        <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{s.query}</div>
                            <div className="text-slate-500">
                              {s.detectedLanguage || 'English'} · {new Date(s.searchedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate(`/marketplace?q=${encodeURIComponent(s.query)}`)}
                            className="text-blue-600 font-semibold shrink-0"
                          >
                            Re-run
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 8: RECOMMENDED FOR YOU */}
            {activeModule === 'recommended' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Personalized Course Recommendations</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Transparent, explainable recommendations aligned to your interests and recent study activity.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personalizationEnabled}
                        onChange={(e) => handleTogglePersonalization(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-700">Personalization ON</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleResetPersonalizationHistory}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset History</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {personalizedRecommendations.map(({ course, reason }) => (
                    <div key={course.id} className="p-4 border border-slate-200 rounded-2xl flex flex-col justify-between gap-3 text-xs">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-semibold text-blue-600">{course.category}</div>
                        <h3 className="text-sm font-bold text-slate-900">{course.title}</h3>
                        <p className="text-slate-600 line-clamp-2">{course.shortDesc}</p>
                        <div className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700">
                          <strong>Why recommended:</strong> {reason}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/marketplace/${course.id}`)}
                          className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-semibold"
                        >
                          View Course
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/learn/${course.id}`)}
                          className="py-2 px-3 bg-blue-600 text-white rounded-xl font-semibold"
                        >
                          Start Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODULE 9: MY CERTIFICATES */}
            {activeModule === 'certificates' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>My Issued Credentials ({certificates.length})</span>
                </h2>
                {certificates.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Complete all 6 certification gates (Video Lessons, Verification Quiz &ge; 70%, Practical Project, Presentation Defense &amp; Faculty Evaluation) to unlock downloadable QR-verified certificates.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((c) => (
                      <div key={c.certificateId} className="p-4 border border-slate-200 rounded-2xl space-y-2.5 text-xs">
                        <div className="text-[11px] font-bold text-blue-600 uppercase">
                          {c.certificateType || 'Course Completion Certificate'}
                        </div>
                        <div className="text-sm font-bold text-slate-900">{c.courseTitle}</div>
                        <div className="text-slate-500 font-mono tabular-nums">
                          {c.certificateId} · {c.grade} ({c.status})
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          {c.status !== 'Pending Admin Approval' && (
                            <button
                              type="button"
                              onClick={() => lmsService.downloadCertificatePdf(c)}
                              className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PDF</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigate(`/verify-certificate/${c.certificateId}`)}
                            className="px-3.5 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Public QR Verify</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 10: MY ASSESSMENTS */}
            {activeModule === 'assessments' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h2 className="text-base font-bold text-slate-900">Quiz & Verification Assessment History ({extData.quizAttempts.length})</h2>
                {extData.quizAttempts.length === 0 ? (
                  <p className="text-xs text-slate-500">No verification quiz attempts recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                          <th className="py-2 pr-3 font-semibold">Course / Lesson</th>
                          <th className="py-2 pr-3 font-semibold">Score</th>
                          <th className="py-2 pr-3 font-semibold">Outcome</th>
                          <th className="py-2 pr-3 font-semibold">Submitted</th>
                          <th className="py-2 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {extData.quizAttempts.map((q) => (
                          <tr key={q.id || q.attemptId}>
                            <td className="py-2.5 pr-3 font-semibold text-slate-900">
                              {q.courseId} · {q.lessonId}
                            </td>
                            <td className="py-2.5 pr-3 font-bold tabular-nums">{q.percentageScore}%</td>
                            <td className="py-2.5 pr-3">
                              <span className={`font-semibold ${q.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {q.passed ? 'Passed' : 'Revision Needed'}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 text-slate-500 tabular-nums">
                              {new Date(q.submittedAt).toLocaleDateString()}
                            </td>
                            <td className="py-2.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/learn/${q.courseId}?tab=quiz`)}
                                className="text-blue-600 font-semibold hover:underline"
                              >
                                Workspace
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* MODULE 11: MY ASSIGNMENTS & PRESENTATIONS */}
            {activeModule === 'assignments' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">Practical Project Submissions ({extData.projectSubmissions.length})</h2>
                  {extData.projectSubmissions.length === 0 ? (
                    <p className="text-slate-500">No practical projects submitted yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {extData.projectSubmissions.map((proj) => (
                        <div key={proj.id || proj.submissionId} className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                          <div className="font-bold text-slate-900">{proj.projectTitle || proj.courseTitle || proj.courseId}</div>
                          <div className="text-slate-500">Status: <strong className="text-slate-800">{proj.status}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900">Student Presentation Defenses ({extData.presentations.length})</h2>
                  {extData.presentations.length === 0 ? (
                    <p className="text-slate-500">No presentation defenses scheduled or uploaded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {extData.presentations.map((pres) => (
                        <div key={pres.id || pres.presentationId} className="p-3.5 border border-slate-200 rounded-2xl space-y-1">
                          <div className="font-bold text-slate-900">{pres.courseTitle || pres.courseId}</div>
                          <div className="text-slate-500">Status: <strong className="text-slate-800">{pres.status}</strong></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 12: MY NOTES CRUD */}
            {activeModule === 'notes' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                <form onSubmit={handleCreateNote} className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-slate-900">Create Personal Study Note</h2>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Related Course</label>
                    <select
                      value={noteCourseId}
                      onChange={(e) => setNoteCourseId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="GENERAL">General Study Notes</option>
                      {progressList.map((p) => (
                        <option key={p.courseId} value={p.courseId}>
                          {p.courseTitle || p.courseId}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Topic / Heading *</label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Microeconomics Elasticity Formulas"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Study Note Content *</label>
                    <textarea
                      rows={5}
                      required
                      value={noteBody}
                      onChange={(e) => setNoteBody(e.target.value)}
                      placeholder="Write formulas, key definitions, or summary takeaways..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{savingNote ? 'Saving Note...' : 'Save Note'}</span>
                  </button>
                </form>

                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h2 className="text-sm font-bold text-slate-900">Saved Notes ({extData.notes.length})</h2>
                  {extData.notes.length === 0 ? (
                    <p className="text-slate-500 py-4">No notes saved yet. Add one on the left or directly inside a lesson workspace.</p>
                  ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto">
                      {extData.notes.map((n) => (
                        <div key={n.id} className="p-4 border border-slate-200 rounded-2xl space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-[11px] font-mono text-blue-600">{n.courseId}</div>
                              <div className="font-bold text-slate-900 text-sm">{n.lessonTitle || n.lessonId}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteNote(n.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600"
                              title="Delete note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-slate-700 whitespace-pre-line">{n.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODULE 13: INLINE QUINN AI TUTOR */}
            {activeModule === 'tutor' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Quinn AI Multilingual Study Tutor</span>
                    </h2>
                    <p className="text-slate-500">
                      AI-generated guidance based on topic context and OpenFrame academic standards. Verify external citations independently.
                    </p>
                  </div>
                  <select
                    value={tutorLang}
                    onChange={(e) => setTutorLang(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
                  >
                    {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                      <option key={l.code} value={l.label}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  {tutorMessages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl max-w-[85%] ${
                        m.role === 'user'
                          ? 'ml-auto bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                    </div>
                  ))}
                  {tutorBusy && (
                    <div className="text-slate-500 italic px-2">Quinn AI is preparing an explanation...</div>
                  )}
                </div>

                <form onSubmit={handleSendTutorMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder={`Ask Quinn AI a question in ${tutorLang}...`}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={tutorBusy || !tutorInput.trim()}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask Tutor</span>
                  </button>
                </form>
              </div>
            )}

            {/* MODULE 14: 20-CHART REAL LEARNING ANALYTICS */}
            {activeModule === 'analytics' && (
              <StudentAnalytics20Charts
                progressList={progressList}
                enrollments={enrollments}
                favorites={favorites}
                certificates={certificates}
                extData={extData}
                studentName={displayName}
                studentEmail={currentUser.email || ''}
              />
            )}

            {/* MODULE 15: NOTIFICATIONS */}
            {activeModule === 'notifications' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span>Academic Notifications</span>
                  </h2>
                  <span className="text-xs text-slate-500 tabular-nums">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500">No notifications yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {notifications.map((n) => (
                      <div key={n.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <div className={`font-semibold ${n.read ? 'text-slate-600' : 'text-slate-900'}`}>
                            {n.title}
                          </div>
                          <p className="text-slate-500">{n.message}</p>
                          {n.actionUrl && (
                            <button
                              type="button"
                              onClick={() => navigate(n.actionUrl!)}
                              className="text-blue-600 hover:underline font-medium pt-0.5"
                            >
                              View details
                            </button>
                          )}
                        </div>
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => handleMarkNotifRead(n.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 16: ACCOUNT SETTINGS & DPDP COMPLIANCE */}
            {activeModule === 'settings' && (
              <form onSubmit={handleSavePreferences} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 text-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Account Preferences & DPDP Privacy Controls</h2>
                  <p className="text-slate-500 mt-0.5">
                    Configure your default learning language, subject recommendations, and privacy preferences.
                  </p>
                </div>

                {prefsSavedMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
                    {prefsSavedMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Learning Language</label>
                    <select
                      value={prefLang}
                      onChange={(e) => setPrefLang(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                        <option key={l.code} value={l.label}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full cursor-pointer">
                      <input
                        type="checkbox"
                        checked={personalizationEnabled}
                        onChange={(e) => handleTogglePersonalization(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="font-semibold text-slate-800">Enable AI Course Personalization</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-2">
                    Preferred Universal Subject Categories (A–L)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {UNIVERSAL_12_CATEGORIES.map((cat) => {
                      const selected = prefCategories.includes(cat.name);
                      return (
                        <label
                          key={cat.code}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer ${
                            selected ? 'bg-blue-50 border-blue-300 text-blue-950 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() =>
                              setPrefCategories((prev) =>
                                prev.includes(cat.name) ? prev.filter((x) => x !== cat.name) : [...prev, cat.name]
                              )
                            }
                            className="rounded text-blue-600"
                          />
                          <span className="truncate">{cat.code}. {cat.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-2.5 text-slate-600">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900">Indian DPDP Act 2023 Data Minimization Notice:</strong> OpenFrame Education never collects or stores Aadhaar numbers, PAN, passport numbers, or sensitive government identity documents in student accounts.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleResetPersonalizationHistory}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear Recent Search History
                  </button>
                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {savingPrefs ? 'Saving Preferences...' : 'Save Account Preferences'}
                  </button>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
