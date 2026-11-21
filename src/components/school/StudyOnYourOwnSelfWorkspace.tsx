import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Coins,
  Compass,
  Download,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Heart,
  Layers,
  Loader2,
  Play,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { standaloneApiFetch } from '../../services/standaloneMockService';
import { GoogleSignInButton } from '../common/GoogleSignInButton';
import { ALL_INDIA_BOARDS } from '../../data/allIndiaBoardsData';
import { ALL_INDIA_LANGUAGE_PACKS } from '../../data/allIndiaLanguagesData';
import { NON_CLINICAL_EDUCATIONAL_DISCLAIMER } from '../../data/iqEqSqQuestionsData';
import {
  SELF_STUDY_MASTER_LEVELS,
  buildDeterministic30QuestionExam,
  buildDeterministicChapterNote,
  buildSubjectContextualIqEqSqBank,
  evaluate30QuestionExam,
  evaluateCustomIqEqSqDimension,
} from '../../data/selfStudyMasterCatalog';
import { quinnAiService } from '../../services/quinnAiService';
import {
  SELF_STUDY_TOKEN_COSTS,
  WEEKLY_RECHARGE_PRICE_INR,
  WEEKLY_RECHARGE_TOKENS,
  deductStudentTokens,
  downloadChapterStudyNotePdf,
  downloadSelfStudyProgressReportPdf,
  exportSelfStudyReportsCsv,
  exportSelfStudyReportsJson,
  getOrCreateStudentTokenWallet,
  getStudentSelfStudyReports,
  getWalletDaysRemaining,
  isWalletExpired,
  rechargeWeeklyTokens,
  saveSelfStudyProgressReport,
} from '../../services/selfStudyService';
import { compute90PercentCoursePricing, formatInr } from '../../utils/pricingEngine';
import { CourseEnrollmentModal } from '../common/CourseEnrollmentModal';
import { StudentAnalytics20Charts } from '../student/StudentAnalytics20Charts';
import {
  AiLearningPath,
  AssessmentDimension,
  CourseEnrollment,
  IqEqSqQuestionItem,
  MarketplaceCourse,
  QuizAttempt,
  SchoolLanguage,
  SearchHistoryEntry,
  SelfStudyChapterNote,
  SelfStudyExamQuestion,
  SelfStudyProgressReport,
  StudentLessonNote,
  StudentProgressRecord,
  StudentTokenWallet,
  TeacherEvaluation,
  VideoLearningSession,
  YouTubeVideoRecommendation,
} from '../../types';

interface StudyOnYourOwnSelfWorkspaceProps {
  initialBoardId?: string;
  initialLanguage?: SchoolLanguage;
  onWalletUpdated?: (wallet: StudentTokenWallet) => void;
}

type StudyMode = 'video' | 'pdf';
type AssessmentTab = 'thirty_q' | 'iq' | 'eq' | 'sq';

export const StudyOnYourOwnSelfWorkspace: React.FC<StudyOnYourOwnSelfWorkspaceProps> = ({
  initialBoardId,
  initialLanguage = 'English',
  onWalletUpdated,
}) => {
  const { currentUser, lmsUser, studentProfile } = useAuth();
  const studentUid = currentUser?.uid || 'guest_learner';
  const studentName =
    lmsUser?.displayName ||
    studentProfile?.fullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'OpenFrame Student';
  const studentEmail = currentUser?.email || studentProfile?.email || '';

  // 1-to-10 Master Academic Selector State (default: Level 3, Class 8, Karnataka State, Science)
  const [selectedLevelNumber, setSelectedLevelNumber] = useState<number>(3);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    initialBoardId ||
      ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === 'KAR_STATE')?.id ||
      ALL_INDIA_BOARDS[0]?.id ||
      'KAR_STATE'
  );
  const [selectedClassId, setSelectedClassId] = useState<string>('CLASS_8');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('c8-sci');
  const [selectedChapterTitle, setSelectedChapterTitle] = useState<string>('Force and Pressure');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage || 'English');
  const [searchQuery, setSearchQuery] = useState<string>(
    'Class 8 Karnataka State Board Science Force and Pressure'
  );

  // Weekly Token Wallet
  const [wallet, setWallet] = useState<StudentTokenWallet | null>(null);
  const [recharging, setRecharging] = useState<boolean>(false);
  const [walletBanner, setWalletBanner] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(
    null
  );

  // Unified Quinn AI + YouTube Discovery & Chapter PDF State
  const [studyMode, setStudyMode] = useState<StudyMode>('video');
  const [loadingDiscovery, setLoadingDiscovery] = useState<boolean>(false);
  const [aiPath, setAiPath] = useState<AiLearningPath | null>(null);
  const [matchedVideos, setMatchedVideos] = useState<YouTubeVideoRecommendation[]>([]);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoRecommendation | null>(null);
  const [chapterNote, setChapterNote] = useState<SelfStudyChapterNote | null>(null);
  const [loadingPdfNote, setLoadingPdfNote] = useState<boolean>(false);
  const [completedChapters, setCompletedChapters] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`openframe_self_study_done_${studentUid}`) || '[]');
    } catch {
      return [];
    }
  });

  // Inline Enrollment Modal (reuses existing 90%-off ₹300–₹2,500 + 7-field certificate address modal)
  const [enrollCourse, setEnrollCourse] = useState<MarketplaceCourse | null>(null);
  const [localEnrollments, setLocalEnrollments] = useState<CourseEnrollment[]>([]);

  // Post-Completion Assessment Runner (30 Questions + IQ, EQ, SQ)
  const [assessmentUnlocked, setAssessmentUnlocked] = useState<boolean>(false);
  const [loadingAssessment, setLoadingAssessment] = useState<boolean>(false);
  const [assessmentTab, setAssessmentTab] = useState<AssessmentTab>('thirty_q');
  const [examQuestions, setExamQuestions] = useState<SelfStudyExamQuestion[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const examAnswersRef = useRef<Record<string, number>>({});
  const [iqEqSqBank, setIqEqSqBank] = useState<Record<AssessmentDimension, IqEqSqQuestionItem[]> | null>(null);
  const [iqAnswers, setIqAnswers] = useState<Record<string, number>>({});
  const [eqAnswers, setEqAnswers] = useState<Record<string, number>>({});
  const [sqAnswers, setSqAnswers] = useState<Record<string, number>>({});
  const [submittingReport, setSubmittingReport] = useState<boolean>(false);

  // Submitted Progress Reports & 20-Graph Analytics Feed
  const [submittedReports, setSubmittedReports] = useState<SelfStudyProgressReport[]>([]);
  const [activeReport, setActiveReport] = useState<SelfStudyProgressReport | null>(null);
  const [searchLogs, setSearchLogs] = useState<SearchHistoryEntry[]>([]);

  const assessmentRef = useRef<HTMLDivElement | null>(null);
  const finalReportRef = useRef<HTMLDivElement | null>(null);

  // Derived Academic Selections
  const activeLevel = useMemo(
    () => SELF_STUDY_MASTER_LEVELS.find((l) => l.levelNumber === selectedLevelNumber) || SELF_STUDY_MASTER_LEVELS[2],
    [selectedLevelNumber]
  );

  const activeBoard = useMemo(
    () =>
      ALL_INDIA_BOARDS.find((b) => b.id === selectedBoardId || b.curriculumGroupId === selectedBoardId) ||
      ALL_INDIA_BOARDS[0],
    [selectedBoardId]
  );

  const activeClassSpec = useMemo(
    () =>
      activeLevel.classesOrDepartments.find((c) => c.id === selectedClassId) ||
      activeLevel.classesOrDepartments[0],
    [activeLevel, selectedClassId]
  );

  const activeSubjectSpec = useMemo(
    () =>
      activeClassSpec.subjects.find((s) => s.id === selectedSubjectId) ||
      activeClassSpec.subjects[0],
    [activeClassSpec, selectedSubjectId]
  );

  // Keep cascading selectors valid when Level / Class / Subject changes
  useEffect(() => {
    if (!activeLevel.classesOrDepartments.some((c) => c.id === selectedClassId)) {
      const nextCls = activeLevel.classesOrDepartments[0];
      setSelectedClassId(nextCls.id);
      const nextSub = nextCls.subjects[0];
      setSelectedSubjectId(nextSub.id);
      setSelectedChapterTitle(nextSub.chapters[0] || '');
    }
  }, [activeLevel, selectedClassId]);

  useEffect(() => {
    if (!activeClassSpec.subjects.some((s) => s.id === selectedSubjectId)) {
      const nextSub = activeClassSpec.subjects[0];
      setSelectedSubjectId(nextSub.id);
      setSelectedChapterTitle(nextSub.chapters[0] || '');
    }
  }, [activeClassSpec, selectedSubjectId]);

  useEffect(() => {
    if (!activeSubjectSpec.chapters.includes(selectedChapterTitle) && activeSubjectSpec.chapters.length > 0) {
      setSelectedChapterTitle(activeSubjectSpec.chapters[0]);
    }
  }, [activeSubjectSpec, selectedChapterTitle]);

  // Load Weekly Token Wallet & Saved Self-Study Reports on Mount / User Change
  useEffect(() => {
    let mounted = true;
    getOrCreateStudentTokenWallet(studentUid, studentEmail).then((w) => {
      if (!mounted) return;
      setWallet(w);
      onWalletUpdated?.(w);
    });
    getStudentSelfStudyReports(studentUid).then((reports) => {
      if (!mounted) return;
      setSubmittedReports(reports);
      if (reports.length > 0) {
        setActiveReport((prev) => prev || reports[0]);
      }
    });
    return () => {
      mounted = false;
    };
  }, [studentUid, studentEmail]);

  // Compute 90%-off OpenFrame Grant Pricing for the active Subject/Chapter Course
  const computedEnrollmentPricing = useMemo(
    () =>
      compute90PercentCoursePricing({
        educationLevel: activeLevel.educationCategoryCode,
        degreeOrClass: activeClassSpec.label,
        category: activeSubjectSpec.department,
        title: `${activeClassSpec.label} ${activeSubjectSpec.name}: ${selectedChapterTitle}`,
      }),
    [activeLevel, activeClassSpec, activeSubjectSpec, selectedChapterTitle]
  );

  // Build an Enrollable MarketplaceCourse object directly from the active chapter/video/Quinn AI path
  const buildEnrollableCourseForChapter = (overrideVideo?: YouTubeVideoRecommendation | null): MarketplaceCourse => {
    const vid = overrideVideo || activeVideo || matchedVideos[0];
    const cleanTitle = `${activeClassSpec.label} ${activeSubjectSpec.name} — ${selectedChapterTitle} (${activeBoard?.shortName || 'All-India'})`;
    const courseId = `ss-${activeLevel.code.toLowerCase()}-${activeSubjectSpec.id}-${selectedChapterTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 32)}`;

    const modules =
      aiPath?.modules?.length
        ? aiPath.modules.map((m, idx) => ({
            moduleNumber: m.moduleNumber || idx + 1,
            title: m.title,
            duration: '35 mins',
            partLabel: m.partLabel || `Part ${idx + 1}`,
            level: m.level || 'Beginner',
            lessons: m.objectives?.length ? m.objectives : [selectedChapterTitle],
            recommendedVideos: m.recommendedVideos || (vid ? [vid] : []),
          }))
        : activeSubjectSpec.chapters.slice(0, 5).map((ch, idx) => ({
            moduleNumber: idx + 1,
            title: ch,
            duration: '40 mins',
            lessons: [`Core Concepts of ${ch}`, `Worked Examples`, `30-Question Mastery Exam`],
          }));

    return {
      id: courseId,
      title: cleanTitle,
      category: activeSubjectSpec.department,
      categories: [activeSubjectSpec.department, activeSubjectSpec.name],
      categoryGroup: activeLevel.title,
      subcategory: activeSubjectSpec.name,
      level: selectedLevelNumber <= 3 ? 'Beginner' : selectedLevelNumber <= 6 ? 'Intermediate' : 'Advanced',
      duration: '4 Weeks Self-Paced',
      pricingTier: computedEnrollmentPricing.pricingTier,
      price: computedEnrollmentPricing.finalPriceInr,
      marketBenchmarkPrice: computedEnrollmentPricing.marketBenchmarkPrice,
      discountPercent: computedEnrollmentPricing.discountPercent,
      isFree: false,
      status: 'Published',
      courseType: vid?.videoId ? 'youtube_video' : 'standard',
      youtubeVideoId: vid?.videoId,
      youtubeUrl: vid?.youtubeUrl || (vid?.videoId ? `https://www.youtube.com/watch?v=${vid.videoId}` : undefined),
      youtubeChannelName: vid?.channelTitle || 'OpenFrame Curated Educator',
      instructorName: vid?.channelTitle || 'OpenFrame Academic Faculty',
      language: selectedLanguage,
      rating: 4.8,
      enrolledCount: 1240,
      imageUrl: vid?.thumbnail || `https://i.ytimg.com/vi/${vid?.videoId || 'dQw4w9WgXcQ'}/hqdefault.jpg`,
      thumbnailUrl: vid?.thumbnail,
      shortDesc: `Structured ${activeBoard?.shortName || 'Board'} curriculum for ${activeClassSpec.label} ${activeSubjectSpec.name} with Quinn AI modules, Chapter PDF Notes, 30-Question Mastery Exam, and Verified Certificate.`,
      description: `Complete self-study track covering ${selectedChapterTitle} and prescribed syllabus chapters for ${activeClassSpec.label} (${activeBoard?.officialName || 'Indian Education Board'}). Includes 90% OpenFrame Grant fee pricing and official QR-verified certification.`,
      learningObjectives: [
        `Master every syllabus concept in ${selectedChapterTitle}`,
        `Complete Quinn AI structured modules and chapter PDF revision`,
        `Achieve 70%+ on the 30-Question Subject Exam and holistic IQ/EQ/SQ evaluation`,
      ],
      modules,
      targetAudience: `${activeClassSpec.label} students (${activeBoard?.shortName || 'All Boards'})`,
      skillsAcquired: [activeSubjectSpec.name, selectedChapterTitle, 'Analytical Problem Solving'],
      practicalProjects: [`Chapter Mastery Case Study: ${selectedChapterTitle}`],
      assessmentMethod: '30-Question Subject Exam + IQ/EQ/SQ Diagnostic + Teacher Verification',
      certificateEligibility: true,
      certificateNote: 'Includes OpenFrame QR-verified digital & dispatchable certificate (7-field residential address verified).',
      educationLevels: [activeLevel.educationCategoryCode],
      degreeProgrammes: [activeClassSpec.label],
      board: activeBoard?.shortName,
      subject: activeSubjectSpec.name,
      recommendedVideos: matchedVideos.slice(0, 4),
      updatedAt: new Date().toISOString(),
    };
  };

  // Unified Quinn AI + YouTube Chapter Search (Reuses existing /api/youtube/search & /api/quinn/organize-course)
  const runUnifiedChapterDiscovery = async (
    queryText: string,
    chapterLabel: string,
    deductToken = true
  ) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    if (deductToken) {
      const check = await deductStudentTokens({
        uid: studentUid,
        studentEmail,
        action: 'video_ai_analysis',
        subject: activeSubjectSpec.name,
        chapterTitle: chapterLabel,
      });
      setWallet(check.wallet);
      onWalletUpdated?.(check.wallet);
      if (!check.ok) {
        setWalletBanner({ type: 'error', text: check.error || 'Weekly tokens exhausted. Please recharge ₹100/week.' });
        return;
      }
    }

    setWalletBanner(null);
    setLoadingDiscovery(true);
    setSearchLogs((prev) => [
      {
        id: `sh-${Date.now()}`,
        studentId: studentUid,
        query: cleanQuery,
        category: activeSubjectSpec.name,
        searchedAt: new Date().toISOString(),
      },
      ...prev.slice(0, 19),
    ]);

    try {
      const [ytResp, organizedPath] = await Promise.all([
        standaloneApiFetch('/api/youtube/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: cleanQuery,
            courseTitle: `${activeClassSpec.label} ${activeSubjectSpec.name}`,
            lessonTopic: chapterLabel,
            category: activeSubjectSpec.name,
            language: selectedLanguage,
            maxResults: 6,
          }),
        })
          .then((r) => (r.ok ? r.json() : { videos: [] }))
          .catch(() => ({ videos: [] })),
        quinnAiService
          .organizeCoursePath({
            query: cleanQuery,
            language: selectedLanguage,
            moduleCount: 4,
            mode: 'builtin',
          })
          .catch(() => null),
      ]);

      const rawVideos: YouTubeVideoRecommendation[] = Array.isArray(ytResp?.videos)
        ? ytResp.videos
        : Array.isArray(organizedPath?.modules)
        ? organizedPath.modules.flatMap((m) => m.recommendedVideos || [])
        : [];

      const uniqueVideos: YouTubeVideoRecommendation[] = [];
      const seenIds = new Set<string>();
      for (const v of rawVideos) {
        const vidId = v.videoId || v.youtubeId || '';
        if (vidId && !seenIds.has(vidId)) {
          seenIds.add(vidId);
          uniqueVideos.push({
            ...v,
            videoId: vidId,
            embedUrl: v.embedUrl || `https://www.youtube-nocookie.com/embed/${vidId}`,
            thumbnail: v.thumbnail || v.thumbnailUrl || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
            youtubeUrl: v.youtubeUrl || `https://www.youtube.com/watch?v=${vidId}`,
          });
        }
      }

      setAiPath(organizedPath);
      setMatchedVideos(uniqueVideos);

      if (uniqueVideos.length > 0) {
        setActiveVideo(uniqueVideos[0]);
        setStudyMode('video');
      } else {
        setActiveVideo(null);
        setStudyMode('pdf');
        await generateOrLoadChapterPdfNote(chapterLabel, false);
      }
    } finally {
      setLoadingDiscovery(false);
    }
  };

  // Auto-run initial chapter discovery cleanly once without deducting starter tokens on first paint
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      runUnifiedChapterDiscovery(
        `${activeClassSpec.label} ${activeBoard?.shortName || 'Karnataka State Board'} ${activeSubjectSpec.name} ${selectedChapterTitle}`,
        selectedChapterTitle,
        false
      );
    }
  }, []);

  const handleSelectChapter = (chapterTitle: string) => {
    setSelectedChapterTitle(chapterTitle);
    const composedQuery = `${activeClassSpec.label} ${activeBoard?.shortName || 'NCERT'} ${activeSubjectSpec.name} ${chapterTitle}`;
    setSearchQuery(composedQuery);
    setChapterNote(null);
    setAssessmentUnlocked(false);
    runUnifiedChapterDiscovery(composedQuery, chapterTitle, true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    runUnifiedChapterDiscovery(q, selectedChapterTitle || q, true);
  };

  // Generate or load Chapter PDF Study Notes (Auto-fallback when no video or learner selects PDF reader)
  const generateOrLoadChapterPdfNote = async (chapterTitle = selectedChapterTitle, chargeTokens = true) => {
    if (chargeTokens) {
      const check = await deductStudentTokens({
        uid: studentUid,
        studentEmail,
        action: 'chapter_pdf',
        subject: activeSubjectSpec.name,
        chapterTitle,
      });
      setWallet(check.wallet);
      onWalletUpdated?.(check.wallet);
      if (!check.ok) {
        setWalletBanner({ type: 'error', text: check.error || 'Weekly tokens exhausted. Please recharge ₹100/week.' });
        return;
      }
    }

    setLoadingPdfNote(true);
    setStudyMode('pdf');
    try {
      const resp = await standaloneApiFetch('/api/self-study/analyze-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: activeBoard?.id || selectedBoardId,
          boardName: activeBoard?.officialName || 'Karnataka State Board',
          levelLabel: activeLevel.title,
          classOrDepartment: activeClassSpec.label,
          gradeBand: activeClassSpec.gradeBand,
          subject: activeSubjectSpec.name,
          chapterTitle,
          language: selectedLanguage,
          mode: 'pdf_notes',
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.note) {
        setChapterNote(data.note as SelfStudyChapterNote);
      } else {
        setChapterNote(
          buildDeterministicChapterNote({
            boardId: activeBoard?.id || selectedBoardId,
            boardName: activeBoard?.officialName || 'Karnataka State Board',
            levelLabel: activeLevel.title,
            classOrDepartment: activeClassSpec.label,
            subject: activeSubjectSpec.name,
            chapterTitle,
            language: selectedLanguage,
          })
        );
      }
    } catch {
      setChapterNote(
        buildDeterministicChapterNote({
          boardId: activeBoard?.id || selectedBoardId,
          boardName: activeBoard?.officialName || 'Karnataka State Board',
          levelLabel: activeLevel.title,
          classOrDepartment: activeClassSpec.label,
          subject: activeSubjectSpec.name,
          chapterTitle,
          language: selectedLanguage,
        })
      );
    } finally {
      setLoadingPdfNote(false);
    }
  };

  // Mark Chapter Complete & Launch Quinn AI Video/Chapter Analysis → 30-Question Exam + IQ/EQ/SQ Tests
  const handleCompleteChapterAndStartTests = async () => {
    const checkExam = await deductStudentTokens({
      uid: studentUid,
      studentEmail,
      action: 'thirty_q_exam',
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
    });
    setWallet(checkExam.wallet);
    onWalletUpdated?.(checkExam.wallet);
    if (!checkExam.ok) {
      setWalletBanner({ type: 'error', text: checkExam.error || 'Weekly tokens exhausted. Please recharge ₹100/week.' });
      return;
    }

    const checkIq = await deductStudentTokens({
      uid: studentUid,
      studentEmail,
      action: 'iq_eq_sq_test',
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
    });
    setWallet(checkIq.wallet);
    onWalletUpdated?.(checkIq.wallet);

    const chapterKey = `${activeClassSpec.id}::${activeSubjectSpec.id}::${selectedChapterTitle}`;
    setCompletedChapters((prev) => {
      const next = prev.includes(chapterKey) ? prev : [...prev, chapterKey];
      try {
        localStorage.setItem(`openframe_self_study_done_${studentUid}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    // Immediately populate all 30 short questions and IQ/EQ/SQ assessments synchronously so they open with 0ms wait
    const instantQuestions = buildDeterministic30QuestionExam({
      boardName: activeBoard?.officialName || 'Karnataka State Board',
      classOrDepartment: activeClassSpec.label,
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
      videoTitle: activeVideo?.title || '',
    });
    const instantBank = buildSubjectContextualIqEqSqBank({
      gradeBand: activeClassSpec.gradeBand,
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
    });

    examAnswersRef.current = {};
    setExamQuestions(instantQuestions);
    setIqEqSqBank(instantBank);
    setExamAnswers({});
    setIqAnswers({});
    setEqAnswers({});
    setSqAnswers({});
    setAssessmentTab('thirty_q');
    setAssessmentUnlocked(true);
    setLoadingAssessment(false);

    setTimeout(() => {
      assessmentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);

    // Optional fast non-blocking AI enrichment for unanswered questions (never blocks opening all 30 questions)
    const targetChapter = selectedChapterTitle;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);
    standaloneApiFetch('/api/self-study/analyze-chapter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        boardId: activeBoard?.id || selectedBoardId,
        boardName: activeBoard?.officialName || 'Karnataka State Board',
        levelLabel: activeLevel.title,
        classOrDepartment: activeClassSpec.label,
        gradeBand: activeClassSpec.gradeBand,
        subject: activeSubjectSpec.name,
        chapterTitle: targetChapter,
        videoTitle: activeVideo?.title || '',
        language: selectedLanguage,
        mode: 'thirty_q_exam',
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((examRes) => {
        if (
          examRes?.generatedBy === 'gemini' &&
          Array.isArray(examRes?.questions) &&
          examRes.questions.length === 30 &&
          Object.keys(examAnswersRef.current).length === 0
        ) {
          setExamQuestions(examRes.questions as SelfStudyExamQuestion[]);
        }
      })
      .catch(() => {
        // Keep the 30 deterministic syllabus questions already open
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
      });
  };

  // Guarantee all 30 questions and IQ/EQ/SQ bank are always available once unlocked
  const displayedExamQuestions = useMemo<SelfStudyExamQuestion[]>(() => {
    if (examQuestions.length === 30) return examQuestions;
    return buildDeterministic30QuestionExam({
      boardName: activeBoard?.officialName || 'Karnataka State Board',
      classOrDepartment: activeClassSpec.label,
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
      videoTitle: activeVideo?.title || '',
    });
  }, [examQuestions, activeBoard, activeClassSpec, activeSubjectSpec, selectedChapterTitle, activeVideo]);

  const displayedIqEqSqBank = useMemo<Record<AssessmentDimension, IqEqSqQuestionItem[]>>(() => {
    if (iqEqSqBank) return iqEqSqBank;
    return buildSubjectContextualIqEqSqBank({
      gradeBand: activeClassSpec.gradeBand,
      subject: activeSubjectSpec.name,
      chapterTitle: selectedChapterTitle,
    });
  }, [iqEqSqBank, activeClassSpec, activeSubjectSpec, selectedChapterTitle]);

  // Submit 30-Question Exam + IQ/EQ/SQ Assessments → Save to Firestore & Render 20 Graphs + Downloadable Report
  const handleSubmitFullEvaluation = async () => {
    if (displayedExamQuestions.length === 0) return;
    setSubmittingReport(true);
    try {
      const examEval = evaluate30QuestionExam(displayedExamQuestions, examAnswers);
      const iqEval = evaluateCustomIqEqSqDimension('IQ', displayedIqEqSqBank.IQ, iqAnswers);
      const eqEval = evaluateCustomIqEqSqDimension('EQ', displayedIqEqSqBank.EQ, eqAnswers);
      const sqEval = evaluateCustomIqEqSqDimension('SQ', displayedIqEqSqBank.SQ, sqAnswers);

      const saved = await saveSelfStudyProgressReport({
        studentId: studentUid,
        studentName,
        studentEmail,
        boardId: activeBoard?.id || selectedBoardId,
        boardName: activeBoard?.shortName || activeBoard?.officialName || 'Karnataka State Board',
        educationLevelNumber: activeLevel.levelNumber,
        educationLevelLabel: activeLevel.title,
        classOrDepartment: activeClassSpec.label,
        subject: activeSubjectSpec.name,
        chapterTitle: selectedChapterTitle,
        language: selectedLanguage,
        sourceType: studyMode === 'pdf' || !activeVideo ? 'chapter_pdf' : 'youtube_video',
        videoId: activeVideo?.videoId,
        videoTitle: activeVideo?.title,
        totalQuestions: examEval.totalQuestions,
        correctAnswers: examEval.correctAnswers,
        thirtyQuestionScore: examEval.scorePercent,
        iqScore: iqEval.scorePercent,
        eqScore: eqEval.scorePercent,
        sqScore: sqEval.scorePercent,
        iqBand: iqEval.bandLabel,
        eqBand: eqEval.bandLabel,
        sqBand: sqEval.bandLabel,
        strongTopics: examEval.strongTopics,
        weakTopics: examEval.weakTopics,
        topicDiagnostics: examEval.topicDiagnostics,
        remediationPlan: examEval.remediationPlan,
        tokensSpent:
          SELF_STUDY_TOKEN_COSTS.video_ai_analysis +
          SELF_STUDY_TOKEN_COSTS.thirty_q_exam +
          SELF_STUDY_TOKEN_COSTS.iq_eq_sq_test,
        submittedAt: new Date().toISOString(),
      });

      setSubmittedReports((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
      setActiveReport(saved);
      setWalletBanner({
        type: 'success',
        text: `Evaluation submitted! 30-Question Score: ${saved.thirtyQuestionScore}% · IQ ${saved.iqScore}% · EQ ${saved.eqScore}% · SQ ${saved.sqScore}%. All 20 analytics graphs & downloadable Progress Report updated below.`,
      });

      setTimeout(() => {
        finalReportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Recharge ₹100 / Week (+250 Tokens)
  const handleWeeklyRecharge = async () => {
    setRecharging(true);
    setWalletBanner(null);
    try {
      const res = await rechargeWeeklyTokens({
        uid: studentUid,
        studentName,
        studentEmail,
      });
      setWallet(res.wallet);
      onWalletUpdated?.(res.wallet);
      setWalletBanner({
        type: res.ok ? 'success' : 'error',
        text: res.message,
      });
    } finally {
      setRecharging(false);
    }
  };

  // Feed Self-Study Reports directly into the existing 20-Chart Engine (zero duplication!)
  const analytics20Data = useMemo(() => {
    const reports = submittedReports;
    const progressList: StudentProgressRecord[] = reports.map((r) => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
      courseId: `ss-${r.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      courseTitle: `${r.classOrDepartment} · ${r.subject} — ${r.chapterTitle}`,
      currentStage: r.thirtyQuestionScore >= 70 ? 'certificate' : 'quiz',
      completedStages: ['enrollment', 'video_learning', 'quiz'],
      completedLessonIds: [r.chapterTitle],
      totalMandatoryLessons: 1,
      overallProgressPercent: Math.min(100, Math.round((r.thirtyQuestionScore + r.iqScore) / 2)),
      quizAveragePercent: r.thirtyQuestionScore,
      certificateEligible: r.thirtyQuestionScore >= 70,
      videoSessionsCount: r.sourceType === 'youtube_video' ? 1 : 0,
      quizzesPassed: r.thirtyQuestionScore >= 60 ? 1 : 0,
      lastActiveAt: r.submittedAt,
      updatedAt: r.submittedAt,
    }));

    const quizAttempts: QuizAttempt[] = reports.map((r) => ({
      id: `qa-${r.id}`,
      studentId: r.studentId,
      studentName: r.studentName,
      courseId: `ss-${r.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lessonId: r.chapterTitle,
      submittedAt: r.submittedAt,
      score: r.correctAnswers,
      maxScore: r.totalQuestions,
      percentage: r.thirtyQuestionScore,
      percentageScore: r.thirtyQuestionScore,
      passed: r.thirtyQuestionScore >= 60,
      quinnFeedback: `IQ ${r.iqScore}% · EQ ${r.eqScore}% · SQ ${r.sqScore}%`,
      recommendedRevisionTopics: r.weakTopics,
    }));

    const videoSessions: VideoLearningSession[] = reports.map((r) => ({
      id: `vs-${r.id}`,
      studentId: r.studentId,
      courseId: `ss-${r.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lessonId: r.chapterTitle,
      videoId: r.videoId || 'chapter-pdf',
      videoTitle: r.videoTitle || `${r.chapterTitle} (PDF Study Notes)`,
      openedAt: r.submittedAt,
      watchDurationSeconds: r.sourceType === 'youtube_video' ? 1320 : 900,
      totalDurationSeconds: 1500,
      completed: true,
      completedAt: r.submittedAt,
      playbackProgress: 100,
    }));

    const evaluations: TeacherEvaluation[] = reports.map((r) => ({
      id: `ev-${r.id}`,
      submissionId: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      courseId: `ss-${r.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      courseName: `${r.subject} · ${r.chapterTitle}`,
      teacherName: 'Quinn AI Holistic Evaluator',
      evaluatedAt: r.submittedAt,
      rubricScores: {
        subjectKnowledge: Math.round((r.thirtyQuestionScore / 100) * 20),
        conceptUnderstanding: Math.round((r.iqScore / 100) * 20),
        practicalImplementation: Math.round((r.thirtyQuestionScore / 100) * 20),
        creativityInnovation: Math.round((r.iqScore / 100) * 15),
        presentationSkills: Math.round((r.eqScore / 100) * 15),
        communicationSkills: Math.round((r.sqScore / 100) * 10),
      },
      totalScore: Math.round((r.thirtyQuestionScore + r.iqScore + r.eqScore + r.sqScore) / 4),
      writtenFeedback: r.remediationPlan.join(' '),
      decision: r.thirtyQuestionScore >= 60 ? 'Approved' : 'Corrections Requested',
    }));

    const notes: StudentLessonNote[] = reports.map((r) => ({
      id: `nt-${r.id}`,
      studentId: r.studentId,
      courseId: `ss-${r.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      lessonId: r.chapterTitle,
      lessonTitle: r.chapterTitle,
      content: `Strong: ${r.strongTopics.join(', ') || 'Foundations'} | Weak: ${r.weakTopics.join(', ') || 'None'}`,
      createdAt: r.submittedAt,
      updatedAt: r.submittedAt,
    }));

    return {
      progressList,
      enrollments: localEnrollments,
      extData: {
        quizAttempts,
        videoSessions,
        projectSubmissions: [],
        presentations: [],
        evaluations,
        notes,
        bookmarks: [],
        searchHistory: searchLogs,
      },
    };
  }, [submittedReports, localEnrollments, searchLogs]);

  const answered30Count = displayedExamQuestions.filter((q) => examAnswers[q.id] !== undefined).length;
  const answeredIqCount = displayedIqEqSqBank.IQ.filter((q) => iqAnswers[q.id] !== undefined).length;
  const answeredEqCount = displayedIqEqSqBank.EQ.filter((q) => eqAnswers[q.id] !== undefined).length;
  const answeredSqCount = displayedIqEqSqBank.SQ.filter((q) => sqAnswers[q.id] !== undefined).length;

  const daysRemaining = wallet ? getWalletDaysRemaining(wallet) : 7;
  const lowTokens = wallet ? wallet.balance <= 6 || isWalletExpired(wallet) : false;

  const currentChapterKey = `${activeClassSpec.id}::${activeSubjectSpec.id}::${selectedChapterTitle}`;
  const isCurrentChapterDone = completedChapters.includes(currentChapterKey);

  return (
    <div className="space-y-8">
      {/* ================================================================= */}
      {/* 1. COMPACT WORKSPACE HEADER & WEEKLY TOKEN WALLET BAR              */}
      {/* ================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#123D32]">
              <Compass className="w-4 h-4" />
              <span>Study on Your Own Self · Unified LKG to Post-Graduation Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
              Self-Paced Chapter Explorer, Quinn AI Modules &amp; 30-Question Diagnostics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Explore all 10 academic levels across every Indian board and 14 languages. Watch matched YouTube lectures or read auto-generated Chapter PDF Notes, enroll with 90% OpenFrame Grant ({formatInr(300)}–{formatInr(2500)}), complete the 30-question exam + IQ/EQ/SQ tests, and download your 20-graph progress report.
            </p>
            {!currentUser && (
              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <GoogleSignInButton
                  role="student"
                  label="Sign in with Google to Sync Progress"
                  variant="compact"
                  showInlineError
                />
                <span className="text-[11px] text-slate-500">
                  Keep your weekly tokens, chapters &amp; 20-graph reports synced across sessions
                </span>
              </div>
            )}
          </div>

          {/* Weekly Token Wallet Card */}
          <div
            className={`rounded-xl border p-4 min-w-[280px] lg:min-w-[330px] ${
              lowTokens ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#123D32] text-white flex items-center justify-center shrink-0">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Weekly Self-Study Tokens
                  </div>
                  <div className="text-lg font-heading font-extrabold text-slate-900 tabular-nums leading-tight">
                    {wallet ? wallet.balance : 50}{' '}
                    <span className="text-xs font-semibold text-slate-500">
                      tokens left · {daysRemaining}d cycle
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWeeklyRecharge}
                disabled={recharging}
                className="px-3 py-2 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold whitespace-nowrap inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
              >
                {recharging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span className="tabular-nums">₹{WEEKLY_RECHARGE_PRICE_INR}/wk (+{WEEKLY_RECHARGE_TOKENS})</span>
              </button>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 tabular-nums">
              <span>AI Search: 2 tok · PDF Notes: 2 tok</span>
              <span>30-Q Exam: 5 tok · IQ/EQ/SQ: 3 tok</span>
            </div>
          </div>
        </div>

        {walletBanner && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-xs font-semibold flex items-center justify-between gap-3 ${
              walletBanner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : walletBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2">
              {walletBanner.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{walletBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setWalletBanner(null)}
              className="text-xs font-bold underline cursor-pointer shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 2. 1-TO-10 MASTER ACADEMIC DIRECTORY + UNIFIED QUINN AI SEARCH    */}
      {/* ================================================================= */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#123D32]" />
              <span>1-to-10 Master Curriculum Directory (LKG to Post-Graduation &amp; Career Skills)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose any level, Indian education board, class/department, subject, and language — or search directly below.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 tabular-nums whitespace-nowrap">
            {ALL_INDIA_BOARDS.length} Indian Boards · 14 Languages
          </span>
        </div>

        {/* 1 to 10 Level Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {SELF_STUDY_MASTER_LEVELS.map((lvl) => {
            const active = lvl.levelNumber === selectedLevelNumber;
            return (
              <button
                key={lvl.code}
                type="button"
                onClick={() => setSelectedLevelNumber(lvl.levelNumber)}
                className={`px-2.5 py-2 rounded-lg border text-left text-[11px] font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-[#0B1930] border-[#0B1930] text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="truncate">{lvl.shortLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Board / Class-Department / Subject / Language Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Education Board / Authority
            </label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
            >
              {ALL_INDIA_BOARDS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.shortName} — {b.stateOrUt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Class / PUC Stream / Department
            </label>
            <select
              value={activeClassSpec.id}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
            >
              {activeLevel.classesOrDepartments.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={activeSubjectSpec.id}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
            >
              {activeClassSpec.subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.chapters.length} Chapters)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Learning Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
            >
              {ALL_INDIA_LANGUAGE_PACKS.map((lp) => (
                <option key={lp.id} value={lp.id}>
                  {lp.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Unified Quinn AI + YouTube Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search subject & chapter (e.g. "Class 8 Karnataka Science Force and Pressure" or "2nd PUC Accountancy")'
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#123D32] focus:outline-none text-sm text-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loadingDiscovery}
            className="px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-[#14284A] text-white text-xs font-bold inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-60"
          >
            {loadingDiscovery ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-300" />
            )}
            <span>Search YouTube &amp; Quinn AI Modules</span>
          </button>
        </form>
      </section>

      {/* ================================================================= */}
      {/* 3. TWO-ZONE STUDY STAGE: CHAPTER MODULES + VIDEO / AUTO-PDF       */}
      {/* ================================================================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Zone: Clickable Chapter Modules Directory */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{activeSubjectSpec.name}</h3>
              <p className="text-[11px] text-slate-500">
                {activeBoard?.shortName} · {activeClassSpec.label}
              </p>
            </div>
            <span className="text-[11px] font-bold text-[#123D32] tabular-nums">
              {activeSubjectSpec.chapters.length} Modules
            </span>
          </div>

          <div className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
            {activeSubjectSpec.chapters.map((chapter, idx) => {
              const isSelected = chapter === selectedChapterTitle;
              const isDone = completedChapters.includes(
                `${activeClassSpec.id}::${activeSubjectSpec.id}::${chapter}`
              );
              return (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => handleSelectChapter(chapter)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#123D32] border-[#123D32] text-white'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`text-[11px] font-mono font-bold tabular-nums mt-0.5 shrink-0 ${
                        isSelected ? 'text-emerald-200' : 'text-slate-400'
                      }`}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold leading-snug">{chapter}</span>
                  </div>
                  {isDone && (
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${
                        isSelected ? 'text-emerald-300' : 'text-emerald-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Zone: YouTube Video Player + Quinn AI Modules OR Chapter PDF Study Reader */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* Chapter Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Chapter · {activeBoard?.shortName} · {activeClassSpec.label}
              </div>
              <h3 className="text-lg font-heading font-extrabold text-slate-900 truncate">
                {selectedChapterTitle}
              </h3>
            </div>

            {/* Mode Switcher: Video vs Chapter PDF */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setStudyMode('video')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  studyMode === 'video'
                    ? 'bg-[#0B1930] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>YouTube Lectures ({matchedVideos.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!chapterNote || chapterNote.chapterTitle !== selectedChapterTitle) {
                    generateOrLoadChapterPdfNote(selectedChapterTitle, true);
                  } else {
                    setStudyMode('pdf');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  studyMode === 'pdf'
                    ? 'bg-[#123D32] text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Chapter PDF Notes</span>
              </button>
            </div>
          </div>

          {/* VIDEO MODE */}
          {studyMode === 'video' && (
            <div className="space-y-5">
              {loadingDiscovery ? (
                <div className="aspect-video rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="w-6 h-6 animate-spin text-[#123D32]" />
                  <p className="text-xs font-semibold">
                    Searching YouTube &amp; building Quinn AI modules for &ldquo;{selectedChapterTitle}&rdquo;...
                  </p>
                </div>
              ) : activeVideo ? (
                <>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-200">
                    <iframe
                      title={activeVideo.title}
                      src={`${activeVideo.embedUrl}?rel=0&modestbranding=1`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>

                  {/* Video Info + Inline Enroll & Complete Buttons */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {activeVideo.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>Creator: {activeVideo.channelTitle}</span>
                        <span className="tabular-nums">Duration: {activeVideo.duration || 'Full Lesson'}</span>
                        <a
                          href={activeVideo.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                        >
                          <span>Watch on YouTube</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEnrollCourse(buildEnrollableCourseForChapter(activeVideo))}
                        className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>
                          Pay {formatInr(computedEnrollmentPricing.finalPriceInr)} First &amp; Enroll
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCompleteChapterAndStartTests}
                        disabled={loadingAssessment}
                        className="px-4 py-2 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer disabled:opacity-60"
                      >
                        {loadingAssessment ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {isCurrentChapterDone ? 'Retake 30-Q + IQ/EQ/SQ' : 'Complete & Take 30-Q Exam'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Additional Matched YouTube Videos */}
                  {matchedVideos.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700">
                        More Matched YouTube Lessons for {selectedChapterTitle}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {matchedVideos.slice(0, 6).map((v) => {
                          const selected = activeVideo?.videoId === v.videoId;
                          return (
                            <button
                              key={v.videoId}
                              type="button"
                              onClick={() => setActiveVideo(v)}
                              className={`text-left rounded-xl border overflow-hidden transition-all cursor-pointer ${
                                selected
                                  ? 'border-[#123D32] ring-2 ring-[#123D32]/20'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="relative aspect-video bg-slate-200">
                                <img
                                  src={v.thumbnail}
                                  alt={v.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[10px] font-mono tabular-nums">
                                  {v.duration || 'Video'}
                                </span>
                              </div>
                              <div className="p-2.5">
                                <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                                  {v.title}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1 truncate">
                                  {v.channelTitle}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-3">
                  <FileText className="w-8 h-8 text-[#123D32] mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900">
                    No YouTube Video Matched — Switch to Auto-Generated Chapter PDF Notes
                  </h4>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Read complete syllabus notes, worked examples, and official {activeBoard?.shortName} / NCERT textbook links immediately.
                  </p>
                  <button
                    type="button"
                    onClick={() => generateOrLoadChapterPdfNote(selectedChapterTitle, true)}
                    className="px-4 py-2 rounded-lg bg-[#123D32] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Chapter PDF Reader</span>
                  </button>
                </div>
              )}

              {/* Quinn AI Structured Parts & Modules (Unified Existing Pipeline) */}
              {aiPath && aiPath.modules && aiPath.modules.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#123D32]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Quinn AI Organized Parts &amp; Modules
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnrollCourse(buildEnrollableCourseForChapter(activeVideo))}
                      className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Enroll Full Structured Path</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {aiPath.modules.slice(0, 4).map((mod, idx) => (
                      <div key={`mod-${mod.moduleNumber || idx}`} className="bg-white border border-slate-200 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-[#123D32]">
                            {mod.partLabel || `Part ${idx + 1}`}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {mod.level}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{mod.title}</div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{mod.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAPTER PDF STUDY NOTES FALLBACK / READER MODE */}
          {studyMode === 'pdf' && (
            <div className="space-y-5">
              {loadingPdfNote ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-600">
                  <Loader2 className="w-6 h-6 animate-spin text-[#123D32]" />
                  <p className="text-xs font-semibold">
                    Generating Chapter PDF Study Notes &amp; Official Board Textbook Links...
                  </p>
                </div>
              ) : chapterNote ? (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <div>
                      <div className="text-xs font-bold text-[#123D32]">
                        Structured Chapter Study Notes Ready ({chapterNote.language})
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Read inline below, download as PDF for offline revision, or open official board textbooks.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadChapterStudyNotePdf(chapterNote)}
                        className="px-3.5 py-2 rounded-lg bg-[#0B1930] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Chapter PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEnrollCourse(buildEnrollableCourseForChapter(activeVideo))}
                        className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer tabular-nums"
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Pay {formatInr(computedEnrollmentPricing.finalPriceInr)} First &amp; Enroll</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCompleteChapterAndStartTests}
                        className="px-3.5 py-2 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Finish Reading &amp; Take 30-Q Exam</span>
                      </button>
                    </div>
                  </div>

                  {/* Overview */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      1. Chapter Overview
                    </h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{chapterNote.overview}</p>
                  </div>

                  {/* Key Definitions */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      2. Key Definitions &amp; Terminology
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {chapterNote.keyDefinitions.map((d, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-xs font-bold text-slate-900">{d.term}</div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{d.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Concepts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      3. Core Concepts Breakdown
                    </h4>
                    {chapterNote.coreConcepts.map((c, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2">
                        <div className="text-sm font-bold text-slate-900">{c.heading}</div>
                        <p className="text-xs text-slate-700 leading-relaxed">{c.explanation}</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                          {c.bulletPoints.map((bp, bIdx) => (
                            <li key={bIdx}>{bp}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {/* Worked Examples */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      4. Worked Examples
                    </h4>
                    <div className="space-y-2.5">
                      {chapterNote.workedExamples.map((ex, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="text-xs font-bold text-slate-900">{ex.problem}</div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            <span className="font-semibold text-[#123D32]">Solution:</span> {ex.solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Official Board Textbook Links */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      5. Official Board Textbook &amp; e-Library Portals
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {chapterNote.officialTextbookLinks.map((lnk, idx) => (
                        <a
                          key={idx}
                          href={lnk.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 rounded-lg bg-white border border-slate-200 hover:border-[#123D32] flex items-center justify-between gap-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate">{lnk.label}</div>
                            <div className="text-[11px] text-slate-500 truncate">{lnk.authority}</div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-[#123D32] shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. POST-COMPLETION 30-QUESTION EXAM + DEDICATED IQ / EQ / SQ      */}
      {/* ================================================================= */}
      <section ref={assessmentRef} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#123D32] flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>Post-Completion Quinn AI Analysis</span>
            </div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mt-0.5">
              30-Question Subject Mastery Exam + Dedicated IQ, EQ &amp; SQ Tests
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzes &ldquo;{selectedChapterTitle}&rdquo; ({activeSubjectSpec.name}) to identify strong vs. weak topics and holistic learner quotients.
            </p>
          </div>

          {!assessmentUnlocked ? (
            <button
              type="button"
              onClick={handleCompleteChapterAndStartTests}
              disabled={loadingAssessment}
              className="px-4 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-60"
            >
              {loadingAssessment ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>Launch 30-Question Exam + IQ/EQ/SQ</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800">
                30-Q: {answered30Count}/30
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800">
                IQ: {answeredIqCount}/{iqEqSqBank?.IQ.length || 6}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800">
                EQ: {answeredEqCount}/{iqEqSqBank?.EQ.length || 5}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800">
                SQ: {answeredSqCount}/{iqEqSqBank?.SQ.length || 5}
              </span>
            </div>
          )}
        </div>

        {walletBanner?.type === 'error' && !assessmentUnlocked && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{walletBanner.text}</span>
            </div>
            <button
              type="button"
              onClick={handleWeeklyRecharge}
              disabled={recharging}
              className="px-3 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Recharge ₹{WEEKLY_RECHARGE_PRICE_INR}/week (+{WEEKLY_RECHARGE_TOKENS} tokens)
            </button>
          </div>
        )}

        {!assessmentUnlocked ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900">
                Ready to evaluate &ldquo;{selectedChapterTitle}&rdquo;?
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">
                After watching the YouTube lecture or reading the Chapter PDF Notes, click Launch to open all 30 short chapter-specific questions at once plus dedicated IQ (Logical), EQ (Emotional Resilience), and SQ (Social &amp; Ethical) evaluations.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCompleteChapterAndStartTests}
              className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-slate-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
            >
              Start Evaluation Now
            </button>
          </div>
        ) : loadingAssessment ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-600">
            <Loader2 className="w-6 h-6 animate-spin text-[#123D32]" />
            <p className="text-xs font-semibold">
              Opening all 30 short subject questions + IQ/EQ/SQ assessments...
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Assessment Sub-Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'thirty_q' as AssessmentTab, label: `Part A: All 30 Short Questions (${answered30Count}/30)`, icon: BookOpen },
                { id: 'iq' as AssessmentTab, label: `Part B1: IQ Test (${answeredIqCount}/${displayedIqEqSqBank.IQ.length})`, icon: Brain },
                { id: 'eq' as AssessmentTab, label: `Part B2: EQ Test (${answeredEqCount}/${displayedIqEqSqBank.EQ.length})`, icon: Heart },
                { id: 'sq' as AssessmentTab, label: `Part B3: SQ Test (${answeredSqCount}/${displayedIqEqSqBank.SQ.length})`, icon: ShieldCheck },
              ].map((t) => {
                const Icon = t.icon;
                const active = assessmentTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setAssessmentTab(t.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer tabular-nums ${
                      active
                        ? 'bg-[#0B1930] text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* PART A: ALL 30 SHORT QUESTIONS OPEN TOGETHER (NO NEXT BUTTON / NO PAGINATION) */}
            {assessmentTab === 'thirty_q' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                  <div className="text-xs font-semibold text-slate-700 tabular-nums">
                    All {displayedExamQuestions.length} Short Questions Open · Answered {answered30Count} / {displayedExamQuestions.length}
                  </div>
                  <div className="flex items-center gap-2.5 min-w-[160px]">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#123D32] transition-all duration-200"
                        style={{ width: `${Math.round((answered30Count / Math.max(1, displayedExamQuestions.length)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#123D32] tabular-nums">
                      {Math.round((answered30Count / Math.max(1, displayedExamQuestions.length)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {displayedExamQuestions.map((q) => {
                    const isAnswered = examAnswers[q.id] !== undefined;
                    return (
                      <div
                        key={q.id}
                        className={`p-3.5 rounded-xl border space-y-2.5 transition-colors ${
                          isAnswered ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#123D32] tabular-nums">
                            Q{q.number}. <span className="text-slate-400 font-semibold">({q.cognitiveLevel})</span>
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">{q.subTopic}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">{q.questionText}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => {
                            const selected = examAnswers[q.id] === oIdx;
                            return (
                              <button
                                key={oIdx}
                                type="button"
                                onClick={() => {
                                  setExamAnswers((prev) => {
                                    const next = { ...prev, [q.id]: oIdx };
                                    examAnswersRef.current = next;
                                    return next;
                                  });
                                }}
                                className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                                  selected
                                    ? 'bg-[#0B1930] border-[#0B1930] text-white font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="font-mono font-bold mr-2">
                                  {String.fromCharCode(65 + oIdx)}.
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PART B1 / B2 / B3: DEDICATED IQ, EQ & SQ TESTS */}
            {assessmentTab !== 'thirty_q' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                  {NON_CLINICAL_EDUCATIONAL_DISCLAIMER}
                </div>

                {(assessmentTab === 'iq'
                  ? displayedIqEqSqBank.IQ
                  : assessmentTab === 'eq'
                  ? displayedIqEqSqBank.EQ
                  : displayedIqEqSqBank.SQ
                ).map((q, idx) => {
                  const ansMap =
                    assessmentTab === 'iq' ? iqAnswers : assessmentTab === 'eq' ? eqAnswers : sqAnswers;
                  const setAns =
                    assessmentTab === 'iq'
                      ? setIqAnswers
                      : assessmentTab === 'eq'
                      ? setEqAnswers
                      : setSqAnswers;
                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#123D32] uppercase tabular-nums">
                          {assessmentTab.toUpperCase()} Item {idx + 1}
                        </span>
                        <span className="text-[11px] text-slate-500">{q.domain}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{q.prompt}</p>
                      <div className="flex flex-wrap gap-2">
                        {q.options.map((opt, oIdx) => {
                          const selected = ansMap[q.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => setAns((prev) => ({ ...prev, [q.id]: oIdx }))}
                              className={`px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer ${
                                selected
                                  ? 'bg-[#123D32] border-[#123D32] text-white font-semibold'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  {assessmentTab === 'iq' ? (
                    <button
                      type="button"
                      onClick={() => setAssessmentTab('eq')}
                      className="ml-auto px-4 py-2 rounded-lg bg-[#0B1930] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to EQ Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : assessmentTab === 'eq' ? (
                    <button
                      type="button"
                      onClick={() => setAssessmentTab('sq')}
                      className="ml-auto px-4 py-2 rounded-lg bg-[#0B1930] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue to SQ Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitFullEvaluation}
                      disabled={submittingReport}
                      className="ml-auto px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {submittingReport ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                      <span>Submit 30-Q + IQ/EQ/SQ &amp; Generate 20-Graph Progress Report</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Submit Bar Available from Any Assessment Tab */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-500">
                Complete the 30 subject questions and IQ, EQ, SQ items, then submit to update all 20 graphs and unlock your downloadable Progress Report.
              </p>
              <button
                type="button"
                onClick={handleSubmitFullEvaluation}
                disabled={submittingReport}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submittingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Submit &amp; Save Progress Report</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ================================================================= */}
      {/* 5. 20-GRAPH VISUAL ANALYTICS SUITE (REUSES EXISTING 20 CHARTS)    */}
      {/* ================================================================= */}
      <section className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Live Self-Study Analytics · 20 Distinct Graph Types
            </div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mt-0.5">
              Strengths, Weaknesses, Mastery Trends &amp; IQ / EQ / SQ Telemetry
            </h3>
          </div>
          {activeReport && (
            <div className="grid grid-cols-4 gap-2 text-center tabular-nums">
              <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">30-Q Exam</div>
                <div className="text-base font-extrabold text-slate-900">{activeReport.thirtyQuestionScore}%</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-[10px] font-bold text-blue-700 uppercase">IQ</div>
                <div className="text-base font-extrabold text-blue-900">{activeReport.iqScore}%</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">EQ</div>
                <div className="text-base font-extrabold text-emerald-900">{activeReport.eqScore}%</div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                <div className="text-[10px] font-bold text-amber-700 uppercase">SQ</div>
                <div className="text-base font-extrabold text-amber-900">{activeReport.sqScore}%</div>
              </div>
            </div>
          )}
        </div>

        <StudentAnalytics20Charts
          progressList={analytics20Data.progressList}
          enrollments={analytics20Data.enrollments}
          favorites={[]}
          certificates={[]}
          extData={analytics20Data.extData}
          studentName={studentName}
          studentEmail={studentEmail}
        />
      </section>

      {/* ================================================================= */}
      {/* 6. FINAL SECTION: SUBMITTED & DOWNLOADABLE PROGRESS REPORT        */}
      {/* ================================================================= */}
      <section ref={finalReportRef} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#123D32] flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Final Section · Official Submitted Progress Report</span>
            </div>
            <h3 className="text-lg font-heading font-extrabold text-slate-900 mt-0.5">
              Downloadable Student Performance, Weak-Area &amp; IQ/EQ/SQ Report
            </h3>
          </div>

          {activeReport && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => downloadSelfStudyProgressReportPdf(activeReport, submittedReports)}
                className="px-4 py-2 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Report (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={() => exportSelfStudyReportsCsv(submittedReports)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => exportSelfStudyReportsJson(submittedReports)}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>

        {!activeReport ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No Progress Report Submitted Yet</div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Complete any chapter video or PDF above and submit the 30-Question Exam + IQ/EQ/SQ evaluation. Your official progress report will appear here automatically and become downloadable as a PDF.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Active Report Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Learner &amp; Chapter Metadata
                </div>
                <div className="text-sm font-bold text-slate-900">{activeReport.studentName}</div>
                <div className="text-xs text-slate-600">
                  {activeReport.boardName} · {activeReport.classOrDepartment}
                </div>
                <div className="text-xs font-semibold text-[#123D32]">
                  {activeReport.subject} — {activeReport.chapterTitle}
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums pt-1">
                  Submitted: {new Date(activeReport.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Strong Topics (75%+)
                </div>
                {activeReport.strongTopics.length > 0 ? (
                  <ul className="space-y-1 text-xs text-emerald-950 font-medium">
                    {activeReport.strongTopics.map((st, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-600">
                    Keep practicing — topics reaching 75%+ accuracy will highlight here.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Weak Areas Requiring Focus (&lt;75%)
                </div>
                {activeReport.weakTopics.length > 0 ? (
                  <ul className="space-y-1 text-xs text-rose-950 font-medium">
                    {activeReport.weakTopics.map((wt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-700 shrink-0 mt-0.5" />
                        <span>{wt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-800 font-semibold">
                    Zero weak topics detected in this chapter!
                  </p>
                )}
              </div>
            </div>

            {/* Topic Accuracy Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5 font-bold">Chapter Sub-Topic</th>
                    <th className="px-4 py-2.5 font-bold tabular-nums">Correct</th>
                    <th className="px-4 py-2.5 font-bold tabular-nums">Accuracy</th>
                    <th className="px-4 py-2.5 font-bold">Diagnostic Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReport.topicDiagnostics.map((d, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{d.topic}</td>
                      <td className="px-4 py-2.5 tabular-nums text-slate-600">
                        {d.correct} / {d.total}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums font-bold text-slate-900">
                        {d.accuracyPercent}%
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-bold ${
                            d.status === 'Strong'
                              ? 'text-emerald-700'
                              : d.status === 'Developing'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Remediation Plan */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quinn AI Personalized Remediation Plan
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {activeReport.remediationPlan.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <RefreshCw className="w-3.5 h-3.5 text-[#123D32] shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Submitted History List */}
            {submittedReports.length > 1 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Previously Submitted Progress Reports ({submittedReports.length})
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {submittedReports.map((rep) => {
                    const selected = rep.id === activeReport.id;
                    return (
                      <button
                        key={rep.id}
                        type="button"
                        onClick={() => setActiveReport(rep)}
                        className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                          selected
                            ? 'border-[#123D32] bg-emerald-50/40'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {rep.subject} · {rep.chapterTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {rep.boardName} · {rep.classOrDepartment}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[11px] font-bold tabular-nums text-slate-700">
                          <span>30-Q: {rep.thirtyQuestionScore}%</span>
                          <span>IQ {rep.iqScore}% · EQ {rep.eqScore}% · SQ {rep.sqScore}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Unified Course Enrollment Modal (90% Off ₹300–₹2,500 + 7-Field Certificate Address Verification) */}
      <CourseEnrollmentModal
        isOpen={Boolean(enrollCourse)}
        onClose={() => setEnrollCourse(null)}
        course={enrollCourse}
        onEnrolled={(enr) => {
          setLocalEnrollments((prev) => [enr, ...prev.filter((e) => e.id !== enr.id)]);
          setWalletBanner({
            type: 'success',
            text: `Enrolled in "${enr.courseTitle}"! Verified certificate details saved.`,
          });
        }}
      />
    </div>
  );
};
