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
  User,
  Camera,
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
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { StudentAnalytics20Charts } from '../components/student/StudentAnalytics20Charts';
import { SocialAppShell, WorkspaceNavItem } from '../components/workspace/SocialAppShell';
import { DonutRingChart, MiniBarChart } from '../components/workspace/DashboardCharts';
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
  EducationCategoryCode,
  QaSavedRecord,
  AiLearningPath,
} from '../types';
import {
  EDUCATION_CLASSIFICATION_CATEGORIES,
  getAllProgrammesForCategory,
} from '../data/educationClassificationData';

type DashboardModuleId =
  | 'overview'
  | 'profile'
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
  { id: 'profile', label: '2. Profile & Verification', icon: User },
  { id: 'courses', label: '3. My Courses', icon: BookOpen },
  { id: 'learning', label: '4. My Learning', icon: Play },
  { id: 'continue', label: '5. Continue Learning', icon: Clock },
  { id: 'completed', label: '6. Completed Courses', icon: CheckCircle2 },
  { id: 'saved', label: '7. Saved Lessons & Favorites', icon: Bookmark },
  { id: 'history', label: '8. Learning History', icon: History },
  { id: 'recommended', label: '9. Recommended For You', icon: Sparkles },
  { id: 'certificates', label: '10. My Certificates', icon: Award },
  { id: 'assessments', label: '11. My Assessments', icon: HelpCircle },
  { id: 'assignments', label: '12. My Assignments & Defense', icon: FileCheck },
  { id: 'notes', label: '13. My Notes', icon: FileText },
  { id: 'tutor', label: '14. Quinn AI Tutor', icon: MessageSquare },
  { id: 'analytics', label: '15. Learning Analytics (20 Charts)', icon: BarChart3 },
  { id: 'notifications', label: '16. Notifications', icon: Bell },
  { id: 'settings', label: '17. Account & Privacy Settings', icon: Settings },
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
  const { currentUser, lmsUser, studentProfile, logout, loading: authLoading } = useAuth();

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
  const [savedQas, setSavedQas] = useState<QaSavedRecord[]>([]);
  const [savedRoadmaps, setSavedRoadmaps] = useState<AiLearningPath[]>([]);

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

  // Module 17 Account Preferences State
  const [prefLang, setPrefLang] = useState('English');
  const [prefCategories, setPrefCategories] = useState<string[]>([]);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSavedMsg, setPrefsSavedMsg] = useState('');

  // Module 2 Editable Student Profile & Verification State
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    dob: '',
    gender: '',
    profilePhotoUrl: '',
    country: 'India',
    state: 'Karnataka',
    district: '',
    city: '',
    houseNumber: '',
    streetAddress: '',
    pincode: '',
    qualification: '',
    institution: '',
    preferredLanguage: 'English',
    educationLevel: '' as '' | EducationCategoryCode,
    degreeOrClass: '',
    academicYear: '',
    subjectsRaw: '',
    skillsRaw: '',
    interestsRaw: '',
    careerAspirations: '',
    learningFormatPreference: 'Mixed' as 'Video' | 'Structured Course' | 'Interactive' | 'Mixed',
  });
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  useEffect(() => {
    setProfileForm({
      fullName: studentProfile?.fullName || lmsUser?.displayName || currentUser?.displayName || '',
      mobileNumber: studentProfile?.mobileNumber || '',
      whatsappNumber: studentProfile?.whatsappNumber || '',
      dob: studentProfile?.dob || '',
      gender: studentProfile?.gender || '',
      profilePhotoUrl: studentProfile?.profilePhotoUrl || lmsUser?.photoURL || currentUser?.photoURL || '',
      country: studentProfile?.country || 'India',
      state: studentProfile?.state || 'Karnataka',
      district: studentProfile?.district || '',
      city: studentProfile?.city || '',
      houseNumber: studentProfile?.houseNumber || '',
      streetAddress: studentProfile?.streetAddress || '',
      pincode: studentProfile?.pincode || '',
      qualification: studentProfile?.qualification || '',
      institution: studentProfile?.institution || '',
      preferredLanguage: studentProfile?.preferredLanguage || 'English',
      educationLevel: (studentProfile?.educationLevel as '' | EducationCategoryCode) || '',
      degreeOrClass: studentProfile?.degreeOrClass || '',
      academicYear: studentProfile?.academicYear || '',
      subjectsRaw: (studentProfile?.subjects || []).join(', '),
      skillsRaw: (studentProfile?.skills || []).join(', '),
      interestsRaw: (studentProfile?.interests || []).join(', '),
      careerAspirations: studentProfile?.careerAspirations || '',
      learningFormatPreference: studentProfile?.learningFormatPreference || 'Mixed',
    });
    if (studentProfile?.preferredLanguage) setPrefLang(studentProfile.preferredLanguage);
    if (studentProfile?.preferredCategories?.length) setPrefCategories(studentProfile.preferredCategories);
  }, [studentProfile, lmsUser, currentUser]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadDashboard() {
      setLoading(true);
      const [allProg, enrs, certs, notifs, favs, stats, schEnr, ext, recRes, qaList, roadmaps] = await Promise.all([
        lmsService.getAllStudentProgress(currentUser!.uid),
        lmsService.getStudentEnrollments(currentUser!.uid),
        lmsService.getCertificatesForStudent(currentUser!.uid),
        lmsService.getNotifications(currentUser!.uid, currentUser!.email || undefined),
        marketplaceService.getStudentFavorites(currentUser!.uid),
        marketplaceService.getLiveMarketplaceCounters().catch(() => null),
        getSchoolEnrollment(currentUser!.uid).catch(() => null),
        lmsService.getStudentExtendedAnalyticsData(currentUser!.uid),
        marketplaceService.filterCourses({ tab: 'recommended', page: 1, pageSize: 12 }).catch(() => ({ courses: [] })),
        lmsService.getQaHistory(currentUser!.uid, 25).catch(() => []),
        lmsService.getAiLearningPaths(20).catch(() => []),
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
      setSavedQas(qaList);
      setSavedRoadmaps(roadmaps.filter((r) => !r.createdByUid || r.createdByUid === currentUser!.uid));

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

  const handleProfilePhotoUpload = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingProfilePhoto(true);
    setProfileSavedMsg('');
    try {
      const uploaded = await lmsService.uploadDeliverableFile(file, 'student-photos');
      const url = uploaded.url;
      setProfileForm((prev) => ({ ...prev, profilePhotoUrl: url }));
      if (currentUser) {
        await setDoc(
          doc(db, 'student_profiles', currentUser.uid),
          stripUndefinedDeep({
            uid: currentUser.uid,
            profilePhotoUrl: url,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        );
      }
      setProfileSavedMsg('Profile photo uploaded to Firebase Storage and synced.');
    } catch {
      setProfileSavedMsg('Photo upload encountered an error. You may also save a direct image URL.');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleSaveStudentProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingProfile(true);
    setProfileSavedMsg('');
    try {
      await setDoc(
        doc(db, 'student_profiles', currentUser.uid),
        stripUndefinedDeep({
          uid: currentUser.uid,
          email: currentUser.email || studentProfile?.email || '',
          fullName: profileForm.fullName.trim() || displayName,
          mobileNumber: profileForm.mobileNumber.trim(),
          whatsappNumber: profileForm.whatsappNumber.trim() || undefined,
          dob: profileForm.dob || undefined,
          gender: profileForm.gender || undefined,
          profilePhotoUrl: profileForm.profilePhotoUrl.trim() || undefined,
          country: profileForm.country.trim() || 'India',
          state: profileForm.state.trim() || undefined,
          district: profileForm.district.trim() || undefined,
          city: profileForm.city.trim() || undefined,
          houseNumber: profileForm.houseNumber.trim() || undefined,
          streetAddress: profileForm.streetAddress.trim() || undefined,
          pincode: profileForm.pincode.trim() || undefined,
          qualification: profileForm.qualification.trim() || undefined,
          institution: profileForm.institution.trim() || undefined,
          preferredLanguage: profileForm.preferredLanguage || 'English',
          educationLevel: profileForm.educationLevel || undefined,
          degreeOrClass: profileForm.degreeOrClass.trim() || undefined,
          academicYear: profileForm.academicYear.trim() || undefined,
          subjects: profileForm.subjectsRaw.split(',').map((s) => s.trim()).filter(Boolean),
          skills: profileForm.skillsRaw.split(',').map((s) => s.trim()).filter(Boolean),
          interests: profileForm.interestsRaw.split(',').map((s) => s.trim()).filter(Boolean),
          careerAspirations: profileForm.careerAspirations.trim() || undefined,
          learningFormatPreference: profileForm.learningFormatPreference || 'Mixed',
          emailVerified: currentUser.emailVerified,
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
      setProfileSavedMsg('Student profile and KYC verification details saved to Firestore.');
    } catch {
      setProfileSavedMsg('Unable to sync profile to Firestore right now. Please try again.');
    } finally {
      setSavingProfile(false);
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
      <div className="min-h-screen bg-[#F5F5F2] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-[#123D32] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#123D32]/10 text-[#123D32] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-editorial font-semibold text-[#18221F]">Student Learning Portal</h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Sign in with your student account to access enrolled courses, Quinn AI YouTube lectures, verification quizzes, 20 real-time analytics charts, notes, and certificates.
          </p>
          <div className="space-y-2.5 pt-1">
            <GoogleSignInButton
              role="student"
              label="Continue with Google (Student)"
              variant="dark"
            />
            <button
              type="button"
              onClick={() => navigate('/portal/student?redirect=/student/dashboard')}
              className="w-full py-2.5 bg-[#123D32] hover:bg-[#0D2E25] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Email / Portal Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = studentProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Student Learner';
  const regNo = studentProfile?.registrationNumber || lmsUser?.registrationNumber || '';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const studentNavItems: WorkspaceNavItem[] = DASHBOARD_MODULES.map((m) => ({
    id: m.id,
    label: m.label,
    icon: m.icon,
    badge: m.id === 'notifications' ? unreadCount : undefined,
  }));

  return (
    <SocialAppShell
      roleLabel="Student"
      userName={profileForm.fullName || displayName}
      userEmail={currentUser.email || ''}
      registrationId={regNo}
      navItems={studentNavItems}
      activeNavId={activeModule}
      onSelectNav={(id) => setActiveModule(id as DashboardModuleId)}
      notifications={notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
      }))}
      onLogout={() => logout().then(() => navigate('/portal'))}
      showRightRail={activeModule !== 'analytics'}
    >
      <div className="space-y-6">
        {/* Top Student Profile Banner */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            {(profileForm.profilePhotoUrl || studentProfile?.profilePhotoUrl) && (
              <img
                src={profileForm.profilePhotoUrl || studentProfile?.profilePhotoUrl}
                alt={displayName}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 hidden sm:block"
              />
            )}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
                OpenFrame Student Workspace{regNo ? ` · ${regNo}` : ''}
              </div>
              <h1 className="text-2xl font-editorial font-semibold text-[#18221F] tracking-tight">
                Welcome back, {profileForm.fullName || displayName}
              </h1>
              <p className="text-xs text-[#64748B] max-w-2xl">
                Your 17-module AI learning hub: YouTube lecture discovery, Quinn AI tutor, verification quizzes, practical projects, real-time analytics, and verified credentials.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {activeProgress && (
              <button
                type="button"
                onClick={() => navigate(`/learn/${activeProgress.courseId}`)}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Resume Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-[#FAF7F2] text-[#18221F] text-xs font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              Browse Catalog
            </button>
          </div>
        </div>

        {/* School & University Education (LKG – PG) Quick Workspace Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
              All-India Education Hub (LKG – 12th – PUC – Degree – PG)
            </div>
            <h2 className="text-sm font-bold text-[#18221F]">
              {schoolEnrollment
                ? `${SCHOOL_CLASSES.find((c) => c.id === schoolEnrollment.classId)?.label || `Class ${schoolEnrollment.classId}`} · ${SCHOOL_BOARDS.find((b) => b.id === schoolEnrollment.boardId)?.shortName || schoolEnrollment.boardId}`
                : 'Daily Classes & Study on Your Own Self (All Boards, 14 Languages)'}
            </h2>
            <p className="text-xs text-[#64748B]">
              {schoolEnrollment
                ? `${schoolEnrollment.medium} · ${schoolEnrollment.preferredLanguage} AI Tutor · ${schoolEnrollment.xpPoints || 0} XP · ${schoolEnrollment.streakDays || 1}-day streak`
                : 'Access Karnataka State Board, NCERT, CBSE, ICSE, NIOS & UG/PG chapter videos, auto-generated PDFs, 30-question exams, IQ/EQ/SQ tests & 20-graph reports.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
            <button
              type="button"
              onClick={() =>
                navigate(
                  schoolEnrollment
                    ? `/school/class/${schoolEnrollment.classId}?board=${schoolEnrollment.boardId}&tab=daily`
                    : '/school?tab=daily'
                )
              }
              className="px-4 py-2.5 bg-[#0B1930] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Daily Classes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                navigate(
                  schoolEnrollment
                    ? `/school/class/${schoolEnrollment.classId}?board=${schoolEnrollment.boardId}&tab=self_study`
                    : '/school?tab=self_study'
                )
              }
              className="px-4 py-2.5 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ring-2 ring-[#123D32]/20"
            >
              <span>Study on Your Own Self</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile / Compact Quick Module Selector */}
        <div className="lg:hidden bg-white border border-slate-200/80 rounded-2xl p-3">
          <label className="block text-[11px] font-semibold text-[#64748B] mb-1.5">
            Student Workspace Module
          </label>
          <select
            value={activeModule}
            onChange={(e) => setActiveModule(e.target.value as DashboardModuleId)}
            className="w-full p-2.5 bg-[#FAF7F2] border border-slate-200 rounded-xl text-xs font-semibold text-[#18221F]"
          >
            {DASHBOARD_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
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

                      <div className="bg-[#123D32] text-white rounded-3xl p-6 space-y-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-300" />
                          <h3 className="text-sm font-bold">Quinn AI Performance</h3>
                        </div>
                        <div className="p-3.5 bg-white/10 rounded-2xl">
                          <div className="text-xs text-emerald-100">Skill Development Index</div>
                          <div className="text-2xl font-bold mt-1 tabular-nums">
                            {performance?.skillDevelopmentScore || 0}%
                          </div>
                        </div>
                        {performance && (
                          <div className="text-xs space-y-2">
                            <div className="text-emerald-200 font-semibold flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>Focus Recommendation</span>
                            </div>
                            <p className="text-emerald-50/90 leading-relaxed">
                              {performance.personalizedRecommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5">
                        <DonutRingChart
                          percent={activeProgress?.overallProgressPercent || 0}
                          label="Active Course Completion"
                          sublabel={`${activeProgress?.completedStages.length || 0} of 8 certification stages completed`}
                          color="#123D32"
                        />
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-3xl p-5">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                          Course Milestones Breakdown
                        </div>
                        <MiniBarChart
                          items={[
                            {
                              label: 'Videos Verified',
                              value: activeProgress?.videoSessionsCount || activeProgress?.completedLessonIds.length || 0,
                              color: '#2563EB',
                            },
                            {
                              label: 'Quiz Average (%)',
                              value: activeProgress?.quizAveragePercent || 0,
                              maxValue: 100,
                              suffix: '%',
                              color: '#123D32',
                            },
                            {
                              label: 'Earned Certificates',
                              value: certificates.length,
                              color: '#059669',
                            },
                          ]}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MODULE 2: STUDENT PROFILE, PHOTO & KYC VERIFICATION */}
            {activeModule === 'profile' && (
              <form onSubmit={handleSaveStudentProfile} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    {profileForm.profilePhotoUrl ? (
                      <img
                        src={profileForm.profilePhotoUrl}
                        alt={profileForm.fullName || displayName}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Student Profile &amp; Verification</h2>
                      <p className="text-slate-500 mt-0.5">
                        Reg ID: <span className="font-mono font-semibold text-slate-800">{regNo || 'Pending Sync'}</span> · {currentUser.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${currentUser.emailVerified ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                          {currentUser.emailVerified ? 'Email Verified' : 'Email Verification Pending'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${profileForm.mobileNumber ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {profileForm.mobileNumber ? 'Mobile On Record' : 'Mobile Not Added'}
                        </span>
                        {studentProfile?.isMinor && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-purple-50 border-purple-200 text-purple-800">
                            Minor · Guardian Linked ({studentProfile.parentName || 'Recorded'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-center shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingProfilePhoto ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingProfilePhoto}
                      onChange={(e) => handleProfilePhotoUpload(e.target.files?.[0])}
                    />
                  </label>
                </div>

                {profileSavedMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium">
                    {profileSavedMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileForm.mobileNumber}
                      onChange={(e) => setProfileForm((p) => ({ ...p, mobileNumber: e.target.value }))}
                      placeholder="10-digit mobile"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={profileForm.whatsappNumber}
                      onChange={(e) => setProfileForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                      placeholder="Optional WhatsApp number"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileForm.dob}
                      onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm((p) => ({ ...p, gender: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary / Other">Non-Binary / Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Preferred Language</label>
                    <select
                      value={profileForm.preferredLanguage}
                      onChange={(e) => setProfileForm((p) => ({ ...p, preferredLanguage: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                        <option key={l.code} value={l.label}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">House / Door No.</label>
                    <input
                      type="text"
                      value={profileForm.houseNumber}
                      onChange={(e) => setProfileForm((p) => ({ ...p, houseNumber: e.target.value }))}
                      placeholder="#42-B"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Street Address / Locality</label>
                    <input
                      type="text"
                      value={profileForm.streetAddress}
                      onChange={(e) => setProfileForm((p) => ({ ...p, streetAddress: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">City / Town</label>
                    <input
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => setProfileForm((p) => ({ ...p, city: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={profileForm.district}
                      onChange={(e) => setProfileForm((p) => ({ ...p, district: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">State / PIN Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={profileForm.state}
                        onChange={(e) => setProfileForm((p) => ({ ...p, state: e.target.value }))}
                        placeholder="State"
                        className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="text"
                        maxLength={6}
                        value={profileForm.pincode}
                        onChange={(e) => setProfileForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
                        placeholder="PIN"
                        className="w-24 p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Qualification / Class</label>
                    <input
                      type="text"
                      value={profileForm.qualification}
                      onChange={(e) => setProfileForm((p) => ({ ...p, qualification: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">School / College / Organization (Optional)</label>
                    <input
                      type="text"
                      value={profileForm.institution}
                      onChange={(e) => setProfileForm((p) => ({ ...p, institution: e.target.value }))}
                      placeholder="Self-Paced Learner"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* Personalized Education Classification Profile (Categories A–J) */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#123D32]">Educational Classification &amp; Personalization Profile</h3>
                    <p className="text-[11px] text-slate-500">
                      Used alongside your live search intent to rank degree-aligned and skill-aligned OpenFrame recommendations.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Education Level (A–J)</label>
                      <select
                        value={profileForm.educationLevel}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            educationLevel: e.target.value as '' | EducationCategoryCode,
                            degreeOrClass: '',
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="">Select Education Level</option>
                        {EDUCATION_CLASSIFICATION_CATEGORIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}. {c.shortTitle}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Degree / Class / Programme</label>
                      <select
                        value={profileForm.degreeOrClass}
                        onChange={(e) => setProfileForm((p) => ({ ...p, degreeOrClass: e.target.value }))}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="">Select or customize below</option>
                        {(profileForm.educationLevel
                          ? getAllProgrammesForCategory(profileForm.educationLevel)
                          : Array.from(new Set(EDUCATION_CLASSIFICATION_CATEGORIES.flatMap((c) => getAllProgrammesForCategory(c.code))))
                        )
                          .slice(0, 80)
                          .map((deg) => (
                            <option key={deg} value={deg}>{deg}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Academic Year / Semester</label>
                      <input
                        type="text"
                        value={profileForm.academicYear}
                        onChange={(e) => setProfileForm((p) => ({ ...p, academicYear: e.target.value }))}
                        placeholder="e.g. 2nd Year / Sem 4 / Working"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Core Subjects (comma-separated)</label>
                      <input
                        type="text"
                        value={profileForm.subjectsRaw}
                        onChange={(e) => setProfileForm((p) => ({ ...p, subjectsRaw: e.target.value }))}
                        placeholder="e.g. Accounting, Python, Economics"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={profileForm.skillsRaw}
                        onChange={(e) => setProfileForm((p) => ({ ...p, skillsRaw: e.target.value }))}
                        placeholder="e.g. Digital Marketing, Excel, AI"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Format</label>
                      <select
                        value={profileForm.learningFormatPreference}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            learningFormatPreference: e.target.value as 'Video' | 'Structured Course' | 'Interactive' | 'Mixed',
                          }))
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      >
                        <option value="Mixed">Mixed (Courses + YouTube Lectures)</option>
                        <option value="Structured Course">Structured OpenFrame Courses</option>
                        <option value="Video">Video-First YouTube Lectures</option>
                        <option value="Interactive">Interactive Q&amp;A + Practice</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">Career Aspirations &amp; Learning Goals</label>
                      <input
                        type="text"
                        value={profileForm.careerAspirations}
                        onChange={(e) => setProfileForm((p) => ({ ...p, careerAspirations: e.target.value }))}
                        placeholder="e.g. Transition into Growth Marketing & Analytics or prepare for Postgraduate Research"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500">DPDP Act 2023 Compliant · No Aadhaar/PAN collected</span>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving Profile...' : 'Save Student Profile'}
                  </button>
                </div>
              </form>
            )}

            {/* MODULE 3: MY COURSES */}
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

                {/* Saved Q&A Notebook */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-[#2563EB]" />
                      <span>Saved Q&amp;A Answers ({savedQas.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/qa')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Ask New Question →
                    </button>
                  </div>
                  {savedQas.length === 0 ? (
                    <p className="text-xs text-slate-500">No Q&amp;A notes saved yet. Ask any topic question on Ask Q&amp;A and save it here.</p>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      {savedQas.map((qa) => (
                        <div key={qa.id} className="p-3.5 border border-slate-200 rounded-2xl flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="font-bold text-slate-900">{qa.question}</div>
                            <p className="text-slate-600 line-clamp-2">{qa.answer}</p>
                            <div className="text-[11px] text-slate-400">
                              Saved {new Date(qa.savedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/qa?q=${encodeURIComponent(qa.question)}`)}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold cursor-pointer"
                            >
                              Open
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await lmsService.deleteQaEntry(qa.id);
                                setSavedQas((prev) => prev.filter((item) => item.id !== qa.id));
                              }}
                              className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 cursor-pointer"
                              title="Delete Q&A entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Saved Visual Learning Roadmaps */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#123D32]" />
                      <span>Saved Learning Roadmaps ({savedRoadmaps.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigate('/marketplace?view=roadmap')}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Build Roadmap →
                    </button>
                  </div>
                  {savedRoadmaps.length === 0 ? (
                    <p className="text-xs text-slate-500">No learning roadmaps saved yet. Generate and save an 8-stage roadmap from Course Discovery.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {savedRoadmaps.map((rm) => (
                        <div key={rm.id} className="p-4 border border-slate-200 rounded-2xl space-y-2">
                          <div className="font-bold text-slate-900">{rm.title}</div>
                          <p className="text-slate-600 line-clamp-2">{rm.overview}</p>
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-slate-500">{rm.modules?.length || 0} stages</span>
                            <button
                              type="button"
                              onClick={() => navigate(`/marketplace?q=${encodeURIComponent(rm.topic)}&view=roadmap`)}
                              className="px-3 py-1.5 bg-[#123D32] text-white rounded-lg font-semibold cursor-pointer"
                            >
                              Resume Roadmap
                            </button>
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
        </div>
      </div>
    </SocialAppShell>
  );
};
