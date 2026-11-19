import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Compass,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  Languages,
  Layers,
  Loader2,
  LogOut,
  Play,
  Presentation,
  Radio,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  User,
  Video,
  Wrench,
  X,
} from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import {
  SCHOOL_ACADEMIC_YEARS,
  SCHOOL_BOARDS,
  SCHOOL_CAREER_PATHWAYS,
  SCHOOL_CLASSES,
  SCHOOL_FORMULA_LIBRARY,
  getDefaultWeeklyTimetable,
  getSubjectsForSelection,
} from '../data/schoolCurriculumData';
import { ALL_INDIA_BOARDS } from '../data/allIndiaBoardsData';
import {
  ALL_INDIA_LANGUAGE_PACKS,
  ALL_INDIA_TECH_GLOSSARY,
  getBoardRecommendedLanguages,
  getLanguagePack,
  getLocalizedText,
} from '../data/allIndiaLanguagesData';
import {
  AllIndiaBoardRecord,
  BoardGradeFramework,
  SchoolAnnouncement,
  SchoolAssignment,
  SchoolAttendanceRecord,
  SchoolBoardId,
  SchoolClassId,
  SchoolConceptProgress,
  SchoolExamination,
  SchoolLanguage,
  SchoolLiveClass,
  SchoolMarkEntry,
  SchoolMasteryStatus,
  SchoolPresentationItem,
  SchoolQuizAttempt,
  SchoolStreamId,
  SchoolStudentEnrollment,
  SchoolSubject,
  SchoolSubmission,
  SchoolTimetableSlot,
  StudentTokenWallet,
  TranslatedConceptBundle,
} from '../types';
import { getBoardGradeFrameworkSpec } from '../data/boardGradeFrameworkData';
import {
  awardSchoolXpAndBadge,
  computeBoardGrade,
  exportSchoolMilestoneCertificatePdf,
  exportSchoolReportCardPdf,
  getBoardGradeFramework,
  getCustomSchoolSubjects,
  getSchoolAnnouncements,
  getSchoolAssignments,
  getSchoolAttendance,
  getSchoolEnrollment,
  getSchoolExaminations,
  getSchoolLiveClasses,
  getSchoolMarks,
  getSchoolPresentations,
  getSchoolQuizAttempts,
  getSchoolSubmissions,
  getSchoolTimetable,
  getStudentSchoolProgress,
  joinSchoolLiveClass,
  markSchoolAttendance,
  saveSchoolEnrollment,
  submitSchoolHomework,
  submitSchoolPresentation,
  updateStudentLanguagePreference,
  upsertSchoolConceptProgress,
} from '../services/schoolService';
import { uploadDocumentToStorage } from '../services/firebase';
import {
  SchoolYouTubeVideoResult,
  fetchSchoolYouTubeLessons,
  getCachedConceptTranslation,
  translateSchoolConceptBundle,
} from '../services/schoolAiService';
import { VoiceLearningControls } from '../components/school/VoiceLearningControls';
import { InteractiveConceptLab } from '../components/school/InteractiveConceptLab';
import { SchoolQuizEngine } from '../components/school/SchoolQuizEngine';
import { AiTutorDrawer } from '../components/school/AiTutorDrawer';
import { AllIndiaBoardDirectory } from '../components/school/AllIndiaBoardDirectory';
import { BoardGradeStructurePanel } from '../components/school/BoardGradeStructurePanel';
import { MultilingualLanguagePanel } from '../components/school/MultilingualLanguagePanel';
import { StudyOnYourOwnSelfWorkspace } from '../components/school/StudyOnYourOwnSelfWorkspace';
import { getOrCreateStudentTokenWallet } from '../services/selfStudyService';

type HubTab =
  | 'daily'
  | 'self_study'
  | 'boards'
  | 'structure'
  | 'languages'
  | 'subjects'
  | 'tutor'
  | 'quizzes'
  | 'marks'
  | 'work'
  | 'live'
  | 'progress'
  | 'tools';

export const SchoolEducationHubPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { currentUser, lmsUser, logout, refreshSchoolEnrollment } = useAuth();
  const [showClassSettingsModal, setShowClassSettingsModal] = useState(false);

  // Parse URL params/segments cleanly
  const [cleanPath, queryStr] = currentPath.split('?');
  const urlParams = useMemo(() => new URLSearchParams(queryStr || ''), [queryStr]);

  const initialClassFromUrl = useMemo<SchoolClassId>(() => {
    const match = cleanPath.match(/^\/school\/class\/([^/]+)/i);
    if (match) {
      const candidate = decodeURIComponent(match[1]).toUpperCase();
      const found = SCHOOL_CLASSES.find((c) => c.id.toUpperCase() === candidate);
      if (found) return found.id;
    }
    return '8';
  }, [cleanPath]);

  const initialDirectoryBoard = useMemo<AllIndiaBoardRecord | null>(() => {
    const dirId = (urlParams.get('directoryBoardId') || '').trim();
    if (dirId) {
      return ALL_INDIA_BOARDS.find((b) => b.id === dirId) || null;
    }
    return null;
  }, [urlParams]);

  const initialBoardFromUrl = useMemo<SchoolBoardId>(() => {
    if (initialDirectoryBoard) return initialDirectoryBoard.curriculumGroupId;
    const b = (urlParams.get('board') || 'KAR_STATE').toUpperCase();
    return (SCHOOL_BOARDS.find((x) => x.id === b)?.id || 'KAR_STATE') as SchoolBoardId;
  }, [urlParams, initialDirectoryBoard]);

  const initialTabFromUrl = useMemo<HubTab>(() => {
    const t = (urlParams.get('tab') || '').toLowerCase();
    const validTabs: HubTab[] = ['daily', 'self_study', 'boards', 'structure', 'languages', 'subjects', 'tutor', 'quizzes', 'marks', 'work', 'live', 'progress', 'tools'];
    return validTabs.includes(t as HubTab) ? (t as HubTab) : 'daily';
  }, [urlParams]);

  const [boardId, setBoardId] = useState<SchoolBoardId>(initialBoardFromUrl);
  const [selectedDirectoryBoard, setSelectedDirectoryBoard] = useState<AllIndiaBoardRecord | null>(
    initialDirectoryBoard || ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === initialBoardFromUrl) || null
  );
  const [gradeFramework, setGradeFramework] = useState<BoardGradeFramework>(() =>
    getBoardGradeFrameworkSpec(
      initialDirectoryBoard?.id ||
        ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === initialBoardFromUrl)?.id
    )
  );
  const [curriculumVersionId, setCurriculumVersionId] = useState<string>(
    () =>
      getBoardGradeFrameworkSpec(
        initialDirectoryBoard?.id ||
          ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === initialBoardFromUrl)?.id
      ).curriculumVersions.find((v) => v.isDefault)?.id || ''
  );
  const [classId, setClassId] = useState<SchoolClassId>(initialClassFromUrl);
  const [academicYear, setAcademicYear] = useState<string>(SCHOOL_ACADEMIC_YEARS[0]);
  const [stream, setStream] = useState<SchoolStreamId>('Science');
  const [medium, setMedium] = useState<string>('English Medium');
  const [language, setLanguage] = useState<SchoolLanguage>('English');
  const [activeTab, setActiveTab] = useState<HubTab>(initialTabFromUrl);

  const [customSubjects, setCustomSubjects] = useState<SchoolSubject[]>([]);
  const [enrollment, setEnrollment] = useState<SchoolStudentEnrollment | null>(null);
  const [parentalConsent, setParentalConsent] = useState(true);
  const [parentEmailInput, setParentEmailInput] = useState('');
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [statusBanner, setStatusBanner] = useState('');
  const [tokenWallet, setTokenWallet] = useState<StudentTokenWallet | null>(null);

  useEffect(() => {
    let active = true;
    const uid = currentUser?.uid || 'guest_learner';
    getOrCreateStudentTokenWallet(uid, currentUser?.email || undefined).then((w) => {
      if (active) setTokenWallet(w);
    });
    return () => {
      active = false;
    };
  }, [currentUser?.uid, currentUser?.email]);

  // Learning Workspace states
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedConceptId, setSelectedConceptId] = useState<string>('');

  // Dynamic Firestore records
  const [progressRecords, setProgressRecords] = useState<SchoolConceptProgress[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<SchoolQuizAttempt[]>([]);
  const [assignments, setAssignments] = useState<SchoolAssignment[]>([]);
  const [submissions, setSubmissions] = useState<SchoolSubmission[]>([]);
  const [presentations, setPresentations] = useState<SchoolPresentationItem[]>([]);
  const [marks, setMarks] = useState<SchoolMarkEntry[]>([]);
  const [exams, setExams] = useState<SchoolExamination[]>([]);
  const [attendance, setAttendance] = useState<SchoolAttendanceRecord[]>([]);
  const [liveClasses, setLiveClasses] = useState<SchoolLiveClass[]>([]);
  const [timetable, setTimetable] = useState<SchoolTimetableSlot[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);

  // Concept Video & Post-Video states
  const [ytVideos, setYtVideos] = useState<SchoolYouTubeVideoResult[]>([]);
  const [ytSearchUrl, setYtSearchUrl] = useState('');
  const [ytStatusMsg, setYtStatusMsg] = useState('');
  const [ytLoading, setYtLoading] = useState(false);
  const [activeYtVideo, setActiveYtVideo] = useState<SchoolYouTubeVideoResult | null>(null);
  const [translatedBundle, setTranslatedBundle] = useState<TranslatedConceptBundle | null>(null);
  const [translating, setTranslating] = useState(false);
  const [offlineSavedIds, setOfflineSavedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('openframe_school_offline_concepts') || '[]');
    } catch {
      return [];
    }
  });

  // Homework & Presentation form states
  const [hwAssignmentId, setHwAssignmentId] = useState('');
  const [hwType, setHwType] = useState<SchoolSubmission['submissionType']>('Written');
  const [hwWritten, setHwWritten] = useState('');
  const [hwFile, setHwFile] = useState<File | null>(null);
  const [hwSubmitting, setHwSubmitting] = useState(false);

  const [prsTopic, setPrsTopic] = useState('');
  const [prsType, setPrsType] = useState<SchoolPresentationItem['presentationType']>('Topic Presentation');
  const [prsGroup, setPrsGroup] = useState('');
  const [prsNotes, setPrsNotes] = useState('');
  const [prsUrl, setPrsUrl] = useState('');
  const [prsFile, setPrsFile] = useState<File | null>(null);
  const [prsSubmitting, setPrsSubmitting] = useState(false);

  // Sync URL class & tab updates
  useEffect(() => {
    setClassId(initialClassFromUrl);
  }, [initialClassFromUrl]);

  useEffect(() => {
    if (urlParams.get('tab')) {
      setActiveTab(initialTabFromUrl);
    }
  }, [initialTabFromUrl, urlParams]);

  // Once enrolled & logged in, default to Daily Classes homepage (unless a sub-tab is explicitly requested)
  useEffect(() => {
    if (currentUser && enrollment && !urlParams.get('tab')) {
      setActiveTab('daily');
    }
  }, [currentUser, enrollment, urlParams]);

  const activeBoard = useMemo(
    () => SCHOOL_BOARDS.find((b) => b.id === boardId) || SCHOOL_BOARDS[0],
    [boardId]
  );

  const activeClass = useMemo(
    () => SCHOOL_CLASSES.find((c) => c.id === classId) || SCHOOL_CLASSES[9],
    [classId]
  );

  // Load Phase 2 Grade & Curriculum Version framework when directory board changes
  useEffect(() => {
    let active = true;
    const dirId = selectedDirectoryBoard?.id;
    getBoardGradeFramework(dirId).then((res) => {
      if (!active) return;
      setGradeFramework(res.framework);
      const validIds = res.framework.curriculumVersions.map((v) => v.id);
      setCurriculumVersionId((prev) =>
        validIds.includes(prev)
          ? prev
          : res.framework.curriculumVersions.find((v) => v.isDefault)?.id || validIds[0] || ''
      );
    });
    return () => {
      active = false;
    };
  }, [selectedDirectoryBoard?.id]);

  // Keep medium strictly valid for selected board
  useEffect(() => {
    if (!activeBoard.supportedMediums.includes(medium)) {
      setMedium(activeBoard.supportedMediums[0]);
    }
  }, [activeBoard, medium]);

  // Strict board + class + stream isolated subjects
  const prescribedSubjects = useMemo(
    () =>
      getSubjectsForSelection({
        boardId,
        classId,
        stream: activeClass.hasStreams ? stream : 'General',
        academicYear,
        medium,
        customSubjects,
      }),
    [boardId, classId, stream, academicYear, medium, customSubjects, activeClass.hasStreams]
  );

  useEffect(() => {
    if (prescribedSubjects.length > 0 && !prescribedSubjects.some((s) => s.id === selectedSubjectId)) {
      const firstSubj = prescribedSubjects[0];
      setSelectedSubjectId(firstSubj.id);
      const firstCh = firstSubj.chapters[0];
      setSelectedChapterId(firstCh?.id || '');
      setSelectedConceptId(firstCh?.concepts[0]?.id || '');
    }
  }, [prescribedSubjects, selectedSubjectId]);

  const activeSubject = useMemo(
    () => prescribedSubjects.find((s) => s.id === selectedSubjectId) || prescribedSubjects[0],
    [prescribedSubjects, selectedSubjectId]
  );

  const activeChapter = useMemo(
    () => activeSubject?.chapters.find((c) => c.id === selectedChapterId) || activeSubject?.chapters[0],
    [activeSubject, selectedChapterId]
  );

  const activeConcept = useMemo(
    () => activeChapter?.concepts.find((c) => c.id === selectedConceptId) || activeChapter?.concepts[0],
    [activeChapter, selectedConceptId]
  );

  // Load initial Firestore school data cleanly
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [cSubj, anns, asgs, exms, lives, tt] = await Promise.all([
        getCustomSchoolSubjects(),
        getSchoolAnnouncements(),
        getSchoolAssignments(boardId, classId),
        getSchoolExaminations(boardId, classId),
        getSchoolLiveClasses(boardId, classId),
        getSchoolTimetable(boardId, classId),
      ]);
      if (!mounted) return;
      setCustomSubjects(cSubj);
      setAnnouncements(anns);
      setAssignments(asgs);
      setExams(exms);
      setLiveClasses(lives);
      setTimetable(tt.length > 0 ? tt : getDefaultWeeklyTimetable(boardId, classId, stream));

      if (currentUser?.uid) {
        const [enr, prog, attempts, subs, prss, mrks, att] = await Promise.all([
          getSchoolEnrollment(currentUser.uid),
          getStudentSchoolProgress(currentUser.uid),
          getSchoolQuizAttempts(currentUser.uid),
          getSchoolSubmissions(currentUser.uid),
          getSchoolPresentations(currentUser.uid),
          getSchoolMarks(currentUser.uid),
          getSchoolAttendance(currentUser.uid),
        ]);
        if (!mounted) return;
        if (enr) {
          setEnrollment(enr);
          if (!urlParams.get('board') && !urlParams.get('directoryBoardId')) {
            setBoardId(enr.boardId);
            if (enr.directoryBoardId) {
              const foundDir = ALL_INDIA_BOARDS.find((b) => b.id === enr.directoryBoardId);
              if (foundDir) setSelectedDirectoryBoard(foundDir);
            }
            if (enr.curriculumVersionId) {
              setCurriculumVersionId(enr.curriculumVersionId);
            }
          }
          setLanguage(enr.preferredLanguage || 'English');
          setParentalConsent(enr.parentalConsentGiven);
          setParentEmailInput(enr.parentEmail || '');
        }
        setProgressRecords(prog);
        setQuizAttempts(attempts);
        setSubmissions(subs);
        setPresentations(prss);
        setMarks(mrks);
        setAttendance(att);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [currentUser?.uid, boardId, classId, stream, urlParams]);

  const activeLanguagePack = useMemo(() => getLanguagePack(language), [language]);
  const quickLanguages = useMemo<SchoolLanguage[]>(() => {
    const set = new Set<SchoolLanguage>(getBoardRecommendedLanguages(selectedDirectoryBoard));
    set.add('English');
    set.add('Hindi');
    set.add('Kannada');
    set.add(language);
    return Array.from(set).slice(0, 5);
  }, [selectedDirectoryBoard, language]);

  // Restore cached regional bundle when concept or language changes (preserves progress)
  useEffect(() => {
    if (!activeConcept) {
      setTranslatedBundle(null);
      return;
    }
    const cached = getCachedConceptTranslation(activeConcept.id, language);
    setTranslatedBundle(cached);
  }, [activeConcept, language]);

  // Language switch preserving all learning progress, active concept, and Firestore preference
  const handleSwitchLanguage = async (nextLang: SchoolLanguage) => {
    setLanguage(nextLang);
    setStatusBanner(`Learning language switched to ${getLanguagePack(nextLang).nativeLabel} — concept & quiz progress preserved.`);
    if (currentUser?.uid) {
      await updateStudentLanguagePreference(currentUser.uid, nextLang);
    }
  };

  const handleSaveEnrollment = async () => {
    if (!currentUser) {
      navigate('/portal');
      return;
    }
    setSavingEnrollment(true);
    try {
      const saved = await saveSchoolEnrollment({
        studentUid: currentUser.uid,
        studentName: lmsUser?.displayName || currentUser.displayName || currentUser.email || 'Student',
        studentEmail: currentUser.email || '',
        boardId,
        directoryBoardId: selectedDirectoryBoard?.id,
        directoryBoardName: selectedDirectoryBoard?.officialName,
        classId,
        academicYear,
        curriculumVersionId: curriculumVersionId || undefined,
        medium,
        stream: activeClass.hasStreams ? stream : 'General',
        preferredLanguage: language,
        parentalConsentGiven: parentalConsent,
        parentEmail: parentEmailInput.trim() || undefined,
        xpPoints: enrollment?.xpPoints || 20,
        streakDays: enrollment?.streakDays || 1,
        badges: enrollment?.badges || ['School Explorer'],
        totalLearningMinutes: enrollment?.totalLearningMinutes || 15,
        lastActiveDate: new Date().toISOString().slice(0, 10),
      });
      setEnrollment(saved);
      await refreshSchoolEnrollment().catch(() => {});
      setShowClassSettingsModal(false);
      setActiveTab('daily');
      setStatusBanner(`Saved ${activeClass.label} (${selectedDirectoryBoard?.shortName || activeBoard.shortName} · ${medium}) — Daily Classes ready.`);
    } catch {
      setStatusBanner('Please sign in first to save your academic enrollment to Firestore.');
    } finally {
      setSavingEnrollment(false);
    }
  };

  const handleSelectDirectoryBoard = (board: AllIndiaBoardRecord) => {
    setSelectedDirectoryBoard(board);
    setBoardId(board.curriculumGroupId);
    setActiveTab('daily');
    setStatusBanner(
      `Active authority set to ${board.officialName} (${board.stateOrUt} · ${board.curriculumGroupId} Curriculum Track).`
    );
  };

  const handleConceptStatusUpdate = async (
    nextStatus: SchoolMasteryStatus,
    extraFlags?: Partial<SchoolConceptProgress>
  ) => {
    if (!activeConcept || !activeChapter || !activeSubject) return;
    if (!currentUser?.uid) {
      setStatusBanner('Sign in via Student Portal to save concept mastery status.');
      return;
    }
    const updated = await upsertSchoolConceptProgress({
      studentId: currentUser.uid,
      boardId,
      classId,
      subjectId: activeSubject.id,
      chapterId: activeChapter.id,
      conceptId: activeConcept.id,
      conceptTitle: activeConcept.title.English,
      updates: { status: nextStatus, ...extraFlags },
    });
    setProgressRecords((prev) => {
      const filtered = prev.filter((p) => p.id !== updated.id);
      return [updated, ...filtered];
    });
    if (nextStatus === 'Mastered') {
      await awardSchoolXpAndBadge({ studentUid: currentUser.uid, xpDelta: 20, minutesDelta: activeConcept.estimatedMinutes });
    }
    setStatusBanner(`Concept "${activeConcept.title.English}" updated to ${nextStatus}.`);
  };

  const handleFindYouTubeLessons = async () => {
    if (!activeSubject || !activeConcept) return;
    setYtLoading(true);
    setYtStatusMsg('');
    try {
      const res = await fetchSchoolYouTubeLessons({
        boardName: activeBoard.shortName,
        classId,
        subjectName: activeSubject.name.English,
        chapterTitle: activeChapter?.title.English,
        conceptTitle: activeConcept.title.English,
        language,
      });
      setYtVideos(res.videos || []);
      setYtSearchUrl(res.safeSearchUrl);
      if (res.message) setYtStatusMsg(res.message);
      if (res.videos && res.videos.length > 0) setActiveYtVideo(res.videos[0]);
    } catch {
      setYtStatusMsg('Unable to reach lesson discovery service.');
    } finally {
      setYtLoading(false);
    }
  };

  const handleLiveTranslate = async (targetOverride?: SchoolLanguage) => {
    if (!activeConcept || !activeSubject) return;
    const targetLang = targetOverride || language;
    setTranslating(true);
    try {
      const bundle = await translateSchoolConceptBundle({
        conceptId: activeConcept.id,
        title: activeConcept.title.English,
        simpleExplanation: activeConcept.simpleExplanation.English,
        detailedExplanation: activeConcept.detailedExplanation.English,
        revisionNotes: activeConcept.revisionNotes.English,
        realLifeApplications: activeConcept.realLifeApplications.map((r) => r.English),
        targetLanguage: targetLang,
        subjectName: activeSubject.name.English,
        className: activeClass.label,
        forceRefresh: true,
      });
      setTranslatedBundle(bundle);
      setStatusBanner(`Translated "${activeConcept.title.English}" to ${targetLang} with verified technical terminology preserved.`);
    } finally {
      setTranslating(false);
    }
  };

  const handleCheckInToday = async () => {
    if (!currentUser?.uid) {
      navigate('/portal');
      return;
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const rec = await markSchoolAttendance({
      studentId: currentUser.uid,
      studentName: lmsUser?.displayName || currentUser.displayName || 'Student',
      boardId,
      classId,
      date: todayStr,
      status: 'Online Attended',
      learningMinutesToday: 30,
      markedBy: 'Self Check-In',
    });
    setAttendance((prev) => [rec, ...prev.filter((a) => a.id !== rec.id)]);
    await awardSchoolXpAndBadge({ studentUid: currentUser.uid, xpDelta: 15, badgeName: 'Daily Attendance Star' });
    setStatusBanner(`Attendance recorded for ${todayStr} (+15 XP).`);
  };

  const handleSaveOffline = () => {
    if (!activeConcept) return;
    try {
      localStorage.setItem(`openframe_offline_concept_${activeConcept.id}`, JSON.stringify(activeConcept));
      const next = Array.from(new Set([...offlineSavedIds, activeConcept.id]));
      localStorage.setItem('openframe_school_offline_concepts', JSON.stringify(next));
      setOfflineSavedIds(next);
      setStatusBanner(`Saved "${activeConcept.title.English}" offline in your browser for low-connectivity study.`);
    } catch {
      // ignore storage quota error
    }
  };

  const handleSubmitHomeworkForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) {
      navigate('/portal');
      return;
    }
    setHwSubmitting(true);
    try {
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      if (hwFile) {
        const up = await uploadDocumentToStorage(hwFile, 'projects');
        fileUrl = up.url;
        fileName = up.fileName;
      }
      const chosenAsg = assignments.find((a) => a.id === hwAssignmentId);
      const sub = await submitSchoolHomework({
        assignmentId: chosenAsg?.id || `concept-hw-${activeConcept?.id || 'general'}`,
        assignmentTitle: chosenAsg?.title || activeConcept?.homeworkTask || `${activeSubject?.name.English} Homework`,
        studentId: currentUser.uid,
        studentName: lmsUser?.displayName || currentUser.displayName || 'Student',
        boardId,
        classId,
        subjectId: activeSubject?.id || '',
        submissionType: hwType,
        writtenAnswer: hwWritten.trim() || undefined,
        fileUrl,
        fileName,
        maxMarks: chosenAsg?.maxMarks || 20,
      });
      setSubmissions((prev) => [sub, ...prev]);
      setHwWritten('');
      setHwFile(null);
      setStatusBanner('Homework submitted for teacher evaluation.');
    } finally {
      setHwSubmitting(false);
    }
  };

  const handleSubmitPresentationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !prsTopic.trim()) return;
    setPrsSubmitting(true);
    try {
      let fileUrl: string | undefined;
      if (prsFile) {
        const up = await uploadDocumentToStorage(prsFile, 'presentations');
        fileUrl = up.url;
      }
      const created = await submitSchoolPresentation({
        studentId: currentUser.uid,
        studentName: lmsUser?.displayName || currentUser.displayName || 'Student',
        boardId,
        classId,
        subjectId: activeSubject?.id || '',
        subjectName: activeSubject?.name.English || 'General',
        topicTitle: prsTopic.trim(),
        presentationType: prsType,
        groupMembers: prsGroup.trim() || undefined,
        fileUrl,
        externalUrl: prsUrl.trim() || undefined,
        summaryNotes: prsNotes.trim(),
        status: 'Submitted',
        maxMarks: 100,
      });
      setPresentations((prev) => [created, ...prev]);
      setPrsTopic('');
      setPrsNotes('');
      setPrsUrl('');
      setPrsFile(null);
      setStatusBanner('Presentation submitted! Teachers will grade it across 7 evaluation criteria.');
    } finally {
      setPrsSubmitting(false);
    }
  };

  // Computed Daily Plan & Analytics
  const todayDayName = useMemo(() => {
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = names[new Date().getDay()];
    return d === 'Sunday' ? 'Monday' : d;
  }, []);

  const todayPlanSlots = useMemo(
    () => timetable.filter((t) => t.dayOfWeek === todayDayName),
    [timetable, todayDayName]
  );

  const activeProgressMap = useMemo(() => {
    const map = new Map<string, SchoolConceptProgress>();
    for (const p of progressRecords) map.set(p.conceptId, p);
    return map;
  }, [progressRecords]);

  const currentConceptProgress = activeConcept ? activeProgressMap.get(activeConcept.id) : undefined;

  const overallMarksPercent = useMemo(() => {
    if (marks.length === 0) return 0;
    const sum = marks.reduce((acc, m) => acc + (m.percentage || 0), 0);
    return Math.round(sum / marks.length);
  }, [marks]);

  const overallBoardGrade = useMemo(
    () => computeBoardGrade(boardId, overallMarksPercent, selectedDirectoryBoard?.id),
    [boardId, overallMarksPercent, selectedDirectoryBoard?.id]
  );

  const attendancePercent = useMemo(() => {
    if (attendance.length === 0) return 100;
    const present = attendance.filter((a) => a.status !== 'Absent').length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const masteredCount = progressRecords.filter((p) => p.status === 'Mastered').length;
  const weakConcepts = progressRecords.filter((p) => p.needsSupport || p.status === 'Needs Revision');

  const isStudentEnrolled = Boolean(currentUser && enrollment);
  const studentDisplayName = lmsUser?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student';

  const navTabs: Array<{ id: HubTab; label: string; icon: React.ComponentType<{ className?: string }>; highlighted?: boolean }> = [
    { id: 'daily', label: 'Daily Classes', icon: Calendar },
    { id: 'self_study', label: 'Study on Your Own Self', icon: Compass, highlighted: true },
    { id: 'boards', label: `All-India Boards (${ALL_INDIA_BOARDS.length})`, icon: Landmark },
    { id: 'structure', label: 'Grade Structure & Versions', icon: Layers },
    { id: 'languages', label: 'Languages & Voice (14)', icon: Languages },
    { id: 'subjects', label: 'Subjects & Concepts', icon: BookOpen },
    { id: 'tutor', label: 'AI Tutor & Flashcards', icon: Sparkles },
    { id: 'quizzes', label: '8-Format Quizzes', icon: CheckCircle2 },
    { id: 'marks', label: 'Marks & Report Card', icon: FileSpreadsheet },
    { id: 'work', label: 'Homework & Presentations', icon: Presentation },
    { id: 'live', label: 'Live Classes & Timetable', icon: Video },
    { id: 'progress', label: 'Badges & Certificates', icon: Trophy },
    { id: 'tools', label: 'Labs, Tools & Careers', icon: Wrench },
  ];

  const handleJoinLiveSession = async (live: SchoolLiveClass) => {
    if (currentUser?.uid) {
      await joinSchoolLiveClass(live.id, currentUser.uid).catch(() => {});
    }
    if (live.meetingUrl) {
      window.open(live.meetingUrl, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTab('live');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 ${isStudentEnrolled ? 'pb-20 md:pb-8' : ''}`}>
      {/* Top Academic Setup Banner (Visible ONLY before login + class registration; hidden in Mobile App & Web once enrolled) */}
      {!isStudentEnrolled ? (
        <div className="bg-gradient-to-r from-[#071326] via-[#0B1930] to-[#13294B] text-white border-b border-blue-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>OpenFrame All-India School Education · LKG to 12th Standard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
                {activeClass.label} Dashboard · {selectedDirectoryBoard?.shortName || activeBoard.shortName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {selectedDirectoryBoard ? `${selectedDirectoryBoard.officialName} (${selectedDirectoryBoard.stateOrUt}) · ` : ''}
                {activeClass.description} ({medium} · Academic Year {academicYear})
              </p>
            </div>

            {/* All-India 14-Language Switcher (Preserves Learning Progress) */}
            <div className="flex flex-wrap items-center gap-2 bg-white/10 border border-white/15 rounded-xl p-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 px-1.5 flex items-center gap-1 whitespace-nowrap">
                <Globe className="w-3.5 h-3.5" />
                <span>Language:</span>
              </span>
              {quickLanguages.map((langId) => {
                const lp = getLanguagePack(langId);
                return (
                  <button
                    key={langId}
                    type="button"
                    onClick={() => handleSwitchLanguage(langId)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      language === langId
                        ? 'bg-sky-400 text-slate-950 shadow-xs'
                        : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {lp.nativeLabel.split(' ')[0]}
                  </button>
                );
              })}
              <select
                aria-label="Select any of 14 All-India learning languages"
                value={language}
                onChange={(e) => handleSwitchLanguage(e.target.value as SchoolLanguage)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0F2042] border border-blue-700 text-sky-100 text-xs font-bold cursor-pointer"
              >
                {ALL_INDIA_LANGUAGE_PACKS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nativeLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Isolated Board / Class / Year / Medium / Stream Controls */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-[#081529]/90 border border-blue-900/60 rounded-2xl p-4">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-300">
                  Education Board
                </label>
                <button
                  type="button"
                  onClick={() => setActiveTab('boards')}
                  className="text-[10px] font-bold text-sky-300 hover:text-white underline cursor-pointer"
                >
                  41 Boards
                </button>
              </div>
              <select
                value={boardId}
                onChange={(e) => {
                  const nextId = e.target.value as SchoolBoardId;
                  setBoardId(nextId);
                  setSelectedDirectoryBoard(
                    ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === nextId) || null
                  );
                }}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0F2042] border border-blue-800 text-white text-xs font-semibold"
              >
                {SCHOOL_BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>{b.shortName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-300 mb-1">
                Class / Standard
              </label>
              <select
                value={classId}
                onChange={(e) => {
                  const nextCls = e.target.value as SchoolClassId;
                  setClassId(nextCls);
                  navigate(`/school/class/${nextCls}?board=${boardId}`);
                }}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0F2042] border border-blue-800 text-white text-xs font-semibold"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-300 mb-1">
                Medium of Instruction
              </label>
              <select
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0F2042] border border-blue-800 text-white text-xs font-semibold"
              >
                {activeBoard.supportedMediums.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-300 mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg bg-[#0F2042] border border-blue-800 text-white text-xs font-semibold"
              >
                {SCHOOL_ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-sky-300 mb-1">
                {activeClass.hasStreams ? 'Senior Secondary Stream' : 'Syllabus Isolation'}
              </label>
              {activeClass.hasStreams ? (
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value as SchoolStreamId)}
                  className="w-full px-2.5 py-2 rounded-lg bg-[#0F2042] border border-blue-800 text-white text-xs font-semibold"
                >
                  <option value="Science">Science Stream</option>
                  <option value="Commerce">Commerce Stream</option>
                  <option value="Arts">Arts / Humanities</option>
                  <option value="Vocational">Vocational &amp; Skill</option>
                  <option value="General">All Prescribed Streams</option>
                </select>
              ) : (
                <div className="px-2.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeBoard.shortName} Only</span>
                </div>
              )}
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSaveEnrollment}
                disabled={savingEnrollment}
                className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                {savingEnrollment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{currentUser ? 'Save & Open Daily Classes' : 'Sign In to Save'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      ) : (
        /* Slim Authenticated Student Daily Header (Hides setup/registration form once logged in & registered) */
        <div className="bg-[#0B1930] text-white border-b border-blue-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-sky-300 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-heading font-bold text-white truncate">
                  {studentDisplayName} · {activeClass.label}
                </div>
                <div className="text-[11px] text-sky-300 truncate">
                  {selectedDirectoryBoard?.shortName || activeBoard.shortName} · {medium} · {academicYear}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('self_study')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#195244] border border-emerald-500/40 text-emerald-100 text-xs font-bold cursor-pointer whitespace-nowrap tabular-nums"
                title="Weekly Self-Study Tokens (Recharge ₹100/week)"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-300" />
                <span>{tokenWallet ? tokenWallet.balance : 50} Tokens</span>
              </button>
              <select
                aria-label="Switch learning language"
                value={language}
                onChange={(e) => handleSwitchLanguage(e.target.value as SchoolLanguage)}
                className="px-2.5 py-1.5 rounded-lg bg-[#0F2042] border border-blue-700/80 text-sky-100 text-xs font-semibold cursor-pointer"
              >
                {ALL_INDIA_LANGUAGE_PACKS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nativeLabel.split(' ')[0]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowClassSettingsModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
                title="Change Class, Board, Medium or Stream"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Class Settings</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/portal?switch=1');
                }}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600/80 text-slate-200 hover:text-white transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Notice Banner */}
      {statusBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center justify-between gap-2">
            <span>{statusBanner}</span>
            <button type="button" onClick={() => setStatusBanner('')} className="text-blue-600 font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Workspace Navigation Tabs */}
      <div className={`bg-white border-b border-slate-200 z-30 ${isStudentEnrolled ? 'md:sticky md:top-0' : 'sticky top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1.5 overflow-x-auto py-2.5">
          {navTabs.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            const isHighlighted = Boolean(t.highlighted);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id);
                  if (typeof window !== 'undefined') {
                    const nextUrl = `${cleanPath}?tab=${t.id}`;
                    window.history.replaceState({}, '', nextUrl);
                    if (currentUser?.uid) {
                      try {
                        localStorage.setItem('openframe_student_active_uid', currentUser.uid);
                        localStorage.setItem('openframe_student_active_route', nextUrl);
                      } catch {
                        // ignore
                      }
                    }
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isHighlighted
                    ? active
                      ? 'bg-[#123D32] text-white shadow-xs ring-2 ring-[#123D32]/25'
                      : 'bg-emerald-50 text-[#123D32] border border-emerald-300 hover:bg-emerald-100'
                    : active
                    ? 'bg-[#0B1930] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ===================================================== */}
        {/* TAB 1B: STUDY ON YOUR OWN SELF (UNIFIED LKG-TO-PG)    */}
        {/* ===================================================== */}
        {activeTab === 'self_study' && (
          <StudyOnYourOwnSelfWorkspace
            initialBoardId={selectedDirectoryBoard?.id || boardId}
            initialLanguage={language}
            onWalletUpdated={(w) => setTokenWallet(w)}
          />
        )}
        {/* ===================================================== */}
        {/* TAB 0: ALL-INDIA EDUCATION BOARD DIRECTORY (41+)      */}
        {/* ===================================================== */}
        {activeTab === 'boards' && (
          <AllIndiaBoardDirectory
            selectedDirectoryBoardId={selectedDirectoryBoard?.id}
            onSelectBoard={handleSelectDirectoryBoard}
          />
        )}

        {/* ===================================================== */}
        {/* TAB 0B: PHASE 2 GRADE STRUCTURE & CURRICULUM VERSIONS */}
        {/* ===================================================== */}
        {activeTab === 'structure' && (
          <BoardGradeStructurePanel
            framework={gradeFramework}
            selectedClassId={classId}
            selectedAcademicYear={academicYear}
            selectedVersionId={curriculumVersionId}
            selectedStream={stream}
            onSelectClass={(nextCls) => {
              setClassId(nextCls);
              navigate(`/school/class/${nextCls}?board=${boardId}`);
            }}
            onSelectAcademicYear={(yr) => setAcademicYear(yr)}
            onSelectVersionId={(verId) => setCurriculumVersionId(verId)}
            onSelectStream={(st) => setStream(st)}
            onOpenSubjectsWorkspace={() => setActiveTab('subjects')}
          />
        )}

        {/* ===================================================== */}
        {/* TAB 0C: PHASE 3 ALL-INDIA MULTILINGUAL & VOICE STUDIO */}
        {/* ===================================================== */}
        {activeTab === 'languages' && (
          <MultilingualLanguagePanel
            activeLanguage={language}
            selectedDirectoryBoard={selectedDirectoryBoard}
            activeConceptTitle={activeConcept ? getLocalizedText(activeConcept.title, language, translatedBundle?.title) : undefined}
            onSelectLanguage={handleSwitchLanguage}
            onTranslateActiveConcept={(lang) => {
              setLanguage(lang);
              handleLiveTranslate(lang);
              setActiveTab('subjects');
            }}
          />
        )}

        {/* ===================================================== */}
        {/* TAB 1: CLASS DASHBOARD & TODAY'S DAILY LEARNING PLAN   */}
        {/* ===================================================== */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            {/* Summary Metrics Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Prescribed Subjects</div>
                <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1 tabular-nums">
                  {prescribedSubjects.length}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{activeBoard.shortName} · {activeClass.shortLabel}</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Concepts Mastered</div>
                <div className="text-2xl font-heading font-extrabold text-emerald-600 mt-1 tabular-nums">
                  {masteredCount}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {weakConcepts.length} flagged · Avg Score {overallMarksPercent}% ({overallBoardGrade.grade})
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Learning Streak &amp; XP</div>
                <div className="text-2xl font-heading font-extrabold text-blue-600 mt-1 tabular-nums">
                  {enrollment?.xpPoints || 0} XP
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{enrollment?.streakDays || 1} Day Streak</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today&apos;s Attendance</div>
                  <div className="text-2xl font-heading font-extrabold text-indigo-600 mt-1 tabular-nums">
                    {attendancePercent}%
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckInToday}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                >
                  Mark Today Present (+15 XP)
                </button>
              </div>
            </div>

            {/* Live Classes Today + Continue Active Concept */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {liveClasses.length > 0 ? (
                <div className="bg-white border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Next Live Class · {liveClasses[0].subjectName}</span>
                    </div>
                    <div className="font-heading font-bold text-base text-slate-900 truncate">
                      {liveClasses[0].topicTitle}
                    </div>
                    <div className="text-xs text-slate-500">
                      {liveClasses[0].scheduledAt ? new Date(liveClasses[0].scheduledAt).toLocaleString('en-IN') : 'Today'} · {liveClasses[0].teacherName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleJoinLiveSession(liveClasses[0])}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Live Class</span>
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                      <span>Live Classes &amp; Weekly Timetable</span>
                    </div>
                    <div className="font-heading font-bold text-base text-slate-900">
                      View Today&apos;s Class Rooms &amp; Schedule
                    </div>
                    <div className="text-xs text-slate-500">
                      Open interactive live rooms, Zoom/Meet links, and full Monday–Saturday timetable.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('live')}
                    className="px-4 py-2.5 rounded-xl bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Open Live Schedule
                  </button>
                </div>
              )}

              {activeSubject && activeConcept && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume Active Lesson · {getLocalizedText(activeSubject.name, language)}</span>
                    </div>
                    <div className="font-heading font-bold text-base text-slate-900 truncate">
                      {getLocalizedText(activeConcept.title, language, translatedBundle?.title)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {activeConcept.estimatedMinutes} mins · Video lessons, 15-part notes &amp; voice read-aloud
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('subjects')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Continue Learning
                  </button>
                </div>
              )}
            </div>

            {/* All-In-One School Tools Grid (Everything accessible directly from Daily Classes Homepage) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-heading font-bold text-lg text-slate-900">
                    Everything for {activeClass.label} on One Homepage
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct 1-tap access to lessons, AI tutor, 8-format quizzes, homework, report cards, live classrooms &amp; labs.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">10 Integrated Modules</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { tab: 'subjects' as HubTab, title: 'Subjects & Concepts', sub: `${prescribedSubjects.length} subjects · Video & voice`, icon: BookOpen },
                  { tab: 'quizzes' as HubTab, title: '8-Format Quizzes', sub: `${quizAttempts.length} completed attempts`, icon: CheckCircle2 },
                  { tab: 'work' as HubTab, title: 'Homework & Projects', sub: `${assignments.length} tasks · Presentations`, icon: Presentation },
                  { tab: 'marks' as HubTab, title: 'Marks & Report Card', sub: `${marks.length} exam records · PDF`, icon: FileSpreadsheet },
                  { tab: 'tutor' as HubTab, title: 'AI Tutor & Flashcards', sub: 'Quinn AI multilingual mentor', icon: Sparkles },
                  { tab: 'live' as HubTab, title: 'Live & Timetable', sub: `${todayPlanSlots.length} periods today`, icon: Video },
                  { tab: 'progress' as HubTab, title: 'Badges & Certificates', sub: `${enrollment?.xpPoints || 0} XP earned`, icon: Trophy },
                  { tab: 'tools' as HubTab, title: 'Labs, Formulas & Careers', sub: 'Interactive concept lab', icon: Wrench },
                  { tab: 'languages' as HubTab, title: '14 Languages & Voice', sub: activeLanguagePack.name, icon: Languages },
                  { tab: 'boards' as HubTab, title: '41+ Boards & Syllabus', sub: activeBoard.shortName, icon: Landmark },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.tab}
                      type="button"
                      onClick={() => setActiveTab(item.tab)}
                      className="text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50/70 hover:bg-white transition-all cursor-pointer group"
                    >
                      <Icon className="w-4 h-4 text-[#123D32] group-hover:text-blue-600 transition-colors" />
                      <div className="font-heading font-bold text-xs sm:text-sm text-slate-900 mt-2 group-hover:text-blue-700">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Today's Learning Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-lg text-slate-900">
                      Today&apos;s Daily Learning Plan ({todayDayName})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Auto-generated from your {activeClass.label} timetable, unfinished concepts, and pending homework.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 tabular-nums">
                    {todayPlanSlots.length} Sessions Today
                  </span>
                </div>

                <div className="space-y-3">
                  {todayPlanSlots.map((slot) => {
                    const matchedSubj = prescribedSubjects.find((s) => s.id === slot.subjectId) || prescribedSubjects[0];
                    return (
                      <div
                        key={slot.id}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                            {slot.startTime} – {slot.endTime} · {slot.mode}
                          </div>
                          <div className="font-heading font-bold text-sm text-slate-900 mt-0.5">
                            {matchedSubj ? getLocalizedText(matchedSubj.name, language) : slot.subjectName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {matchedSubj?.chapters[0] ? getLocalizedText(matchedSubj.chapters[0].title, language) : ''} · {slot.teacherName}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (matchedSubj) {
                              setSelectedSubjectId(matchedSubj.id);
                              setSelectedChapterId(matchedSubj.chapters[0]?.id || '');
                              setSelectedConceptId(matchedSubj.chapters[0]?.concepts[0]?.id || '');
                            }
                            setActiveTab('subjects');
                          }}
                          className="px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shrink-0"
                        >
                          Open Concept
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Safety & Parental Consent + Announcements */}
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Child Protection &amp; Parent Link</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    All student marks, quizzes, and activity logs stay private to the student, linked parent, and verified faculty.
                  </p>
                  <input
                    type="email"
                    value={parentEmailInput}
                    onChange={(e) => setParentEmailInput(e.target.value)}
                    placeholder="Authorized Parent/Guardian Email"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parentalConsent}
                      onChange={(e) => setParentalConsent(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>Parental / Guardian oversight consent verified for LKG–12 learning workspace.</span>
                  </label>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    School Announcements ({announcements.length})
                  </div>
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Board-isolated syllabus for {activeBoard.shortName} ({activeClass.label}) is ready. Complete today&apos;s concepts to earn XP!
                    </p>
                  ) : (
                    announcements.slice(0, 4).map((ann) => (
                      <div key={ann.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900">{ann.title}</div>
                        <p className="text-slate-600 mt-0.5">{ann.body}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Prescribed Subjects Quick Grid */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Prescribed Subjects for {activeClass.label} ({activeBoard.shortName})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Showing strictly subjects prescribed for your selected board, class, stream, and academic year.
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-600 tabular-nums">
                  {prescribedSubjects.length} Subjects
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {prescribedSubjects.map((subj) => (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubjectId(subj.id);
                      setSelectedChapterId(subj.chapters[0]?.id || '');
                      setSelectedConceptId(subj.chapters[0]?.concepts[0]?.id || '');
                      setActiveTab('subjects');
                    }}
                    className="text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50/70 hover:bg-white transition-all cursor-pointer group"
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      {subj.category} · {subj.code}
                    </div>
                    <div className="font-heading font-bold text-sm text-slate-900 mt-1 group-hover:text-blue-700">
                      {getLocalizedText(subj.name, language)}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {subj.chapters.length} Units · {subj.textbookSource}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 2: CHAPTER-WISE & CONCEPT-WISE LEARNING WORKSPACE */}
        {/* ===================================================== */}
        {activeTab === 'subjects' && activeSubject && activeChapter && activeConcept && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Subject -> Chapters -> Topics -> Concepts */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Subject ({prescribedSubjects.length} prescribed)
                </label>
                <select
                  value={activeSubject.id}
                  onChange={(e) => {
                    const s = prescribedSubjects.find((x) => x.id === e.target.value);
                    if (s) {
                      setSelectedSubjectId(s.id);
                      setSelectedChapterId(s.chapters[0]?.id || '');
                      setSelectedConceptId(s.chapters[0]?.concepts[0]?.id || '');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {prescribedSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{getLocalizedText(s.name, language)}</option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500">
                  Source: {activeSubject.textbookSource}
                </div>
              </div>

              {/* Chapters & Sequential Concepts */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Chapters &amp; Concepts (Basic → Advanced)
                </div>
                {activeSubject.chapters.map((ch) => (
                  <div key={ch.id} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedChapterId(ch.id);
                        setSelectedConceptId(ch.concepts[0]?.id || '');
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold cursor-pointer ${
                        ch.id === activeChapter.id
                          ? 'bg-[#0B1930] text-white'
                          : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      Unit {ch.chapterNumber}. {getLocalizedText(ch.title, language)}
                    </button>
                    <div className="divide-y divide-slate-100 bg-white">
                      {ch.concepts.map((c) => {
                        const prog = activeProgressMap.get(c.id);
                        const activeC = c.id === activeConcept.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedChapterId(ch.id);
                              setSelectedConceptId(c.id);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between gap-2 cursor-pointer ${
                              activeC ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="truncate">
                              {c.order}. {getLocalizedText(c.title, language)}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                              {prog?.status || c.difficulty}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Main Panel: Full 15-Part Concept View */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
                {/* 1. Concept Title + 15. Mastery Status */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                      {getLocalizedText(activeSubject.name, language)} · {activeConcept.subtopicTitle} · {activeConcept.difficulty}
                    </div>
                    <h2
                      dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                      className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 mt-1"
                    >
                      {getLocalizedText(activeConcept.title, language, translatedBundle?.title)}
                    </h2>
                    <div className="text-xs text-slate-500 mt-1">
                      Estimated Study Time: {activeConcept.estimatedMinutes} mins · Status:{' '}
                      <strong className="text-slate-800">
                        {currentConceptProgress?.status || 'Not Started'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={currentConceptProgress?.status || 'In Progress'}
                      onChange={(e) => handleConceptStatusUpdate(e.target.value as SchoolMasteryStatus)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Needs Revision">Needs Revision</option>
                      <option value="Mastered">Mastered</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleSaveOffline}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{offlineSavedIds.includes(activeConcept.id) ? 'Saved Offline' : 'Save Offline'}</span>
                    </button>
                  </div>
                </div>

                {/* Voice Read-Aloud & Live Technical-Term-Safe Translation */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <VoiceLearningControls
                    textToRead={`${getLocalizedText(
                      activeConcept.simpleExplanation,
                      language,
                      translatedBundle?.simpleExplanation
                    )} ${getLocalizedText(
                      activeConcept.detailedExplanation,
                      language,
                      translatedBundle?.detailedExplanation
                    )}`}
                    language={language}
                  />
                  {language !== 'English' && (
                    <button
                      type="button"
                      onClick={() => handleLiveTranslate()}
                      disabled={translating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {translating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>
                        {translatedBundle ? `Refresh ${language} Translation` : `Translate Lesson to ${language}`}
                      </span>
                    </button>
                  )}
                </div>

                {/* 2. Simple Explanation & 3. Detailed Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      Simple Explanation ({activeLanguagePack.nativeLabel})
                    </div>
                    <p
                      dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                      className="text-xs sm:text-sm text-slate-800 leading-relaxed"
                    >
                      {getLocalizedText(
                        activeConcept.simpleExplanation,
                        language,
                        translatedBundle?.simpleExplanation
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Detailed Textbook Explanation
                    </div>
                    <p
                      dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                      className="text-xs sm:text-sm text-slate-800 leading-relaxed"
                    >
                      {getLocalizedText(
                        activeConcept.detailedExplanation,
                        language,
                        translatedBundle?.detailedExplanation
                      )}
                    </p>
                  </div>
                </div>

                {/* Technical Terms Glossary (Accurate Terminology Check) */}
                {activeConcept.technicalTermsGlossary.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                      Bilingual Technical Terminology (Preserves Accurate Exam Terms)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {activeConcept.technicalTermsGlossary.map((g) => (
                        <div key={g.term} className="bg-white p-2.5 rounded-lg border border-amber-200/70">
                          <div className="font-bold text-slate-900">{g.term}</div>
                          <div className="text-slate-600 mt-0.5">
                            KN: {g.kannadaMeaning} · HI: {g.hindiMeaning}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{g.definition}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Learning Objectives & 7. Illustration */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Learning Objectives
                    </div>
                    <ul className="space-y-1.5">
                      {activeConcept.learningObjectives.map((obj, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-32">
                    <img
                      src={activeConcept.illustrationUrl}
                      alt={activeConcept.title.English}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* 5. Examples & 6. Real-Life Applications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Worked Example
                    </div>
                    {activeConcept.examples.map((ex, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="text-xs font-bold text-blue-700">{ex.title}</div>
                        {ex.stepByStep?.map((st, si) => (
                          <div key={si} className="text-xs text-slate-700 flex gap-2">
                            <span className="font-bold text-slate-400">{si + 1}.</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Real-Life Applications ({language})
                    </div>
                    {activeConcept.realLifeApplications.map((appItem, idx) => (
                      <p
                        key={idx}
                        dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                        className="text-xs text-slate-700 leading-relaxed"
                      >
                        {getLocalizedText(
                          appItem,
                          language,
                          translatedBundle?.realLifeApplications?.[idx]
                        )}
                      </p>
                    ))}
                    <div
                      dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                      className="pt-2 border-t border-slate-100 text-xs"
                    >
                      <strong className="text-slate-900">Revision Note:</strong>{' '}
                      <span className="text-slate-600">
                        {getLocalizedText(
                          activeConcept.revisionNotes,
                          language,
                          translatedBundle?.revisionNotes
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 8. Interactive Diagrams & Labs */}
                <InteractiveConceptLab
                  concept={activeConcept}
                  classId={classId}
                  language={language}
                  initialTab="diagram"
                />

                {/* 9. YouTube Video Lessons + Post-Video Recap & Completion Checklist */}
                <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-slate-50/70">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                        <Video className="w-4 h-4" />
                        <span>Curriculum Video Lessons &amp; Post-Video Mastery</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Opening a video alone does not grant mastery — complete the Recap, Quiz, and Practice steps below.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleFindYouTubeLessons}
                      disabled={ytLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {ytLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>Find Concept Video Lessons</span>
                    </button>
                  </div>

                  {ytStatusMsg && <div className="text-xs text-slate-600">{ytStatusMsg}</div>}

                  {ytSearchUrl && (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={ytSearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                      >
                        <span>Open Safe YouTube Search: {activeClass.shortLabel} {activeSubject.name.English}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {activeYtVideo && (
                    <div className="space-y-3">
                      <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-300 bg-black">
                        <iframe
                          src={activeYtVideo.embedUrl}
                          title={activeYtVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      {ytVideos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-1">
                          {ytVideos.map((v) => (
                            <button
                              key={v.videoId}
                              type="button"
                              onClick={() => setActiveYtVideo(v)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 border cursor-pointer ${
                                activeYtVideo.videoId === v.videoId
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-slate-700 border-slate-200'
                              }`}
                            >
                              {v.title.slice(0, 42)} ({v.duration})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explicit Post-Video Learning Verification Workflow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => handleConceptStatusUpdate('In Progress', { videoReviewed: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        currentConceptProgress?.videoReviewed
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      1. Video Reviewed ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConceptStatusUpdate('In Progress', { recapCompleted: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        currentConceptProgress?.recapCompleted
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      2. Recap Checked ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConceptStatusUpdate('In Progress', { practiceCompleted: true })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        currentConceptProgress?.practiceCompleted
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      3. Practice Done ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConceptStatusUpdate('Mastered')}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-left cursor-pointer ${
                        currentConceptProgress?.status === 'Mastered'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      4. Mark Mastered (+20 XP)
                    </button>
                  </div>
                </div>

                {/* 10. Important Questions, 11. Practice Exercises & 13. Homework */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Important Exam Questions
                    </div>
                    {activeConcept.importantQuestions.map((iq, idx) => (
                      <div key={idx} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-900">Q: {iq.question} ({iq.marks}M)</div>
                        <div className="text-slate-600 mt-1">Ans: {iq.answer}</div>
                      </div>
                    ))}
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Practice Exercise &amp; Mini Homework
                    </div>
                    {activeConcept.practiceExercises.map((pe, idx) => (
                      <div key={idx} className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="font-bold text-slate-900">{pe.prompt}</div>
                        <div className="text-blue-700">Hint: {pe.hint}</div>
                        <div className="text-emerald-700">Solution: {pe.solution}</div>
                      </div>
                    ))}
                    <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                      <strong>Assigned Homework:</strong> {activeConcept.homeworkTask}
                      <button
                        type="button"
                        onClick={() => setActiveTab('work')}
                        className="ml-2 underline font-bold cursor-pointer"
                      >
                        Submit Homework →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 12. Embedded Concept Quiz */}
              <SchoolQuizEngine
                studentUid={currentUser?.uid}
                studentName={lmsUser?.displayName || currentUser?.displayName || 'Student'}
                boardId={boardId}
                boardName={activeBoard.shortName}
                classId={classId}
                classNameLabel={activeClass.label}
                subjectId={activeSubject.id}
                subjectName={getLocalizedText(activeSubject.name, language)}
                chapterId={activeChapter.id}
                chapterTitle={getLocalizedText(activeChapter.title, language)}
                conceptId={activeConcept.id}
                conceptTitle={getLocalizedText(activeConcept.title, language, translatedBundle?.title)}
                language={language}
                onAttemptSaved={(att) => setQuizAttempts((p) => [att, ...p])}
              />
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 3: AI TUTOR & FLASHCARDS                          */}
        {/* ===================================================== */}
        {activeTab === 'tutor' && activeSubject && (
          <AiTutorDrawer
            boardName={activeBoard.name}
            classNameLabel={activeClass.label}
            medium={medium}
            language={language}
            subjectName={getLocalizedText(activeSubject.name, language)}
            chapterTitle={activeChapter ? getLocalizedText(activeChapter.title, language) : undefined}
            concept={activeConcept}
            progressSummary={`Mastered: ${masteredCount}, Needs Revision: ${weakConcepts.length}, Average Marks: ${overallMarksPercent}%`}
          />
        )}

        {/* ===================================================== */}
        {/* TAB 4: STANDALONE 8-FORMAT QUIZZES & HISTORY          */}
        {/* ===================================================== */}
        {activeTab === 'quizzes' && activeSubject && (
          <div className="space-y-6">
            <SchoolQuizEngine
              studentUid={currentUser?.uid}
              studentName={lmsUser?.displayName || currentUser?.displayName || 'Student'}
              boardId={boardId}
              boardName={activeBoard.shortName}
              classId={classId}
              classNameLabel={activeClass.label}
              subjectId={activeSubject.id}
              subjectName={getLocalizedText(activeSubject.name, language)}
              chapterId={activeChapter?.id}
              chapterTitle={activeChapter ? getLocalizedText(activeChapter.title, language) : getLocalizedText(activeSubject.name, language)}
              conceptId={activeConcept?.id}
              conceptTitle={activeConcept ? getLocalizedText(activeConcept.title, language, translatedBundle?.title) : getLocalizedText(activeSubject.name, language)}
              language={language}
              onAttemptSaved={(att) => setQuizAttempts((p) => [att, ...p])}
            />

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Recent Quiz &amp; Assessment History ({quizAttempts.length})
              </h3>
              {quizAttempts.length === 0 ? (
                <p className="text-xs text-slate-500">Complete a quiz above to view scores and review teacher remarks.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                        <th className="py-2 pr-3">Mode</th>
                        <th className="py-2 pr-3">Subject</th>
                        <th className="py-2 pr-3">Score</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quizAttempts.slice(0, 15).map((qa) => (
                        <tr key={qa.id}>
                          <td className="py-2.5 pr-3 font-bold text-slate-800">{qa.quizMode}</td>
                          <td className="py-2.5 pr-3 text-slate-600">{qa.subjectName}</td>
                          <td className="py-2.5 pr-3 font-bold text-blue-700 tabular-nums">
                            {qa.totalAwarded}/{qa.totalMax} ({qa.percentage}%)
                          </td>
                          <td className="py-2.5 pr-3 text-slate-600">
                            {qa.pendingTeacherReview ? 'Pending Teacher Review' : 'Finalized'}
                          </td>
                          <td className="py-2.5 text-slate-500 tabular-nums">
                            {new Date(qa.submittedAt).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 5: MARKS, EXAMINATIONS & REPORT CARD              */}
        {/* ===================================================== */}
        {activeTab === 'marks' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading font-bold text-xl text-slate-900">
                  Marks Ledger &amp; Examinations ({activeBoard.shortName})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeBoard.gradingRuleSummary}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  exportSchoolReportCardPdf({
                    studentName: lmsUser?.displayName || currentUser?.displayName || 'Student Learner',
                    boardName: activeBoard.name,
                    classLabel: activeClass.label,
                    academicYear,
                    medium,
                    marks,
                    overallPercent: overallMarksPercent,
                    overallGrade: overallBoardGrade.grade,
                    attendancePercent,
                  })
                }
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Report Card PDF</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Recorded Marks Across 10 Categories ({marks.length})
                </h3>
                {marks.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No exam marks recorded yet for your account. Teacher-entered exam marks, practicals, projects, and evaluated quizzes appear here.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                          <th className="py-2 pr-3">Subject</th>
                          <th className="py-2 pr-3">Category</th>
                          <th className="py-2 pr-3">Marks</th>
                          <th className="py-2 pr-3">%</th>
                          <th className="py-2">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marks.map((m) => (
                          <tr key={m.id}>
                            <td className="py-2.5 pr-3 font-bold text-slate-900">{m.subjectName}</td>
                            <td className="py-2.5 pr-3 text-slate-600">{m.category} · {m.examTitle}</td>
                            <td className="py-2.5 pr-3 font-semibold tabular-nums">{m.marksObtained}/{m.maxMarks}</td>
                            <td className="py-2.5 pr-3 font-bold text-blue-700 tabular-nums">{m.percentage}%</td>
                            <td className="py-2.5 font-bold text-emerald-700">{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Upcoming Examinations ({exams.length})
                </h3>
                {exams.length === 0 ? (
                  <p className="text-xs text-slate-500">No upcoming board/unit exams scheduled yet for {activeClass.label}.</p>
                ) : (
                  exams.map((ex) => (
                    <div key={ex.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-slate-900">{ex.title} ({ex.subjectName})</div>
                      <div className="text-slate-600">{ex.category} · Date: {ex.examDate} · {ex.maxMarks} Marks</div>
                      <div className="text-[11px] text-slate-500">{ex.syllabusScope}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 6: HOMEWORK & STUDENT PRESENTATION SYSTEM         */}
        {/* ===================================================== */}
        {activeTab === 'work' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Homework Submission */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Homework &amp; Assignment Submissions
              </h3>
              <form onSubmit={handleSubmitHomeworkForm} className="space-y-3 text-xs">
                <select
                  value={hwAssignmentId}
                  onChange={(e) => setHwAssignmentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">Concept Homework: {activeConcept?.homeworkTask.slice(0, 60) || 'General Subject Practice'}</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} (Due: {a.dueDate})</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={hwType}
                    onChange={(e) => setHwType(e.target.value as SchoolSubmission['submissionType'])}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Written">Written Answer</option>
                    <option value="PDF">PDF Document</option>
                    <option value="Photo">Notebook Photo</option>
                    <option value="Audio">Audio Explanation</option>
                    <option value="Video">Video Recording</option>
                    <option value="Project File">Project File</option>
                  </select>
                  <label className="px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 cursor-pointer flex items-center gap-1.5 truncate">
                    <Upload className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{hwFile ? hwFile.name : 'Attach File (Optional)'}</span>
                    <input type="file" className="hidden" onChange={(e) => setHwFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={hwWritten}
                  onChange={(e) => setHwWritten(e.target.value)}
                  placeholder="Write your homework answer or solution summary..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={hwSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  {hwSubmitting ? 'Submitting Homework...' : 'Submit Homework for Teacher Review'}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Your Submissions ({submissions.length})
                </div>
                {submissions.slice(0, 5).map((s) => (
                  <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{s.assignmentTitle}</div>
                      <div className="text-slate-500">{s.submissionType} · {s.status}</div>
                      {s.teacherComment && <div className="text-blue-700 mt-0.5">Teacher: {s.teacherComment}</div>}
                    </div>
                    {typeof s.marksAwarded === 'number' && (
                      <div className="font-bold text-emerald-700 tabular-nums">{s.marksAwarded}/{s.maxMarks}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Student Presentation System */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-heading font-bold text-lg text-slate-900">
                Student Presentation Studio (7 Evaluation Criteria)
              </h3>
              <form onSubmit={handleSubmitPresentationForm} className="space-y-3 text-xs">
                <input
                  type="text"
                  required
                  value={prsTopic}
                  onChange={(e) => setPrsTopic(e.target.value)}
                  placeholder="Presentation Topic Title (e.g. Working Model of Electric Circuit)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={prsType}
                    onChange={(e) => setPrsType(e.target.value as SchoolPresentationItem['presentationType'])}
                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Topic Presentation">Topic Presentation</option>
                    <option value="PowerPoint Slides">PowerPoint Slides</option>
                    <option value="Video Presentation">Video Presentation</option>
                    <option value="Audio Explanation">Audio Explanation</option>
                    <option value="Project Demonstration">Project Demonstration</option>
                    <option value="Science Experiment">Science Experiment</option>
                    <option value="Group Presentation">Group Presentation</option>
                  </select>
                  <input
                    type="text"
                    value={prsGroup}
                    onChange={(e) => setPrsGroup(e.target.value)}
                    placeholder="Group Members (if Group)"
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="url"
                    value={prsUrl}
                    onChange={(e) => setPrsUrl(e.target.value)}
                    placeholder="Slides / Video URL (optional)"
                    className="px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <label className="px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 cursor-pointer flex items-center gap-1.5 truncate">
                    <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{prsFile ? prsFile.name : 'Upload PPT/Video/Audio'}</span>
                    <input type="file" className="hidden" onChange={(e) => setPrsFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={prsNotes}
                  onChange={(e) => setPrsNotes(e.target.value)}
                  placeholder="Key points & explanation summary of your presentation..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={prsSubmitting}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {prsSubmitting ? 'Uploading Presentation...' : 'Submit Student Presentation'}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Evaluated &amp; Submitted Presentations ({presentations.length})
                </div>
                {presentations.slice(0, 4).map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{p.topicTitle}</span>
                      {typeof p.totalMarks === 'number' && <span className="text-emerald-700 tabular-nums">{p.totalMarks}/100</span>}
                    </div>
                    <div className="text-slate-500">{p.presentationType} · {p.status}</div>
                    {p.teacherFeedback && <div className="text-indigo-700">Feedback: {p.teacherFeedback}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 7: LIVE ONLINE CLASSES & WEEKLY TIMETABLE         */}
        {/* ===================================================== */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Scheduled Live Classes ({liveClasses.length})
              </h3>
              {liveClasses.length === 0 ? (
                <p className="text-xs text-slate-500">
                  Live teacher sessions scheduled for {activeClass.label} ({activeBoard.shortName}) appear here with one-click attendance join.
                </p>
              ) : (
                liveClasses.map((lc) => (
                  <div key={lc.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="font-bold text-slate-900">{lc.subjectName}: {lc.topicTitle}</div>
                    <div className="text-slate-600">{lc.sessionType} · {lc.teacherName} · {lc.scheduledAt}</div>
                    <a
                      href={lc.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => currentUser?.uid && joinSchoolLiveClass(lc.id, currentUser.uid)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Live Class</span>
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Weekly Class Timetable ({activeClass.label} · {activeBoard.shortName})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const).map((day) => {
                  const slots = timetable.filter((s) => s.dayOfWeek === day);
                  return (
                    <div key={day} className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                      <div className="text-xs font-extrabold text-slate-900 border-b border-slate-200 pb-1">{day}</div>
                      {slots.map((sl) => (
                        <div key={sl.id} className="text-[11px] bg-white p-2 rounded border border-slate-200">
                          <div className="font-bold text-blue-700">{sl.startTime} – {sl.endTime}</div>
                          <div className="font-semibold text-slate-800">{sl.subjectName}</div>
                          <div className="text-slate-500">{sl.mode}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 8: GAMIFICATION, PORTFOLIO & PRINTABLE CERTIFICATE */}
        {/* ===================================================== */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Learning Achievements, Badges &amp; Portfolio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Constructive milestones rewarding study streaks, mastered concepts, quizzes, and presentations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    exportSchoolMilestoneCertificatePdf({
                      studentName: lmsUser?.displayName || currentUser?.displayName || 'Student Learner',
                      classLabel: activeClass.label,
                      boardName: activeBoard.shortName,
                      milestoneTitle: `${activeSubject?.name.English || 'Academic'} Mastery · ${masteredCount} Concepts Completed`,
                      certCode: `OF-SCH-${classId}-${Date.now().toString().slice(-5)}`,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Print Certificate PDF</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(enrollment?.badges || ['School Explorer', 'First Concept Started']).map((b) => (
                  <div key={b} className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2.5 text-xs font-bold text-amber-900">
                    <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-800 mb-2">Student Portfolio Items</div>
                <div className="text-xs text-slate-600">
                  {presentations.length} Presentations · {submissions.length} Assignments · {quizAttempts.length} Evaluated Assessments
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-heading font-bold text-base text-slate-900">
                Concepts Flagged for Revision ({weakConcepts.length})
              </h3>
              {weakConcepts.length === 0 ? (
                <p className="text-xs text-slate-500">No weak concepts flagged right now. Keep practicing consistently!</p>
              ) : (
                weakConcepts.map((w) => (
                  <div key={w.id} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex justify-between items-center">
                    <span className="font-bold text-rose-900">{w.conceptTitle}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubjectId(w.subjectId);
                        setSelectedChapterId(w.chapterId);
                        setSelectedConceptId(w.conceptId);
                        setActiveTab('subjects');
                      }}
                      className="text-blue-700 font-bold underline cursor-pointer"
                    >
                      Revise
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* TAB 9: 25 ADVANCED TOOLS, LABS, GLOSSARY & CAREERS    */}
        {/* ===================================================== */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            <InteractiveConceptLab
              concept={activeConcept}
              classId={classId}
              language={language}
              initialTab={['LKG', 'UKG', '1', '2', '3', '4', '5'].includes(classId) ? 'handwriting' : 'science'}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formula Library */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span>School Formula &amp; Equation Library</span>
                </h3>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {SCHOOL_FORMULA_LIBRARY.map((f) => (
                    <div key={f.title} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{f.title}</span>
                        <span className="text-blue-600">{f.subject} ({f.stage})</span>
                      </div>
                      <div className="font-mono text-indigo-800 font-bold mt-1">{f.formula}</div>
                      <div className="text-slate-600 mt-0.5">{f.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bilingual Terminology Glossary */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>All-India Technical Terminology ({activeLanguagePack.name})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('languages')}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Open 14-Language Studio →
                  </button>
                </div>
                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {ALL_INDIA_TECH_GLOSSARY.map((g) => (
                    <div key={g.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{g.english} · {g.subject}</div>
                      <div
                        dir={activeLanguagePack.rtl ? 'rtl' : 'ltr'}
                        className="text-blue-800 mt-0.5 font-semibold"
                      >
                        {activeLanguagePack.name}: {g.translations[language] || g.english}
                      </div>
                      <div className="text-slate-600 mt-1">{g.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Career Development Module (Focused on Classes 8 to 12) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Career Development &amp; Stream Guidance (Classes 8 – 12)</span>
                </div>
                <h3 className="font-heading font-bold text-xl text-slate-900 mt-1">
                  Future Pathways, Stream Combinations &amp; Entrance Milestones
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SCHOOL_CAREER_PATHWAYS.map((cp) => (
                  <div key={cp.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">{cp.stream}</div>
                    <div className="font-heading font-bold text-sm text-slate-900">{cp.title}</div>
                    <p className="text-slate-600 leading-relaxed">{cp.summary}</p>
                    <div><strong>Focus Subjects:</strong> {cp.keySubjects.join(', ')}</div>
                    <div><strong>Key Exams:</strong> {cp.entrancePathways.join(' · ')}</div>
                    <div className="text-indigo-700 font-semibold">Roles: {cp.roles.join(', ')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Class & Board Settings Modal (Only opened manually when enrolled student clicks "Class Settings") */}
      {showClassSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Update Class, Board &amp; Medium
                </h3>
                <p className="text-xs text-slate-500">
                  Your saved subjects, daily timetable, and progress remain backed up in your student profile.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassSettingsModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                aria-label="Close class settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Education Board</label>
                <select
                  value={boardId}
                  onChange={(e) => {
                    const nextId = e.target.value as SchoolBoardId;
                    setBoardId(nextId);
                    setSelectedDirectoryBoard(ALL_INDIA_BOARDS.find((b) => b.curriculumGroupId === nextId) || null);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  {SCHOOL_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>{b.shortName} — {b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Standard</label>
                <select
                  value={classId}
                  onChange={(e) => {
                    const nextCls = e.target.value as SchoolClassId;
                    setClassId(nextCls);
                    navigate(`/school/class/${nextCls}?board=${boardId}`);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Medium of Instruction</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  {activeBoard.supportedMediums.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                >
                  {SCHOOL_ACADEMIC_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {activeClass.hasStreams && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Senior Secondary Stream</label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value as SchoolStreamId)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  >
                    <option value="Science">Science Stream</option>
                    <option value="Commerce">Commerce Stream</option>
                    <option value="Arts">Arts / Humanities</option>
                    <option value="Vocational">Vocational &amp; Skill</option>
                    <option value="General">All Prescribed Streams</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClassSettingsModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEnrollment}
                disabled={savingEnrollment}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                {savingEnrollment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Bottom Navigation Bar (Displayed after login+registration on /school) */}
      {isStudentEnrolled && (
        <nav
          aria-label="Mobile school daily navigation"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 grid grid-cols-5 gap-1 shadow-lg"
        >
          {[
            { tab: 'daily' as HubTab, label: 'Daily Home', icon: Calendar },
            { tab: 'subjects' as HubTab, label: 'Subjects', icon: BookOpen },
            { tab: 'quizzes' as HubTab, label: 'Quizzes', icon: CheckCircle2 },
            { tab: 'live' as HubTab, label: 'Live', icon: Video },
            { tab: 'marks' as HubTab, label: 'Marks', icon: FileSpreadsheet },
          ].map((item) => {
            const Icon = item.icon;
            const isAct = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                  isAct ? 'text-blue-700 bg-blue-50' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="truncate max-w-full">{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
