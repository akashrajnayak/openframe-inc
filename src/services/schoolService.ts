import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import {
  db,
  auth,
  stripUndefinedDeep,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  SCHOOL_BOARDS,
} from '../data/schoolCurriculumData';
import {
  ALL_INDIA_BOARDS,
} from '../data/allIndiaBoardsData';
import {
  computePercentageWithFramework,
  getBoardGradeFrameworkSpec,
} from '../data/boardGradeFrameworkData';
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
  SchoolFeeRecord,
  SchoolLanguage,
  SchoolLiveClass,
  SchoolMarkEntry,
  SchoolMasteryStatus,
  SchoolParentTeacherMessage,
  SchoolPresentationItem,
  SchoolQuizAttempt,
  SchoolStreamId,
  SchoolStudentEnrollment,
  SchoolSubject,
  SchoolSubmission,
  SchoolTimetableSlot,
} from '../types';

export const SCHOOL_COLLECTIONS = {
  ENROLLMENTS: 'school_enrollments',
  SUBJECTS: 'school_subjects',
  PROGRESS: 'school_progress',
  QUIZ_ATTEMPTS: 'school_quiz_attempts',
  ASSIGNMENTS: 'school_assignments',
  SUBMISSIONS: 'school_submissions',
  PRESENTATIONS: 'school_presentations',
  MARKS: 'school_marks',
  EXAMINATIONS: 'school_examinations',
  ATTENDANCE: 'school_attendance',
  TIMETABLES: 'school_timetables',
  LIVE_CLASSES: 'school_live_classes',
  FEES: 'school_fees',
  MESSAGES: 'school_messages',
  ANNOUNCEMENTS: 'school_announcements',
  BOARDS: 'school_boards',
  GRADE_FRAMEWORKS: 'school_grade_frameworks',
} as const;

export function computeBoardGrade(
  boardId: SchoolBoardId,
  percentage: number,
  directoryBoardId?: string
): {
  grade: string;
  remark: string;
} {
  if (directoryBoardId) {
    const fw = getBoardGradeFrameworkSpec(directoryBoardId);
    const res = computePercentageWithFramework(fw, percentage);
    return { grade: res.grade, remark: res.remark };
  }
  const board = SCHOOL_BOARDS.find((b) => b.id === boardId) || SCHOOL_BOARDS[0];
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const band =
    board.gradingBands.find((b) => pct >= b.minPercent && pct <= b.maxPercent) ||
    board.gradingBands[board.gradingBands.length - 1];
  return {
    grade: band?.grade || 'B',
    remark: band?.remark || 'Satisfactory',
  };
}

const VALID_SCHOOL_LANGUAGES: SchoolLanguage[] = [
  'English',
  'Kannada',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Odia',
  'Punjabi',
  'Assamese',
  'Urdu',
  'Sanskrit',
];

export function isSchoolQualificationLabel(label?: string | null): boolean {
  if (!label) return false;
  const norm = label.toLowerCase();
  return (
    norm.includes('lkg') ||
    norm.includes('ukg') ||
    norm.includes('nursery') ||
    norm.includes('kindergarten') ||
    norm.includes('primary school') ||
    norm.includes('middle school') ||
    norm.includes('secondary school') ||
    norm.includes('higher secondary') ||
    norm.includes('class ') ||
    norm.includes('classes ') ||
    norm.includes('puc') ||
    norm.includes('10th') ||
    norm.includes('12th')
  );
}

export function inferClassIdFromQualification(label?: string | null): SchoolClassId {
  const norm = (label || '').toLowerCase();
  if (norm.includes('lkg') || norm.includes('nursery')) return 'LKG';
  if (norm.includes('ukg') || norm.includes('kindergarten')) return 'UKG';
  const match = norm.match(/class(?:es)?\s*(\d{1,2})/);
  if (match) {
    const num = Number(match[1]);
    if (num >= 1 && num <= 12) return String(num) as SchoolClassId;
  }
  if (norm.includes('primary')) return '5';
  if (norm.includes('middle')) return '8';
  if (norm.includes('higher secondary') || norm.includes('puc') || norm.includes('12th')) return '11';
  if (norm.includes('secondary') || norm.includes('10th')) return '10';
  return '8';
}

export function toValidSchoolLanguage(lang?: string | null): SchoolLanguage {
  const clean = (lang || '').split('(')[0].trim();
  const matched = VALID_SCHOOL_LANGUAGES.find(
    (item) => item.toLowerCase() === clean.toLowerCase()
  );
  return matched || 'English';
}

// ====================================================
// ALL-INDIA EDUCATION BOARD DIRECTORY (41+ BOARDS)
// ====================================================

const CATEGORY_SORT_ORDER: Record<AllIndiaBoardRecord['category'], number> = {
  National: 0,
  International: 1,
  State: 2,
  'Union Territory': 3,
};

function sanitizeBoardPayload(board: AllIndiaBoardRecord): AllIndiaBoardRecord {
  const cleanId = board.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  return stripUndefinedDeep({
    ...board,
    id: cleanId,
    stateOrUt: String(board.stateOrUt || '').slice(0, 120),
    officialName: String(board.officialName || '').slice(0, 240),
    shortName: String(board.shortName || '').slice(0, 80),
    secondaryBoardName: board.secondaryBoardName ? String(board.secondaryBoardName).slice(0, 180) : undefined,
    seniorSecondaryBoardName: board.seniorSecondaryBoardName ? String(board.seniorSecondaryBoardName).slice(0, 180) : undefined,
    scertBody: String(board.scertBody || '').slice(0, 200),
    affiliationMode: String(board.affiliationMode || '').slice(0, 100) as AllIndiaBoardRecord['affiliationMode'],
    subProgrammes: (board.subProgrammes || []).slice(0, 20),
    gradeRangeSummary: String(board.gradeRangeSummary || '').slice(0, 160),
    officialGradeLevels: (board.officialGradeLevels || ['1']).slice(0, 20),
    supportedMediums: (board.supportedMediums || ['English']).slice(0, 30),
    gradingSummary: String(board.gradingSummary || '').slice(0, 400),
    officialWebsite: String(board.officialWebsite || '').slice(0, 300),
    officialSyllabusUrl: board.officialSyllabusUrl ? String(board.officialSyllabusUrl).slice(0, 300) : undefined,
    sourceNote: String(board.sourceNote || '').slice(0, 600),
    updatedAt: new Date().toISOString(),
  });
}

export async function getAllIndiaBoards(): Promise<{
  boards: AllIndiaBoardRecord[];
  syncedCount: number;
  source: 'firestore_merged' | 'canonical_baseline';
}> {
  const merged = new Map<string, AllIndiaBoardRecord>();
  for (const b of ALL_INDIA_BOARDS) {
    merged.set(b.id, b);
  }
  let syncedCount = 0;
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.BOARDS), limit(120)));
    syncedCount = snap.docs.length;
    for (const d of snap.docs) {
      const data = d.data() as AllIndiaBoardRecord;
      if (data && data.id) {
        merged.set(data.id, data);
      }
    }
  } catch {
    // Graceful fallback to verified canonical baseline if network/offline
  }

  const boards = Array.from(merged.values()).sort((a, b) => {
    const catDiff = (CATEGORY_SORT_ORDER[a.category] ?? 9) - (CATEGORY_SORT_ORDER[b.category] ?? 9);
    if (catDiff !== 0) return catDiff;
    return a.stateOrUt.localeCompare(b.stateOrUt);
  });

  return {
    boards,
    syncedCount,
    source: syncedCount > 0 ? 'firestore_merged' : 'canonical_baseline',
  };
}

export async function saveSchoolBoardDirectoryDoc(board: AllIndiaBoardRecord): Promise<AllIndiaBoardRecord> {
  const sanitized = sanitizeBoardPayload(board);
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.BOARDS, sanitized.id), sanitized, { merge: true });
    return sanitized;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.BOARDS}/${sanitized.id}`);
  }
}

export async function seedAllIndiaBoardsToFirestore(forceOverwrite = false): Promise<{
  totalCanonical: number;
  writtenCount: number;
  alreadySyncedCount: number;
}> {
  const existingIds = new Set<string>();
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.BOARDS), limit(120)));
    for (const d of snap.docs) existingIds.add(d.id);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, SCHOOL_COLLECTIONS.BOARDS);
  }

  let writtenCount = 0;
  for (const board of ALL_INDIA_BOARDS) {
    if (!forceOverwrite && existingIds.has(board.id)) continue;
    await saveSchoolBoardDirectoryDoc(board);
    writtenCount++;
  }

  return {
    totalCanonical: ALL_INDIA_BOARDS.length,
    writtenCount,
    alreadySyncedCount: existingIds.size,
  };
}

export async function getBoardGradeFramework(directoryBoardId?: string): Promise<{
  framework: BoardGradeFramework;
  source: 'firestore_custom' | 'canonical_spec';
}> {
  const baseline = getBoardGradeFrameworkSpec(directoryBoardId);
  if (!directoryBoardId) {
    return { framework: baseline, source: 'canonical_spec' };
  }
  const cleanId = directoryBoardId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  try {
    const snap = await getDoc(doc(db, SCHOOL_COLLECTIONS.GRADE_FRAMEWORKS, cleanId));
    if (snap.exists()) {
      const data = snap.data() as BoardGradeFramework;
      if (data && data.id) {
        return { framework: data, source: 'firestore_custom' };
      }
    }
  } catch {
    // Graceful fallback to canonical framework specification
  }
  return { framework: baseline, source: 'canonical_spec' };
}

export async function saveBoardGradeFramework(framework: BoardGradeFramework): Promise<BoardGradeFramework> {
  const cleanId = framework.id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 128);
  const payload: BoardGradeFramework = stripUndefinedDeep({
    ...framework,
    id: cleanId,
    directoryBoardId: String(framework.directoryBoardId || cleanId).slice(0, 128),
    boardShortName: String(framework.boardShortName || '').slice(0, 100),
    structurePattern: String(framework.structurePattern || '').slice(0, 200),
    gradingScaleName: String(framework.gradingScaleName || '').slice(0, 160),
    passingRule: String(framework.passingRule || '').slice(0, 300),
    gradingBands: (framework.gradingBands || []).slice(0, 15),
    curriculumVersions: (framework.curriculumVersions || []).slice(0, 12),
    stages: (framework.stages || []).slice(0, 20),
    streamStructure: (framework.streamStructure || []).slice(0, 10),
    updatedAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.GRADE_FRAMEWORKS, cleanId), payload, { merge: true });
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.GRADE_FRAMEWORKS}/${cleanId}`);
  }
}

// ====================================================
// ENROLLMENTS & PREFERENCES (Persisted per Student)
// ====================================================

export async function getSchoolEnrollment(studentUid: string): Promise<SchoolStudentEnrollment | null> {
  if (!studentUid) return null;
  try {
    const snap = await getDoc(doc(db, SCHOOL_COLLECTIONS.ENROLLMENTS, studentUid));
    return snap.exists() ? (snap.data() as SchoolStudentEnrollment) : null;
  } catch {
    return null;
  }
}

export async function saveSchoolEnrollment(
  enrollment: Omit<SchoolStudentEnrollment, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
    createdAt?: string;
  }
): Promise<SchoolStudentEnrollment> {
  const now = new Date().toISOString();
  const id = enrollment.id || enrollment.studentUid;
  const payload: SchoolStudentEnrollment = stripUndefinedDeep({
    ...enrollment,
    id,
    createdAt: enrollment.createdAt || now,
    updatedAt: now,
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.ENROLLMENTS, id), payload, { merge: true });
    return payload;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.ENROLLMENTS}/${id}`);
  }
}

export async function getAllSchoolEnrollments(): Promise<SchoolStudentEnrollment[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.ENROLLMENTS), limit(250)));
    return snap.docs.map((d) => d.data() as SchoolStudentEnrollment);
  } catch {
    return [];
  }
}

export async function updateStudentLanguagePreference(
  studentUid: string,
  preferredLanguage: SchoolLanguage
): Promise<void> {
  if (!studentUid) return;
  try {
    await updateDoc(doc(db, SCHOOL_COLLECTIONS.ENROLLMENTS, studentUid), {
      preferredLanguage,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // non-blocking if user not yet enrolled
  }
}

// ====================================================
// CONCEPT PROGRESS & MASTERY + XP / BADGES
// ====================================================

export async function getStudentSchoolProgress(studentId: string): Promise<SchoolConceptProgress[]> {
  if (!studentId) return [];
  try {
    const q = query(
      collection(db, SCHOOL_COLLECTIONS.PROGRESS),
      where('studentId', '==', studentId),
      limit(300)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolConceptProgress);
  } catch {
    return [];
  }
}

export async function upsertSchoolConceptProgress(params: {
  studentId: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  chapterId: string;
  conceptId: string;
  conceptTitle: string;
  updates: Partial<SchoolConceptProgress>;
}): Promise<SchoolConceptProgress> {
  const docId = `${params.studentId}_${params.conceptId}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const ref = doc(db, SCHOOL_COLLECTIONS.PROGRESS, docId);
  let existing: SchoolConceptProgress | null = null;
  try {
    const snap = await getDoc(ref);
    if (snap.exists()) existing = snap.data() as SchoolConceptProgress;
  } catch {
    // ignore miss
  }

  const merged: SchoolConceptProgress = stripUndefinedDeep({
    id: docId,
    studentId: params.studentId,
    boardId: params.boardId,
    classId: params.classId,
    subjectId: params.subjectId,
    chapterId: params.chapterId,
    conceptId: params.conceptId,
    conceptTitle: params.conceptTitle,
    status: (params.updates.status || existing?.status || 'In Progress') as SchoolMasteryStatus,
    videoReviewed: params.updates.videoReviewed ?? existing?.videoReviewed ?? false,
    recapCompleted: params.updates.recapCompleted ?? existing?.recapCompleted ?? false,
    practiceCompleted: params.updates.practiceCompleted ?? existing?.practiceCompleted ?? false,
    quizPassed: params.updates.quizPassed ?? existing?.quizPassed ?? false,
    latestQuizScore: params.updates.latestQuizScore ?? existing?.latestQuizScore,
    timeSpentSeconds: (existing?.timeSpentSeconds || 0) + (params.updates.timeSpentSeconds || 0),
    needsSupport: params.updates.needsSupport ?? existing?.needsSupport ?? false,
    revisionScheduledAt: params.updates.revisionScheduledAt ?? existing?.revisionScheduledAt,
    updatedAt: new Date().toISOString(),
  });

  try {
    await setDoc(ref, merged, { merge: true });
    return merged;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.PROGRESS}/${docId}`);
  }
}

export async function awardSchoolXpAndBadge(params: {
  studentUid: string;
  xpDelta: number;
  badgeName?: string;
  minutesDelta?: number;
}): Promise<void> {
  if (!params.studentUid) return;
  try {
    const enr = await getSchoolEnrollment(params.studentUid);
    if (!enr) return;
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let nextStreak = enr.streakDays || 1;
    if (enr.lastActiveDate && enr.lastActiveDate !== today) {
      nextStreak = enr.lastActiveDate === yesterday ? nextStreak + 1 : 1;
    }
    const badges = new Set<string>(enr.badges || []);
    if (params.badgeName) badges.add(params.badgeName);
    const nextXp = (enr.xpPoints || 0) + Math.max(0, params.xpDelta);
    if (nextXp >= 100) badges.add('Century Learner');
    if (nextXp >= 500) badges.add('Mastery Scholar');

    await updateDoc(doc(db, SCHOOL_COLLECTIONS.ENROLLMENTS, params.studentUid), {
      xpPoints: nextXp,
      streakDays: nextStreak,
      badges: Array.from(badges),
      totalLearningMinutes: (enr.totalLearningMinutes || 0) + (params.minutesDelta || 5),
      lastActiveDate: today,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // non-blocking telemetry
  }
}

// ====================================================
// QUIZZES, ASSIGNMENTS, PRESENTATIONS, MARKS, EXAMS
// ====================================================

export async function saveSchoolQuizAttempt(attempt: SchoolQuizAttempt): Promise<void> {
  try {
    await setDoc(
      doc(db, SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS, attempt.id),
      stripUndefinedDeep(attempt),
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS}/${attempt.id}`);
  }
}

export async function getSchoolQuizAttempts(studentId?: string): Promise<SchoolQuizAttempt[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS), where('studentId', '==', studentId), limit(150))
      : query(collection(db, SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS), orderBy('submittedAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolQuizAttempt);
  } catch {
    return [];
  }
}

export async function updateSchoolQuizReviewByTeacher(
  attemptId: string,
  updates: {
    itemGrades: SchoolQuizAttempt['itemGrades'];
    totalAwarded: number;
    percentage: number;
    teacherReviewedBy: string;
    teacherRemarks: string;
  }
): Promise<void> {
  try {
    await updateDoc(doc(db, SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS, attemptId), {
      ...stripUndefinedDeep(updates),
      pendingTeacherReview: false,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SCHOOL_COLLECTIONS.QUIZ_ATTEMPTS}/${attemptId}`);
  }
}

export async function getSchoolAssignments(boardId?: SchoolBoardId, classId?: SchoolClassId): Promise<SchoolAssignment[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.ASSIGNMENTS), limit(200)));
    const all = snap.docs.map((d) => d.data() as SchoolAssignment);
    return all.filter(
      (a) => (!boardId || a.boardId === boardId) && (!classId || a.classId === classId)
    );
  } catch {
    return [];
  }
}

export async function createSchoolAssignment(
  payload: Omit<SchoolAssignment, 'id' | 'createdAt'>
): Promise<SchoolAssignment> {
  const id = `sasg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const item: SchoolAssignment = stripUndefinedDeep({
    ...payload,
    id,
    createdAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.ASSIGNMENTS, id), item);
    return item;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.ASSIGNMENTS}/${id}`);
  }
}

export async function getSchoolSubmissions(studentId?: string): Promise<SchoolSubmission[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.SUBMISSIONS), where('studentId', '==', studentId), limit(150))
      : query(collection(db, SCHOOL_COLLECTIONS.SUBMISSIONS), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolSubmission);
  } catch {
    return [];
  }
}

export async function submitSchoolHomework(
  payload: Omit<SchoolSubmission, 'id' | 'submittedAt' | 'updatedAt' | 'status'>
): Promise<SchoolSubmission> {
  const id = `ssub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const item: SchoolSubmission = stripUndefinedDeep({
    ...payload,
    id,
    status: 'Submitted',
    submittedAt: now,
    updatedAt: now,
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.SUBMISSIONS, id), item);
    return item;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.SUBMISSIONS}/${id}`);
  }
}

export async function evaluateSchoolHomework(
  submissionId: string,
  updates: { marksAwarded: number; teacherComment: string; evaluatedBy: string; status: SchoolSubmission['status'] }
): Promise<void> {
  try {
    await updateDoc(doc(db, SCHOOL_COLLECTIONS.SUBMISSIONS, submissionId), {
      ...stripUndefinedDeep(updates),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SCHOOL_COLLECTIONS.SUBMISSIONS}/${submissionId}`);
  }
}

export async function getSchoolPresentations(studentId?: string): Promise<SchoolPresentationItem[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.PRESENTATIONS), where('studentId', '==', studentId), limit(150))
      : query(collection(db, SCHOOL_COLLECTIONS.PRESENTATIONS), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolPresentationItem);
  } catch {
    return [];
  }
}

export async function submitSchoolPresentation(
  payload: Omit<SchoolPresentationItem, 'id' | 'submittedAt' | 'updatedAt'>
): Promise<SchoolPresentationItem> {
  const id = `sprs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  const item: SchoolPresentationItem = stripUndefinedDeep({
    ...payload,
    id,
    submittedAt: now,
    updatedAt: now,
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.PRESENTATIONS, id), item);
    return item;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.PRESENTATIONS}/${id}`);
  }
}

export async function updateSchoolPresentationEvaluation(
  presentationId: string,
  updates: Partial<SchoolPresentationItem>
): Promise<void> {
  try {
    await updateDoc(doc(db, SCHOOL_COLLECTIONS.PRESENTATIONS, presentationId), {
      ...stripUndefinedDeep(updates),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SCHOOL_COLLECTIONS.PRESENTATIONS}/${presentationId}`);
  }
}

export async function getSchoolMarks(studentId?: string): Promise<SchoolMarkEntry[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.MARKS), where('studentId', '==', studentId), limit(250))
      : query(collection(db, SCHOOL_COLLECTIONS.MARKS), limit(300));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolMarkEntry);
  } catch {
    return [];
  }
}

export async function recordSchoolMark(
  entry: Omit<SchoolMarkEntry, 'id' | 'percentage' | 'grade' | 'recordedAt'>
): Promise<SchoolMarkEntry> {
  const id = `smrk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const pct = entry.maxMarks > 0 ? Math.round((entry.marksObtained / entry.maxMarks) * 100) : 0;
  const { grade } = computeBoardGrade(entry.boardId, pct);
  const full: SchoolMarkEntry = stripUndefinedDeep({
    ...entry,
    id,
    percentage: pct,
    grade,
    recordedAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.MARKS, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.MARKS}/${id}`);
  }
}

// ====================================================
// EXAMS, ATTENDANCE, TIMETABLE, LIVE CLASSES, FEES, MESSAGES, ANNOUNCEMENTS
// ====================================================

export async function getSchoolExaminations(boardId?: SchoolBoardId, classId?: SchoolClassId): Promise<SchoolExamination[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.EXAMINATIONS), limit(150)));
    const all = snap.docs.map((d) => d.data() as SchoolExamination);
    return all.filter((e) => (!boardId || e.boardId === boardId) && (!classId || e.classId === classId));
  } catch {
    return [];
  }
}

export async function saveSchoolExamination(exam: Omit<SchoolExamination, 'id'>): Promise<SchoolExamination> {
  const id = `sexm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolExamination = stripUndefinedDeep({ ...exam, id });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.EXAMINATIONS, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.EXAMINATIONS}/${id}`);
  }
}

export async function getSchoolAttendance(studentId?: string): Promise<SchoolAttendanceRecord[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.ATTENDANCE), where('studentId', '==', studentId), limit(180))
      : query(collection(db, SCHOOL_COLLECTIONS.ATTENDANCE), limit(250));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolAttendanceRecord);
  } catch {
    return [];
  }
}

export async function markSchoolAttendance(
  record: Omit<SchoolAttendanceRecord, 'id'>
): Promise<SchoolAttendanceRecord> {
  const docId = `${record.studentId}_${record.date}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
  const full: SchoolAttendanceRecord = stripUndefinedDeep({ ...record, id: docId });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.ATTENDANCE, docId), full, { merge: true });
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.ATTENDANCE}/${docId}`);
  }
}

export async function getSchoolLiveClasses(boardId?: SchoolBoardId, classId?: SchoolClassId): Promise<SchoolLiveClass[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.LIVE_CLASSES), limit(120)));
    const all = snap.docs.map((d) => d.data() as SchoolLiveClass);
    return all.filter((l) => (!boardId || l.boardId === boardId) && (!classId || l.classId === classId));
  } catch {
    return [];
  }
}

export async function createSchoolLiveClass(
  payload: Omit<SchoolLiveClass, 'id' | 'attendeeIds'>
): Promise<SchoolLiveClass> {
  const id = `slive-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolLiveClass = stripUndefinedDeep({ ...payload, id, attendeeIds: [] });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.LIVE_CLASSES, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.LIVE_CLASSES}/${id}`);
  }
}

export async function joinSchoolLiveClass(liveClassId: string, studentUid: string): Promise<void> {
  try {
    const ref = doc(db, SCHOOL_COLLECTIONS.LIVE_CLASSES, liveClassId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as SchoolLiveClass;
    const next = Array.from(new Set([...(data.attendeeIds || []), studentUid]));
    await updateDoc(ref, { attendeeIds: next });
  } catch {
    // non-blocking
  }
}

export async function getSchoolTimetable(boardId?: SchoolBoardId, classId?: SchoolClassId): Promise<SchoolTimetableSlot[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.TIMETABLES), limit(200)));
    const all = snap.docs.map((d) => d.data() as SchoolTimetableSlot);
    return all.filter((s) => (!boardId || s.boardId === boardId) && (!classId || s.classId === classId));
  } catch {
    return [];
  }
}

export async function saveSchoolTimetableSlot(slot: Omit<SchoolTimetableSlot, 'id'>): Promise<SchoolTimetableSlot> {
  const id = `stt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolTimetableSlot = stripUndefinedDeep({ ...slot, id });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.TIMETABLES, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.TIMETABLES}/${id}`);
  }
}

export async function getSchoolFees(studentId?: string): Promise<SchoolFeeRecord[]> {
  try {
    const q = studentId
      ? query(collection(db, SCHOOL_COLLECTIONS.FEES), where('studentId', '==', studentId), limit(100))
      : query(collection(db, SCHOOL_COLLECTIONS.FEES), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SchoolFeeRecord);
  } catch {
    return [];
  }
}

export async function saveSchoolFeeRecord(fee: Omit<SchoolFeeRecord, 'id' | 'updatedAt'>): Promise<SchoolFeeRecord> {
  const id = `sfee-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolFeeRecord = stripUndefinedDeep({ ...fee, id, updatedAt: new Date().toISOString() });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.FEES, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.FEES}/${id}`);
  }
}

export async function getSchoolAnnouncements(): Promise<SchoolAnnouncement[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.ANNOUNCEMENTS), orderBy('createdAt', 'desc'), limit(60)));
    return snap.docs.map((d) => d.data() as SchoolAnnouncement);
  } catch {
    return [];
  }
}

export async function createSchoolAnnouncement(
  payload: Omit<SchoolAnnouncement, 'id' | 'createdAt'>
): Promise<SchoolAnnouncement> {
  const id = `sann-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolAnnouncement = stripUndefinedDeep({
    ...payload,
    id,
    createdAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.ANNOUNCEMENTS, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.ANNOUNCEMENTS}/${id}`);
  }
}

export async function getSchoolMessagesForUser(uid: string): Promise<SchoolParentTeacherMessage[]> {
  if (!uid) return [];
  try {
    const qParent = query(collection(db, SCHOOL_COLLECTIONS.MESSAGES), where('parentUid', '==', uid), limit(100));
    const qTeacher = query(collection(db, SCHOOL_COLLECTIONS.MESSAGES), where('teacherUid', '==', uid), limit(100));
    const [pSnap, tSnap] = await Promise.all([getDocs(qParent).catch(() => null), getDocs(qTeacher).catch(() => null)]);
    const merged = [
      ...(pSnap ? pSnap.docs.map((d) => d.data() as SchoolParentTeacherMessage) : []),
      ...(tSnap ? tSnap.docs.map((d) => d.data() as SchoolParentTeacherMessage) : []),
    ];
    const uniq = new Map<string, SchoolParentTeacherMessage>();
    for (const m of merged) uniq.set(m.id, m);
    return Array.from(uniq.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch {
    return [];
  }
}

export async function sendSchoolParentTeacherMessage(
  payload: Omit<SchoolParentTeacherMessage, 'id' | 'createdAt'>
): Promise<SchoolParentTeacherMessage> {
  const id = `smsg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const full: SchoolParentTeacherMessage = stripUndefinedDeep({
    ...payload,
    id,
    createdAt: new Date().toISOString(),
  });
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.MESSAGES, id), full);
    return full;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${SCHOOL_COLLECTIONS.MESSAGES}/${id}`);
  }
}

// ====================================================
// ADMIN CUSTOM / IMPORTED CURRICULUM (CSV, EXCEL, JSON)
// ====================================================

export async function getCustomSchoolSubjects(): Promise<SchoolSubject[]> {
  try {
    const snap = await getDocs(query(collection(db, SCHOOL_COLLECTIONS.SUBJECTS), limit(250)));
    return snap.docs.map((d) => d.data() as SchoolSubject);
  } catch {
    return [];
  }
}

export async function saveSchoolSubjectDoc(subject: SchoolSubject): Promise<void> {
  try {
    await setDoc(doc(db, SCHOOL_COLLECTIONS.SUBJECTS, subject.id), stripUndefinedDeep(subject), { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SCHOOL_COLLECTIONS.SUBJECTS}/${subject.id}`);
  }
}

export async function deleteSchoolSubjectDoc(subjectId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, SCHOOL_COLLECTIONS.SUBJECTS, subjectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${SCHOOL_COLLECTIONS.SUBJECTS}/${subjectId}`);
  }
}

export interface ParsedCurriculumImportRow {
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  stream: SchoolStreamId;
  subjectCode: string;
  subjectName: string;
  chapterNumber: number;
  chapterTitle: string;
  conceptTitle: string;
  simpleExplanation: string;
  kannadaExplanation?: string;
  hindiExplanation?: string;
  textbookReference?: string;
}

export async function parseCurriculumImportFile(file: File): Promise<ParsedCurriculumImportRow[]> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  const normalizeRow = (raw: Record<string, any>): ParsedCurriculumImportRow => {
    const boardRaw = String(raw.boardId || raw.Board || raw.board || 'CBSE').trim().toUpperCase();
    const boardId: SchoolBoardId =
      boardRaw.includes('KAR') || boardRaw.includes('STATE')
        ? boardRaw.includes('OTHER')
          ? 'OTHER_STATE'
          : 'KAR_STATE'
        : boardRaw.includes('ICSE') || boardRaw.includes('CISCE')
        ? 'ICSE'
        : boardRaw.includes('RECOG') || boardRaw.includes('NIOS')
        ? 'OTHER_RECOGNIZED'
        : 'CBSE';

    const classRaw = String(raw.classId || raw.Class || raw.class || '8').trim().toUpperCase();
    const validClasses: SchoolClassId[] = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const matchedClass = validClasses.find((c) => c === classRaw || classRaw.includes(c)) || '8';

    const streamRaw = String(raw.stream || raw.Stream || 'General').trim();
    const stream: SchoolStreamId = (['General', 'Science', 'Commerce', 'Arts', 'Vocational'].includes(streamRaw)
      ? streamRaw
      : 'General') as SchoolStreamId;

    return {
      boardId,
      classId: matchedClass,
      stream,
      subjectCode: String(raw.subjectCode || raw.Code || raw.Subject || 'GEN').trim().toUpperCase().slice(0, 12),
      subjectName: String(raw.subjectName || raw.Subject || 'General Subject').trim(),
      chapterNumber: Math.max(1, Number(raw.chapterNumber || raw.ChapterNo || 1)),
      chapterTitle: String(raw.chapterTitle || raw.Chapter || 'Imported Chapter').trim(),
      conceptTitle: String(raw.conceptTitle || raw.Concept || 'Imported Concept').trim(),
      simpleExplanation: String(raw.simpleExplanation || raw.Explanation || 'Imported curriculum concept.').trim(),
      kannadaExplanation: raw.kannadaExplanation || raw.Kannada || undefined,
      hindiExplanation: raw.hindiExplanation || raw.Hindi || undefined,
      textbookReference: raw.textbookReference || raw.Textbook || undefined,
    };
  };

  if (ext === 'json') {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map(normalizeRow);
  }

  // Excel (.xlsx, .xls) or CSV
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
  return rows.map(normalizeRow);
}

export async function importParsedCurriculumRowsToFirestore(
  rows: ParsedCurriculumImportRow[]
): Promise<{ subjectsSaved: number; conceptsImported: number }> {
  const grouped = new Map<string, SchoolSubject>();

  for (const row of rows) {
    const subjId = `${row.boardId}_CLS_${row.classId}_${row.stream}_${row.subjectCode}`.toUpperCase();
    let subj = grouped.get(subjId);
    if (!subj) {
      subj = {
        id: subjId,
        boardId: row.boardId,
        classId: row.classId,
        stream: row.stream,
        code: row.subjectCode,
        name: {
          English: row.subjectName,
          Kannada: row.subjectName,
          Hindi: row.subjectName,
        },
        category: 'Imported Curriculum',
        colorTheme: 'blue',
        textbookSource: row.textbookReference || `Imported ${row.boardId} Syllabus`,
        academicYear: '2026-2027',
        mediums: ['English Medium', 'Kannada Medium', 'Hindi Medium'],
        chapters: [],
      };
      grouped.set(subjId, subj);
    }

    const chId = `${subjId}-ch-${row.chapterNumber}`;
    let ch = subj.chapters.find((c) => c.id === chId);
    if (!ch) {
      ch = {
        id: chId,
        boardId: row.boardId,
        classId: row.classId,
        subjectId: subjId,
        chapterNumber: row.chapterNumber,
        title: {
          English: row.chapterTitle,
          Kannada: row.chapterTitle,
          Hindi: row.chapterTitle,
        },
        textbookReference: row.textbookReference || `Imported ${row.boardId}`,
        summary: `Imported chapter for ${row.classId} ${row.subjectName}`,
        topics: [{ id: `${chId}-t1`, title: row.conceptTitle, subtopics: [row.conceptTitle] }],
        concepts: [],
      };
      subj.chapters.push(ch);
    }

    const cOrder = ch.concepts.length + 1;
    ch.concepts.push({
      id: `${chId}-c-${cOrder}`,
      subjectId: subjId,
      chapterId: chId,
      topicId: `${chId}-t1`,
      subtopicTitle: row.conceptTitle,
      order: cOrder,
      title: {
        English: row.conceptTitle,
        Kannada: row.conceptTitle,
        Hindi: row.conceptTitle,
      },
      simpleExplanation: {
        English: row.simpleExplanation,
        Kannada: row.kannadaExplanation || row.simpleExplanation,
        Hindi: row.hindiExplanation || row.simpleExplanation,
      },
      detailedExplanation: {
        English: row.simpleExplanation,
        Kannada: row.kannadaExplanation || row.simpleExplanation,
        Hindi: row.hindiExplanation || row.simpleExplanation,
      },
      learningObjectives: [`Master ${row.conceptTitle} (${row.boardId})`],
      examples: [{ title: 'Curriculum Example', content: row.simpleExplanation }],
      realLifeApplications: [
        {
          English: `Applied in ${row.subjectName} daily exercises.`,
          Kannada: `${row.subjectName} ದೈನಂದಿನ ಅಭ್ಯಾಸದಲ್ಲಿ ಅನ್ವಯವಾಗುತ್ತದೆ.`,
          Hindi: `${row.subjectName} के दैनिक अभ्यास में उपयोगी।`,
        },
      ],
      illustrationUrl: '/assets/images/academic_education.jpg',
      diagramType: 'general_concept',
      diagramCaption: row.conceptTitle,
      technicalTermsGlossary: [],
      importantQuestions: [
        { question: `Explain ${row.conceptTitle}.`, answer: row.simpleExplanation, marks: 2 },
      ],
      practiceExercises: [
        { prompt: `Summarize ${row.conceptTitle} in 3 lines.`, hint: 'Use key vocabulary.', solution: row.simpleExplanation },
      ],
      homeworkTask: `Revise ${row.conceptTitle} from ${row.chapterTitle}.`,
      revisionNotes: {
        English: row.simpleExplanation,
        Kannada: row.kannadaExplanation || row.simpleExplanation,
        Hindi: row.hindiExplanation || row.simpleExplanation,
      },
      flashcards: [{ front: row.conceptTitle, back: row.simpleExplanation }],
      estimatedMinutes: 15,
      difficulty: 'Basic',
    });
  }

  let savedCount = 0;
  for (const subj of grouped.values()) {
    await saveSchoolSubjectDoc(subj);
    savedCount++;
  }
  return { subjectsSaved: savedCount, conceptsImported: rows.length };
}

// ====================================================
// PRINTABLE PDF REPORT CARD & ACHIEVEMENT CERTIFICATE
// ====================================================

export function exportSchoolReportCardPdf(params: {
  studentName: string;
  boardName: string;
  classLabel: string;
  academicYear: string;
  medium: string;
  marks: SchoolMarkEntry[];
  overallPercent: number;
  overallGrade: string;
  attendancePercent: number;
}) {
  const docPdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  docPdf.setFillColor(11, 25, 48);
  docPdf.rect(0, 0, 210, 34, 'F');
  docPdf.setTextColor(255, 255, 255);
  docPdf.setFontSize(16);
  docPdf.text('OPENFRAME EDUCATION · SCHOOL PROGRESS REPORT CARD', 14, 15);
  docPdf.setFontSize(9);
  docPdf.text('OpenFrame IT Solutions Private Limited · Academic Years LKG – Class 12', 14, 23);

  docPdf.setTextColor(15, 23, 42);
  docPdf.setFontSize(11);
  docPdf.text(`Student: ${params.studentName}`, 14, 46);
  docPdf.text(`Board: ${params.boardName}`, 14, 53);
  docPdf.text(`Class: ${params.classLabel}   |   Medium: ${params.medium}   |   Year: ${params.academicYear}`, 14, 60);
  docPdf.text(`Overall Score: ${params.overallPercent}% (${params.overallGrade})   |   Attendance: ${params.attendancePercent}%`, 14, 67);

  docPdf.setDrawColor(203, 213, 225);
  docPdf.line(14, 72, 196, 72);

  let y = 80;
  docPdf.setFontSize(9.5);
  docPdf.setTextColor(30, 64, 175);
  docPdf.text('SUBJECT', 14, y);
  docPdf.text('CATEGORY', 68, y);
  docPdf.text('MARKS', 120, y);
  docPdf.text('%', 150, y);
  docPdf.text('GRADE', 170, y);
  y += 6;

  docPdf.setTextColor(15, 23, 42);
  for (const row of params.marks.slice(0, 22)) {
    docPdf.text(row.subjectName.slice(0, 24), 14, y);
    docPdf.text(row.category.slice(0, 22), 68, y);
    docPdf.text(`${row.marksObtained} / ${row.maxMarks}`, 120, y);
    docPdf.text(`${row.percentage}%`, 150, y);
    docPdf.text(row.grade, 170, y);
    y += 7;
    if (y > 270) break;
  }

  docPdf.setFontSize(8);
  docPdf.setTextColor(100, 116, 139);
  docPdf.text(`Generated on ${new Date().toLocaleDateString('en-IN')} · OpenFrame School LMS`, 14, 285);
  docPdf.save(`OpenFrame_ReportCard_${params.studentName.replace(/\s+/g, '_')}.pdf`);
}

export function exportSchoolMilestoneCertificatePdf(params: {
  studentName: string;
  classLabel: string;
  boardName: string;
  milestoneTitle: string;
  certCode: string;
}) {
  const docPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  docPdf.setDrawColor(11, 25, 48);
  docPdf.setLineWidth(3);
  docPdf.rect(8, 8, 281, 194);
  docPdf.setDrawColor(37, 99, 235);
  docPdf.setLineWidth(0.7);
  docPdf.rect(12, 12, 273, 186);

  docPdf.setFontSize(12);
  docPdf.setTextColor(37, 99, 235);
  docPdf.text('OPENFRAME EDUCATION · SCHOOL ACADEMIC EXCELLENCE', 148.5, 36, { align: 'center' });

  docPdf.setFontSize(26);
  docPdf.setTextColor(11, 25, 48);
  docPdf.text('CERTIFICATE OF ACHIEVEMENT', 148.5, 56, { align: 'center' });

  docPdf.setFontSize(12);
  docPdf.setTextColor(71, 85, 105);
  docPdf.text('This certifies that', 148.5, 76, { align: 'center' });

  docPdf.setFontSize(24);
  docPdf.setTextColor(15, 23, 42);
  docPdf.text(params.studentName, 148.5, 92, { align: 'center' });

  docPdf.setFontSize(12);
  docPdf.setTextColor(51, 65, 85);
  docPdf.text(
    `enrolled in ${params.classLabel} (${params.boardName}) has demonstrated commendable mastery in:`,
    148.5,
    110,
    { align: 'center' }
  );

  docPdf.setFontSize(16);
  docPdf.setTextColor(30, 64, 175);
  docPdf.text(params.milestoneTitle, 148.5, 126, { align: 'center' });

  docPdf.setFontSize(9.5);
  docPdf.setTextColor(100, 116, 139);
  docPdf.text(`Credential ID: ${params.certCode}`, 30, 175);
  docPdf.text(`Issued: ${new Date().toLocaleDateString('en-IN')}`, 148.5, 175, { align: 'center' });
  docPdf.text('OpenFrame IT Solutions Pvt Ltd', 266, 175, { align: 'right' });

  docPdf.save(`OpenFrame_School_Certificate_${params.studentName.replace(/\s+/g, '_')}.pdf`);
}

export function getActiveSchoolActor(): { uid: string; name: string; email: string } {
  const u = auth.currentUser;
  return {
    uid: u?.uid || 'guest-learner',
    name: u?.displayName || u?.email?.split('@')[0] || 'Student Learner',
    email: u?.email || '',
  };
}
