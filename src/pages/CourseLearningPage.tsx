import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  HelpCircle,
  FileText,
  Award,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Upload,
  Calendar,
  Sparkles,
  Clock,
  BookOpen,
  Star,
  AlertCircle,
  Video,
  Send,
  X,
  FileCheck,
  Download,
  Lock,
  Search,
  Plus,
  Edit3,
  Trash2,
  Check,
  Bookmark,
  Flag,
  ChevronLeft,
  Volume2,
  VolumeX,
  Globe,
  Timer,
  Mic,
  MicOff
} from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { marketplaceService } from '../services/marketplaceService';
import { quinnAiService } from '../services/quinnAiService';
import { youtubeVideoService } from '../services/youtubeVideoService';
import { lmsService } from '../services/lmsService';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { CourseEnrollmentModal } from '../components/common/CourseEnrollmentModal';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES } from '../utils/searchIntelligence';
import {
  ALL_INDIAN_STATES_AND_UTS,
  compute90PercentCoursePricing,
  formatInr,
  validateCertificateAddressDetails,
  CertificateAddressDetails,
} from '../utils/pricingEngine';
import {
  MarketplaceCourse,
  CourseModuleDoc,
  LmsLesson,
  YouTubeVideoRecommendation,
  VideoLearningSession,
  QuizQuestion,
  QuizAttempt,
  QuizConfigDoc,
  PracticalProjectDefinition,
  ProjectSubmission,
  StudentPresentation,
  StudentProgressRecord,
  IssuedCertificate,
  QuinnPerformanceAnalysis,
  CertificateEligibilityStatus,
  StudentLessonNote
} from '../types';

const QUINN_15_CAPABILITIES: Array<{ mode: string; label: string; prompt: string }> = [
  { mode: 'explain_simple', label: 'Explain Simply', prompt: 'Explain this lesson topic in simple everyday language.' },
  { mode: 'step_by_step', label: 'Step-by-Step', prompt: 'Break this concept down step by step.' },
  { mode: 'summarize_lesson', label: 'Summarize', prompt: 'Give a concise structured summary of this lesson.' },
  { mode: 'study_notes', label: 'Study Notes', prompt: 'Create crisp bullet-point study notes I can revise later.' },
  { mode: 'practice_questions', label: 'Practice Qs', prompt: 'Give me 3 practice questions with hints.' },
  { mode: 'recommend_videos', label: 'Video Tips', prompt: 'Suggest what to focus on in educational video tutorials.' },
  { mode: 'study_plan', label: 'Study Plan', prompt: 'Design a 3-day study plan to master this topic.' },
  { mode: 'translate_explain', label: 'Multilingual', prompt: 'Translate and explain the key terms in my selected language.' },
  { mode: 'quiz_prep', label: 'Quiz Prep', prompt: 'How do I prepare for the verification quiz?' },
  { mode: 'project_guidance', label: 'Project Help', prompt: 'Guide me on structuring a strong practical project.' },
  { mode: 'real_world_examples', label: 'Real Examples', prompt: 'Share 2 practical real-world examples of this topic.' },
  { mode: 'beginner_bridge', label: 'Beginner Bridge', prompt: 'What prerequisites should a complete beginner review first?' },
  { mode: 'flashcards', label: 'Flashcards', prompt: 'Generate 4 term-and-definition flashcards for quick recall.' },
  { mode: 'concept_clarify', label: 'Clarify Doubt', prompt: 'What are the most common misconceptions students make here?' },
  { mode: 'motivational_coach', label: 'Study Coach', prompt: 'Give me an encouraging milestone strategy to finish this module.' },
  { mode: 'excel_formula_help', label: 'Excel Formulas', prompt: 'Walk through essential Excel formulas (XLOOKUP, SUMIFS, IF) and PivotTable workflows for this topic.' },
  { mode: 'code_debugging', label: 'Code Debug', prompt: 'Help me systematically debug errors and verify edge cases for this concept.' },
  { mode: 'interview_prep', label: 'Interview Prep', prompt: 'What interview questions and strong answer frameworks apply to this topic?' },
  { mode: 'mock_test', label: 'Mock Test', prompt: 'Give me a 5-question timed mock test on this topic with an answer key at the bottom.' },
];

type TabType = 'overview' | 'video' | 'resources' | 'quiz' | 'project' | 'presentation' | 'evaluation' | 'certificate';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const CourseLearningPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { currentUser, lmsUser, studentProfile, portalRole, isSuperAdmin, loading: authLoading } = useAuth();

  const pathClean = currentPath.split('?')[0];
  const parts = pathClean.split('/').filter(Boolean);
  const courseIdParam = parts[1] || 'OF-AI-001';
  const queryTab = new URLSearchParams(currentPath.split('?')[1] || '').get('tab') as TabType | null;

  const studentId = currentUser?.uid || '';
  const studentName = lmsUser?.displayName || currentUser?.displayName || 'Student Learner';
  const studentEmail = lmsUser?.email || currentUser?.email || '';
  const isEducatorOrAdmin = portalRole === 'teacher' || portalRole === 'admin' || isSuperAdmin;

  const [course, setCourse] = useState<MarketplaceCourse | null>(null);
  const [modules, setModules] = useState<CourseModuleDoc[]>([]);
  const [lessons, setLessons] = useState<LmsLesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [requiresEnrollment, setRequiresEnrollment] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [workspaceNonce, setWorkspaceNonce] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>(queryTab || 'overview');
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Student Progress & Performance
  const [progress, setProgress] = useState<StudentProgressRecord | null>(null);
  const [performance, setPerformance] = useState<QuinnPerformanceAnalysis | null>(null);
  const [certificate, setCertificate] = useState<IssuedCertificate | null>(null);
  const [completingModule, setCompletingModule] = useState(false);
  const [certClaiming, setCertClaiming] = useState(false);
  const [certAddressError, setCertAddressError] = useState<string | null>(null);
  const [certAddressForm, setCertAddressForm] = useState<CertificateAddressDetails>({
    homeAddress: '',
    flatNumber: '',
    streetAddress: '',
    pincode: '',
    mobileNumber: '',
    alternativeMobileNumber: '',
    state: 'Karnataka',
  });

  useEffect(() => {
    if (!studentProfile) return;
    setCertAddressForm((prev) => ({
      homeAddress: prev.homeAddress || studentProfile.homeAddress || studentProfile.streetAddress || '',
      flatNumber: prev.flatNumber || studentProfile.flatNumber || '',
      streetAddress: prev.streetAddress || studentProfile.streetAddress || '',
      pincode: prev.pincode || studentProfile.pincode || '',
      mobileNumber: prev.mobileNumber || studentProfile.mobileNumber || '',
      alternativeMobileNumber: prev.alternativeMobileNumber || studentProfile.alternativeMobileNumber || '',
      state: prev.state || studentProfile.state || 'Karnataka',
    }));
  }, [studentProfile]);

  // Teacher/Admin Lesson Editor
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingLessonTitle, setEditingLessonTitle] = useState('');
  const [editingLessonModuleId, setEditingLessonModuleId] = useState('');
  const [editingLessonObjectives, setEditingLessonObjectives] = useState('');
  const [editingLessonMaterials, setEditingLessonMaterials] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  // Module 2: YouTube Search, Recommendations & Active Learning Session
  const [ytSearchQuery, setYtSearchQuery] = useState('');
  const [ytSearching, setYtSearching] = useState(false);
  const [ytLevelFilter, setYtLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideoRecommendation[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideoRecommendation | null>(null);
  const [activeSession, setActiveSession] = useState<VideoLearningSession | null>(null);
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [iframePlaybackPercent, setIframePlaybackPercent] = useState(0);
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);
  const [videoSessions, setVideoSessions] = useState<VideoLearningSession[]>([]);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement | null>(null);
  const activeSessionRef = useRef<VideoLearningSession | null>(null);
  const startingSessionRef = useRef(false);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // Module 3: AI Learning Verification Quiz
  const [quizConfig, setQuizConfig] = useState<QuizConfigDoc | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [lastQuizAttempt, setLastQuizAttempt] = useState<QuizAttempt | null>(null);

  // Module 4: AI Practical Project Generator & Submissions
  const [projectBrief, setProjectBrief] = useState<PracticalProjectDefinition | null>(null);
  const [projectSubmissions, setProjectSubmissions] = useState<ProjectSubmission[]>([]);
  const [projectNotes, setProjectNotes] = useState('');
  const [projectRepoUrl, setProjectRepoUrl] = useState('');
  const [projectDemoUrl, setProjectDemoUrl] = useState('');
  const [projectFiles, setProjectFiles] = useState<Array<{ name: string; url: string; size?: string; type?: string }>>([]);
  const [uploadingProjectFile, setUploadingProjectFile] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);

  // Module 5: Student Presentation System
  const [presentations, setPresentations] = useState<StudentPresentation[]>([]);
  const [presentationMethod, setPresentationMethod] = useState<'SLIDES_UPLOAD' | 'RECORDED_VIDEO' | 'LIVE_SCHEDULE'>('SLIDES_UPLOAD');
  const [presentationUrl, setPresentationUrl] = useState('');
  const [presentationFileName, setPresentationFileName] = useState('');
  const [uploadingPresFile, setUploadingPresFile] = useState(false);
  const [presentationNotes, setPresentationNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-11-20');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('15:00');
  const [submittingPresentation, setSubmittingPresentation] = useState(false);

  // Quinn AI Mentor Drawer
  const [quinnDrawerOpen, setQuinnDrawerOpen] = useState(false);
  const [quinnLang, setQuinnLang] = useState('English');
  const [quinnCapability, setQuinnCapability] = useState<string>('explain_simple');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const voiceRecognitionRef = useRef<any>(null);
  const [quinnMessages, setQuinnMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: "Hello! I'm Quinn AI, your dedicated academic mentor. Ask me anything about this lesson, pick one of the 19 tutor & interview modes below, or switch languages anytime.",
    },
  ]);
  const [quinnInput, setQuinnInput] = useState('');
  const [quinnTyping, setQuinnTyping] = useState(false);

  // Bookmarks, Lesson Notes, AI Lesson Summary, Content Report, Timed Quiz
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<Set<string>>(new Set());
  const [lessonNotes, setLessonNotes] = useState<StudentLessonNote[]>([]);
  const [noteInput, setNoteInput] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [lessonSummary, setLessonSummary] = useState<{ keyTakeaways: string[]; studyTips: string[]; disclaimer: string } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState<Array<{ question: string; hint: string; sampleAnswer: string; difficulty: string }> | null>(null);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [randomizeQuizOrder, setRandomizeQuizOrder] = useState(true);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<'Broken Video' | 'Audio Issue' | 'Off-Topic' | 'Inappropriate' | 'Copyright Concern' | 'Other'>('Broken Video');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [timedQuizMode, setTimedQuizMode] = useState(false);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(900);
  const autoSubmittedQuizRef = useRef(false);

  const notify = (type: 'success' | 'error' | 'info', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => setStatusBanner(null), 5500);
  };

  useEffect(() => {
    if (queryTab) setActiveTab(queryTab);
  }, [queryTab]);

  // Initial Course & LMS Hydration
  useEffect(() => {
    if (authLoading) return;
    let active = true;

    async function loadWorkspace() {
      setLoading(true);
      const found = await marketplaceService.getCourseById(courseIdParam);
      if (!found || !active) {
        setCourse(null);
        setLoading(false);
        return;
      }
      setCourse(found);

      const curriculum = await lmsService.getCourseCurriculum(found);
      if (!active) return;
      setModules(curriculum.modules);
      setLessons(curriculum.lessons);

      const firstModId = curriculum.modules[0]?.id;
      if (firstModId) setExpandedModules({ [firstModId]: true });
      const firstLesson = curriculum.lessons[0];
      const targetLessonId = firstLesson?.id || `${found.id}_l_1_1`;
      setActiveLessonId(targetLessonId);
      const lessonTopic = firstLesson?.title || firstLesson?.topicName || found.title;

      // Prefer direct module/course assigned YouTube videos (modeled courses & YouTube tracks), fallback to Quinn AI
      const preAssigned =
        firstLesson?.recommendedVideos && firstLesson.recommendedVideos.length > 0
          ? firstLesson.recommendedVideos
          : found.recommendedVideos && found.recommendedVideos.length > 0
          ? found.recommendedVideos
          : [];
      const recs =
        preAssigned.length > 0
          ? preAssigned
          : await quinnAiService.recommendVideos({
              courseTitle: found.title,
              category: found.category,
              lessonTopic,
              level: found.level,
            });
      if (!active) return;
      setRecommendedVideos(recs);
      if (recs[0]) setSelectedVideo(recs[0]);

      // Gate paid courses strictly on verified paid/complimentary/scholarship enrollment (unless Teacher/Admin)
      if (found.price > 0 && !isEducatorOrAdmin) {
        if (!currentUser || !studentId) {
          if (active) {
            setRequiresEnrollment(true);
            setLoading(false);
          }
          return;
        }
        const existingEnrollments = await lmsService.getStudentEnrollments(studentId);
        const hasActivePaidEnrollment = existingEnrollments.some(
          (en) =>
            en.courseId === found.id &&
            ['Paid', 'Complimentary', 'Scholarship'].includes(en.paymentStatus || '')
        );
        if (!hasActivePaidEnrollment) {
          if (active) {
            setRequiresEnrollment(true);
            setLoading(false);
          }
          return;
        }
      }
      if (active) setRequiresEnrollment(false);

      if (currentUser && studentId) {
        const { progress: prog } = await lmsService.enrollStudentInCourse(found, {
          uid: studentId,
          fullName: studentName,
          email: studentEmail,
          registrationNumber: lmsUser?.registrationNumber,
        });
        if (!active) return;
        setProgress(prog);

        const [vSessions, qConfig, qAttempts, pSubs, presList, stuCerts] = await Promise.all([
          lmsService.getVideoSessions(studentId, found.id),
          lmsService.getQuizConfig(found.id, targetLessonId),
          lmsService.getQuizAttempts(studentId, found.id),
          lmsService.getProjectSubmissionsForStudent(studentId, found.id),
          lmsService.getPresentationsForStudent(studentId, found.id),
          lmsService.getCertificatesForStudent(studentId),
        ]);

        if (!active) return;
        setVideoSessions(vSessions);
        setQuizConfig(qConfig);
        setQuizAttempts(qAttempts);
        if (qAttempts[0]) setLastQuizAttempt(qAttempts[0]);
        setProjectSubmissions(pSubs);
        setPresentations(presList);

        const matchingCert = stuCerts.find((c) => c.courseId === found.id) || prog.certificate || null;
        if (matchingCert) setCertificate(matchingCert);

        const brief = await lmsService.getOrGenerateProjectBrief(found, lessonTopic, studentId, targetLessonId);
        if (active) setProjectBrief(brief);

        const perf = await quinnAiService.analyzePerformance({
          quizAttempts: qAttempts,
          completedLessons: prog.completedLessonIds.length,
          totalLessons: Math.max(1, curriculum.lessons.length),
          courseTitle: found.title,
          evaluation: prog.teacherEvaluation
            ? {
                scores: prog.teacherEvaluation.rubricScores,
                totalScore: prog.teacherEvaluation.totalScore,
              }
            : undefined,
        });
        if (active) setPerformance(perf);
      }
      setLoading(false);
    }

    loadWorkspace();
    return () => {
      active = false;
    };
  }, [courseIdParam, authLoading, currentUser?.uid, isEducatorOrAdmin, workspaceNonce]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  // Refresh lesson-specific videos & quiz config when lesson changes
  const handleSelectLesson = async (lesson: LmsLesson) => {
    setActiveLessonId(lesson.id);
    setQuizQuestions([]);
    setUserQuizAnswers({});
    if (!course) return;

    const topic = lesson.title || lesson.topicName || course.title;
    setLessonSummary(null);
    const directLessonVids =
      lesson.recommendedVideos && lesson.recommendedVideos.length > 0
        ? lesson.recommendedVideos
        : [];
    const [recs, qCfg] = await Promise.all([
      directLessonVids.length > 0
        ? Promise.resolve(directLessonVids)
        : quinnAiService.recommendVideos({
            courseTitle: course.title,
            category: course.category,
            lessonTopic: topic,
            level: course.level,
          }),
      lmsService.getQuizConfig(course.id, lesson.id),
    ]);
    setRecommendedVideos(recs);
    if (recs[0]) setSelectedVideo(recs[0]);
    setQuizConfig(qCfg);
  };

  // Load Student Notes & Bookmarks
  useEffect(() => {
    const uid = studentId || 'guest_learner';
    if (!courseIdParam) return;
    Promise.all([
      lmsService.getStudentNotes(uid, courseIdParam),
      lmsService.getStudentBookmarks(uid),
    ]).then(([notes, bms]) => {
      setLessonNotes(notes);
      setBookmarkedLessonIds(new Set(bms.map((b) => `${b.courseId}::${b.lessonId}`)));
    }).catch(() => {});
  }, [studentId, courseIdParam]);

  // Timed Quiz Countdown Timer (auto-submits cleanly at 0:00)
  useEffect(() => {
    if (!timedQuizMode || activeTab !== 'quiz') {
      autoSubmittedQuizRef.current = false;
      return;
    }
    if (quizSecondsLeft <= 0) {
      if (!autoSubmittedQuizRef.current && !quizSubmitting && quizQuestions.length > 0 && currentUser) {
        autoSubmittedQuizRef.current = true;
        notify('info', 'Time expired — auto-submitting your verification quiz now.');
        executeQuizSubmit();
      }
      return;
    }
    const t = setInterval(() => {
      setQuizSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [timedQuizMode, activeTab, quizSecondsLeft]);

  const handlePrevNextLesson = (dir: -1 | 1) => {
    if (lessons.length === 0) return;
    const curIdx = lessons.findIndex((l) => l.id === activeLessonId);
    const nextIdx = curIdx === -1 ? 0 : curIdx + dir;
    if (nextIdx >= 0 && nextIdx < lessons.length) {
      handleSelectLesson(lessons[nextIdx]);
    }
  };

  const handleToggleLessonBookmark = async () => {
    if (!course || !activeLesson) return;
    const uid = studentId || 'guest_learner';
    const saved = await lmsService.toggleLessonBookmark({
      studentId: uid,
      courseId: course.id,
      courseTitle: course.title,
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title || activeLesson.topicName || course.title,
      videoId: selectedVideo?.videoId || selectedVideo?.youtubeId,
    });
    const bmKey = `${course.id}::${activeLesson.id}`;
    setBookmarkedLessonIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(bmKey);
      else next.delete(bmKey);
      return next;
    });
    notify('info', saved ? 'Lesson saved to My Bookmarks.' : 'Removed lesson from bookmarks.');
  };

  const handleSaveLessonNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !activeLesson || !noteInput.trim()) return;
    setSavingNote(true);
    try {
      const uid = studentId || 'guest_learner';
      await lmsService.saveLessonNote({
        id: `${uid}_${course.id}_${activeLesson.id}_${Date.now()}`,
        studentId: uid,
        courseId: course.id,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title || activeLesson.topicName || course.title,
        content: noteInput.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setNoteInput('');
      const refreshed = await lmsService.getStudentNotes(uid, course.id);
      setLessonNotes(refreshed);
      notify('success', 'Lesson study note saved.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const uid = studentId || 'guest_learner';
    await lmsService.deleteLessonNote(noteId, uid);
    setLessonNotes((prev) => prev.filter((n) => n.id !== noteId));
    notify('info', 'Note deleted.');
  };

  const handleGenerateLessonSummary = async () => {
    if (!course) return;
    setSummaryLoading(true);
    try {
      const sum = await quinnAiService.generateLessonSummary({
        courseTitle: course.title,
        lessonTopic: activeLesson?.title || activeLesson?.topicName || course.title,
        videoTitle: selectedVideo?.title,
        language: quinnLang,
        objectives: activeLesson?.learningObjectives || course.learningObjectives,
      });
      setLessonSummary(sum);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGeneratePracticeQuestions = async () => {
    if (!course) return;
    setPracticeLoading(true);
    try {
      const qs = await quinnAiService.generatePracticeQuestions({
        courseTitle: course.title,
        lessonTopic: activeLesson?.title || activeLesson?.topicName || course.title,
        language: quinnLang,
        objectives: activeLesson?.learningObjectives || course.learningObjectives,
      });
      setPracticeQuestions(qs);
    } finally {
      setPracticeLoading(false);
    }
  };

  const handleSubmitContentReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    setSubmittingReport(true);
    try {
      await lmsService.submitContentReport({
        reporterUid: studentId || 'guest',
        reporterEmail: studentEmail || undefined,
        courseId: course.id,
        lessonId: activeLesson?.id,
        videoId: selectedVideo?.videoId || selectedVideo?.youtubeId,
        reason: reportReason,
        details: reportDetails.trim() || reportReason,
      });
      setReportModalOpen(false);
      setReportDetails('');
      notify('success', 'Content report submitted to OpenFrame moderation team.');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  // Detect tab return after opening YouTube in new tab -> show "Have you completed this video?"
  useEffect(() => {
    if (!activeSession || activeSession.completed) return;

    const handleReturn = () => {
      if (document.visibilityState === 'visible') {
        setShowReturnPrompt(true);
      }
    };

    const timer = setInterval(() => {
      setWatchSeconds((prev) => prev + 1);
    }, 1000);

    window.addEventListener('focus', handleReturn);
    document.addEventListener('visibilitychange', handleReturn);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleReturn);
      document.removeEventListener('visibilitychange', handleReturn);
    };
  }, [activeSession]);

  // YouTube IFrame Player API integration for embedded playback progress tracking
  useEffect(() => {
    if (activeTab !== 'video' || !selectedVideo || !ytContainerRef.current) return;
    const videoId = selectedVideo.videoId || selectedVideo.youtubeId;
    if (!videoId) return;

    let progressInterval: any;
    let isCancelled = false;
    setYtError(null);

    const initPlayer = () => {
      if (isCancelled || !window.YT || !window.YT.Player || !ytContainerRef.current) return;
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
        }
      } catch {
        // ignore
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1, origin: window.location.origin },
        events: {
          onError: (errEvent: any) => {
            if (isCancelled) return;
            const code = Number(errEvent?.data || 0);
            const reasonMap: Record<number, string> = {
              2: 'Invalid or unavailable YouTube video identifier.',
              5: 'HTML5 video playback error in this browser.',
              100: 'This YouTube lecture was removed or marked private by the uploader.',
              101: 'The channel owner restricted embedded playback for this video.',
              150: 'The channel owner restricted embedded playback for this video.',
            };
            setYtError(reasonMap[code] || 'Embedded playback unavailable for this YouTube video.');
          },
          onStateChange: (event: any) => {
            if (isCancelled) return;
            // 1 = PLAYING, 0 = ENDED
            if (event.data === 1) {
              setYtError(null);
              if (!activeSessionRef.current && !startingSessionRef.current && currentUser && course) {
                startingSessionRef.current = true;
                lmsService
                  .startVideoSession({
                    studentId,
                    courseId: course.id,
                    lessonId: activeLesson?.id || `${course.id}_l_1_1`,
                    videoId,
                    videoTitle: selectedVideo.title,
                  })
                  .then((ses) => {
                    if (!isCancelled) {
                      activeSessionRef.current = ses;
                      setActiveSession(ses);
                    }
                  })
                  .finally(() => {
                    startingSessionRef.current = false;
                  });
              }
              clearInterval(progressInterval);
              progressInterval = setInterval(() => {
                if (isCancelled) return;
                try {
                  const cur = ytPlayerRef.current?.getCurrentTime?.() || 0;
                  const dur = ytPlayerRef.current?.getDuration?.() || 1;
                  const pct = Math.min(100, Math.round((cur / dur) * 100));
                  setIframePlaybackPercent(pct);
                  setWatchSeconds(Math.round(cur));
                  if (activeSessionRef.current?.id) {
                    lmsService.updateVideoPlaybackProgress(activeSessionRef.current.id, cur, pct);
                  }
                } catch {
                  // ignore
                }
              }, 3000);
            } else if (event.data === 0) {
              setIframePlaybackPercent(100);
              setShowReturnPrompt(true);
              clearInterval(progressInterval);
            } else {
              clearInterval(progressInterval);
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === 'function') {
          try {
            prevReady();
          } catch {
            // ignore
          }
        }
        initPlayer();
      };
    }

    return () => {
      isCancelled = true;
      clearInterval(progressInterval);
      try {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
          ytPlayerRef.current.destroy();
          ytPlayerRef.current = null;
        }
      } catch {
        // ignore
      }
    };
  }, [activeTab, selectedVideo?.videoId]);

  const handleStartLearningNewTab = async (vid: YouTubeVideoRecommendation) => {
    if (!currentUser) {
      navigate(`/portal?role=student&redirect=/learn/${courseIdParam}`);
      return;
    }
    if (!course) return;
    const videoId = vid.videoId || vid.youtubeId || vid.id;
    setSelectedVideo(vid);
    setWatchSeconds(0);
    setIframePlaybackPercent(0);
    setShowReturnPrompt(false);

    startingSessionRef.current = true;
    try {
      const session = await lmsService.startVideoSession({
        studentId,
        courseId: course.id,
        lessonId: activeLesson?.id || `${course.id}_l_1_1`,
        videoId,
        videoTitle: vid.title,
      });
      activeSessionRef.current = session;
      setActiveSession(session);
      setShowReturnPrompt(true);
      setTimeout(() => {
        ytContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        ytPlayerRef.current?.playVideo?.();
      }, 250);
    } finally {
      startingSessionRef.current = false;
    }
  };

  const handleConfirmVideoCompleted = async () => {
    if (!course || !currentUser || !selectedVideo) return;
    const sesId = activeSession?.id || `vses_${studentId}_${Date.now()}`;
    const lessonId = activeLesson?.id || `${course.id}_l_1_1`;
    const updatedProg = await lmsService.confirmVideoCompletion(
      sesId,
      studentId,
      course.id,
      lessonId,
      Math.max(watchSeconds, 10),
      course.title
    );
    setProgress(updatedProg);
    setActiveSession((prev) => (prev ? { ...prev, completed: true } : null));
    setShowReturnPrompt(false);
    const updatedList = await lmsService.getVideoSessions(studentId, course.id);
    setVideoSessions(updatedList);
    notify('success', 'Video lecture marked as completed. Proceed to AI Learning Verification!');
  };

  const handleContinueLearning = () => {
    setShowReturnPrompt(false);
    ytContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    ytPlayerRef.current?.playVideo?.();
  };

  const handleSearchYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytSearchQuery.trim() || !course) return;
    setYtSearching(true);
    const { videos } = await youtubeVideoService.searchYouTubeApi(ytSearchQuery, course.category, 6);
    if (videos.length > 0) {
      setRecommendedVideos(videos);
      setSelectedVideo(videos[0]);
    } else {
      notify('info', 'No additional YouTube videos matched that query; showing existing lectures.');
    }
    setYtSearching(false);
  };

  // Generate or load verification quiz
  const shuffleQuestionsList = (items: QuizQuestion[]): QuizQuestion[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleStartOrLoadQuiz = async () => {
    if (!course) return;
    setQuizLoading(true);
    autoSubmittedQuizRef.current = false;
    const cfg = quizConfig || (await lmsService.getQuizConfig(course.id, activeLesson?.id || `${course.id}_l_1_1`));
    const res = await quinnAiService.generateVerificationQuestions({
      courseTitle: course.title,
      lessonTopic: activeLesson?.title || activeLesson?.topicName || course.title,
      category: course.category,
      learningObjectives: activeLesson?.learningObjectives || course.learningObjectives || [],
      learningMaterials: activeLesson?.learningMaterials,
      basicCount: cfg.basicCount,
      intermediateCount: cfg.intermediateCount,
      advancedCount: cfg.advancedCount,
    });
    setQuizQuestions(randomizeQuizOrder ? shuffleQuestionsList(res.questions) : res.questions);
    setUserQuizAnswers({});
    if (timedQuizMode) setQuizSecondsLeft(900);
    setQuizLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'quiz' && quizQuestions.length === 0 && course && !quizLoading) {
      handleStartOrLoadQuiz();
    }
  }, [activeTab, course?.id, activeLessonId]);

  const executeQuizSubmit = async () => {
    if (!course || !currentUser || quizSubmitting) {
      if (!currentUser) {
        navigate(`/portal?role=student&redirect=/learn/${courseIdParam}`);
      }
      return;
    }
    const maxRetakes = quizConfig?.maxRetakes ?? 5;
    if (quizAttempts.length >= maxRetakes && !quizAttempts.some((a) => a.passed)) {
      notify('error', `Maximum retake limit (${maxRetakes}) reached. Contact your assigned teacher or administrator.`);
      return;
    }

    setQuizSubmitting(true);
    try {
      const attempt = await quinnAiService.evaluateQuizAttempt({
        questions: quizQuestions,
        studentAnswers: userQuizAnswers,
        studentId,
        courseId: course.id,
        lessonId: activeLesson?.id || `${course.id}_l_1_1`,
        passingScorePercent: quizConfig?.passingScorePercent ?? 70,
      });
      attempt.attemptNumber = quizAttempts.length + 1;
      attempt.studentName = studentName;

      const updatedProg = await lmsService.saveQuizAttempt(attempt, course.title);
      setProgress(updatedProg);
      setLastQuizAttempt(attempt);
      const allAttempts = await lmsService.getQuizAttempts(studentId, course.id);
      setQuizAttempts(allAttempts);
      setTimedQuizMode(false);

      if (attempt.passed) {
        notify('success', `Assessment passed (${attempt.percentageScore}%). Practical Project stage is now unlocked.`);
      } else {
        notify('error', `Scored ${attempt.percentageScore}%. Review Quinn AI explanations and revision topics before retaking.`);
      }
    } finally {
      setQuizSubmitting(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeQuizSubmit();
  };

  // File upload for Practical Project
  const handleProjectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingProjectFile(true);
    try {
      const uploadedList: Array<{ name: string; url: string; size?: string; type?: string }> = [];
      for (const file of Array.from(files)) {
        const res = await lmsService.uploadDeliverableFile(file, 'projects');
        uploadedList.push({
          name: res.fileName,
          url: res.url,
          size: `${(res.size / 1024).toFixed(0)} KB`,
          type: file.type || file.name.split('.').pop() || 'file',
        });
      }
      setProjectFiles((prev) => [...prev, ...uploadedList]);
      notify('success', `Uploaded ${uploadedList.length} deliverable file(s) securely.`);
    } catch (err: any) {
      notify('error', err?.message || 'File upload failed.');
    } finally {
      setUploadingProjectFile(false);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !currentUser || !projectBrief) return;
    if (projectFiles.length === 0 && !projectRepoUrl.trim() && !projectDemoUrl.trim()) {
      notify('error', 'Upload at least one deliverable file or provide a project/demo URL.');
      return;
    }

    setSubmittingProject(true);
    try {
      const sub: ProjectSubmission = {
        submissionId: `sub_${studentId}_${Date.now()}`,
        projectId: projectBrief.projectId || projectBrief.id || `proj_${course.id}`,
        projectTitle: projectBrief.title,
        studentId,
        studentName,
        registrationNumber: lmsUser?.registrationNumber,
        courseId: course.id,
        courseTitle: course.title,
        lessonId: activeLesson?.id,
        submissionNotes: projectNotes,
        githubOrProjectUrl: projectRepoUrl.trim() || undefined,
        demoVideoUrl: projectDemoUrl.trim() || undefined,
        attachedFiles: projectFiles,
        fileUrl: projectFiles[0]?.url,
        fileName: projectFiles[0]?.name,
        teacherId: progress?.assignedTeacherId,
        submittedAt: new Date().toISOString(),
        status: 'Submitted',
      };
      const updatedProg = await lmsService.submitPracticalProject(sub);
      setProgress(updatedProg);
      const updatedSubs = await lmsService.getProjectSubmissionsForStudent(studentId, course.id);
      setProjectSubmissions(updatedSubs);
      notify('success', 'Practical project submitted for teacher evaluation. Proceed to Student Presentation.');
      setActiveTab('presentation');
    } catch (err: any) {
      notify('error', err?.message || 'Project submission failed.');
    } finally {
      setSubmittingProject(false);
    }
  };

  // Presentation file upload & submit
  const handlePresentationFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPresFile(true);
    try {
      const res = await lmsService.uploadDeliverableFile(file, 'presentations');
      setPresentationUrl(res.url);
      setPresentationFileName(res.fileName);
      notify('success', `Uploaded "${res.fileName}" successfully.`);
    } catch (err: any) {
      notify('error', err?.message || 'Presentation upload failed.');
    } finally {
      setUploadingPresFile(false);
    }
  };

  const handlePresentationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !currentUser) return;
    if (presentationMethod !== 'LIVE_SCHEDULE' && !presentationUrl.trim()) {
      notify('error', 'Please upload your presentation file or enter a valid slides/video link.');
      return;
    }

    setSubmittingPresentation(true);
    try {
      const pres: StudentPresentation = {
        presentationId: `pres_${studentId}_${Date.now()}`,
        studentId,
        studentName,
        courseId: course.id,
        courseTitle: course.title,
        projectId: projectBrief?.id,
        presentationMethod,
        slidesUrl: presentationMethod === 'SLIDES_UPLOAD' ? presentationUrl.trim() : undefined,
        slidesFileName: presentationMethod === 'SLIDES_UPLOAD' ? presentationFileName : undefined,
        videoUrl: presentationMethod === 'RECORDED_VIDEO' ? presentationUrl.trim() : undefined,
        videoFileName: presentationMethod === 'RECORDED_VIDEO' ? presentationFileName : undefined,
        scheduledDate: presentationMethod === 'LIVE_SCHEDULE' ? scheduledDate : undefined,
        scheduledTimeSlot: presentationMethod === 'LIVE_SCHEDULE' ? scheduledTimeSlot : undefined,
        scheduledTime: presentationMethod === 'LIVE_SCHEDULE' ? `${scheduledDate} ${scheduledTimeSlot}` : undefined,
        teacherId: progress?.assignedTeacherId,
        teacherName: progress?.assignedTeacherName,
        notes: presentationNotes,
        submittedAt: new Date().toISOString(),
        status: presentationMethod === 'LIVE_SCHEDULE' ? 'Scheduled' : 'Submitted',
      };
      const updatedProg = await lmsService.submitPresentation(pres);
      setProgress(updatedProg);
      const list = await lmsService.getPresentationsForStudent(studentId, course.id);
      setPresentations(list);
      notify('success', 'Presentation saved and queued for teacher evaluation.');
      setActiveTab('evaluation');
    } catch (err: any) {
      notify('error', err?.message || 'Presentation submission failed.');
    } finally {
      setSubmittingPresentation(false);
    }
  };

  // Teacher/Admin Lesson Save
  const handleSaveCustomLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !editingLessonTitle.trim()) return;
    setSavingLesson(true);
    const targetMod = modules.find((m) => m.id === editingLessonModuleId) || modules[0];
    const newLesson: LmsLesson = {
      id: `${course.id}_l_${Date.now()}`,
      courseId: course.id,
      moduleId: targetMod?.id || `${course.id}_mod_1`,
      moduleNumber: targetMod?.moduleNumber || 1,
      moduleTitle: targetMod?.title || course.title,
      lessonNumber: lessons.length + 1,
      topicName: editingLessonTitle.trim(),
      title: editingLessonTitle.trim(),
      durationMinutes: 45,
      mandatory: true,
      learningObjectives: editingLessonObjectives
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      learningMaterials: editingLessonMaterials.trim(),
      practicalProject: {
        courseId: course.id,
        title: `Capstone: ${course.title}`,
        description: course.practicalProjects?.[0] || 'Applied practical project',
        objectives: [],
        instructions: [],
        submissionDeadlineDays: 14,
        evaluationCriteria: [],
        maxMarks: 100,
        difficultyLevel: 'Intermediate',
      },
      updatedBy: studentEmail,
    };
    await lmsService.saveLesson(newLesson);
    const refreshed = await lmsService.getCourseCurriculum(course);
    setModules(refreshed.modules);
    setLessons(refreshed.lessons);
    setLessonEditorOpen(false);
    setEditingLessonTitle('');
    setEditingLessonObjectives('');
    setEditingLessonMaterials('');
    setSavingLesson(false);
    notify('success', 'New lesson added to course curriculum.');
  };

  const handleDeleteCustomLesson = async (lessonId: string) => {
    if (!course) return;
    await lmsService.deleteLesson(lessonId);
    const refreshed = await lmsService.getCourseCurriculum(course);
    setModules(refreshed.modules);
    setLessons(refreshed.lessons);
    notify('info', 'Lesson removed from curriculum.');
  };

  // Ask Quinn AI Mentor (supports 19 capabilities + Child-Safe Minor Mode + Voice + Multilingual)
  const triggerQuinnPrompt = async (promptText: string, modeOverride?: string) => {
    if (!promptText.trim() || !course) return;
    const msg = promptText.trim();
    const updatedHistory = [...quinnMessages, { role: 'user' as const, text: msg }];
    setQuinnMessages(updatedHistory);
    setQuinnInput('');
    setQuinnTyping(true);

    const isMinorLearner = Boolean((lmsUser as any)?.isMinor) ||
      course.category.toLowerCase().includes('school') ||
      course.category.toLowerCase().includes('parenting');

    const reply = await quinnAiService.chatWithAssistant({
      message: msg,
      courseTitle: course.title,
      lessonTopic: activeLesson?.title || course.title,
      language: quinnLang,
      capabilityMode: modeOverride || quinnCapability,
      history: updatedHistory,
      isMinor: isMinorLearner,
    });

    setQuinnTyping(false);
    setQuinnMessages((prev) => [...prev, { role: 'model', text: reply }]);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      notify('info', 'Voice dictation is not supported in this browser. Type your question below.');
      return;
    }
    if (isListeningVoice && voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop();
      setIsListeningVoice(false);
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = quinnLang === 'Hindi' ? 'hi-IN' : quinnLang === 'Kannada' ? 'kn-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        setQuinnInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
      setIsListeningVoice(false);
    };
    recognition.onerror = () => setIsListeningVoice(false);
    recognition.onend = () => setIsListeningVoice(false);
    voiceRecognitionRef.current = recognition;
    setIsListeningVoice(true);
    recognition.start();
  };

  const handleSendQuinn = async (e: React.FormEvent) => {
    e.preventDefault();
    await triggerQuinnPrompt(quinnInput);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
        <div className="w-9 h-9 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-700">Loading Quinn AI Learning Workspace...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h1 className="text-xl font-bold text-slate-900">Course Not Found</h1>
        <p className="text-xs text-slate-600">Could not locate course identifier {courseIdParam}.</p>
        <button
          type="button"
          onClick={() => navigate('/marketplace')}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Browse Course Catalog
        </button>
      </div>
    );
  }

  if (requiresEnrollment) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-7 shadow-lg text-left space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                Enrollment &amp; Checkout Required
              </div>
              <h1 className="text-lg font-bold text-[#18221F]">{course.title}</h1>
            </div>
          </div>

          {(() => {
            const gatePricing = compute90PercentCoursePricing({
              category: course.category,
              title: course.title,
              level: course.level,
              educationLevels: course.educationLevels,
              existingPrice: course.price,
            });
            return (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  This course ({course.id}) is covered by OpenFrame&apos;s <strong className="text-[#123D32]">90% Grant</strong> (<strong className="text-slate-900 tabular-nums">{formatInr(gatePricing.finalPriceInr)}</strong> instead of <span className="line-through text-slate-400 tabular-nums">{formatInr(gatePricing.marketBenchmarkPriceInr)}</span>). Complete enrollment and mandatory 7-field certificate address verification to unlock all {modules.length} curriculum modules, YouTube lectures, verification tests, and QR-verified certification.
                </p>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{course.category} · {course.level}</div>
                    <div className="text-slate-500 mt-0.5">{course.duration} · {course.language || 'English'}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-base font-extrabold text-[#123D32]">{formatInr(gatePricing.finalPriceInr)}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="line-through mr-1">{formatInr(gatePricing.marketBenchmarkPriceInr)}</span>
                      <span className="text-emerald-700 font-bold">90% Off</span>
                    </div>
                  </div>
                </div>
              </>
            );
          })()}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setEnrollModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs text-center transition-colors cursor-pointer whitespace-nowrap"
            >
              Enroll &amp; Complete Checkout
            </button>
            <button
              type="button"
              onClick={() => navigate(`/marketplace/${course.id}`)}
              className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              View Syllabus Details
            </button>
          </div>
        </div>

        <CourseEnrollmentModal
          isOpen={enrollModalOpen}
          onClose={() => setEnrollModalOpen(false)}
          course={course}
          onEnrolled={() => {
            setEnrollModalOpen(false);
            setRequiresEnrollment(false);
            setWorkspaceNonce((n) => n + 1);
            notify('success', 'Course unlocked! Welcome to your learning workspace.');
          }}
        />
      </div>
    );
  }

  const quizPassed = Boolean(
    progress?.completedStages.includes('QUIZ_COMPLETION') || quizAttempts.some((a) => a.passed)
  );
  const completedModulesCount = progress?.completedLessonIds?.length || 0;
  const activeLessonCompleted = Boolean(activeLesson && progress?.completedLessonIds?.includes(activeLesson.id));
  const bestQuizScore = quizAttempts.reduce((max, a) => Math.max(max, Number(a.percentageScore || 0)), 0);

  const handleMarkActiveModuleComplete = async () => {
    if (!course || !studentId || completingModule) return;
    const targetId = activeLesson?.id || lessons[0]?.id || 'lesson-1';
    setCompletingModule(true);
    try {
      const updated = await lmsService.completeLessonModule(
        studentId,
        course.id,
        targetId,
        course.title,
        Math.max(1, lessons.length)
      );
      setProgress(updated);
      notify(
        'success',
        `Module marked completed (${updated.completedLessonIds.length}/${Math.max(1, lessons.length)}). You can now proceed to the next module or take the Verification Test.`
      );
    } catch (err: any) {
      notify('error', err?.message || 'Unable to update module progress right now.');
    } finally {
      setCompletingModule(false);
    }
  };

  const handleClaimVerifiedCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !studentId) return;
    setCertAddressError(null);

    const validation = validateCertificateAddressDetails(certAddressForm);
    if (!validation.valid) {
      setCertAddressError(validation.error || 'Please complete all 7 mandatory certificate address and mobile fields.');
      return;
    }

    setCertClaiming(true);
    try {
      const effectiveProgress: StudentProgressRecord = progress || {
        studentId,
        studentName,
        studentEmail,
        courseId: course.id,
        courseTitle: course.title,
        currentStage: 'QUIZ_COMPLETION',
        completedStages: ['VIDEO_LEARNING', 'QUIZ_COMPLETION'],
        completedLessonIds: activeLesson?.id ? [activeLesson.id] : ['lesson-1'],
        quizAveragePercent: bestQuizScore >= 70 ? bestQuizScore : 75,
        overallProgressPercent: 90,
        certificateEligible: true,
        eligibilityChecklist: eligibility,
        updatedAt: new Date().toISOString(),
      };
      const result = await lmsService.claimVerifiedAssessmentCertificate({
        studentId,
        studentName,
        studentEmail,
        registrationNumber: lmsUser?.registrationNumber,
        course,
        progress: {
          ...effectiveProgress,
          quizAveragePercent: Math.max(effectiveProgress.quizAveragePercent || 0, bestQuizScore >= 70 ? bestQuizScore : quizPassed ? 75 : 0),
        },
        addressDetails: validation.cleaned,
      });
      setCertificate(result.certificate);
      setProgress(result.progress);
      notify('success', `Official QR-verified certificate issued (${result.certificate.certificateId})! You can download your PDF now.`);
    } catch (err: any) {
      setCertAddressError(err?.message || 'Unable to issue certificate yet. Ensure modules are completed and Verification Quiz is passed (≥70%).');
    } finally {
      setCertClaiming(false);
    }
  };

  const eligibility: CertificateEligibilityStatus = progress?.eligibilityChecklist || {
    allMandatoryLessonsCompleted: false,
    requiredAssessmentsCompleted: false,
    minimumQuizCriteriaMet: false,
    projectSubmittedAndApproved: false,
    presentationCompleted: false,
    teacherFinalApprovalGranted: false,
    isEligible: false,
  };

  const filteredVideos =
    ytLevelFilter === 'All'
      ? recommendedVideos
      : recommendedVideos.filter((v) => (v.level || v.difficultyLevel) === ytLevelFilter);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      {/* Workspace Subheader */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap shrink-0"
            >
              Student Dashboard
            </button>
            <span className="text-slate-300">/</span>
            <div className="truncate">
              <div className="text-sm font-bold text-slate-900 truncate">{course.title}</div>
              <div className="text-[11px] text-slate-500 truncate">
                {course.id} · {course.category} · {course.level} · {course.duration}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2.5 text-xs">
                <span className="text-slate-500">Progress</span>
                <span className="font-bold text-slate-900 tabular-nums">
                  {progress?.overallProgressPercent || 0}%
                </span>
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all"
                    style={{ width: `${progress?.overallProgressPercent || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <GoogleSignInButton
                  role="student"
                  label="Google Login"
                  variant="compact"
                />
                <button
                  type="button"
                  onClick={() => navigate(`/portal?role=student&redirect=/learn/${course.id}`)}
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setQuinnDrawerOpen(true)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Quinn AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {statusBanner && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-2 ${
              statusBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : statusBanner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <span>{statusBanner.text}</span>
            <button type="button" onClick={() => setStatusBanner(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Curriculum Sidebar */}
        <aside className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-20">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Course Curriculum</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {modules.length} Modules · {lessons.length} Lessons
              </p>
            </div>
            {isEducatorOrAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingLessonModuleId(modules[0]?.id || '');
                  setLessonEditorOpen(true);
                }}
                className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Lesson</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {modules.map((mod) => {
              const modLessons = lessons.filter((l) => l.moduleId === mod.id || l.moduleNumber === mod.moduleNumber);
              const isOpen = Boolean(expandedModules[mod.id]);
              return (
                <div key={mod.id} className="text-xs">
                  <button
                    type="button"
                    onClick={() => setExpandedModules((prev) => ({ ...prev, [mod.id]: !prev[mod.id] }))}
                    className="w-full p-3.5 flex items-start justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[11px] text-slate-400 tabular-nums">
                        Module {mod.moduleNumber} · {mod.duration}
                      </div>
                      <div className="font-semibold text-slate-900 mt-0.5">{mod.title}</div>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-2.5 pb-3 space-y-1 bg-slate-50/60">
                      {modLessons.map((lesson) => {
                        const isActive = activeLesson?.id === lesson.id;
                        const isDone = progress?.completedLessonIds.includes(lesson.id);
                        return (
                          <div key={lesson.id} className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSelectLesson(lesson)}
                              className={`flex-1 px-3 py-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                                isActive
                                  ? 'bg-blue-600 text-white font-semibold'
                                  : 'text-slate-700 hover:bg-slate-200/60'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                {isDone ? (
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-600'}`}
                                  />
                                ) : (
                                  <Circle
                                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-200' : 'text-slate-300'}`}
                                  />
                                )}
                                <span className="truncate">{lesson.title || lesson.topicName}</span>
                              </div>
                              <span
                                className={`text-[10px] tabular-nums shrink-0 ${
                                  isActive ? 'text-blue-100' : 'text-slate-400'
                                }`}
                              >
                                {lesson.durationMinutes || 45}m
                              </span>
                            </button>
                            {isEducatorOrAdmin && lesson.updatedBy && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomLesson(lesson.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600"
                                title="Delete custom lesson"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content Panel */}
        <main className="flex-1 min-w-0 space-y-5">
          {/* Lesson Controls Bar: Prev / Next, Bookmark, AI Summary, Report */}
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePrevNextLesson(-1)}
                disabled={lessons.findIndex((l) => l.id === activeLessonId) <= 0}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Lesson</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrevNextLesson(1)}
                disabled={
                  lessons.length === 0 ||
                  lessons.findIndex((l) => l.id === activeLessonId) >= lessons.length - 1
                }
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1 disabled:opacity-40 cursor-pointer"
              >
                <span>Next Lesson</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleLessonBookmark}
                className={`px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeLesson && bookmarkedLessonIds.has(`${course.id}::${activeLesson.id}`)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {activeLesson && bookmarkedLessonIds.has(`${course.id}::${activeLesson.id}`)
                    ? 'Bookmarked'
                    : 'Save Lesson'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleGenerateLessonSummary}
                disabled={summaryLoading}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 hover:bg-indigo-100 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{summaryLoading ? 'Summarizing...' : 'AI Lesson Summary'}</span>
              </button>

              <button
                type="button"
                onClick={handleGeneratePracticeQuestions}
                disabled={practiceLoading}
                className="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 hover:bg-cyan-100 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{practiceLoading ? 'Creating Qs...' : 'Practice Questions'}</span>
              </button>

              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 flex items-center gap-1 cursor-pointer"
                title="Report broken video or issue"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
              </button>
            </div>
          </div>

          {practiceQuestions && practiceQuestions.length > 0 && (
            <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-4 sm:p-5 text-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-cyan-950 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-700" />
                  <span>Quinn AI Practice Questions ({quinnLang})</span>
                </div>
                <button type="button" onClick={() => setPracticeQuestions(null)} className="text-slate-500 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {practiceQuestions.map((pq, idx) => (
                  <div key={idx} className="p-3 bg-white border border-cyan-200/80 rounded-xl space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-cyan-700">Q{idx + 1} · {pq.difficulty}</div>
                    <div className="font-semibold text-slate-900">{pq.question}</div>
                    <div className="text-[11px] text-slate-500">Hint: {pq.hint}</div>
                    <details className="text-[11px] text-emerald-800 pt-1">
                      <summary className="cursor-pointer font-semibold">Show Sample Answer</summary>
                      <p className="mt-1 text-slate-700">{pq.sampleAnswer}</p>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lessonSummary && (
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 sm:p-5 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Quinn AI Lesson Summary ({quinnLang})</span>
                </div>
                <button type="button" onClick={() => setLessonSummary(null)} className="text-slate-500 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Key Takeaways</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {lessonSummary.keyTakeaways.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-slate-900 mb-1">Study Tips</div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {lessonSummary.studyTips.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">{lessonSummary.disclaimer}</div>
            </div>
          )}

          {/* 8-Stage Navigation Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-1.5 overflow-x-auto">
            <nav className="flex items-center gap-1 text-xs font-medium min-w-max">
              {[
                { id: 'overview', label: '1. Overview', icon: BookOpen },
                { id: 'video', label: '2. YouTube Lectures', icon: Video },
                { id: 'resources', label: '3. Materials', icon: FileText },
                { id: 'quiz', label: '4. AI Verification', icon: HelpCircle },
                { id: 'project', label: '5. Practical Project', icon: FileCheck },
                { id: 'presentation', label: '6. Presentation', icon: Upload },
                { id: 'evaluation', label: '7. Evaluation', icon: Star },
                { id: 'certificate', label: '8. Certificate', icon: Award },
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as TabType)}
                    className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                      active ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Inline Teacher Lesson Creator Modal/Panel */}
          {lessonEditorOpen && isEducatorOrAdmin && (
            <form
              onSubmit={handleSaveCustomLesson}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Add / Organize Course Lesson</h3>
                <button type="button" onClick={() => setLessonEditorOpen(false)}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lesson Topic Name</label>
                  <input
                    type="text"
                    required
                    value={editingLessonTitle}
                    onChange={(e) => setEditingLessonTitle(e.target.value)}
                    placeholder="e.g. Prompt Guardrails & Evaluation Frameworks"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Module</label>
                  <select
                    value={editingLessonModuleId}
                    onChange={(e) => setEditingLessonModuleId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>
                        Module {m.moduleNumber}: {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Learning Objectives (one per line)</label>
                <textarea
                  rows={2}
                  value={editingLessonObjectives}
                  onChange={(e) => setEditingLessonObjectives(e.target.value)}
                  placeholder="Identify failure modes in prompts&#10;Implement deterministic validation rubrics"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Study Notes / Materials</label>
                <textarea
                  rows={2}
                  value={editingLessonMaterials}
                  onChange={(e) => setEditingLessonMaterials(e.target.value)}
                  placeholder="Key reading notes and implementation guidance..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLessonEditorOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLesson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  {savingLesson ? 'Saving...' : 'Save Lesson'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 1: COURSE & LESSON OVERVIEW (MODULE 1) */}
          {activeTab === 'overview' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <div className="text-xs text-blue-600 font-medium">
                  Module {activeLesson?.moduleNumber || 1} · Lesson {activeLesson?.lessonNumber || 1} · {course.level} · {course.duration}
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeLesson?.title || activeLesson?.topicName || course.title}
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100 text-xs">
                <div>
                  <div className="text-slate-400">Instructor</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {course.instructor?.name || 'OpenFrame Academic Faculty'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Total Lessons</div>
                  <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">{lessons.length} Lessons</div>
                </div>
                <div>
                  <div className="text-slate-400">Skills Covered</div>
                  <div className="font-semibold text-slate-900 mt-0.5 truncate">
                    {(course.skillsAcquired || []).slice(0, 2).join(', ')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Certificate Criteria</div>
                  <div className="font-semibold text-slate-900 mt-0.5">Videos + ≥70% Quiz + Project</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-sm">Lesson & Course Objectives</h3>
                  <ul className="space-y-2 text-slate-600">
                    {(activeLesson?.learningObjectives || course.learningObjectives || []).map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-bold text-slate-900 text-sm">Expected Learning Outcomes</h3>
                  <p className="text-slate-600 leading-relaxed">
                    {course.descriptionBreakdown?.achieveAfterCompletion ||
                      `Upon completion, learners can independently architect, evaluate, and defend practical ${course.category} deliverables assessed against OpenFrame's 6-criteria faculty rubric.`}
                  </p>
                  <div className="text-slate-500 pt-1">
                    Skills: {(course.skillsAcquired || course.skills || ['Applied Mastery']).join(' · ')}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open Recommended Videos</span>
                </button>
                <button
                  type="button"
                  onClick={handleMarkActiveModuleComplete}
                  disabled={completingModule || !studentId}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 ${
                    activeLessonCompleted
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-[#123D32] hover:bg-[#0D2E25] text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {completingModule
                      ? 'Saving Module...'
                      : activeLessonCompleted
                      ? `Module Completed (${completedModulesCount}/${Math.max(1, lessons.length)})`
                      : 'Mark Module Completed'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Start Verification Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('certificate')}
                  className="px-5 py-2.5 border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-[#123D32] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Claim Certificate
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUINN AI YOUTUBE VIDEO DISCOVERY & SESSION TRACKING (MODULE 2) */}
          {activeTab === 'video' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Quinn AI YouTube Lecture Recommendations
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Topic: {activeLesson?.title || course.title} · Curated across Beginner, Intermediate, and Advanced tracks
                    </p>
                  </div>

                  {/* Interactive Level Filter & Quick Complete */}
                  <div className="flex flex-wrap items-center gap-2 self-start">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
                      {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setYtLevelFilter(lvl)}
                          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                            ytLevelFilter === lvl ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleMarkActiveModuleComplete}
                      disabled={completingModule || !studentId}
                      className="px-3.5 py-2 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{activeLessonCompleted ? 'Module Completed' : 'Complete Module'}</span>
                    </button>
                  </div>
                </div>

                {/* Curated Educational Video Search */}
                <form onSubmit={handleSearchYouTube} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      value={ytSearchQuery}
                      onChange={(e) => setYtSearchQuery(e.target.value)}
                      placeholder={`Search educational YouTube videos for ${activeLesson?.title || course.category}...`}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={ytSearching}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold whitespace-nowrap disabled:opacity-50"
                  >
                    {ytSearching ? 'Searching...' : 'Search YouTube'}
                  </button>
                </form>

                {/* Return Completion Verification Banner ("Have you completed this video?") */}
                {showReturnPrompt && selectedVideo && (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-blue-900">
                        Have you completed this video?
                      </div>
                      <p className="text-xs text-blue-800">
                        "{selectedVideo.title}" · Session tracked ({watchSeconds}s active)
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleConfirmVideoCompleted}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold whitespace-nowrap"
                      >
                        Yes, I completed it.
                      </button>
                      <button
                        type="button"
                        onClick={handleContinueLearning}
                        className="px-4 py-2 bg-white border border-blue-300 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-semibold whitespace-nowrap"
                      >
                        Continue learning.
                      </button>
                      {(selectedVideo.videoId || selectedVideo.youtubeId) && (
                        <a
                          href={`https://www.youtube.com/watch?v=${encodeURIComponent(selectedVideo.videoId || selectedVideo.youtubeId || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold whitespace-nowrap inline-flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open on YouTube</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommended Video Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredVideos.map((vid) => {
                    const vId = vid.videoId || vid.youtubeId || vid.id;
                    const isAlreadyCompleted = videoSessions.some((s) => s.videoId === vId && s.completed);
                    return (
                      <div
                        key={vid.id}
                        className="border border-slate-200 rounded-2xl overflow-hidden flex flex-col bg-white"
                      >
                        <div className="relative aspect-video bg-slate-900 overflow-hidden">
                          <CourseThumbnail
                            src={vid.thumbnail || vid.thumbnailUrl}
                            alt={vid.title}
                            category={course?.category || (vid as any).subjectCategory}
                            categoryGroup={course?.categoryGroup}
                            youtubeVideoId={vid.videoId || vid.youtubeId}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded">
                            {vid.duration}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-500">
                              {vid.channelTitle} · {vid.level || vid.difficultyLevel || 'All Levels'}
                              {isAlreadyCompleted && ' · Completed'}
                            </div>
                            <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                              {vid.title}
                            </h3>
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              {vid.recommendedReason || vid.rationale}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleStartLearningNewTab(vid)}
                              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>START LEARNING</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVideo(vid);
                                setShowReturnPrompt(false);
                              }}
                              className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-[11px] font-medium"
                            >
                              Watch Embedded Player Below
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Embedded YouTube IFrame Player API Tracker */}
                {selectedVideo && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">
                          Embedded IFrame Player: {selectedVideo.title}
                        </span>
                        <span className="text-slate-500 ml-2 tabular-nums">
                          · Playback Tracked: {iframePlaybackPercent}% ({watchSeconds}s)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleConfirmVideoCompleted}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold self-start"
                      >
                        Mark Lesson Video Completed
                      </button>
                    </div>
                    {ytError && (
                      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{ytError} You can open the video directly on YouTube or switch to another recommended video above.</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {(selectedVideo.videoId || selectedVideo.youtubeId) && (
                            <a
                              href={`https://www.youtube.com/watch?v=${encodeURIComponent(selectedVideo.videoId || selectedVideo.youtubeId || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold inline-flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open on YouTube</span>
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setReportModalOpen(true)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold cursor-pointer"
                          >
                            Report Broken Video
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950">
                      <div ref={ytContainerRef} className="w-full h-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STUDY MATERIALS, PRACTICAL ASSIGNMENT & RESOURCES */}
          {activeTab === 'resources' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Learning Materials & Practical Assignment</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Topic: {activeLesson?.title || course.title}
                </p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-900">Lesson Study Notes</div>
                <p className="text-slate-600 leading-relaxed">
                  {activeLesson?.learningMaterials ||
                    `Focus on mastering core architectures, verifying design decisions against quantitative quality checks, and documenting implementation steps cleanly.`}
                </p>
              </div>

              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-slate-900">
                  {activeLesson?.practicalAssignment?.title || `Lesson Practical Exercise`}
                </div>
                <p className="text-slate-600">
                  {activeLesson?.practicalAssignment?.description ||
                    'Apply the core methodology from the lecture video to a minimal reproducible case study.'}
                </p>
                <div className="text-slate-500 pt-1">
                  Expected Output: {activeLesson?.practicalAssignment?.expectedOutput || 'Brief summary + working link or artifact.'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(activeLesson?.resources || [
                  { title: `${course.category} Reference Guide`, url: `/marketplace/${course.id}`, type: 'Guide' },
                  { title: 'Interactive Quiz Check', url: `/learn/${course.id}?tab=quiz`, type: 'Assessment' },
                ]).map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => navigate(res.url)}
                    className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 text-left transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{res.title}</div>
                      <div className="text-slate-500 mt-0.5">{res.type}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Personal Lesson Notes CRUD */}
              <div className="pt-5 border-t border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span>My Personal Lesson Notes ({lessonNotes.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">Saved privately to your dashboard</span>
                </div>
                <form onSubmit={handleSaveLessonNote} className="space-y-2">
                  <textarea
                    rows={3}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={`Write takeaways, formulas, or revision notes for "${activeLesson?.title || course.title}"...`}
                    className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingNote || !noteInput.trim()}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      {savingNote ? 'Saving Note...' : 'Save Note'}
                    </button>
                  </div>
                </form>

                {lessonNotes.length > 0 && (
                  <div className="space-y-2">
                    {lessonNotes.map((n) => (
                      <div key={n.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-800">{n.lessonTitle}</div>
                          <p className="text-slate-600 whitespace-pre-wrap">{n.content}</p>
                          <div className="text-[10px] text-slate-400">{new Date(n.updatedAt).toLocaleString()}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 shrink-0 cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI LEARNING VERIFICATION QUIZ (MODULE 3) */}
          {activeTab === 'quiz' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Let's check what you learned!</h2>
                  <p className="text-xs text-slate-500 mt-1 tabular-nums">
                    {quizQuestions.length || 15} questions ({quizConfig?.basicCount ?? 5} basic, {quizConfig?.intermediateCount ?? 5} intermediate, {quizConfig?.advancedCount ?? 5} advanced) · Passing criteria: {quizConfig?.passingScorePercent ?? 70}% · Attempts: {quizAttempts.length}/{quizConfig?.maxRetakes ?? 5}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start">
                  <button
                    type="button"
                    onClick={() => {
                      setRandomizeQuizOrder((prev) => !prev);
                      setQuizQuestions((qs) => shuffleQuestionsList(qs));
                    }}
                    className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                      randomizeQuizOrder
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {randomizeQuizOrder ? 'Randomized Order: ON' : 'Shuffle Questions'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!timedQuizMode) {
                        autoSubmittedQuizRef.current = false;
                        setQuizSecondsLeft(900);
                      }
                      setTimedQuizMode((p) => !p);
                    }}
                    className={`px-3 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                      timedQuizMode
                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span className="tabular-nums">
                      {timedQuizMode
                        ? `Timed: ${Math.floor(quizSecondsLeft / 60)}:${String(quizSecondsLeft % 60).padStart(2, '0')}`
                        : 'Enable Timed Quiz (15m)'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartOrLoadQuiz}
                    disabled={quizLoading}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold whitespace-nowrap"
                  >
                    {quizLoading ? 'Generating...' : 'Regenerate Quiz'}
                  </button>
                </div>
              </div>

              {lastQuizAttempt && (
                <div
                  className={`p-5 rounded-2xl border space-y-3 text-xs ${
                    lastQuizAttempt.passed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900">
                      Result: {lastQuizAttempt.percentageScore}% ({lastQuizAttempt.score}/{lastQuizAttempt.maxScore} pts) ·{' '}
                      {lastQuizAttempt.passed ? 'Passed' : 'Revision Required'}
                    </div>
                    {lastQuizAttempt.passed && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('project')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                      >
                        Unlock Practical Project
                      </button>
                    )}
                  </div>
                  <p className="text-slate-700">{lastQuizAttempt.quinnFeedback}</p>

                  {lastQuizAttempt.recommendedRevisionTopics?.length > 0 && (
                    <div className="pt-1">
                      <div className="font-semibold text-slate-800">Recommended Topics for Revision:</div>
                      <ul className="list-disc pl-5 text-slate-600 mt-1 space-y-0.5">
                        {lastQuizAttempt.recommendedRevisionTopics.map((topic, i) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {lastQuizAttempt.responses && lastQuizAttempt.responses.length > 0 && (
                    <div className="pt-3 border-t border-black/10 space-y-2">
                      <div className="font-semibold text-slate-800">Question-by-Question Review:</div>
                      {lastQuizAttempt.responses.map((resp, idx) => (
                        <div key={resp.questionId} className="p-2.5 bg-white/80 rounded-xl border border-black/5">
                          <div className="flex items-center justify-between font-medium">
                            <span>Q{idx + 1}: {resp.isCorrect ? 'Correct' : 'Incorrect / Partial'}</span>
                            <span className="tabular-nums">{resp.scoreAwarded}/{resp.maxScore} pts</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{resp.feedback}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {quizLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Quinn AI is generating your personalized verification assessment...
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-5">
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-medium tabular-nums">
                          Question {idx + 1} of {quizQuestions.length} · {q.difficulty} · {q.format || q.type}
                        </span>
                        <span className="tabular-nums font-medium">{q.points} pts</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{q.questionText}</p>

                      {q.options && q.options.length > 0 ? (
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                                userQuizAnswers[q.id] === opt
                                  ? 'bg-blue-50 border-blue-500 text-blue-950 font-semibold'
                                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q_${q.id}`}
                                value={opt}
                                checked={userQuizAnswers[q.id] === opt}
                                onChange={() => setUserQuizAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                                className="text-blue-600"
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          rows={q.type === 'fill_in_blank' ? 1 : 3}
                          value={userQuizAnswers[q.id] || ''}
                          onChange={(e) => setUserQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder={
                            q.type === 'fill_in_blank'
                              ? 'Type the missing term...'
                              : 'Write a concise, clear technical explanation...'
                          }
                          className="w-full p-3 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={quizSubmitting || quizQuestions.length === 0}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                    >
                      {quizSubmitting ? 'Evaluating Answers...' : 'Submit Assessment for Grading'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: AI PRACTICAL PROJECT GENERATOR & UPLOAD (MODULE 4) */}
          {activeTab === 'project' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6">
              {!quizPassed && !isEducatorOrAdmin ? (
                <div className="py-10 text-center space-y-3 max-w-md mx-auto">
                  <Lock className="w-9 h-9 text-amber-600 mx-auto" />
                  <h2 className="text-base font-bold text-slate-900">Practical Project Locked</h2>
                  <p className="text-xs text-slate-600">
                    Complete the AI Learning Verification Quiz with at least {quizConfig?.passingScorePercent ?? 70}% to unlock your unique practical project brief.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Go to Verification Quiz
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <div className="text-xs text-slate-500 tabular-nums">
                      Difficulty: {projectBrief?.difficultyLevel || course.level} · Max Marks: {projectBrief?.maxMarks || 100} · Deadline: {projectBrief?.deadlineDate ? new Date(projectBrief.deadlineDate).toLocaleDateString() : `${projectBrief?.submissionDeadlineDays || 14} days`}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {projectBrief?.title || `Practical Project: ${course.title}`}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {projectBrief?.problemStatement || projectBrief?.description}
                    </p>
                  </div>

                  {projectBrief && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                      <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Objectives & Instructions</h3>
                        <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                          {(projectBrief.instructions || projectBrief.objectives || []).map((ins, i) => (
                            <li key={i}>{ins}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-slate-900">Expected Output & Deliverables</h3>
                        <p className="text-slate-600">{projectBrief.expectedOutput}</p>
                        <ul className="space-y-1 text-slate-700 pt-1">
                          {(projectBrief.requiredDeliverables || []).map((del, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{del}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Submission Form */}
                  <form onSubmit={handleProjectSubmit} className="space-y-4 pt-4 border-t border-slate-100 text-xs">
                    <h3 className="text-sm font-bold text-slate-900">Upload Deliverables & Project Links</h3>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        Upload Documents (PDF, Word, PowerPoint, Images)
                      </label>
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 cursor-pointer bg-slate-50/50 transition-colors">
                        <Upload className="w-6 h-6 text-blue-600 mb-2" />
                        <span className="font-semibold text-slate-700">
                          {uploadingProjectFile ? 'Uploading to Cloud Storage...' : 'Click to attach PDF, DOCX, PPTX, PNG, or JPG (max 25MB)'}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                          onChange={handleProjectFileUpload}
                          className="hidden"
                        />
                      </label>

                      {projectFiles.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {projectFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                              <span className="font-medium text-emerald-900 truncate">{f.name} ({f.size})</span>
                              <a href={f.url} target="_blank" rel="noreferrer" className="text-blue-600 underline shrink-0">
                                Preview
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Project / Repository URL</label>
                        <input
                          type="url"
                          value={projectRepoUrl}
                          onChange={(e) => setProjectRepoUrl(e.target.value)}
                          placeholder="https://github.com/... or live project link"
                          className="w-full p-2.5 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Video Demonstration Link</label>
                        <input
                          type="url"
                          value={projectDemoUrl}
                          onChange={(e) => setProjectDemoUrl(e.target.value)}
                          placeholder="https://youtube.com/... or Loom walkthrough"
                          className="w-full p-2.5 border border-slate-200 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Implementation Summary & Notes *</label>
                      <textarea
                        rows={3}
                        required
                        value={projectNotes}
                        onChange={(e) => setProjectNotes(e.target.value)}
                        placeholder="Explain your methodology, key results, and how your submission meets each objective..."
                        className="w-full p-3 border border-slate-200 rounded-xl"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingProject || uploadingProjectFile}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                      >
                        {submittingProject ? 'Submitting Project...' : 'Submit Practical Project'}
                      </button>
                    </div>
                  </form>

                  {projectSubmissions.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                      <h4 className="font-bold text-slate-900">Your Project Submission History</h4>
                      {projectSubmissions.map((s) => (
                        <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-900">{s.projectTitle || s.courseId}</div>
                            <div className="text-slate-500">
                              Submitted {new Date(s.submittedAt || '').toLocaleDateString()} · Status: {s.status}
                            </div>
                          </div>
                          {s.fileUrl && (
                            <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-medium">
                              View File
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 6: STUDENT PRESENTATION SYSTEM (MODULE 5) */}
          {activeTab === 'presentation' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Student Presentation Submission</h2>
                <p className="text-slate-500 mt-1">
                  Demonstrate mastery of your practical project by uploading slides, submitting a recorded video presentation, or scheduling a live presentation session.
                </p>
              </div>

              {/* 3 Presentation Methods Segmented Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
                {[
                  { id: 'SLIDES_UPLOAD', label: '1. Upload PowerPoint / Slides' },
                  { id: 'RECORDED_VIDEO', label: '2. Recorded Video Presentation' },
                  { id: 'LIVE_SCHEDULE', label: '3. Schedule Live Meeting' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPresentationMethod(m.id as any)}
                    className={`py-2.5 px-3 rounded-lg font-semibold transition-colors ${
                      presentationMethod === m.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handlePresentationSubmit} className="space-y-4">
                {presentationMethod !== 'LIVE_SCHEDULE' ? (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1.5">
                        {presentationMethod === 'SLIDES_UPLOAD'
                          ? 'Upload PowerPoint / PDF Deck'
                          : 'Upload Recorded Presentation Video (MP4/WebM)'}
                      </label>
                      <input
                        type="file"
                        accept={presentationMethod === 'SLIDES_UPLOAD' ? '.ppt,.pptx,.pdf' : '.mp4,.webm,.mov'}
                        onChange={handlePresentationFileUpload}
                        className="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-900 file:text-white file:font-semibold"
                      />
                      {uploadingPresFile && <p className="text-blue-600 mt-1">Uploading file...</p>}
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Or Paste Presentation / Recording URL
                      </label>
                      <input
                        type="url"
                        value={presentationUrl}
                        onChange={(e) => setPresentationUrl(e.target.value)}
                        placeholder={
                          presentationMethod === 'SLIDES_UPLOAD'
                            ? 'https://docs.google.com/presentation/...'
                            : 'https://youtube.com/... or Google Drive link'
                        }
                        className="w-full p-2.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Defense Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                      <input
                        type="time"
                        value={scheduledTimeSlot}
                        onChange={(e) => setScheduledTimeSlot(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div className="sm:col-span-2 text-slate-600">
                      Assigned Faculty: {progress?.assignedTeacherName || 'OpenFrame Evaluation Panel'} · An integrated meeting link will be generated automatically upon confirmation.
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Presentation Outline / Key Talking Points</label>
                  <textarea
                    rows={3}
                    value={presentationNotes}
                    onChange={(e) => setPresentationNotes(e.target.value)}
                    placeholder="Highlight your problem statement, practical demonstration, and measurable outcomes..."
                    className="w-full p-3 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPresentation || uploadingPresFile}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {submittingPresentation
                      ? 'Submitting...'
                      : presentationMethod === 'LIVE_SCHEDULE'
                      ? 'Confirm Live Presentation Slot'
                      : 'Submit Presentation for Faculty Review'}
                  </button>
                </div>
              </form>

              {presentations.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h3 className="font-bold text-slate-900">Presentation History & Status</h3>
                  {presentations.map((p) => (
                    <div key={p.id} className="p-3.5 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Method: {p.presentationMethod?.replace('_', ' ')} · Status: {p.status}
                        </div>
                        <div className="text-slate-500">
                          {p.scheduledTime ? `Scheduled: ${p.scheduledTime}` : `Submitted: ${new Date(p.submittedAt).toLocaleDateString()}`}
                        </div>
                      </div>
                      {(p.meetingLink || p.slidesUrl || p.videoUrl) && (
                        <a
                          href={p.meetingLink || p.slidesUrl || p.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{p.meetingLink ? 'Join Live Meeting Room' : 'Open Submitted Asset'}</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: TEACHER EVALUATION & QUINN AI PERFORMANCE ANALYSIS (MODULES 6 & 7) */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Faculty 6-Criteria Rubric Evaluation</h2>
                    <p className="text-slate-500 mt-0.5">
                      Maximum 100 Marks · Minimum 70 Marks & Approval required for certification
                    </p>
                  </div>
                  {progress?.teacherEvaluation && (
                    <div className="text-base font-bold text-blue-600 tabular-nums">
                      {progress.teacherEvaluation.totalScore}/100 ·{' '}
                      {progress.teacherEvaluation.decision || (progress.teacherEvaluation.isApproved ? 'Approved' : 'Pending')}
                    </div>
                  )}
                </div>

                {progress?.teacherEvaluation ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { label: 'Subject Knowledge', val: progress.teacherEvaluation.rubricScores.subjectKnowledge, max: 20 },
                        {
                          label: 'Concept Understanding',
                          val:
                            progress.teacherEvaluation.rubricScores.conceptUnderstanding ??
                            progress.teacherEvaluation.rubricScores.conceptsMastery ??
                            0,
                          max: 20,
                        },
                        {
                          label: 'Practical Implementation',
                          val: progress.teacherEvaluation.rubricScores.practicalImplementation,
                          max: 20,
                        },
                        {
                          label: 'Creativity & Innovation',
                          val: progress.teacherEvaluation.rubricScores.creativityInnovation,
                          max: 15,
                        },
                        {
                          label: 'Presentation Skills',
                          val:
                            progress.teacherEvaluation.rubricScores.presentationSkills ??
                            progress.teacherEvaluation.rubricScores.presentationQuality ??
                            0,
                          max: 15,
                        },
                        {
                          label: 'Communication Skills',
                          val: progress.teacherEvaluation.rubricScores.communicationSkills,
                          max: 10,
                        },
                      ].map((c) => (
                        <div key={c.label} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                          <div className="text-slate-500">{c.label}</div>
                          <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">
                            {c.val} / {c.max}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                      <div className="font-bold text-slate-900">
                        Written Feedback from {progress.teacherEvaluation.teacherName}
                      </div>
                      <p className="text-slate-700 leading-relaxed">{progress.teacherEvaluation.writtenFeedback}</p>
                      {progress.teacherEvaluation.actionItemsRequired && (
                        <p className="text-rose-700 font-medium pt-1">
                          Action Required: {progress.teacherEvaluation.actionItemsRequired}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl">
                    Your project and presentation are awaiting faculty rubric review. Once your teacher evaluates your work in the Teacher Dashboard, your itemized 100-mark scorecard and written feedback will appear here.
                  </div>
                )}
              </div>

              {/* Module 7: Quinn AI Performance Analysis */}
              {performance && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900">Quinn AI Performance Analysis</h3>
                    <span className="font-bold text-blue-600 tabular-nums">
                      Skill Development Index: {performance.skillDevelopmentScore}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-slate-500">Course Progress</div>
                      <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">{performance.progressPercentage}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-slate-500">Quiz Average</div>
                      <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">{performance.quizAverage}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-slate-500">Project Score</div>
                      <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">{performance.projectScore}%</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-slate-500">Presentation Score</div>
                      <div className="text-base font-bold text-slate-900 mt-1 tabular-nums">{performance.presentationScore}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Verified Strengths</div>
                      <ul className="space-y-1 text-slate-600 list-disc pl-4">
                        {performance.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 mb-1">Areas for Improvement</div>
                      <ul className="space-y-1 text-slate-600 list-disc pl-4">
                        {performance.areasForImprovement.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-950">
                    {performance.personalizedRecommendation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: CERTIFICATE GENERATION & MANDATORY 7-FIELD VERIFICATION (MODULE 8) */}
          {activeTab === 'certificate' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 text-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Certificate Issuance &amp; Mandatory Address Verification</h2>
                <p className="text-slate-500 mt-1">
                  Complete your course modules, pass the Verification Test (≥{quizConfig?.passingScorePercent ?? 70}%), and submit all 7 mandatory residential address &amp; contact details below to claim your QR-verified OpenFrame Certificate.
                </p>
              </div>

              {/* Direct Verification Track (Modules -> Test -> 7-Field Address -> Certificate) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-2 ${
                    completedModulesCount > 0 || eligibility.allMandatoryLessonsCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold">Step 1 · Complete Modules</div>
                    <div className="text-[11px] mt-0.5 tabular-nums">
                      {completedModulesCount} / {Math.max(1, lessons.length)} lessons completed
                    </div>
                  </div>
                  {completedModulesCount > 0 || eligibility.allMandatoryLessonsCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={handleMarkActiveModuleComplete}
                      className="px-2.5 py-1 rounded-lg bg-[#123D32] text-white text-[11px] font-semibold cursor-pointer shrink-0"
                    >
                      Mark Done
                    </button>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-2 ${
                    quizPassed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div>
                    <div className="font-bold">Step 2 · Verification Test</div>
                    <div className="text-[11px] mt-0.5 tabular-nums">
                      {quizPassed
                        ? `Passed (${Math.max(70, bestQuizScore)}%)`
                        : `Required: ≥${quizConfig?.passingScorePercent ?? 70}%`}
                    </div>
                  </div>
                  {quizPassed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveTab('quiz')}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-semibold cursor-pointer shrink-0"
                    >
                      Take Test
                    </button>
                  )}
                </div>

                <div
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-2 ${
                    validateCertificateAddressDetails(certAddressForm).valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}
                >
                  <div>
                    <div className="font-bold">Step 3 · 7-Field Address Details</div>
                    <div className="text-[11px] mt-0.5">
                      {validateCertificateAddressDetails(certAddressForm).valid
                        ? 'All 7 mandatory fields verified'
                        : 'Home, Flat, Street, Pin, 2 Mobiles & State'}
                    </div>
                  </div>
                  {validateCertificateAddressDetails(certAddressForm).valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                </div>
              </div>

              {certificate ? (
                <div className="p-6 sm:p-8 border border-slate-200 rounded-3xl bg-slate-50/50 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-emerald-700 font-semibold">
                          Status: {certificate.status} · Serial: {certificate.certificateId}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-semibold">
                          {certificate.certificateType || 'Course Completion Certificate'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{certificate.courseTitle}</h3>
                      <p className="text-slate-600 mt-0.5 tabular-nums">
                        Awarded to {certificate.studentName} · Grade {certificate.grade} ({certificate.score ?? certificate.finalScore}/100)
                      </p>
                      {certificate.state && certificate.pincode && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Verified Dispatch Record: {[certificate.flatNumber, certificate.homeAddress, certificate.streetAddress, certificate.state, certificate.pincode].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    {certificate.qrCodeUrl && (
                      <img
                        src={certificate.qrCodeUrl}
                        alt="Certificate QR Code"
                        className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-1.5 shrink-0"
                      />
                    )}
                  </div>

                  {certificate.status === 'Pending Admin Approval' ? (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                      Your faculty evaluation is approved! Final download unlocks once an administrator applies the institutional seal.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => lmsService.downloadCertificatePdf(certificate)}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Official PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/verify-certificate/${certificate.certificateId}`)}
                        className="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 rounded-xl font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Public Verification Page</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form
                  onSubmit={handleClaimVerifiedCertificate}
                  className="p-5 sm:p-6 rounded-2xl border border-emerald-200 bg-[#FAF7F2] space-y-4"
                >
                  <div>
                    <h3 className="text-sm font-bold text-[#18221F]">
                      Mandatory Certificate Issuance &amp; Dispatch Details (All 7 Fields Required)
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Required before issuing your QR-verified certificate. Your address &amp; contact numbers are stored privately on your learner record and are never exposed on the public QR verification page.
                    </p>
                  </div>

                  {certAddressError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{certAddressError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Home Address *</label>
                      <input
                        type="text"
                        required
                        value={certAddressForm.homeAddress}
                        onChange={(e) => setCertAddressForm({ ...certAddressForm, homeAddress: e.target.value })}
                        placeholder="House / Building Name & Locality"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Flat Number *</label>
                      <input
                        type="text"
                        required
                        value={certAddressForm.flatNumber}
                        onChange={(e) => setCertAddressForm({ ...certAddressForm, flatNumber: e.target.value })}
                        placeholder="e.g., Flat 204 / Door No. 12"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={certAddressForm.streetAddress}
                        onChange={(e) => setCertAddressForm({ ...certAddressForm, streetAddress: e.target.value })}
                        placeholder="Street / Main Road / Cross / Landmark"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Pin Code (6 Digits) *</label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        maxLength={6}
                        value={certAddressForm.pincode}
                        onChange={(e) =>
                          setCertAddressForm({
                            ...certAddressForm,
                            pincode: e.target.value.replace(/\D/g, '').slice(0, 6),
                          })
                        }
                        placeholder="e.g., 560001"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">State / Union Territory *</label>
                      <select
                        required
                        value={certAddressForm.state}
                        onChange={(e) => setCertAddressForm({ ...certAddressForm, state: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      >
                        <option value="">Select Indian State / UT</option>
                        {ALL_INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        value={certAddressForm.mobileNumber}
                        onChange={(e) =>
                          setCertAddressForm({
                            ...certAddressForm,
                            mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        placeholder="10-digit primary mobile"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Alternative Mobile Number (10 Digits) *</label>
                      <input
                        type="tel"
                        required
                        inputMode="numeric"
                        maxLength={10}
                        value={certAddressForm.alternativeMobileNumber}
                        onChange={(e) =>
                          setCertAddressForm({
                            ...certAddressForm,
                            alternativeMobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10),
                          })
                        }
                        placeholder="10-digit alternate / guardian mobile"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="text-[11px] text-slate-600">
                      {!quizPassed
                        ? 'Pass the Verification Quiz (≥70%) in Tab 4 to activate certificate issuance.'
                        : completedModulesCount === 0
                        ? 'Mark at least 1 module completed in Step 1 above before claiming.'
                        : 'All academic steps satisfied — click to verify address and issue your QR Certificate.'}
                    </div>
                    <button
                      type="submit"
                      disabled={certClaiming || !quizPassed || completedModulesCount === 0}
                      className="px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Award className="w-4 h-4" />
                      <span>{certClaiming ? 'Issuing Verified Certificate...' : 'Claim & Issue Official QR Certificate'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Extended 6-Criteria Faculty Honours Checklist */}
              <div className="space-y-2.5 pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Full 6-Criteria Academic &amp; Faculty Honours Progress
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: '1. All mandatory video lessons completed', ok: eligibility.allMandatoryLessonsCompleted || completedModulesCount > 0 },
                    { label: '2. Required AI verification assessments completed', ok: eligibility.requiredAssessmentsCompleted || quizAttempts.length > 0 },
                    { label: `3. Minimum quiz passing marks achieved (≥${quizConfig?.passingScorePercent ?? 70}%)`, ok: eligibility.minimumQuizCriteriaMet || quizPassed },
                    { label: '4. Practical project submitted & approved', ok: eligibility.projectSubmittedAndApproved },
                    { label: '5. Student presentation completed', ok: eligibility.presentationCompleted },
                    { label: `6. Teacher final approval granted (≥${quizConfig?.passingScorePercent ?? 70}/100)`, ok: eligibility.teacherFinalApprovalGranted },
                  ].map((gate) => (
                    <div
                      key={gate.label}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        gate.ok
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <span className="font-medium">{gate.label}</span>
                      {gate.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                OpenFrame Education Certificate Disclosure: Credentials verify course completion and assessment within OpenFrame Education&apos;s platform. They do not imply government accreditation, university degree equivalence, or third-party YouTube channel endorsement.
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Report Content Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmitContentReport} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Report Video / Lesson Issue</span>
              </h3>
              <button type="button" onClick={() => setReportModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as any)}
                className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
              >
                <option value="Broken Video">Broken Video / Playback Error</option>
                <option value="Audio Issue">Audio / Caption Quality Issue</option>
                <option value="Off-Topic">Off-Topic / Misaligned Content</option>
                <option value="Inappropriate">Inappropriate Content</option>
                <option value="Copyright Concern">Copyright Concern</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Additional Details</label>
              <textarea
                rows={3}
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
                placeholder="Describe what happened..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quinn AI Mentor Slide-Over Drawer (15 Capabilities + Multilingual + Voice Read Aloud) */}
      {quinnDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-bold text-slate-900">Quinn AI Tutor (19 Learning &amp; Interview Modes)</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[260px]">
                      {activeLesson?.title || course.title}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg px-2 py-1 text-[11px]">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <select
                      value={quinnLang}
                      onChange={(e) => setQuinnLang(e.target.value)}
                      className="bg-transparent font-semibold text-slate-700 focus:outline-none"
                    >
                      {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                        <option key={l.code} value={l.label}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="button" onClick={() => setQuinnDrawerOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-800">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 15 Quick Capability Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {QUINN_15_CAPABILITIES.map((cap) => (
                  <button
                    key={cap.mode}
                    type="button"
                    onClick={() => {
                      setQuinnCapability(cap.mode);
                      triggerQuinnPrompt(cap.prompt, cap.mode);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                      quinnCapability === cap.mode
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cap.label}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500">
                Academic AI Notice: Responses are tailored cleanly for educational study &amp; grounded in lesson metadata.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {quinnMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl max-w-[90%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-slate-100 text-slate-800 mr-auto'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {m.role === 'model' && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/70 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSpeakText(m.text)}
                        className="text-[10px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                      >
                        {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {quinnTyping && (
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 max-w-[60%]">
                  Quinn AI is thinking ({quinnLang})...
                </div>
              )}
            </div>

            <form onSubmit={handleSendQuinn} className="p-4 border-t border-slate-200 flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                title={isListeningVoice ? 'Stop Voice Dictation' : 'Voice Question Input'}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isListeningVoice
                    ? 'bg-rose-600 border-rose-600 text-white animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isListeningVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={quinnInput}
                onChange={(e) => setQuinnInput(e.target.value)}
                placeholder={`Ask Quinn AI in ${quinnLang}...`}
                className="flex-1 px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={quinnTyping || !quinnInput.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50"
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
