import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { db, handleFirestoreError, OperationType, uploadDocumentToStorage, stripUndefinedDeep } from './firebase';
import {
  StudentProgressRecord,
  VideoLearningSession,
  QuizAttempt,
  QuizConfigDoc,
  PracticalProjectDefinition,
  ProjectSubmission,
  StudentPresentation,
  TeacherEvaluation,
  IssuedCertificate,
  LmsNotification,
  LmsLesson,
  CourseModuleDoc,
  CourseEnrollment,
  CertificateEligibilityStatus,
  LmsGlobalSettings,
  CertificateTemplate,
  ParentStudentLink,
  StudentProfile,
  TeacherProfile,
  MarketplaceCourse,
  LearningStage,
  CertificateType,
  StudentLessonNote,
  StudentLessonBookmark,
  SearchHistoryEntry,
  ConsentRecord,
  AiLearningPath,
  ContentReport,
  ApiUsageTelemetry,
  QaSavedRecord,
  RecommendationAnalyticsEvent,
} from '../types';
import { quinnAiService } from './quinnAiService';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

const DEFAULT_GLOBAL_SETTINGS: LmsGlobalSettings = {
  id: 'global',
  quinnPersona: 'Socratic Mentor & Technical Architect',
  defaultBasicCount: 5,
  defaultIntermediateCount: 5,
  defaultAdvancedCount: 5,
  defaultPassingScore: 70,
  defaultMaxRetakes: 5,
  requireVideoCompletionConfirmation: true,
  youtubePreferredChannels: 'MIT OpenCourseWare, Stanford Online, freeCodeCamp.org, DeepLearning.AI, Harvard CS50, 3Blue1Brown',
  youtubeMaxRecommendations: 3,
  youtubeSafeSearch: 'strict',
  requireAdminCertApproval: false,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CERT_TEMPLATE: CertificateTemplate = {
  id: 'default_2026',
  name: 'OpenFrame Academic Distinction Seal',
  accreditationLine: 'OpenFrame IT Solutions Private Limited in association with HopeNest Global Foundation',
  credentialTitle: 'Certificate of Applied Mastery',
  authorizedSignatoryName: 'Academic Director & CTO',
  authorizedSignatoryTitle: 'OpenFrame Education Council',
  requireAdminApprovalBeforeIssue: false,
  accentColor: '#1d4ed8',
  updatedAt: new Date().toISOString(),
};

export class LmsService {
  // -------------------------------------------------------------
  // 1. Course Enrollment & Progress (8-Stage Tracking)
  // -------------------------------------------------------------
  async updateStudentProfile(uid: string, partial: Partial<StudentProfile>): Promise<StudentProfile | null> {
    if (!uid) return null;
    const now = new Date().toISOString();
    try {
      await setDoc(
        doc(db, 'student_profiles', uid),
        stripUndefinedDeep({ ...partial, uid, updatedAt: now }),
        { merge: true }
      );
      const snap = await getDoc(doc(db, 'student_profiles', uid));
      return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as StudentProfile) : null;
    } catch {
      return null;
    }
  }

  async enrollStudentInCourse(
    course: MarketplaceCourse,
    student: {
      uid: string;
      fullName: string;
      email: string;
      registrationNumber?: string;
    },
    paymentStatusOverride?: CourseEnrollment['paymentStatus'],
    feeAmountOverride?: number
  ): Promise<{ enrollment: CourseEnrollment; progress: StudentProgressRecord }> {
    const now = new Date().toISOString();
    const enrollmentId = sanitizeId(`${student.uid}_${course.id}`);
    const regNo = student.registrationNumber || `OF-STU-${student.uid.slice(0, 6).toUpperCase()}`;

    // Check existing enrollment or student profile for assigned teacher
    let assignedTeacherId = '';
    let assignedTeacherName = '';
    try {
      const stuSnap = await getDoc(doc(db, 'student_profiles', student.uid));
      if (stuSnap.exists()) {
        const stuData = stuSnap.data() as StudentProfile;
        assignedTeacherId = stuData.assignedTeacherId || '';
        assignedTeacherName = stuData.assignedTeacherName || '';
        const existingCourses = new Set(stuData.enrolledCourseIds || []);
        if (!existingCourses.has(course.id)) {
          existingCourses.add(course.id);
          await updateDoc(doc(db, 'student_profiles', student.uid), {
            enrolledCourseIds: Array.from(existingCourses),
            updatedAt: now,
          });
        }
      }
    } catch {
      // Non-blocking if profile read restricted
    }

    const enrollment: CourseEnrollment = {
      id: enrollmentId,
      studentId: student.uid,
      studentName: student.fullName,
      studentEmail: student.email,
      registrationNumber: regNo,
      courseId: course.id,
      courseTitle: course.title,
      teacherId: assignedTeacherId || undefined,
      teacherName: assignedTeacherName || undefined,
      status: 'Active',
      paymentStatus: paymentStatusOverride || (course.price === 0 ? 'Complimentary' : 'Paid'),
      feeAmount: feeAmountOverride !== undefined ? Number(feeAmountOverride) : Number(course.price || 0),
      enrolledAt: now,
      updatedAt: now,
    };

    try {
      const existingSnap = await getDoc(doc(db, 'course_enrollments', enrollmentId));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'course_enrollments', enrollmentId), stripUndefinedDeep(enrollment));
        await this.createNotification({
          id: `notif_${Date.now()}_enr`,
          recipientId: student.uid,
          recipientEmail: student.email,
          recipientRole: 'STUDENT',
          type: 'new_lesson',
          title: `Enrolled in ${course.title}`,
          message: 'Your curriculum, Quinn AI video curator, and verification assessments are ready.',
          actionUrl: `/learn/${course.id}`,
          createdAt: now,
          read: false,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `course_enrollments/${enrollmentId}`);
    }

    const totalMandatoryLessons = Math.max(
      1,
      course.modules?.reduce((acc, m) => acc + Math.max(1, m.lessons?.length || 1), 0) || 3
    );

    const progress = await this.getStudentProgress(course.id, student.uid, {
      fullName: student.fullName,
      email: student.email,
      registrationNumber: regNo,
      courseTitle: course.title,
      courseDuration: course.duration,
      totalMandatoryLessons,
    });

    return { enrollment, progress };
  }

  async getStudentEnrollments(studentUid: string): Promise<CourseEnrollment[]> {
    try {
      const q = query(
        collection(db, 'course_enrollments'),
        where('studentId', '==', studentUid),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (err) {
      console.warn('Error fetching enrollments:', err);
      return [];
    }
  }

  async getAllStudentProgress(studentUid: string): Promise<StudentProgressRecord[]> {
    try {
      const q = query(
        collection(db, 'student_progress'),
        where('studentId', '==', studentUid),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (err) {
      console.warn('Error fetching all student progress:', err);
      return [];
    }
  }

  async getStudentProgress(
    courseId: string,
    studentId: string,
    studentInfo?: {
      fullName?: string;
      email?: string;
      registrationNumber?: string;
      courseTitle?: string;
      courseDuration?: string;
      totalMandatoryLessons?: number;
    }
  ): Promise<StudentProgressRecord> {
    const docId = sanitizeId(`${studentId}_${courseId}`);
    try {
      const snap = await getDoc(doc(db, 'student_progress', docId));
      if (snap.exists()) {
        const data = snap.data() as StudentProgressRecord;
        return {
          ...data,
          id: snap.id,
          eligibilityChecklist: this.evaluateCertificateEligibility(data),
        };
      }
    } catch (err) {
      console.warn('Read student_progress error:', err);
    }

    const now = new Date().toISOString();
    const initialRecord: StudentProgressRecord = {
      id: docId,
      courseId,
      courseTitle: studentInfo?.courseTitle || courseId,
      courseDuration: studentInfo?.courseDuration || '8 Weeks',
      studentId,
      studentName: studentInfo?.fullName || 'OpenFrame Learner',
      studentEmail: studentInfo?.email || '',
      registrationNumber: studentInfo?.registrationNumber || `OF-STU-${studentId.slice(0, 6).toUpperCase()}`,
      enrollmentDate: now,
      currentStage: 'VIDEO_LEARNING',
      completedStages: ['COURSE_ENROLLMENT'],
      failedStages: [],
      completedLessonIds: [],
      totalMandatoryLessons: studentInfo?.totalMandatoryLessons || 3,
      overallProgressPercent: 12,
      quizAveragePercent: 0,
      videoSessionsCount: 0,
      quizzesPassed: 0,
      projectApproved: false,
      presentationCompleted: false,
      teacherApproved: false,
      certificateEligible: false,
      certificateIssued: false,
      lastActiveAt: now,
      updatedAt: now,
    };

    initialRecord.eligibilityChecklist = this.evaluateCertificateEligibility(initialRecord);

    try {
      await setDoc(doc(db, 'student_progress', docId), initialRecord, { merge: true });
    } catch (err) {
      console.warn('Initial student_progress creation deferred:', err);
    }

    return initialRecord;
  }

  async saveStudentProgress(record: StudentProgressRecord, allowApprovalFields = false): Promise<void> {
    const docId = sanitizeId(`${record.studentId}_${record.courseId}`);
    const now = new Date().toISOString();
    record.id = docId;
    record.lastActiveAt = now;
    record.updatedAt = now;

    const checklist = this.evaluateCertificateEligibility(record);
    record.eligibilityChecklist = checklist;
    record.certificateEligible = checklist.isEligible;

    // Strip approval-protected keys if non-educator client is updating own progress
    const payload: Record<string, any> = { ...record };
    if (!allowApprovalFields) {
      delete payload.teacherApproved;
      delete payload.adminCertificateApproved;
      delete payload.certificateIssued;
    }

    // Remove undefined keys for Firestore strictness
    Object.keys(payload).forEach((k) => {
      if (payload[k] === undefined) delete payload[k];
    });

    const cleanedPayload = stripUndefinedDeep(payload);

    try {
      await setDoc(doc(db, 'student_progress', docId), cleanedPayload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `student_progress/${docId}`);
    }
  }

  // -------------------------------------------------------------
  // 2. Course Curriculum (Modules & Lessons Organization)
  // -------------------------------------------------------------
  async getCourseCurriculum(course: MarketplaceCourse): Promise<{
    modules: CourseModuleDoc[];
    lessons: LmsLesson[];
  }> {
    let customModules: CourseModuleDoc[] = [];
    let customLessons: LmsLesson[] = [];

    try {
      const mSnap = await getDocs(
        query(collection(db, 'course_modules'), where('courseId', '==', course.id), limit(100))
      );
      customModules = mSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as CourseModuleDoc))
        .sort((a, b) => a.moduleNumber - b.moduleNumber);

      const lSnap = await getDocs(
        query(collection(db, 'lessons'), where('courseId', '==', course.id), limit(250))
      );
      customLessons = lSnap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as LmsLesson))
        .sort((a, b) => (a.moduleNumber || 1) - (b.moduleNumber || 1) || (a.lessonNumber || 1) - (b.lessonNumber || 1));
    } catch (err) {
      console.warn('Reading custom curriculum failed, synthesizing from course blueprint:', err);
    }

    if (customModules.length > 0 && customLessons.length > 0) {
      return { modules: customModules, lessons: customLessons };
    }

    // Synthesize structured modules & lessons cleanly from MarketplaceCourse blueprint
    const fallbackModules: CourseModuleDoc[] = [];
    const fallbackLessons: LmsLesson[] = [];
    const baseModules = course.modules && course.modules.length > 0
      ? course.modules
      : [
          {
            moduleNumber: 1,
            title: `${course.title} Foundations`,
            duration: '2 Weeks',
            lessons: ['Core Concepts & Architecture', 'Tooling & Practical Setup', 'Guided Walkthrough'],
          },
        ];

    baseModules.forEach((mod, mIdx) => {
      const modId = sanitizeId(`${course.id}_mod_${mIdx + 1}`);
      fallbackModules.push({
        id: modId,
        courseId: course.id,
        moduleNumber: mod.moduleNumber || mIdx + 1,
        title: mod.title,
        description: `Module ${mod.moduleNumber || mIdx + 1} covering ${mod.title}`,
        duration: mod.duration || '1 Week',
        createdBy: 'system',
        updatedAt: new Date().toISOString(),
      });

      const lessonItems = mod.lessons && mod.lessons.length > 0
        ? mod.lessons
        : [`${mod.title} - Core Principles`];

      lessonItems.forEach((rawLesson: any, lIdx: number) => {
        const lessonTitle = typeof rawLesson === 'string' ? rawLesson : (rawLesson.title || rawLesson.topicName || `Lesson ${lIdx + 1}`);
        const lessonId = sanitizeId(`${course.id}_l_${mIdx + 1}_${lIdx + 1}`);
        fallbackLessons.push({
          id: lessonId,
          courseId: course.id,
          moduleId: modId,
          moduleNumber: mod.moduleNumber || mIdx + 1,
          moduleTitle: mod.title,
          lessonNumber: lIdx + 1,
          topicName: lessonTitle,
          title: lessonTitle,
          topics: [lessonTitle, ...(course.skillsAcquired || []).slice(0, 3)],
          durationMinutes: 45,
          mandatory: true,
          learningObjectives: course.learningObjectives?.slice(0, 3) || [
            `Understand the foundational principles of ${lessonTitle}`,
            `Apply ${lessonTitle} in a structured practical exercise`,
          ],
          learningMaterials: `Study Guide for ${lessonTitle}: Focus on architectural concepts, measurable performance metrics, and reproducible implementation.`,
          resources: [
            { title: `${course.category} Reference Architecture Guide`, url: `/marketplace/${course.id}`, type: 'Guide' },
            { title: 'Structured Practical Worksheet', url: `/learn/${course.id}?tab=project`, type: 'Assignment' },
          ],
          practicalAssignment: {
            title: `Applied Exercise: ${lessonTitle}`,
            description: `Summarize core design trade-offs and produce a working sample applying ${lessonTitle}.`,
            expectedOutput: 'Short structured architecture note or prototype URL.',
          },
          practicalProject: {
            courseId: course.id,
            lessonId,
            title: `Capstone Project: ${course.title}`,
            description: course.practicalProjects?.[0] || `Deliver an end-to-end implementation for ${course.title}.`,
            objectives: course.learningObjectives?.slice(0, 3) || ['Design', 'Implement', 'Present'],
            instructions: ['Review module concepts', 'Design architecture', 'Implement & test', 'Present outcomes'],
            submissionDeadlineDays: 14,
            evaluationCriteria: [],
            maxMarks: 100,
            difficultyLevel: course.level === 'All Levels' ? 'Intermediate' : course.level,
          },
        });
      });
    });

    return {
      modules: customModules.length > 0 ? customModules : fallbackModules,
      lessons: customLessons.length > 0 ? customLessons : fallbackLessons,
    };
  }

  async saveCourseModule(mod: CourseModuleDoc): Promise<void> {
    const id = sanitizeId(mod.id || `${mod.courseId}_mod_${Date.now()}`);
    try {
      await setDoc(
        doc(db, 'course_modules', id),
        stripUndefinedDeep({ ...mod, id, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `course_modules/${id}`);
    }
  }

  async deleteCourseModule(moduleId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'course_modules', moduleId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `course_modules/${moduleId}`);
    }
  }

  async saveLesson(lesson: LmsLesson): Promise<void> {
    const id = sanitizeId(lesson.id || `${lesson.courseId || 'course'}_l_${Date.now()}`);
    const payload = stripUndefinedDeep({ ...lesson, id, updatedAt: new Date().toISOString() });
    try {
      await setDoc(doc(db, 'lessons', id), payload, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `lessons/${id}`);
    }
  }

  async deleteLesson(lessonId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `lessons/${lessonId}`);
    }
  }

  // -------------------------------------------------------------
  // 3. YouTube Video Learning Sessions (Module 2 — Never Auto-Completed)
  // -------------------------------------------------------------
  async startVideoSession(params: {
    studentId: string;
    courseId: string;
    lessonId: string;
    videoId: string;
    videoTitle: string;
    totalDurationSeconds?: number;
  }): Promise<VideoLearningSession> {
    const now = new Date().toISOString();
    const sessionId = sanitizeId(`vses_${params.studentId}_${params.videoId}_${Date.now()}`);
    const session: VideoLearningSession = {
      id: sessionId,
      sessionId,
      studentId: params.studentId,
      courseId: params.courseId,
      lessonId: params.lessonId,
      videoId: params.videoId,
      videoTitle: params.videoTitle,
      openedAt: now,
      watchDurationSeconds: 0,
      totalDurationSeconds: params.totalDurationSeconds || 1200,
      playbackProgress: 0,
      completed: false,
    };

    try {
      await setDoc(doc(db, 'video_learning_sessions', sessionId), session);
    } catch (err) {
      console.warn('Video session create warning:', err);
    }

    return session;
  }

  async updateVideoPlaybackProgress(
    sessionId: string,
    watchDurationSeconds: number,
    playbackProgress: number
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'video_learning_sessions', sessionId), {
        watchDurationSeconds: Math.round(watchDurationSeconds),
        playbackProgress: Math.min(100, Math.round(playbackProgress)),
      });
    } catch {
      // ignore non-critical tick updates
    }
  }

  async confirmVideoCompletion(
    sessionId: string,
    studentId: string,
    courseId: string,
    lessonId: string,
    watchDurationSeconds: number,
    courseTitle?: string
  ): Promise<StudentProgressRecord> {
    const now = new Date().toISOString();
    try {
      await setDoc(
        doc(db, 'video_learning_sessions', sanitizeId(sessionId)),
        {
          id: sanitizeId(sessionId),
          sessionId: sanitizeId(sessionId),
          studentId,
          courseId,
          lessonId,
          watchDurationSeconds: Math.round(watchDurationSeconds),
          playbackProgress: 100,
          completed: true,
          completedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Video completion update warning:', err);
    }

    const completionId = sanitizeId(`${studentId}_${courseId}_${lessonId}`);
    try {
      await setDoc(
        doc(db, 'lesson_completions', completionId),
        {
          id: completionId,
          studentId,
          courseId,
          lessonId,
          videoCompleted: true,
          quizPassed: false,
          completedAt: now,
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Lesson completion write warning:', err);
    }

    const progress = await this.getStudentProgress(courseId, studentId, { courseTitle });
    if (!progress.completedLessonIds.includes(lessonId)) {
      progress.completedLessonIds = [...progress.completedLessonIds, lessonId];
    }
    progress.videoSessionsCount = (progress.videoSessionsCount || 0) + 1;
    if (!progress.completedStages.includes('VIDEO_LEARNING')) {
      progress.completedStages = [...progress.completedStages, 'VIDEO_LEARNING'];
    }
    if (progress.currentStage === 'COURSE_ENROLLMENT' || progress.currentStage === 'VIDEO_LEARNING') {
      progress.currentStage = 'QUIZ_COMPLETION';
    }
    progress.overallProgressPercent = Math.max(progress.overallProgressPercent || 0, 30);
    await this.saveStudentProgress(progress);
    return progress;
  }

  async getVideoSessions(studentId: string, courseId: string): Promise<VideoLearningSession[]> {
    try {
      const q = query(
        collection(db, 'video_learning_sessions'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch {
      return [];
    }
  }

  // -------------------------------------------------------------
  // 4. AI Verification Quiz Config & Attempts (Module 3)
  // -------------------------------------------------------------
  async getQuizConfig(courseId: string, lessonId: string): Promise<QuizConfigDoc> {
    const configId = sanitizeId(`${courseId}_${lessonId}`);
    try {
      const snap = await getDoc(doc(db, 'quizzes', configId));
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as any) } as QuizConfigDoc;
      }
    } catch {
      // fallback to global defaults
    }

    const global = await this.getLmsGlobalSettings();
    return {
      id: configId,
      courseId,
      lessonId,
      basicCount: global.defaultBasicCount,
      intermediateCount: global.defaultIntermediateCount,
      advancedCount: global.defaultAdvancedCount,
      passingScorePercent: global.defaultPassingScore,
      maxRetakes: global.defaultMaxRetakes,
      timeLimitMinutes: 30,
      updatedBy: 'system',
      updatedAt: new Date().toISOString(),
    };
  }

  async saveQuizConfig(config: QuizConfigDoc): Promise<void> {
    const id = sanitizeId(config.id || `${config.courseId}_${config.lessonId}`);
    try {
      await setDoc(
        doc(db, 'quizzes', id),
        stripUndefinedDeep({ ...config, id, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `quizzes/${id}`);
    }
  }

  async getQuizAttempts(studentId: string, courseId: string, lessonId?: string): Promise<QuizAttempt[]> {
    try {
      const q = query(
        collection(db, 'quiz_attempts'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId),
        limit(50)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as QuizAttempt));
      const filtered = lessonId ? items.filter((a) => a.lessonId === lessonId) : items;
      return filtered.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    } catch {
      return [];
    }
  }

  async saveQuizAttempt(attempt: QuizAttempt, courseTitle?: string): Promise<StudentProgressRecord> {
    const attemptId = sanitizeId(attempt.attemptId || attempt.id || `att_${attempt.studentId}_${Date.now()}`);
    const normalizedAttempt: QuizAttempt = {
      ...attempt,
      id: attemptId,
      attemptId,
      percentageScore: Math.round(attempt.percentageScore ?? attempt.percentage ?? 0),
    };

    try {
      const { responses, ...attemptSummary } = normalizedAttempt;
      await setDoc(doc(db, 'quiz_attempts', attemptId), stripUndefinedDeep(attemptSummary));

      if (responses && responses.length > 0) {
        await setDoc(
          doc(db, 'quiz_responses', `resp_${attemptId}`),
          stripUndefinedDeep({
            id: `resp_${attemptId}`,
            attemptId,
            studentId: attempt.studentId,
            courseId: attempt.courseId,
            lessonId: attempt.lessonId,
            responses,
            createdAt: new Date().toISOString(),
          })
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `quiz_attempts/${attemptId}`);
    }

    const progress = await this.getStudentProgress(attempt.courseId, attempt.studentId, { courseTitle });
    progress.quizAveragePercent = Math.max(progress.quizAveragePercent || 0, normalizedAttempt.percentageScore);

    if (normalizedAttempt.passed) {
      progress.quizzesPassed = (progress.quizzesPassed || 0) + 1;
      progress.failedStages = (progress.failedStages || []).filter((s) => s !== 'QUIZ_COMPLETION');
      const stageSet = new Set<LearningStage>(progress.completedStages);
      stageSet.add('QUIZ_COMPLETION');
      stageSet.add('PROJECT_ASSIGNMENT');
      progress.completedStages = Array.from(stageSet);
      progress.currentStage = 'PROJECT_SUBMISSION';
      progress.overallProgressPercent = Math.max(progress.overallProgressPercent || 0, 50);

      // Update lesson completion
      const completionId = sanitizeId(`${attempt.studentId}_${attempt.courseId}_${attempt.lessonId}`);
      try {
        await setDoc(
          doc(db, 'lesson_completions', completionId),
          {
            id: completionId,
            studentId: attempt.studentId,
            courseId: attempt.courseId,
            lessonId: attempt.lessonId,
            quizPassed: true,
            completedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch {
        // non-blocking
      }

      await this.createNotification({
        id: `notif_${Date.now()}_quiz_pass`,
        recipientId: attempt.studentId,
        recipientEmail: progress.studentEmail,
        recipientRole: 'STUDENT',
        type: 'assessment_result',
        title: `Verification Quiz Passed (${normalizedAttempt.percentageScore}%)`,
        message: `You passed the verification quiz for ${courseTitle || attempt.courseId}. Your unique Practical Project is now unlocked!`,
        actionUrl: `/learn/${attempt.courseId}?tab=project`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    } else {
      const failedSet = new Set<LearningStage>(progress.failedStages || []);
      failedSet.add('QUIZ_COMPLETION');
      progress.failedStages = Array.from(failedSet);
      await this.createNotification({
        id: `notif_${Date.now()}_quiz_fail`,
        recipientId: attempt.studentId,
        recipientEmail: progress.studentEmail,
        recipientRole: 'STUDENT',
        type: 'assessment_result',
        title: `Quiz Revision Needed (${normalizedAttempt.percentageScore}%)`,
        message: 'Review Quinn AI explanations and revisit recommended lesson topics before retaking.',
        actionUrl: `/learn/${attempt.courseId}?tab=quiz`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    }

    await this.saveStudentProgress(progress);
    return progress;
  }

  // -------------------------------------------------------------
  // 5. Practical Project Generator & Submissions (Module 4)
  // -------------------------------------------------------------
  async getOrGenerateProjectBrief(
    course: MarketplaceCourse,
    lessonTopic: string,
    studentId: string,
    lessonId: string
  ): Promise<PracticalProjectDefinition> {
    const projectDocId = sanitizeId(`proj_${studentId}_${course.id}`);
    try {
      const snap = await getDoc(doc(db, 'projects', projectDocId));
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as any) } as PracticalProjectDefinition;
      }
    } catch {
      // continue to generate
    }

    const generated = await quinnAiService.generatePracticalProject({
      courseId: course.id,
      courseTitle: course.title,
      lessonTopic,
      category: course.category,
      variationSeed: `${studentId}-${course.id}-${lessonTopic}`,
    });

    const deadlineDate = new Date(
      Date.now() + (generated.submissionDeadlineDays || 14) * 86400000
    ).toISOString();

    const record: PracticalProjectDefinition = {
      ...generated,
      id: projectDocId,
      projectId: projectDocId,
      courseId: course.id,
      lessonId,
      studentId,
      variationSeed: `${studentId.slice(0, 6)}-${course.id}`,
      deadlineDate,
    };

    try {
      await setDoc(doc(db, 'projects', projectDocId), stripUndefinedDeep(record), { merge: true });
    } catch {
      // non-blocking
    }

    return record;
  }

  async uploadDeliverableFile(
    file: File,
    folder: 'projects' | 'presentations' | 'student-photos'
  ): Promise<{ url: string; fileName: string; size: number }> {
    return uploadDocumentToStorage(file, folder);
  }

  async getProjectSubmissionsForStudent(
    studentId: string,
    courseId?: string
  ): Promise<ProjectSubmission[]> {
    try {
      const q = query(
        collection(db, 'project_submissions'),
        where('studentId', '==', studentId),
        limit(50)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as ProjectSubmission));
      return (courseId ? list.filter((s) => s.courseId === courseId) : list).sort((a, b) =>
        (b.submittedAt || b.submissionDate || '').localeCompare(a.submittedAt || a.submissionDate || '')
      );
    } catch {
      return [];
    }
  }

  async submitPracticalProject(submission: ProjectSubmission): Promise<StudentProgressRecord> {
    const subId = sanitizeId(submission.submissionId || submission.id || `sub_${submission.studentId}_${Date.now()}`);
    const now = new Date().toISOString();
    const record: ProjectSubmission = stripUndefinedDeep({
      ...submission,
      id: subId,
      submissionId: subId,
      submittedAt: submission.submittedAt || now,
      submissionDate: submission.submissionDate || now,
      status: 'Submitted',
    });

    try {
      await setDoc(doc(db, 'project_submissions', subId), record, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `project_submissions/${subId}`);
    }

    const progress = await this.getStudentProgress(record.courseId, record.studentId, {
      fullName: record.studentName,
      courseTitle: record.courseTitle,
    });
    const stages = new Set<LearningStage>(progress.completedStages);
    stages.add('PROJECT_SUBMISSION');
    progress.completedStages = Array.from(stages);
    progress.failedStages = (progress.failedStages || []).filter((s) => s !== 'PROJECT_SUBMISSION');
    progress.currentStage = 'PRESENTATION';
    progress.projectSubmission = record;
    progress.overallProgressPercent = Math.max(progress.overallProgressPercent || 0, 70);
    await this.saveStudentProgress(progress);

    await this.createNotification({
      id: `notif_${Date.now()}_proj`,
      recipientId: record.studentId,
      recipientEmail: progress.studentEmail,
      recipientRole: 'STUDENT',
      type: 'project_assigned',
      title: 'Practical Project Submitted',
      message: 'Your practical project has been uploaded. Complete your Student Presentation next.',
      actionUrl: `/learn/${record.courseId}?tab=presentation`,
      createdAt: now,
      read: false,
    });

    if (progress.assignedTeacherId) {
      await this.createNotification({
        id: `notif_${Date.now()}_tch_proj`,
        recipientId: progress.assignedTeacherId,
        recipientRole: 'TEACHER',
        type: 'teacher_feedback',
        title: `New Project Submission: ${record.studentName}`,
        message: `${record.studentName} submitted "${record.projectTitle || record.courseId}" for evaluation.`,
        actionUrl: '/teacher/dashboard',
        createdAt: now,
        read: false,
      });
    }

    return progress;
  }

  // -------------------------------------------------------------
  // 6. Student Presentation System (Module 5)
  // -------------------------------------------------------------
  async getPresentationsForStudent(
    studentId: string,
    courseId?: string
  ): Promise<StudentPresentation[]> {
    try {
      const q = query(
        collection(db, 'presentations'),
        where('studentId', '==', studentId),
        limit(50)
      );
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as StudentPresentation));
      return (courseId ? list.filter((p) => p.courseId === courseId) : list).sort((a, b) =>
        b.submittedAt.localeCompare(a.submittedAt)
      );
    } catch {
      return [];
    }
  }

  async submitPresentation(presentation: StudentPresentation): Promise<StudentProgressRecord> {
    const presId = sanitizeId(
      presentation.presentationId || presentation.id || `pres_${presentation.studentId}_${Date.now()}`
    );
    const now = new Date().toISOString();

    const isLive = presentation.presentationMethod === 'LIVE_SCHEDULE' || presentation.method === 'live_schedule';
    const record: StudentPresentation = stripUndefinedDeep({
      ...presentation,
      id: presId,
      presentationId: presId,
      submittedAt: presentation.submittedAt || now,
      status: isLive ? 'Scheduled' : 'Submitted',
      meetingLink: isLive
        ? presentation.meetingLink || `https://meet.jit.si/OpenFrame-Defense-${presId}`
        : undefined,
    });

    try {
      await setDoc(doc(db, 'presentations', presId), record, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `presentations/${presId}`);
    }

    const progress = await this.getStudentProgress(record.courseId, record.studentId, {
      fullName: record.studentName,
      courseTitle: record.courseTitle,
    });
    const stages = new Set<LearningStage>(progress.completedStages);
    stages.add('PRESENTATION');
    progress.completedStages = Array.from(stages);
    progress.currentStage = 'TEACHER_EVALUATION';
    progress.presentation = record;
    progress.presentationCompleted = true;
    progress.overallProgressPercent = Math.max(progress.overallProgressPercent || 0, 85);
    await this.saveStudentProgress(progress);

    await this.createNotification({
      id: `notif_${Date.now()}_pres`,
      recipientId: record.studentId,
      recipientEmail: progress.studentEmail,
      recipientRole: 'STUDENT',
      type: 'presentation_schedule',
      title: isLive ? 'Live Presentation Defense Scheduled' : 'Presentation Submitted for Faculty Review',
      message: isLive
        ? `Scheduled for ${record.scheduledDate || record.scheduledTime}. Join room: ${record.meetingLink}`
        : 'Your presentation has been queued for your assigned faculty evaluator.',
      actionUrl: `/learn/${record.courseId}?tab=evaluation`,
      createdAt: now,
      read: false,
    });

    if (record.teacherId || progress.assignedTeacherId) {
      await this.createNotification({
        id: `notif_${Date.now()}_tch_pres`,
        recipientId: (record.teacherId || progress.assignedTeacherId)!,
        recipientRole: 'TEACHER',
        type: 'presentation_schedule',
        title: `Presentation Ready: ${record.studentName}`,
        message: `${record.studentName} submitted a presentation for ${record.courseTitle || record.courseId}.`,
        actionUrl: '/teacher/dashboard',
        createdAt: now,
        read: false,
      });
    }

    return progress;
  }

  // -------------------------------------------------------------
  // 7. Teacher Evaluation Queue, History & Rubric Grading (Module 6)
  // -------------------------------------------------------------
  async getPendingSubmissionsForTeacher(teacherUid?: string, isAdmin = false): Promise<Array<{
    submissionId: string;
    studentId: string;
    studentName: string;
    registrationNumber?: string;
    courseId: string;
    courseTitle: string;
    submittedAt: string;
    type: 'PROJECT' | 'PRESENTATION';
    status: string;
    projectData?: ProjectSubmission;
    presentationData?: StudentPresentation;
  }>> {
    const queue: Array<any> = [];
    let assignedCourses: string[] = [];
    let assignedStudents: string[] = [];

    if (teacherUid && !isAdmin) {
      try {
        const tchSnap = await getDoc(doc(db, 'teacher_profiles', teacherUid));
        if (tchSnap.exists()) {
          const tch = tchSnap.data() as TeacherProfile;
          assignedCourses = tch.assignedCourseIds || [];
          assignedStudents = tch.assignedStudentIds || [];
        }
      } catch {
        // ignore
      }
    }

    const matchesTeacherScope = (studentId: string, courseId: string, itemTeacherId?: string) => {
      if (isAdmin || !teacherUid) return true;
      if (itemTeacherId && itemTeacherId === teacherUid) return true;
      if (assignedCourses.length === 0 && assignedStudents.length === 0) return true;
      return assignedCourses.includes(courseId) || assignedStudents.includes(studentId);
    };

    try {
      const projSnap = await getDocs(query(collection(db, 'project_submissions'), limit(100)));
      projSnap.docs.forEach((d) => {
        const data = { id: d.id, ...(d.data() as any) } as ProjectSubmission;
        const st = (data.status || '').toLowerCase();
        if (st !== 'approved' && st !== 'rejected' && matchesTeacherScope(data.studentId, data.courseId, data.teacherId)) {
          queue.push({
            submissionId: data.submissionId || d.id,
            studentId: data.studentId,
            studentName: data.studentName || 'Student Learner',
            registrationNumber: data.registrationNumber,
            courseId: data.courseId,
            courseTitle: data.courseTitle || data.courseId,
            submittedAt: data.submittedAt || data.submissionDate || new Date().toISOString(),
            type: 'PROJECT',
            status: data.status || 'Submitted',
            projectData: data,
          });
        }
      });

      const presSnap = await getDocs(query(collection(db, 'presentations'), limit(100)));
      presSnap.docs.forEach((d) => {
        const data = { id: d.id, ...(d.data() as any) } as StudentPresentation;
        const st = (data.status || '').toLowerCase();
        if (st !== 'evaluated' && matchesTeacherScope(data.studentId, data.courseId, data.teacherId)) {
          queue.push({
            submissionId: data.presentationId || d.id,
            studentId: data.studentId,
            studentName: data.studentName || 'Student Learner',
            courseId: data.courseId,
            courseTitle: data.courseTitle || data.courseId,
            submittedAt: data.submittedAt || new Date().toISOString(),
            type: 'PRESENTATION',
            status: data.status || 'Submitted',
            presentationData: data,
          });
        }
      });
    } catch (err) {
      console.warn('Error fetching teacher review queue:', err);
    }

    return queue.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  }

  async getEvaluationsHistory(teacherUid?: string, isAdmin = false): Promise<TeacherEvaluation[]> {
    try {
      const snap = await getDocs(query(collection(db, 'teacher_evaluations'), limit(100)));
      const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as TeacherEvaluation));
      const filtered = isAdmin || !teacherUid ? all : all.filter((e) => !e.teacherId || e.teacherId === teacherUid || e.evaluatedBy === teacherUid);
      return filtered.sort((a, b) =>
        (b.evaluatedAt || b.evaluationDate || '').localeCompare(a.evaluatedAt || a.evaluationDate || '')
      );
    } catch {
      return [];
    }
  }

  async submitTeacherEvaluation(evalData: TeacherEvaluation): Promise<{
    evaluation: TeacherEvaluation;
    certificate?: IssuedCertificate;
    eligibility: CertificateEligibilityStatus;
  }> {
    const evalId = sanitizeId(evalData.evaluationId || evalData.id || `eval_${evalData.studentId}_${Date.now()}`);
    const now = new Date().toISOString();
    const decision = evalData.decision || evalData.status || (evalData.isApproved ? 'Approved' : 'Corrections Requested');
    const approved = decision === 'Approved' && evalData.totalScore >= 70;

    const record: TeacherEvaluation = stripUndefinedDeep({
      ...evalData,
      id: evalId,
      evaluationId: evalId,
      decision,
      status: decision,
      isApproved: approved,
      finalized: true,
      evaluatedAt: now,
      evaluationDate: now,
      history: [
        ...(evalData.history || []),
        {
          timestamp: now,
          teacherName: evalData.teacherName,
          totalScore: evalData.totalScore,
          decision,
          feedback: evalData.writtenFeedback,
        },
      ],
    });

    try {
      await setDoc(doc(db, 'teacher_evaluations', evalId), record, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `teacher_evaluations/${evalId}`);
    }

    // Update associated project_submission or presentation status
    try {
      const projRef = doc(db, 'project_submissions', sanitizeId(evalData.submissionId));
      const projSnap = await getDoc(projRef);
      if (projSnap.exists()) {
        await updateDoc(projRef, {
          status: decision,
          evaluationId: evalId,
          reviewedBy: evalData.teacherName,
          reviewDate: now,
        });
      }
    } catch {
      // might be a presentation ID
    }

    try {
      const presRef = doc(db, 'presentations', sanitizeId(evalData.submissionId));
      const presSnap = await getDoc(presRef);
      if (presSnap.exists()) {
        await updateDoc(presRef, {
          status: decision === 'Reassessment Scheduled' ? 'Reassessment Scheduled' : 'Evaluated',
          marksAwarded: evalData.totalScore,
          feedback: evalData.writtenFeedback,
        });
      }
    } catch {
      // non-blocking
    }

    const progress = await this.getStudentProgress(evalData.courseId, evalData.studentId, {
      fullName: evalData.studentName,
      courseTitle: evalData.courseName,
    });

    progress.teacherEvaluation = record;
    progress.projectApproved = approved;
    progress.teacherApproved = approved;
    if (progress.presentation) {
      progress.presentationCompleted = true;
    }

    const stages = new Set<LearningStage>(progress.completedStages);
    if (approved) {
      stages.add('TEACHER_EVALUATION');
      progress.failedStages = (progress.failedStages || []).filter((s) => s !== 'TEACHER_EVALUATION');
    } else {
      const fails = new Set<LearningStage>(progress.failedStages || []);
      fails.add('TEACHER_EVALUATION');
      progress.failedStages = Array.from(fails);
      progress.currentStage = decision === 'Reassessment Scheduled' ? 'PRESENTATION' : 'PROJECT_SUBMISSION';
    }
    progress.completedStages = Array.from(stages);

    const eligibility = this.evaluateCertificateEligibility(progress);
    progress.eligibilityChecklist = eligibility;
    progress.certificateEligible = eligibility.isEligible;

    let certificate: IssuedCertificate | undefined;
    const settings = await this.getLmsGlobalSettings();

    if (eligibility.isEligible) {
      const requireAdmin = settings.requireAdminCertApproval;
      certificate = await this.issueCertificate({
        courseId: evalData.courseId,
        courseTitle: evalData.courseName || progress.courseTitle || evalData.courseId,
        courseDuration: progress.courseDuration,
        studentId: evalData.studentId,
        studentName: evalData.studentName || progress.studentName,
        registrationNumber: evalData.registrationNumber || progress.registrationNumber,
        score: evalData.totalScore,
        teacherId: evalData.teacherId,
        teacherName: evalData.teacherName,
        approvedByAdmin: !requireAdmin,
        certificateType: evalData.certificateType,
        status: requireAdmin ? 'Pending Admin Approval' : 'Issued',
      });
      progress.certificate = certificate;
      progress.certificateId = certificate.certificateId;
      progress.certificateIssued = !requireAdmin;
      progress.adminCertificateApproved = !requireAdmin;
      if (!requireAdmin) {
        stages.add('CERTIFICATE');
        progress.completedStages = Array.from(stages);
        progress.currentStage = 'CERTIFICATE';
        progress.overallProgressPercent = 100;
      } else {
        progress.overallProgressPercent = 95;
      }
    }

    await this.saveStudentProgress(progress, true);

    await this.createNotification({
      id: `notif_${Date.now()}_eval`,
      recipientId: evalData.studentId,
      recipientEmail: progress.studentEmail,
      recipientRole: 'STUDENT',
      type: certificate && certificate.status === 'Issued' ? 'certificate_ready' : 'teacher_feedback',
      title: approved
        ? `Evaluation Approved (${evalData.totalScore}/100)`
        : `Faculty Feedback: ${decision}`,
      message: approved
        ? certificate
          ? certificate.status === 'Issued'
            ? `Your evaluation was approved (${evalData.totalScore}/100). Certificate ${certificate.certificateId} is ready!`
            : `Evaluation approved (${evalData.totalScore}/100). Pending final administrator seal for certificate issuance.`
          : `Evaluation approved (${evalData.totalScore}/100). Complete remaining checklist items to unlock your certificate.`
        : `${decision}: ${evalData.actionItemsRequired || evalData.writtenFeedback}`,
      actionUrl: `/learn/${evalData.courseId}?tab=${certificate ? 'certificate' : 'evaluation'}`,
      createdAt: now,
      read: false,
    });

    return { evaluation: record, certificate, eligibility };
  }

  // -------------------------------------------------------------
  // 8. 6-Condition Certificate Eligibility, Issuance & PDF Verification
  // -------------------------------------------------------------
  evaluateCertificateEligibility(
    progress: StudentProgressRecord,
    passingScore = 70
  ): CertificateEligibilityStatus {
    const requiredLessons = Math.max(1, progress.totalMandatoryLessons || 1);
    const completedLessonsCount = progress.completedLessonIds?.length || 0;
    const allMandatoryLessonsCompleted =
      completedLessonsCount >= 1 &&
      (progress.completedStages.includes('VIDEO_LEARNING') || completedLessonsCount >= requiredLessons);

    const requiredAssessmentsCompleted =
      progress.completedStages.includes('QUIZ_COMPLETION') || (progress.quizzesPassed || 0) >= 1;

    const minimumQuizCriteriaMet = (progress.quizAveragePercent || 0) >= passingScore;

    const projectSubmittedAndApproved = Boolean(
      progress.completedStages.includes('PROJECT_SUBMISSION') &&
        (progress.projectApproved || progress.teacherEvaluation?.isApproved)
    );

    const presentationCompleted = Boolean(
      progress.completedStages.includes('PRESENTATION') || progress.presentationCompleted
    );

    const teacherFinalApprovalGranted = Boolean(
      progress.teacherApproved ||
        (progress.teacherEvaluation?.isApproved && (progress.teacherEvaluation?.totalScore || 0) >= passingScore)
    );

    const isEligible =
      allMandatoryLessonsCompleted &&
      requiredAssessmentsCompleted &&
      minimumQuizCriteriaMet &&
      projectSubmittedAndApproved &&
      presentationCompleted &&
      teacherFinalApprovalGranted;

    return {
      allMandatoryLessonsCompleted,
      requiredAssessmentsCompleted,
      minimumQuizCriteriaMet,
      projectSubmittedAndApproved,
      presentationCompleted,
      teacherFinalApprovalGranted,
      isEligible,
    };
  }

  async issueCertificate(params: {
    courseId: string;
    courseTitle: string;
    courseDuration?: string;
    studentId: string;
    studentName: string;
    registrationNumber?: string;
    score: number;
    teacherId?: string;
    teacherName?: string;
    approvedByAdmin?: boolean;
    adminApproverEmail?: string;
    certificateType?: CertificateType;
    status?: IssuedCertificate['status'];
  }): Promise<IssuedCertificate> {
    const year = new Date().getFullYear();
    const uniqueSuffix = `${Date.now().toString(36).toUpperCase().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
    const certificateId = `OF-CERT-${year}-${uniqueSuffix}`.slice(0, 80);
    const now = new Date().toISOString();

    let grade = 'B (Pass)';
    if (params.score >= 90) grade = 'A+ (Distinction)';
    else if (params.score >= 80) grade = 'A (Excellence)';
    else if (params.score >= 70) grade = 'B+ (Merit)';

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://openframe.edu';
    const verificationUrl = `${origin}/verify-certificate/${certificateId}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        width: 240,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
    } catch (err) {
      console.warn('Local QR generation failed:', err);
    }

    const template = (await this.getCertificateTemplates())[0] || DEFAULT_CERT_TEMPLATE;

    const cert: IssuedCertificate = stripUndefinedDeep({
      id: certificateId,
      certificateId,
      certificateType: params.certificateType || 'Course Completion Certificate',
      studentId: params.studentId,
      studentName: params.studentName,
      registrationNumber: params.registrationNumber || `OF-STU-${params.studentId.slice(0, 6).toUpperCase()}`,
      courseId: params.courseId,
      courseName: params.courseTitle,
      courseTitle: params.courseTitle,
      courseDuration: params.courseDuration || '8 Weeks',
      issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      completionDate: now,
      issuedAt: now,
      finalScore: params.score,
      score: params.score,
      grade,
      teacherId: params.teacherId || 'FACULTY-BOARD',
      teacherName: params.teacherName || 'OpenFrame Academic Evaluator',
      teacherRole: 'Lead Faculty Evaluator',
      approvedByAdmin: params.approvedByAdmin ?? true,
      adminApproverEmail: params.adminApproverEmail,
      templateId: template.id,
      verificationUrl,
      qrVerificationUrl: verificationUrl,
      qrCodeUrl: qrDataUrl,
      accreditationBody: template.accreditationLine,
      authorizedSignatory: `${template.authorizedSignatoryName}, ${template.authorizedSignatoryTitle}`,
      status: params.status || 'Issued',
    });

    try {
      await setDoc(doc(db, 'certificates', certificateId), cert, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `certificates/${certificateId}`);
    }

    return cert;
  }

  async approveCertificateByAdmin(certificateId: string, adminEmail: string): Promise<void> {
    try {
      const ref = doc(db, 'certificates', sanitizeId(certificateId));
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Certificate not found.');
      const cert = snap.data() as IssuedCertificate;
      await updateDoc(ref, {
        status: 'Issued',
        approvedByAdmin: true,
        adminApproverEmail: adminEmail,
      });

      const progress = await this.getStudentProgress(cert.courseId, cert.studentId);
      progress.adminCertificateApproved = true;
      progress.certificateIssued = true;
      progress.currentStage = 'CERTIFICATE';
      if (!progress.completedStages.includes('CERTIFICATE')) {
        progress.completedStages = [...progress.completedStages, 'CERTIFICATE'];
      }
      progress.overallProgressPercent = 100;
      if (progress.certificate) {
        progress.certificate = { ...progress.certificate, status: 'Issued', approvedByAdmin: true };
      }
      await this.saveStudentProgress(progress, true);

      await this.createNotification({
        id: `notif_${Date.now()}_cert_admin`,
        recipientId: cert.studentId,
        recipientEmail: progress.studentEmail,
        recipientRole: 'STUDENT',
        type: 'certificate_ready',
        title: `Official Certificate Approved (${cert.certificateId})`,
        message: `Admin seal applied for ${cert.courseTitle}. Your verified certificate is now live.`,
        actionUrl: `/verify-certificate/${cert.certificateId}`,
        createdAt: new Date().toISOString(),
        read: false,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `certificates/${certificateId}`);
    }
  }

  async revokeCertificate(certificateId: string, adminEmail: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'certificates', sanitizeId(certificateId)), {
        status: 'Revoked',
        adminApproverEmail: adminEmail,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `certificates/${certificateId}`);
    }
  }

  async getCertificate(certificateId: string): Promise<IssuedCertificate | null> {
    const cleanId = certificateId.trim();
    if (!cleanId) return null;
    try {
      const sanitized = sanitizeId(cleanId);
      let snap = await getDoc(doc(db, 'certificates', sanitized));
      let cert: any = null;
      if (snap.exists()) {
        cert = { id: snap.id, ...(snap.data() as any) };
      } else {
        const pubSnap = await getDoc(doc(db, 'certificate_verification', sanitized));
        if (!pubSnap.exists()) return null;
        const p = pubSnap.data() as any;
        cert = {
          id: pubSnap.id,
          certificateId: p.certificateId || sanitized,
          studentId: p.studentId || '',
          studentName: p.studentName || 'Verified Learner',
          courseId: p.courseId || 'school-program',
          courseTitle: p.courseTitle || 'OpenFrame Partner Program',
          courseName: p.courseTitle || 'OpenFrame Partner Program',
          schoolName: p.schoolName,
          teacherName: p.issuerName || 'Authorized Institutional Signatory',
          authorizedSignatory: p.schoolName ? `Issued with ${p.schoolName}` : 'Authorized Signatory · OpenFrame Education',
          accreditationBody: p.schoolName
            ? `OpenFrame School Partner Credential · ${p.schoolName}`
            : 'Academic Alliance with HopeNest Global Foundation',
          certificateType: 'School Partner Completion Credential',
          grade: p.grade || 'Verified',
          score: p.score ?? 100,
          completionDate: p.issueDate || '',
          issuedDate: p.issueDate || '',
          status: p.status || 'Issued',
          revocationReason: p.revocationReason,
          correctionNote: p.correctionNote,
        };
      }

      // Generate QR client-side if not yet stored
      if (!cert.qrCodeUrl && typeof window !== 'undefined') {
        const url = cert.verificationUrl || `${window.location.origin}/verify-certificate/${cert.certificateId}`;
        cert.qrCodeUrl = await QRCode.toDataURL(url, { width: 220, margin: 1 });
      }

      // Log verification scan (non-blocking)
      const logId = `ver_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setDoc(doc(db, 'certificate_verifications', logId), {
        id: logId,
        certificateId: cert.certificateId,
        verifiedAt: new Date().toISOString(),
        source: typeof window !== 'undefined' ? window.location.pathname : 'portal',
      }).catch(() => {});

      return cert as IssuedCertificate;
    } catch (err) {
      console.warn('Certificate verification lookup error:', err);
      return null;
    }
  }

  async getCertificatesForStudent(studentUid: string): Promise<IssuedCertificate[]> {
    try {
      const q = query(collection(db, 'certificates'), where('studentId', '==', studentUid), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as IssuedCertificate));
    } catch {
      return [];
    }
  }

  async getPendingCertificatesForAdmin(): Promise<IssuedCertificate[]> {
    try {
      const snap = await getDocs(query(collection(db, 'certificates'), limit(100)));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as IssuedCertificate))
        .sort((a, b) => (b.issuedAt || b.completionDate || '').localeCompare(a.issuedAt || a.completionDate || ''));
    } catch {
      return [];
    }
  }

  async downloadCertificatePdf(cert: IssuedCertificate): Promise<void> {
    const docPdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = docPdf.internal.pageSize.getWidth();
    const h = docPdf.internal.pageSize.getHeight();

    // Crisp Apple-minimal cream/white credential canvas
    docPdf.setFillColor(255, 255, 255);
    docPdf.rect(0, 0, w, h, 'F');

    // Outer hairline frame + inner border
    docPdf.setDrawColor(15, 23, 42);
    docPdf.setLineWidth(0.8);
    docPdf.rect(10, 10, w - 20, h - 20);
    docPdf.setDrawColor(29, 78, 216);
    docPdf.setLineWidth(0.4);
    docPdf.rect(14, 14, w - 28, h - 28);

    // Header brand block
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(11);
    docPdf.setTextColor(71, 85, 105);
    docPdf.text('OPENFRAME IT SOLUTIONS PRIVATE LIMITED', w / 2, 28, { align: 'center' });

    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(9);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text(
      cert.accreditationBody || 'Academic Alliance with HopeNest Global Foundation',
      w / 2,
      34,
      { align: 'center' }
    );

    // Credential Headline
    const certHeadline = (cert.certificateType || 'Course Completion Certificate').toUpperCase();
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(20);
    docPdf.setTextColor(15, 23, 42);
    docPdf.text(certHeadline, w / 2, 52, { align: 'center' });

    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(11);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text('This credential formally certifies that', w / 2, 66, { align: 'center' });

    // Student Name
    docPdf.setFont('times', 'bold');
    docPdf.setFontSize(30);
    docPdf.setTextColor(29, 78, 216);
    docPdf.text(cert.studentName || 'Verified Learner', w / 2, 82, { align: 'center' });

    docPdf.setDrawColor(203, 213, 225);
    docPdf.line(65, 87, w - 65, 87);

    // Body Statement
    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(11);
    docPdf.setTextColor(51, 65, 85);
    docPdf.text(
      `has successfully completed all mandatory coursework, Quinn AI verification assessments, practical project deliverables,`,
      w / 2,
      98,
      { align: 'center' }
    );
    docPdf.text(
      `and faculty rubric presentation defense with Grade ${cert.grade} (${cert.score ?? cert.finalScore ?? 90}/100) in:`,
      w / 2,
      105,
      { align: 'center' }
    );

    // Course Title
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(18);
    docPdf.setTextColor(15, 23, 42);
    docPdf.text(cert.courseTitle || cert.courseName || cert.courseId, w / 2, 121, {
      align: 'center',
      maxWidth: w - 60,
    });

    // Metadata Footer Grid
    const footerY = 158;
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(9);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text('CERTIFICATE SERIAL', 28, footerY);
    docPdf.text('ISSUE DATE', 28, footerY + 14);

    docPdf.setFont('courier', 'bold');
    docPdf.setFontSize(11);
    docPdf.setTextColor(15, 23, 42);
    docPdf.text(cert.certificateId, 28, footerY + 6);
    docPdf.setFont('helvetica', 'normal');
    const parsedCompletion = cert.completionDate ? new Date(cert.completionDate) : null;
    const safeIssueDate =
      cert.issuedDate ||
      (parsedCompletion && !Number.isNaN(parsedCompletion.getTime())
        ? parsedCompletion.toDateString()
        : new Date().toDateString());
    docPdf.text(safeIssueDate, 28, footerY + 20);

    // Center QR Code
    let qrImage = cert.qrCodeUrl;
    if (!qrImage && typeof window !== 'undefined') {
      const url = cert.verificationUrl || `${window.location.origin}/verify-certificate/${cert.certificateId}`;
      qrImage = await QRCode.toDataURL(url, { width: 200, margin: 1 });
    }
    if (qrImage && qrImage.startsWith('data:image')) {
      docPdf.addImage(qrImage, 'PNG', w / 2 - 15, footerY - 8, 30, 30);
      docPdf.setFont('helvetica', 'normal');
      docPdf.setFontSize(8);
      docPdf.setTextColor(100, 116, 139);
      docPdf.text('Scan to Verify Authenticity', w / 2, footerY + 26, { align: 'center' });
    }

    // Right Signatory
    docPdf.setFont('times', 'italic');
    docPdf.setFontSize(14);
    docPdf.setTextColor(15, 23, 42);
    docPdf.text(cert.teacherName || 'OpenFrame Academic Council', w - 28, footerY + 6, { align: 'right' });
    docPdf.setDrawColor(148, 163, 184);
    docPdf.line(w - 92, footerY + 9, w - 28, footerY + 9);
    docPdf.setFont('helvetica', 'bold');
    docPdf.setFontSize(8);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text(cert.authorizedSignatory || 'Faculty Evaluator & Academic Director', w - 28, footerY + 15, {
      align: 'right',
    });

    docPdf.setFont('helvetica', 'normal');
    docPdf.setFontSize(7.5);
    docPdf.setTextColor(100, 116, 139);
    docPdf.text(
      'Basis: Issued by OpenFrame Education based on internal assessments and coursework completion; not a university degree or external statutory affiliation.',
      w / 2,
      h - 16,
      { align: 'center' }
    );

    docPdf.save(`${cert.certificateId}_OpenFrame_Certificate.pdf`);
  }

  // -------------------------------------------------------------
  // 9. Notifications & Email Dispatch (Module 11)
  // -------------------------------------------------------------
  async getNotifications(recipientId: string, recipientEmail?: string): Promise<LmsNotification[]> {
    const results: LmsNotification[] = [];
    const seenIds = new Set<string>();

    try {
      const q1 = query(
        collection(db, 'notifications'),
        where('recipientId', '==', recipientId),
        limit(40)
      );
      const snap1 = await getDocs(q1);
      snap1.docs.forEach((d) => {
        if (!seenIds.has(d.id)) {
          seenIds.add(d.id);
          results.push({ id: d.id, ...(d.data() as any) });
        }
      });

      if (recipientEmail && recipientEmail !== recipientId) {
        const q2 = query(
          collection(db, 'notifications'),
          where('recipientId', '==', recipientEmail),
          limit(20)
        );
        const snap2 = await getDocs(q2);
        snap2.docs.forEach((d) => {
          if (!seenIds.has(d.id)) {
            seenIds.add(d.id);
            results.push({ id: d.id, ...(d.data() as any) });
          }
        });
      }
    } catch {
      // ignore read errors
    }

    return results.sort((a, b) =>
      (b.createdAt || b.timestamp || '').localeCompare(a.createdAt || a.timestamp || '')
    );
  }

  async markNotificationAsRead(notifId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'notifications', sanitizeId(notifId)), { read: true });
    } catch {
      // non-blocking
    }
  }

  async createNotification(notif: LmsNotification): Promise<void> {
    const id = sanitizeId(notif.id || `notif_${Date.now()}`);
    const payload = stripUndefinedDeep({
      ...notif,
      id,
      createdAt: notif.createdAt || new Date().toISOString(),
      read: notif.read ?? false,
    });

    try {
      await setDoc(doc(db, 'notifications', id), payload, { merge: true });
    } catch (err) {
      console.warn('Notification Firestore write skipped:', err);
    }

    if (notif.recipientEmail) {
      fetch('/api/notifications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: notif.recipientEmail,
          recipientName: notif.recipientRole,
          subject: `[OpenFrame Education] ${notif.title}`,
          message: notif.message,
          type: notif.type,
          actionUrl: notif.actionUrl,
        }),
      }).catch(() => {});
    }
  }

  // -------------------------------------------------------------
  // 10. Parent Portal Linking & Progress Visibility
  // -------------------------------------------------------------
  async linkStudentToParent(
    parentUid: string,
    parentEmail: string,
    parentName: string,
    studentIdentifier: string
  ): Promise<ParentStudentLink> {
    const clean = studentIdentifier.trim();
    if (!clean) throw new Error('Enter your child’s registered email or OpenFrame Student ID (OF-STU-...).');

    let foundStudent: StudentProfile | null = null;

    if (clean.includes('@')) {
      const snap = await getDocs(
        query(collection(db, 'student_profiles'), where('email', '==', clean.toLowerCase()), limit(1))
      );
      if (!snap.empty) {
        foundStudent = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
      }
    } else {
      const snap = await getDocs(
        query(collection(db, 'student_profiles'), where('registrationNumber', '==', clean.toUpperCase()), limit(1))
      );
      if (!snap.empty) {
        foundStudent = { id: snap.docs[0].id, ...(snap.docs[0].data() as any) };
      }
    }

    if (!foundStudent) {
      throw new Error(
        `No active student account found matching "${clean}". Ask your child to sign in to the Student Portal once to activate their registration.`
      );
    }

    const linkId = sanitizeId(`${parentUid}_${foundStudent.uid}`);
    const linkDoc: ParentStudentLink = {
      id: linkId,
      parentUid,
      parentEmail: parentEmail.toLowerCase(),
      parentName,
      studentUid: foundStudent.uid,
      studentName: foundStudent.fullName,
      registrationNumber: foundStudent.registrationNumber,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'parent_links', linkId), linkDoc, { merge: true });
      const userRef = doc(db, 'users', parentUid);
      const uSnap = await getDoc(userRef);
      if (uSnap.exists()) {
        const existingLinked = new Set<string>(uSnap.data().linkedStudentIds || []);
        existingLinked.add(foundStudent.uid);
        await updateDoc(userRef, {
          linkedStudentIds: Array.from(existingLinked),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `parent_links/${linkId}`);
    }

    return linkDoc;
  }

  async getLinkedStudentsForParent(parentUid: string): Promise<ParentStudentLink[]> {
    try {
      const q = query(collection(db, 'parent_links'), where('parentUid', '==', parentUid), limit(20));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch {
      return [];
    }
  }

  async getStudentReportForParent(studentUid: string): Promise<{
    profile: StudentProfile | null;
    progressList: StudentProgressRecord[];
    certificates: IssuedCertificate[];
    quizAttempts: QuizAttempt[];
    evaluations: TeacherEvaluation[];
  }> {
    let profile: StudentProfile | null = null;
    try {
      const pSnap = await getDoc(doc(db, 'student_profiles', studentUid));
      if (pSnap.exists()) profile = pSnap.data() as StudentProfile;
    } catch {
      // ignore
    }

    const [progressList, certificates] = await Promise.all([
      this.getAllStudentProgress(studentUid),
      this.getCertificatesForStudent(studentUid),
    ]);

    let quizAttempts: QuizAttempt[] = [];
    let evaluations: TeacherEvaluation[] = [];
    try {
      const qSnap = await getDocs(
        query(collection(db, 'quiz_attempts'), where('studentId', '==', studentUid), limit(30))
      );
      quizAttempts = qSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

      const eSnap = await getDocs(
        query(collection(db, 'teacher_evaluations'), where('studentId', '==', studentUid), limit(30))
      );
      evaluations = eSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch {
      // ignore
    }

    return { profile, progressList, certificates, quizAttempts, evaluations };
  }

  // -------------------------------------------------------------
  // 11. Admin Control Center (Live Analytics, Settings & Assignments)
  // -------------------------------------------------------------
  async getLmsAnalytics(): Promise<{
    totalEnrollments: number;
    videosCompleted: number;
    quizzesGraded: number;
    quizPassRate: number;
    projectsSubmitted: number;
    evaluationsCompleted: number;
    certificatesIssued: number;
    pendingAdminCertificates: number;
    activeTeachers: number;
    activeStudents: number;
    totalSearches: number;
    completedCoursesCount: number;
    pendingAssessmentsCount: number;
  }> {
    try {
      const [enr, vid, quiz, proj, evals, certs, stu, tch, searches, progSnap, presSnap] = await Promise.all([
        getDocs(query(collection(db, 'course_enrollments'), limit(500))),
        getDocs(query(collection(db, 'video_learning_sessions'), where('completed', '==', true), limit(500))),
        getDocs(query(collection(db, 'quiz_attempts'), limit(500))),
        getDocs(query(collection(db, 'project_submissions'), limit(500))),
        getDocs(query(collection(db, 'teacher_evaluations'), limit(500))),
        getDocs(query(collection(db, 'certificates'), limit(500))),
        getDocs(query(collection(db, 'student_profiles'), limit(500))),
        getDocs(query(collection(db, 'teacher_profiles'), limit(500))),
        getDocs(query(collection(db, 'search_history'), limit(500))).catch(() => ({ size: 0 } as any)),
        getDocs(query(collection(db, 'student_progress'), limit(500))).catch(() => ({ docs: [] } as any)),
        getDocs(query(collection(db, 'presentations'), limit(500))).catch(() => ({ docs: [] } as any)),
      ]);

      const quizDocs = quiz.docs.map((d) => d.data() as QuizAttempt);
      const passedCount = quizDocs.filter((q) => q.passed).length;
      const certDocs = certs.docs.map((d) => d.data() as IssuedCertificate);
      const projDocs = proj.docs.map((d) => d.data() as ProjectSubmission);
      const presDocs = presSnap.docs ? presSnap.docs.map((d: any) => d.data() as StudentPresentation) : [];
      const progDocs = progSnap.docs ? progSnap.docs.map((d: any) => d.data() as StudentProgressRecord) : [];

      const completedCoursesCount = progDocs.filter(
        (p: StudentProgressRecord) =>
          (p.overallProgressPercent || 0) >= 100 ||
          Boolean(p.certificateIssued) ||
          (p.completedStages || []).includes('CERTIFICATE')
      ).length;

      const pendingProjects = projDocs.filter((p) => p.status === 'Submitted' || p.status === 'Under Review').length;
      const pendingPres = presDocs.filter((p: StudentPresentation) => p.status === 'Submitted' || p.status === 'Scheduled').length;

      return {
        totalEnrollments: enr.size,
        videosCompleted: vid.size,
        quizzesGraded: quiz.size,
        quizPassRate: quiz.size > 0 ? Math.round((passedCount / quiz.size) * 100) : 0,
        projectsSubmitted: proj.size,
        evaluationsCompleted: evals.size,
        certificatesIssued: certDocs.filter((c) => c.status === 'Issued' || c.status === 'VERIFIED').length,
        pendingAdminCertificates: certDocs.filter((c) => c.status === 'Pending Admin Approval').length,
        activeStudents: stu.size,
        activeTeachers: tch.size,
        totalSearches: searches.size || 0,
        completedCoursesCount,
        pendingAssessmentsCount: pendingProjects + pendingPres,
      };
    } catch (err) {
      console.warn('Analytics aggregation fallback:', err);
      return {
        totalEnrollments: 0,
        videosCompleted: 0,
        quizzesGraded: 0,
        quizPassRate: 0,
        projectsSubmitted: 0,
        evaluationsCompleted: 0,
        certificatesIssued: 0,
        pendingAdminCertificates: 0,
        activeStudents: 0,
        activeTeachers: 0,
        totalSearches: 0,
        completedCoursesCount: 0,
        pendingAssessmentsCount: 0,
      };
    }
  }

  async getLmsGlobalSettings(): Promise<LmsGlobalSettings> {
    try {
      const snap = await getDoc(doc(db, 'lms_settings', 'global'));
      if (snap.exists()) {
        return { ...DEFAULT_GLOBAL_SETTINGS, ...(snap.data() as any) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_GLOBAL_SETTINGS;
  }

  async saveLmsGlobalSettings(settings: LmsGlobalSettings): Promise<void> {
    try {
      await setDoc(
        doc(db, 'lms_settings', 'global'),
        stripUndefinedDeep({ ...settings, id: 'global', updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'lms_settings/global');
    }
  }

  async getCertificateTemplates(): Promise<CertificateTemplate[]> {
    try {
      const snap = await getDocs(collection(db, 'certificate_templates'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as CertificateTemplate));
      }
    } catch {
      // fallback
    }
    return [DEFAULT_CERT_TEMPLATE];
  }

  async saveCertificateTemplate(tpl: CertificateTemplate): Promise<void> {
    const id = sanitizeId(tpl.id || 'default_2026');
    try {
      await setDoc(
        doc(db, 'certificate_templates', id),
        stripUndefinedDeep({ ...tpl, id, updatedAt: new Date().toISOString() }),
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `certificate_templates/${id}`);
    }
  }

  async getAllStudentProfiles(): Promise<StudentProfile[]> {
    try {
      const snap = await getDocs(query(collection(db, 'student_profiles'), limit(200)));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as StudentProfile));
    } catch {
      return [];
    }
  }

  async getAllTeacherProfiles(): Promise<TeacherProfile[]> {
    try {
      const snap = await getDocs(query(collection(db, 'teacher_profiles'), limit(100)));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as TeacherProfile));
    } catch {
      return [];
    }
  }

  async assignTeacherToStudentOrCourse(params: {
    teacherUid: string;
    teacherName: string;
    studentUid?: string;
    courseId?: string;
  }): Promise<void> {
    const now = new Date().toISOString();
    try {
      const tchRef = doc(db, 'teacher_profiles', sanitizeId(params.teacherUid));
      const tchSnap = await getDoc(tchRef);
      if (tchSnap.exists()) {
        const tch = tchSnap.data() as TeacherProfile;
        const courses = new Set(tch.assignedCourseIds || []);
        const students = new Set(tch.assignedStudentIds || []);
        if (params.courseId) courses.add(params.courseId);
        if (params.studentUid) students.add(params.studentUid);
        await updateDoc(tchRef, {
          assignedCourseIds: Array.from(courses),
          assignedStudentIds: Array.from(students),
          updatedAt: now,
        });
      }

      if (params.studentUid) {
        const stuRef = doc(db, 'student_profiles', sanitizeId(params.studentUid));
        await updateDoc(stuRef, {
          assignedTeacherId: params.teacherUid,
          assignedTeacherName: params.teacherName,
          updatedAt: now,
        });

        if (params.courseId) {
          const progRef = doc(db, 'student_progress', sanitizeId(`${params.studentUid}_${params.courseId}`));
          const progSnap = await getDoc(progRef);
          if (progSnap.exists()) {
            await updateDoc(progRef, {
              assignedTeacherId: params.teacherUid,
              assignedTeacherName: params.teacherName,
              updatedAt: now,
            });
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'teacher_assignment');
    }
  }

  // -------------------------------------------------------------
  // 12. Student Notes, Bookmarks, Search History, Consent & Reports
  // -------------------------------------------------------------
  async saveLessonNote(note: StudentLessonNote): Promise<StudentLessonNote> {
    const id = sanitizeId(note.id || `${note.studentId}_${note.courseId}_${note.lessonId}`);
    const now = new Date().toISOString();
    const record: StudentLessonNote = stripUndefinedDeep({
      ...note,
      id,
      updatedAt: now,
      createdAt: note.createdAt || now,
    });
    try {
      await setDoc(doc(db, 'student_notes', id), record, { merge: true });
    } catch {
      // Fall back to local cache if unauthenticated
    }
    try {
      const key = `openframe_notes_${note.studentId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]') as StudentLessonNote[];
      const next = [record, ...existing.filter((n) => n.id !== id)].slice(0, 100);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore storage error
    }
    return record;
  }

  async getStudentNotes(studentId: string, courseId?: string): Promise<StudentLessonNote[]> {
    const byId = new Map<string, StudentLessonNote>();
    try {
      const key = `openframe_notes_${studentId}`;
      const local = JSON.parse(localStorage.getItem(key) || '[]') as StudentLessonNote[];
      local.forEach((n) => {
        if (!courseId || n.courseId === courseId) byId.set(n.id, n);
      });
    } catch {
      // ignore
    }
    try {
      const q = query(collection(db, 'student_notes'), where('studentId', '==', studentId), limit(100));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const data = { id: d.id, ...(d.data() as any) } as StudentLessonNote;
        if (!courseId || data.courseId === courseId) byId.set(data.id, data);
      });
    } catch {
      // ignore
    }
    return Array.from(byId.values()).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }

  async deleteLessonNote(noteId: string, studentId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'student_notes', sanitizeId(noteId)));
    } catch {
      // ignore
    }
    try {
      const key = `openframe_notes_${studentId}`;
      const local = JSON.parse(localStorage.getItem(key) || '[]') as StudentLessonNote[];
      localStorage.setItem(key, JSON.stringify(local.filter((n) => n.id !== noteId)));
    } catch {
      // ignore
    }
  }

  async toggleLessonBookmark(bookmark: Omit<StudentLessonBookmark, 'id' | 'savedAt'>): Promise<boolean> {
    const id = sanitizeId(`${bookmark.studentId}_${bookmark.courseId}_${bookmark.lessonId}`);
    const existing = await this.getStudentBookmarks(bookmark.studentId);
    const alreadySaved = existing.some((b) => b.id === id);

    if (alreadySaved) {
      try {
        await deleteDoc(doc(db, 'student_bookmarks', id));
      } catch {
        // ignore
      }
      try {
        const key = `openframe_bookmarks_${bookmark.studentId}`;
        localStorage.setItem(key, JSON.stringify(existing.filter((b) => b.id !== id)));
      } catch {
        // ignore
      }
      return false;
    }

    const record: StudentLessonBookmark = stripUndefinedDeep({
      ...bookmark,
      id,
      savedAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'student_bookmarks', id), record, { merge: true });
    } catch {
      // ignore
    }
    try {
      const key = `openframe_bookmarks_${bookmark.studentId}`;
      localStorage.setItem(key, JSON.stringify([record, ...existing].slice(0, 120)));
    } catch {
      // ignore
    }
    return true;
  }

  async getStudentBookmarks(studentId: string): Promise<StudentLessonBookmark[]> {
    const byId = new Map<string, StudentLessonBookmark>();
    try {
      const key = `openframe_bookmarks_${studentId}`;
      const local = JSON.parse(localStorage.getItem(key) || '[]') as StudentLessonBookmark[];
      local.forEach((b) => byId.set(b.id, b));
    } catch {
      // ignore
    }
    try {
      const q = query(collection(db, 'student_bookmarks'), where('studentId', '==', studentId), limit(100));
      const snap = await getDocs(q);
      snap.docs.forEach((d) => {
        const data = { id: d.id, ...(d.data() as any) } as StudentLessonBookmark;
        byId.set(data.id, data);
      });
    } catch {
      // ignore
    }
    return Array.from(byId.values()).sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
  }

  async recordSearchHistory(entry: Omit<SearchHistoryEntry, 'id' | 'searchedAt'>): Promise<void> {
    const id = sanitizeId(`srch_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    const record: SearchHistoryEntry = stripUndefinedDeep({
      ...entry,
      id,
      searchedAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'search_history', id), record);
    } catch {
      // ignore
    }
  }

  async getSearchHistory(userId?: string, maxCount = 50): Promise<SearchHistoryEntry[]> {
    try {
      const q = userId
        ? query(collection(db, 'search_history'), where('userId', '==', userId), limit(maxCount))
        : query(collection(db, 'search_history'), limit(maxCount));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SearchHistoryEntry))
        .sort((a, b) => (b.searchedAt || '').localeCompare(a.searchedAt || ''));
    } catch {
      return [];
    }
  }

  async recordConsentRecord(record: Omit<ConsentRecord, 'id' | 'recordedAt'>): Promise<void> {
    const id = sanitizeId(`consent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    const payload: ConsentRecord = stripUndefinedDeep({
      ...record,
      id,
      recordedAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'consent_records', id), payload);
    } catch {
      // non-blocking
    }
  }

  async saveAiLearningPath(path: AiLearningPath): Promise<AiLearningPath> {
    const id = sanitizeId(path.id || `ai_path_${Date.now()}`);
    const payload: AiLearningPath = stripUndefinedDeep({
      ...path,
      id,
      updatedAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'ai_learning_paths', id), payload, { merge: true });
    } catch {
      // ignore if offline
    }
    return payload;
  }

  async getAiLearningPaths(maxCount = 30): Promise<AiLearningPath[]> {
    try {
      const snap = await getDocs(query(collection(db, 'ai_learning_paths'), limit(maxCount)));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as AiLearningPath))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch {
      return [];
    }
  }

  async approveAiLearningPath(pathId: string, approved: boolean): Promise<void> {
    try {
      await updateDoc(doc(db, 'ai_learning_paths', sanitizeId(pathId)), {
        approvedByAdmin: approved,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }

  async submitContentReport(report: Omit<ContentReport, 'id' | 'status' | 'createdAt'>): Promise<ContentReport> {
    const id = sanitizeId(`rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    const payload: ContentReport = stripUndefinedDeep({
      ...report,
      id,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'content_reports', id), payload);
    } catch (err) {
      console.warn('Report submit warning:', err);
    }
    return payload;
  }

  async getContentReports(maxCount = 50): Promise<ContentReport[]> {
    try {
      const snap = await getDocs(query(collection(db, 'content_reports'), limit(maxCount)));
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as ContentReport))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } catch {
      return [];
    }
  }

  async updateContentReportStatus(reportId: string, status: ContentReport['status']): Promise<void> {
    try {
      await updateDoc(doc(db, 'content_reports', sanitizeId(reportId)), { status });
    } catch {
      // ignore
    }
  }

  async getStudentExtendedAnalyticsData(studentUid: string): Promise<{
    quizAttempts: QuizAttempt[];
    videoSessions: VideoLearningSession[];
    projectSubmissions: ProjectSubmission[];
    presentations: StudentPresentation[];
    evaluations: TeacherEvaluation[];
    notes: StudentLessonNote[];
    bookmarks: StudentLessonBookmark[];
    searchHistory: SearchHistoryEntry[];
  }> {
    const [quizSnap, vidSnap, projSnap, presSnap, evalSnap, notes, bookmarks, searchHistory] = await Promise.all([
      getDocs(query(collection(db, 'quiz_attempts'), where('studentId', '==', studentUid), limit(100))).catch(() => null),
      getDocs(query(collection(db, 'video_learning_sessions'), where('studentId', '==', studentUid), limit(150))).catch(() => null),
      getDocs(query(collection(db, 'project_submissions'), where('studentId', '==', studentUid), limit(50))).catch(() => null),
      getDocs(query(collection(db, 'presentations'), where('studentId', '==', studentUid), limit(50))).catch(() => null),
      getDocs(query(collection(db, 'teacher_evaluations'), where('studentId', '==', studentUid), limit(50))).catch(() => null),
      this.getStudentNotes(studentUid),
      this.getStudentBookmarks(studentUid),
      this.getSearchHistory(studentUid, 40),
    ]);

    return {
      quizAttempts: quizSnap ? quizSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as QuizAttempt)) : [],
      videoSessions: vidSnap ? vidSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as VideoLearningSession)) : [],
      projectSubmissions: projSnap ? projSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as ProjectSubmission)) : [],
      presentations: presSnap ? presSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as StudentPresentation)) : [],
      evaluations: evalSnap ? evalSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as TeacherEvaluation)) : [],
      notes,
      bookmarks,
      searchHistory,
    };
  }

  async getSystemTelemetry(): Promise<ApiUsageTelemetry | null> {
    try {
      const res = await fetch('/api/system/telemetry');
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return null;
  }

  // ====================================================
  // Q&A HISTORY (/qa_history) & DISCOVERY ANALYTICS (/recommendation_analytics)
  // ====================================================

  async saveQaEntry(entry: Omit<QaSavedRecord, 'id' | 'savedAt'>): Promise<QaSavedRecord> {
    if (!entry.studentId) throw new Error('Authentication required to save Q&A answers.');
    const id = sanitizeId(`qa_${entry.studentId.slice(0, 16)}_${Date.now().toString(36)}`);
    const payload: QaSavedRecord = stripUndefinedDeep({
      ...entry,
      id,
      savedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'qa_history', id), payload);
    return payload;
  }

  async getQaHistory(studentId: string, maxCount = 50): Promise<QaSavedRecord[]> {
    if (!studentId) return [];
    try {
      const snap = await getDocs(
        query(collection(db, 'qa_history'), where('studentId', '==', studentId), limit(maxCount))
      );
      return snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as QaSavedRecord))
        .sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    } catch {
      return [];
    }
  }

  async deleteQaEntry(id: string): Promise<void> {
    if (!id) return;
    await deleteDoc(doc(db, 'qa_history', sanitizeId(id)));
  }

  async logDiscoveryAnalyticsEvent(
    event: Omit<RecommendationAnalyticsEvent, 'id' | 'createdAt'>
  ): Promise<void> {
    const id = sanitizeId(`ana_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`);
    const payload: RecommendationAnalyticsEvent = stripUndefinedDeep({
      ...event,
      id,
      query: String(event.query || '').slice(0, 240),
      createdAt: new Date().toISOString(),
    });
    try {
      await setDoc(doc(db, 'recommendation_analytics', id), payload);
    } catch {
      // Non-blocking telemetry
    }
  }

  async getDiscoveryAnalyticsSummary(): Promise<{
    totalSearches: number;
    totalEvents: number;
    totalEnrollments: number;
    youtubeClicks: number;
    qaCount: number;
    topSearchedSubjects: Array<{ label: string; count: number }>;
    popularDegrees: Array<{ label: string; count: number }>;
    topRequestedSkills: Array<{ label: string; count: number }>;
    recentEvents: RecommendationAnalyticsEvent[];
  }> {
    const [searchSnap, eventSnap, enrollSnap] = await Promise.all([
      getDocs(query(collection(db, 'search_history'), limit(300))).catch(() => null),
      getDocs(query(collection(db, 'recommendation_analytics'), limit(500))).catch(() => null),
      getDocs(query(collection(db, 'course_enrollments'), limit(500))).catch(() => null),
    ]);

    const searches = searchSnap ? searchSnap.docs.map((d) => d.data() as SearchHistoryEntry) : [];
    const events = eventSnap
      ? eventSnap.docs
          .map((d) => d.data() as RecommendationAnalyticsEvent)
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      : [];
    const enrollments = enrollSnap ? enrollSnap.docs.map((d) => d.data() as any) : [];

    const subjectMap = new Map<string, number>();
    const degreeMap = new Map<string, number>();
    const skillMap = new Map<string, number>();

    searches.forEach((s) => {
      const q = String(s.query || '').trim();
      if (q) subjectMap.set(q, (subjectMap.get(q) || 0) + 1);
    });

    let youtubeClicks = 0;
    let qaCount = 0;
    events.forEach((e) => {
      if (e.eventType === 'youtube_watch') youtubeClicks++;
      if (e.eventType === 'qa_ask') qaCount++;
      if (e.subject) skillMap.set(e.subject, (skillMap.get(e.subject) || 0) + 1);
      if (e.degreeOrClass) degreeMap.set(e.degreeOrClass, (degreeMap.get(e.degreeOrClass) || 0) + 1);
      if (e.query && e.eventType === 'search') {
        subjectMap.set(e.query, (subjectMap.get(e.query) || 0) + 1);
      }
    });

    const sortMap = (m: Map<string, number>) =>
      Array.from(m.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    return {
      totalSearches: searches.length,
      totalEvents: events.length,
      totalEnrollments: enrollments.length,
      youtubeClicks,
      qaCount,
      topSearchedSubjects: sortMap(subjectMap),
      popularDegrees: sortMap(degreeMap),
      topRequestedSkills: sortMap(skillMap),
      recentEvents: events.slice(0, 20),
    };
  }
}

export const lmsService = new LmsService();
