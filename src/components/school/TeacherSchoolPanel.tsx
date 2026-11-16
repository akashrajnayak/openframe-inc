import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  FileText,
  Presentation,
  HelpCircle,
  Award,
  Video,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Plus,
  Calendar,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  SCHOOL_BOARDS,
  SCHOOL_CLASSES,
  getSubjectsForSelection,
} from '../../data/schoolCurriculumData';
import {
  getAllSchoolEnrollments,
  getSchoolAssignments,
  createSchoolAssignment,
  getSchoolSubmissions,
  evaluateSchoolHomework,
  getSchoolPresentations,
  updateSchoolPresentationEvaluation,
  getSchoolQuizAttempts,
  updateSchoolQuizReviewByTeacher,
  getSchoolMarks,
  recordSchoolMark,
  markSchoolAttendance,
  getSchoolAttendance,
  getSchoolLiveClasses,
  createSchoolLiveClass,
  getSchoolMessagesForUser,
  sendSchoolParentTeacherMessage,
  computeBoardGrade,
} from '../../services/schoolService';
import { evaluatePresentationWithAI } from '../../services/schoolAiService';
import {
  SchoolStudentEnrollment,
  SchoolAssignment,
  SchoolSubmission,
  SchoolPresentationItem,
  SchoolQuizAttempt,
  SchoolMarkEntry,
  SchoolAttendanceRecord,
  SchoolLiveClass,
  SchoolParentTeacherMessage,
  SchoolBoardId,
  SchoolClassId,
  SchoolMarksCategory,
} from '../../types';

interface Props {
  teacherUid: string;
  teacherName: string;
  onStatus?: (msg: string) => void;
}

type SchoolFacultyTab =
  | 'students'
  | 'assignments'
  | 'presentations'
  | 'quizzes'
  | 'marks'
  | 'live_classes'
  | 'messages';

const MARKS_CATEGORIES: SchoolMarksCategory[] = [
  'Quiz',
  'Chapter Test',
  'Assignment',
  'Monthly Test',
  'Quarterly Exam',
  'Half-Yearly Exam',
  'Annual Exam',
  'Practical',
  'Project',
  'Presentation',
];

export const TeacherSchoolPanel: React.FC<Props> = ({
  teacherUid,
  teacherName,
  onStatus,
}) => {
  const [subTab, setSubTab] = useState<SchoolFacultyTab>('students');
  const [loading, setLoading] = useState(true);

  const [enrollments, setEnrollments] = useState<SchoolStudentEnrollment[]>([]);
  const [assignments, setAssignments] = useState<SchoolAssignment[]>([]);
  const [submissions, setSubmissions] = useState<SchoolSubmission[]>([]);
  const [presentations, setPresentations] = useState<SchoolPresentationItem[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<SchoolQuizAttempt[]>([]);
  const [marks, setMarks] = useState<SchoolMarkEntry[]>([]);
  const [attendance, setAttendance] = useState<SchoolAttendanceRecord[]>([]);
  const [liveClasses, setLiveClasses] = useState<SchoolLiveClass[]>([]);
  const [messages, setMessages] = useState<SchoolParentTeacherMessage[]>([]);

  // Context filter
  const [filterBoard, setFilterBoard] = useState<SchoolBoardId | 'ALL'>('ALL');
  const [filterClass, setFilterClass] = useState<SchoolClassId | 'ALL'>('ALL');

  // Create assignment form
  const [asgBoard, setAsgBoard] = useState<SchoolBoardId>('CBSE');
  const [asgClass, setAsgClass] = useState<SchoolClassId>('8');
  const [asgSubject, setAsgSubject] = useState('Mathematics');
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDue, setAsgDue] = useState(() =>
    new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );
  const [asgMaxMarks, setAsgMaxMarks] = useState(20);

  // Homework evaluation state
  const [evalSub, setEvalSub] = useState<SchoolSubmission | null>(null);
  const [hwMarks, setHwMarks] = useState(16);
  const [hwComment, setHwComment] = useState('Well structured response. Keep practicing step-by-step derivations.');
  const [hwStatus, setHwStatus] = useState<SchoolSubmission['status']>('Evaluated');

  // Presentation 7-criteria evaluation modal state
  const [evalPres, setEvalPres] = useState<SchoolPresentationItem | null>(null);
  const [presRubric, setPresRubric] = useState({
    subjectKnowledge: 12,
    understanding: 13,
    communication: 12,
    creativity: 12,
    confidence: 13,
    accuracy: 13,
    presentationQuality: 8,
  });
  const [presFeedback, setPresFeedback] = useState('');
  const [aiAssistingPres, setAiAssistingPres] = useState(false);

  // Quiz subjective review state
  const [reviewQuiz, setReviewQuiz] = useState<SchoolQuizAttempt | null>(null);
  const [quizOverrides, setQuizOverrides] = useState<Record<string, number>>({});
  const [quizTeacherRemarks, setQuizTeacherRemarks] = useState('');

  // Record marks form
  const [markStudentUid, setMarkStudentUid] = useState('');
  const [markSubject, setMarkSubject] = useState('Mathematics');
  const [markCategory, setMarkCategory] = useState<SchoolMarksCategory>('Monthly Test');
  const [markTitle, setMarkTitle] = useState('Monthly Assessment 1');
  const [markObtained, setMarkObtained] = useState(42);
  const [markMax, setMarkMax] = useState(50);

  // Schedule live class form
  const [liveBoard, setLiveBoard] = useState<SchoolBoardId>('CBSE');
  const [liveClassId, setLiveClassId] = useState<SchoolClassId>('8');
  const [liveSubject, setLiveSubject] = useState('Mathematics');
  const [liveTopic, setLiveTopic] = useState('');
  const [liveWhen, setLiveWhen] = useState(() =>
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [liveDuration, setLiveDuration] = useState(45);
  const [liveUrl, setLiveUrl] = useState('');

  // Parent-teacher message reply
  const [replyParentUid, setReplyParentUid] = useState('');
  const [replyText, setReplyText] = useState('');

  const notify = (msg: string) => {
    if (onStatus) onStatus(msg);
  };

  const loadAllSchoolFacultyData = async () => {
    setLoading(true);
    const [enr, asgs, subs, pres, qz, mrks, att, live, msgs] = await Promise.all([
      getAllSchoolEnrollments(),
      getSchoolAssignments(),
      getSchoolSubmissions(),
      getSchoolPresentations(),
      getSchoolQuizAttempts(),
      getSchoolMarks(),
      getSchoolAttendance(),
      getSchoolLiveClasses(),
      getSchoolMessagesForUser(teacherUid),
    ]);
    setEnrollments(enr);
    setAssignments(asgs);
    setSubmissions(subs);
    setPresentations(pres);
    setQuizAttempts(qz);
    setMarks(mrks);
    setAttendance(att);
    setLiveClasses(live);
    setMessages(msgs);
    if (enr.length > 0 && !markStudentUid) {
      setMarkStudentUid(enr[0].studentUid);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAllSchoolFacultyData();
  }, [teacherUid]);

  const filteredEnrollments = useMemo(
    () =>
      enrollments.filter(
        (e) =>
          (filterBoard === 'ALL' || e.boardId === filterBoard) &&
          (filterClass === 'ALL' || e.classId === filterClass)
      ),
    [enrollments, filterBoard, filterClass]
  );

  const asgSubjectOptions = useMemo(
    () =>
      getSubjectsForSelection({
        boardId: asgBoard,
        classId: asgClass,
        stream: asgClass === '11' || asgClass === '12' ? 'Science' : 'General',
        medium: 'English Medium',
      }),
    [asgBoard, asgClass]
  );

  const handleMarkAttendance = async (
    student: SchoolStudentEnrollment,
    status: SchoolAttendanceRecord['status']
  ) => {
    const today = new Date().toISOString().slice(0, 10);
    await markSchoolAttendance({
      studentId: student.studentUid,
      studentName: student.studentName,
      boardId: student.boardId,
      classId: student.classId,
      date: today,
      status,
      learningMinutesToday: student.totalLearningMinutes || 30,
      markedBy: teacherName,
    });
    const refreshed = await getSchoolAttendance();
    setAttendance(refreshed);
    notify(`Marked ${student.studentName} as ${status} for ${today}.`);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;
    await createSchoolAssignment({
      boardId: asgBoard,
      classId: asgClass,
      subjectId: `${asgBoard}_${asgClass}_${asgSubject}`.toLowerCase().replace(/\s+/g, '_'),
      subjectName: asgSubject,
      title: asgTitle.trim(),
      description: asgDesc.trim() || `Complete homework assignment for ${asgSubject}.`,
      dueDate: asgDue,
      maxMarks: asgMaxMarks,
      allowedFormats: ['Written', 'PDF', 'Photo', 'Audio', 'Video'],
      assignedByUid: teacherUid,
      assignedByName: teacherName,
    });
    setAsgTitle('');
    setAsgDesc('');
    setAssignments(await getSchoolAssignments());
    notify(`School assignment published for Class ${asgClass} (${asgBoard}).`);
  };

  const handleSaveHomeworkEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalSub) return;
    await evaluateSchoolHomework(evalSub.id, {
      marksAwarded: hwMarks,
      teacherComment: hwComment,
      evaluatedBy: teacherName,
      status: hwStatus,
    });
    setEvalSub(null);
    setSubmissions(await getSchoolSubmissions());
    notify(`Homework graded for ${evalSub.studentName} (${hwMarks}/${evalSub.maxMarks}).`);
  };

  const handleAiAssistPresentation = async () => {
    if (!evalPres) return;
    setAiAssistingPres(true);
    try {
      const draft = await evaluatePresentationWithAI({
        topicTitle: evalPres.topicTitle,
        presentationType: evalPres.presentationType,
        subjectName: evalPres.subjectName,
        classId: evalPres.classId,
        summaryNotes: evalPres.summaryNotes,
        externalUrl: evalPres.externalUrl || evalPres.fileUrl,
      });
      if (draft?.rubric) {
        setPresRubric({
          subjectKnowledge: Number(draft.rubric.subjectKnowledge ?? 12),
          understanding: Number(draft.rubric.understanding ?? 12),
          communication: Number(draft.rubric.communication ?? 12),
          creativity: Number(draft.rubric.creativity ?? 12),
          confidence: Number(draft.rubric.confidence ?? 12),
          accuracy: Number(draft.rubric.accuracy ?? 12),
          presentationQuality: Number(draft.rubric.presentationQuality ?? 8),
        });
      }
      if (draft?.aiSuggestedFeedback) {
        setPresFeedback(draft.aiSuggestedFeedback);
      }
    } catch {
      notify('AI draft unavailable right now. You may score the rubric directly.');
    } finally {
      setAiAssistingPres(false);
    }
  };

  const presTotal =
    presRubric.subjectKnowledge +
    presRubric.understanding +
    presRubric.communication +
    presRubric.creativity +
    presRubric.confidence +
    presRubric.accuracy +
    presRubric.presentationQuality;

  const handleSavePresentationEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evalPres) return;
    await updateSchoolPresentationEvaluation(evalPres.id, {
      rubric: presRubric,
      totalMarks: presTotal,
      maxMarks: 100,
      teacherFeedback: presFeedback,
      evaluatedBy: teacherName,
      status: 'Evaluated',
    });
    setEvalPres(null);
    setPresentations(await getSchoolPresentations());
    notify(`Presentation evaluated for ${evalPres.studentName}: ${presTotal}/100.`);
  };

  const handleOpenQuizReview = (attempt: SchoolQuizAttempt) => {
    setReviewQuiz(attempt);
    const map: Record<string, number> = {};
    for (const g of attempt.itemGrades || []) {
      map[g.questionId] = g.awardedMarks;
    }
    setQuizOverrides(map);
    setQuizTeacherRemarks(attempt.teacherRemarks || 'Reviewed and verified by faculty.');
  };

  const handleSaveQuizReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewQuiz) return;
    const updatedGrades = (reviewQuiz.itemGrades || []).map((g) => {
      const nextMarks = Math.min(g.maxMarks, Math.max(0, Number(quizOverrides[g.questionId] ?? g.awardedMarks)));
      return {
        ...g,
        awardedMarks: nextMarks,
        isCorrect: nextMarks >= g.maxMarks * 0.5,
      };
    });
    const totalAwarded = updatedGrades.reduce((acc, g) => acc + g.awardedMarks, 0);
    const percentage = reviewQuiz.totalMax > 0 ? Math.round((totalAwarded / reviewQuiz.totalMax) * 100) : 0;

    await updateSchoolQuizReviewByTeacher(reviewQuiz.id, {
      itemGrades: updatedGrades,
      totalAwarded,
      percentage,
      teacherReviewedBy: teacherName,
      teacherRemarks: quizTeacherRemarks,
    });
    setReviewQuiz(null);
    setQuizAttempts(await getSchoolQuizAttempts());
    notify(`Quiz marks finalized for ${reviewQuiz.studentName}: ${totalAwarded}/${reviewQuiz.totalMax} (${percentage}%).`);
  };

  const handleRecordMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = enrollments.find((s) => s.studentUid === markStudentUid);
    if (!stu) return;
    await recordSchoolMark({
      studentId: stu.studentUid,
      studentName: stu.studentName,
      boardId: stu.boardId,
      classId: stu.classId,
      academicYear: stu.academicYear,
      subjectId: `${stu.boardId}_${stu.classId}_${markSubject}`.toLowerCase().replace(/\s+/g, '_'),
      subjectName: markSubject,
      category: markCategory,
      examTitle: markTitle.trim() || markCategory,
      marksObtained: Number(markObtained),
      maxMarks: Number(markMax),
      recordedBy: teacherName,
    });
    setMarks(await getSchoolMarks());
    const pct = markMax > 0 ? Math.round((markObtained / markMax) * 100) : 0;
    const { grade } = computeBoardGrade(stu.boardId, pct);
    notify(`Recorded ${markObtained}/${markMax} (${grade}) in ${markSubject} for ${stu.studentName}.`);
  };

  const handleScheduleLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTopic.trim()) return;
    const autoRoom = `https://meet.jit.si/OpenFrame-${liveBoard}-${liveClassId}-${Date.now().toString().slice(-5)}`;
    await createSchoolLiveClass({
      boardId: liveBoard,
      classId: liveClassId,
      subjectName: liveSubject,
      topicTitle: liveTopic.trim(),
      teacherUid,
      teacherName,
      scheduledAt: new Date(liveWhen).toISOString(),
      durationMinutes: liveDuration,
      meetingUrl: liveUrl.trim() || autoRoom,
      sessionType: 'Live Lecture',
      status: 'Scheduled',
    });
    setLiveTopic('');
    setLiveUrl('');
    setLiveClasses(await getSchoolLiveClasses());
    notify(`Live session scheduled for Class ${liveClassId} (${liveSubject}).`);
  };

  const handleSendParentMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyParentUid || !replyText.trim()) return;
    const threadMsg = messages.find((m) => m.parentUid === replyParentUid);
    await sendSchoolParentTeacherMessage({
      parentUid: replyParentUid,
      parentName: threadMsg?.parentName || 'Parent Guardian',
      teacherUid,
      teacherName,
      studentId: threadMsg?.studentId || '',
      studentName: threadMsg?.studentName || 'Student',
      senderRole: 'teacher',
      message: replyText.trim(),
    });
    setReplyText('');
    setMessages(await getSchoolMessagesForUser(teacherUid));
    notify('Message sent to parent.');
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
        Loading School LKG–12 faculty records...
      </div>
    );
  }

  const pendingQuizCount = quizAttempts.filter((q) => q.pendingTeacherReview).length;
  const pendingSubCount = submissions.filter((s) => s.status === 'Submitted').length;
  const pendingPresCount = presentations.filter((p) => p.status !== 'Evaluated').length;

  return (
    <div className="space-y-6">
      {/* Sub-navigation bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            School Education Faculty Workspace (LKG – 12th Standard)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Board-isolated homework, 7-criteria presentation rubrics, editable subjective quizzes, 10-category exam marks, attendance & live sessions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
          {[
            { id: 'students', label: `Students (${enrollments.length})`, icon: Users },
            { id: 'assignments', label: `Homework (${pendingSubCount})`, icon: FileText },
            { id: 'presentations', label: `Presentations (${pendingPresCount})`, icon: Presentation },
            { id: 'quizzes', label: `Quiz Review (${pendingQuizCount})`, icon: HelpCircle },
            { id: 'marks', label: 'Marks & Grades', icon: Award },
            { id: 'live_classes', label: 'Live Classes', icon: Video },
            { id: 'messages', label: `Parent Chat (${messages.length})`, icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id as SchoolFacultyTab)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB: STUDENTS & DAILY ATTENDANCE */}
      {subTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900">Enrolled School Learners & Attendance</h3>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={filterBoard}
                onChange={(e) => setFilterBoard(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Boards</option>
                {SCHOOL_BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>{b.shortName}</option>
                ))}
              </select>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white"
              >
                <option value="ALL">All Classes (LKG–12)</option>
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredEnrollments.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-500">
              No students match the selected board/class filter yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-5 font-semibold">Student</th>
                    <th className="py-3 px-5 font-semibold">Board / Class</th>
                    <th className="py-3 px-5 font-semibold">Medium / Language</th>
                    <th className="py-3 px-5 font-semibold">XP & Streak</th>
                    <th className="py-3 px-5 font-semibold">Today Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEnrollments.map((stu) => {
                    const today = new Date().toISOString().slice(0, 10);
                    const todayRec = attendance.find(
                      (a) => a.studentId === stu.studentUid && a.date === today
                    );
                    return (
                      <tr key={stu.studentUid} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5">
                          <div className="font-semibold text-slate-900">{stu.studentName}</div>
                          <div className="text-slate-500">{stu.studentEmail}</div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700">
                          {stu.boardId} · Class {stu.classId} ({stu.stream})
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {stu.medium} · {stu.preferredLanguage}
                        </td>
                        <td className="py-3.5 px-5 tabular-nums font-semibold text-slate-800">
                          {stu.xpPoints || 0} XP · {stu.streakDays || 1}d streak
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5">
                            {(['Present', 'Online Attended', 'Late', 'Absent'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleMarkAttendance(stu, st)}
                                className={`px-2.5 py-1 rounded-lg font-medium border transition-colors ${
                                  todayRec?.status === st
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {st === 'Online Attended' ? 'Online' : st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: ASSIGNMENTS & HOMEWORK GRADING */}
      {subTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <form onSubmit={handleCreateAssignment} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Publish School Assignment</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Board</label>
                <select
                  value={asgBoard}
                  onChange={(e) => setAsgBoard(e.target.value as SchoolBoardId)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  {SCHOOL_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>{b.shortName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={asgClass}
                  onChange={(e) => setAsgClass(e.target.value as SchoolClassId)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Prescribed Subject</label>
              <select
                value={asgSubject}
                onChange={(e) => setAsgSubject(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-xl"
              >
                {asgSubjectOptions.map((s) => (
                  <option key={s.id} value={s.name.English}>{s.name.English}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assignment Title *</label>
              <input
                type="text"
                required
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                placeholder="e.g. Solve Worksheet on Linear Equations"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instructions</label>
              <textarea
                rows={3}
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={asgDue}
                  onChange={(e) => setAsgDue(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={asgMaxMarks}
                  onChange={(e) => setAsgMaxMarks(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Assignment</span>
            </button>
          </form>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Student Homework Submissions ({submissions.length})</h3>
              <span className="text-slate-500">{assignments.length} active assignments</span>
            </div>
            {submissions.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No homework submissions received yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <div key={sub.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">
                        {sub.assignmentTitle} · {sub.studentName}
                      </div>
                      <div className="text-slate-500">
                        {sub.boardId} · Class {sub.classId} · Format: {sub.submissionType} · Status: {sub.status}
                      </div>
                      {sub.writtenAnswer && (
                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl mt-1 max-w-xl">
                          {sub.writtenAnswer}
                        </p>
                      )}
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open {sub.fileName || 'Attachment'}</span>
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEvalSub(sub);
                        setHwMarks(sub.marksAwarded ?? Math.round(sub.maxMarks * 0.8));
                        setHwComment(sub.teacherComment || 'Accurate steps and neat work.');
                        setHwStatus('Evaluated');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shrink-0"
                    >
                      {sub.status === 'Evaluated' ? `Edit Grade (${sub.marksAwarded}/${sub.maxMarks})` : 'Grade Homework'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PRESENTATIONS (7 CRITERIA + AI ASSIST + EDITABLE MARKS) */}
      {subTab === 'presentations' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden text-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Student Presentations & Oral Explanations</h3>
            <span className="text-slate-500">7-Criteria 100-Mark Rubric · Editable Teacher Final Marks</span>
          </div>
          {presentations.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No student presentations submitted yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {presentations.map((p) => (
                <div key={p.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {p.topicTitle} · {p.studentName}
                    </div>
                    <div className="text-slate-500">
                      {p.subjectName} · Class {p.classId} ({p.boardId}) · {p.presentationType} · {p.status}
                    </div>
                    <p className="text-slate-600 max-w-2xl">{p.summaryNotes}</p>
                    {(p.externalUrl || p.fileUrl) && (
                      <a
                        href={p.externalUrl || p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Slides / Video Link</span>
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEvalPres(p);
                      setPresRubric(
                        p.rubric || {
                          subjectKnowledge: 12,
                          understanding: 13,
                          communication: 12,
                          creativity: 12,
                          confidence: 13,
                          accuracy: 13,
                          presentationQuality: 8,
                        }
                      );
                      setPresFeedback(p.teacherFeedback || p.aiSuggestedFeedback || 'Clear articulation and solid concept accuracy.');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shrink-0"
                  >
                    {p.status === 'Evaluated' ? `Edit Rubric (${p.totalMarks}/100)` : 'Evaluate 7 Criteria'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: SUBJECTIVE QUIZ REVIEWS */}
      {subTab === 'quizzes' && (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden text-xs">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Student Quizzes & Editable Subjective Reviews</h3>
            <span className="text-slate-500">AI evaluations remain drafts until teacher approval/edit</span>
          </div>
          {quizAttempts.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No school quiz attempts recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {quizAttempts.map((q) => (
                <div key={q.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900 text-sm">
                      {q.studentName} · {q.subjectName} ({q.quizMode})
                    </div>
                    <div className="text-slate-500">
                      {q.boardId} · Class {q.classId} · Language: {q.language} ·{' '}
                      <span className={q.pendingTeacherReview ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                        {q.pendingTeacherReview ? 'Pending Teacher Review' : 'Finalized'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right tabular-nums">
                      <div className="font-bold text-slate-900 text-sm">{q.totalAwarded}/{q.totalMax}</div>
                      <div className="text-slate-500">{q.percentage}%</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenQuizReview(q)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
                    >
                      Review / Edit Marks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: 10-CATEGORY MARKS ENTRY */}
      {subTab === 'marks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <form onSubmit={handleRecordMark} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Record Exam / Assessment Mark</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student</label>
              <select
                value={markStudentUid}
                onChange={(e) => setMarkStudentUid(e.target.value)}
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {enrollments.length === 0 && <option value="">No enrolled school students yet</option>}
                {enrollments.map((s) => (
                  <option key={s.studentUid} value={s.studentUid}>
                    {s.studentName} ({s.boardId} · Class {s.classId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category (10 Types)</label>
              <select
                value={markCategory}
                onChange={(e) => setMarkCategory(e.target.value as SchoolMarksCategory)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {MARKS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={markSubject}
                onChange={(e) => setMarkSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assessment Title</label>
              <input
                type="text"
                required
                value={markTitle}
                onChange={(e) => setMarkTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  min={0}
                  value={markObtained}
                  onChange={(e) => setMarkObtained(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Marks</label>
                <input
                  type="number"
                  min={1}
                  value={markMax}
                  onChange={(e) => setMarkMax(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!markStudentUid}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              Save Grade Entry
            </button>
          </form>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Recorded School Marksheet Entries ({marks.length})</h3>
            </div>
            {marks.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No marks recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5 font-semibold">Student</th>
                      <th className="py-3 px-5 font-semibold">Subject / Category</th>
                      <th className="py-3 px-5 font-semibold">Marks</th>
                      <th className="py-3 px-5 font-semibold">Board Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {marks.map((m) => (
                      <tr key={m.id}>
                        <td className="py-3 px-5 font-semibold text-slate-900">{m.studentName}</td>
                        <td className="py-3 px-5 text-slate-600">
                          {m.subjectName} · {m.category} ({m.examTitle})
                        </td>
                        <td className="py-3 px-5 tabular-nums font-semibold">
                          {m.marksObtained}/{m.maxMarks} ({m.percentage}%)
                        </td>
                        <td className="py-3 px-5 font-bold text-blue-600">{m.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: LIVE CLASSES */}
      {subTab === 'live_classes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <form onSubmit={handleScheduleLiveClass} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Schedule Live Class / Doubt Clinic</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Board</label>
                <select
                  value={liveBoard}
                  onChange={(e) => setLiveBoard(e.target.value as SchoolBoardId)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  {SCHOOL_BOARDS.map((b) => (
                    <option key={b.id} value={b.id}>{b.shortName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={liveClassId}
                  onChange={(e) => setLiveClassId(e.target.value as SchoolClassId)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                >
                  {SCHOOL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={liveSubject}
                onChange={(e) => setLiveSubject(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Topic Title *</label>
              <input
                type="text"
                required
                value={liveTopic}
                onChange={(e) => setLiveTopic(e.target.value)}
                placeholder="e.g. Board Exam Numericals Doubt Clinic"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={liveWhen}
                  onChange={(e) => setLiveWhen(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={liveDuration}
                  onChange={(e) => setLiveDuration(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custom Meeting URL (Optional)</label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="Auto-generates secure Jitsi classroom if empty"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
            >
              Schedule Live Classroom
            </button>
          </form>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Scheduled Live Sessions ({liveClasses.length})</h3>
            </div>
            {liveClasses.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No live classes scheduled yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {liveClasses.map((lc) => (
                  <div key={lc.id} className="p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{lc.topicTitle}</div>
                      <div className="text-slate-500 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                          {lc.boardId} · Class {lc.classId} · {lc.subjectName} · {new Date(lc.scheduledAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <a
                      href={lc.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5 shrink-0"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Room</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PARENT-TEACHER CHAT */}
      {subTab === 'messages' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-slate-900">Parent–Teacher Communication</h3>
          {messages.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No parent messages yet. Messages sent by parents from the Parent Portal appear here.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setReplyParentUid(m.parentUid)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                    m.senderRole === 'teacher'
                      ? 'bg-blue-50 border-blue-100 ml-8'
                      : 'bg-slate-50 border-slate-200 mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                    <span>
                      {m.senderRole === 'teacher' ? `You (${m.teacherName})` : `${m.parentName} (Parent of ${m.studentName})`}
                    </span>
                    <span className="text-slate-400 font-normal">{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-700">{m.message}</p>
                </div>
              ))}
            </div>
          )}

          {messages.length > 0 && (
            <form onSubmit={handleSendParentMessage} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100">
              <select
                value={replyParentUid}
                onChange={(e) => setReplyParentUid(e.target.value)}
                required
                className="px-3 py-2 border border-slate-200 rounded-xl"
              >
                <option value="">Select Parent Thread...</option>
                {Array.from(new Map(messages.map((m) => [m.parentUid, m])).values()).map((m) => (
                  <option key={m.parentUid} value={m.parentUid}>
                    {m.parentName} ({m.studentName})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write academic update or response to parent..."
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
              >
                Send Reply
              </button>
            </form>
          )}
        </div>
      )}

      {/* HOMEWORK GRADING MODAL */}
      {evalSub && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveHomeworkEval} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 text-xs shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Grade Homework · {evalSub.studentName}</h3>
            <p className="text-slate-500">{evalSub.assignmentTitle}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marks Awarded (Max {evalSub.maxMarks})</label>
                <input
                  type="number"
                  min={0}
                  max={evalSub.maxMarks}
                  value={hwMarks}
                  onChange={(e) => setHwMarks(Number(e.target.value))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Decision</label>
                <select
                  value={hwStatus}
                  onChange={(e) => setHwStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  <option value="Evaluated">Evaluated</option>
                  <option value="Corrections Requested">Corrections Requested</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teacher Feedback</label>
              <textarea
                rows={3}
                value={hwComment}
                onChange={(e) => setHwComment(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEvalSub(null)} className="px-4 py-2 border border-slate-200 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold">
                Save Grade
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7-CRITERIA PRESENTATION RUBRIC MODAL */}
      {evalPres && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSavePresentationEval} className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">7-Criteria Presentation Rubric · {evalPres.studentName}</h3>
                <p className="text-slate-500">{evalPres.topicTitle} ({evalPres.subjectName})</p>
              </div>
              <div className="text-right tabular-nums">
                <div className="text-slate-400">Editable Total</div>
                <div className="text-xl font-bold text-blue-600">{presTotal}/100</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
              <span className="text-slate-600">Optional AI Rubric Draft (teachers can edit every score below)</span>
              <button
                type="button"
                disabled={aiAssistingPres}
                onClick={handleAiAssistPresentation}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{aiAssistingPres ? 'Drafting...' : 'AI Draft Scores'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'subjectKnowledge', label: '1. Subject Knowledge', max: 15 },
                { key: 'understanding', label: '2. Understanding', max: 15 },
                { key: 'communication', label: '3. Communication', max: 15 },
                { key: 'creativity', label: '4. Creativity', max: 15 },
                { key: 'confidence', label: '5. Confidence', max: 15 },
                { key: 'accuracy', label: '6. Accuracy', max: 15 },
                { key: 'presentationQuality', label: '7. Presentation Quality', max: 10 },
              ].map((crit) => {
                const val = (presRubric as any)[crit.key] as number;
                return (
                  <div key={crit.key} className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>{crit.label}</span>
                      <span className="tabular-nums">{val}/{crit.max}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={crit.max}
                      value={val}
                      onChange={(e) =>
                        setPresRubric((prev) => ({ ...prev, [crit.key]: Number(e.target.value) }))
                      }
                      className="w-full accent-blue-600"
                    />
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Final Faculty Feedback</label>
              <textarea
                rows={3}
                required
                value={presFeedback}
                onChange={(e) => setPresFeedback(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEvalPres(null)} className="px-4 py-2 border border-slate-200 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold">
                Save Final Marks
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QUIZ SUBJECTIVE REVIEW MODAL */}
      {reviewQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveQuizReview} className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Quiz Answer Review · {reviewQuiz.studentName}</h3>
                <p className="text-slate-500">{reviewQuiz.subjectName} · {reviewQuiz.quizMode}</p>
              </div>
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>Teacher Editable Marks</span>
              </span>
            </div>

            <div className="space-y-3">
              {(reviewQuiz.itemGrades || []).map((g, idx) => {
                const questionObj = reviewQuiz.questions?.find((qq) => qq.id === g.questionId);
                return (
                  <div key={g.questionId} className="p-3.5 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="font-semibold text-slate-900">
                      Q{idx + 1}. {questionObj?.questionText || g.questionId}
                    </div>
                    <div className="text-slate-600">
                      Student Answer: <span className="font-medium text-slate-900">{reviewQuiz.studentAnswers?.[g.questionId] || 'No response'}</span>
                    </div>
                    <div className="text-slate-500">{g.feedback}</div>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="font-semibold text-slate-700">Awarded Marks (Max {g.maxMarks}):</label>
                      <input
                        type="number"
                        min={0}
                        max={g.maxMarks}
                        step="0.5"
                        value={quizOverrides[g.questionId] ?? g.awardedMarks}
                        onChange={(e) =>
                          setQuizOverrides((p) => ({ ...p, [g.questionId]: Number(e.target.value) }))
                        }
                        className="w-20 p-1.5 border border-slate-200 rounded-lg tabular-nums font-semibold"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teacher Remarks</label>
              <input
                type="text"
                value={quizTeacherRemarks}
                onChange={(e) => setQuizTeacherRemarks(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setReviewQuiz(null)} className="px-4 py-2 border border-slate-200 rounded-xl">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Finalize Student Quiz Marks</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
