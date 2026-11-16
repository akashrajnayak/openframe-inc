import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Send,
  CreditCard,
  BookOpen
} from 'lucide-react';
import {
  SCHOOL_BOARDS,
  SCHOOL_CLASSES,
} from '../../data/schoolCurriculumData';
import {
  getSchoolEnrollment,
  getStudentSchoolProgress,
  getSchoolMarks,
  getSchoolAttendance,
  getSchoolExaminations,
  getSchoolSubmissions,
  getSchoolPresentations,
  getSchoolFees,
  getSchoolMessagesForUser,
  sendSchoolParentTeacherMessage,
  computeBoardGrade,
  exportSchoolReportCardPdf,
} from '../../services/schoolService';
import {
  SchoolStudentEnrollment,
  SchoolConceptProgress,
  SchoolMarkEntry,
  SchoolAttendanceRecord,
  SchoolExamination,
  SchoolSubmission,
  SchoolPresentationItem,
  SchoolFeeRecord,
  SchoolParentTeacherMessage,
} from '../../types';

interface Props {
  studentUid: string;
  studentNameFallback: string;
  parentUid: string;
  parentName: string;
}

export const ParentSchoolPanel: React.FC<Props> = ({
  studentUid,
  studentNameFallback,
  parentUid,
  parentName,
}) => {
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<SchoolStudentEnrollment | null>(null);
  const [progress, setProgress] = useState<SchoolConceptProgress[]>([]);
  const [marks, setMarks] = useState<SchoolMarkEntry[]>([]);
  const [attendance, setAttendance] = useState<SchoolAttendanceRecord[]>([]);
  const [exams, setExams] = useState<SchoolExamination[]>([]);
  const [submissions, setSubmissions] = useState<SchoolSubmission[]>([]);
  const [presentations, setPresentations] = useState<SchoolPresentationItem[]>([]);
  const [fees, setFees] = useState<SchoolFeeRecord[]>([]);
  const [messages, setMessages] = useState<SchoolParentTeacherMessage[]>([]);

  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!studentUid) return;
    let active = true;

    async function load() {
      setLoading(true);
      const enr = await getSchoolEnrollment(studentUid);
      const [prog, mrks, att, exms, subs, pres, feeList, msgs] = await Promise.all([
        getStudentSchoolProgress(studentUid),
        getSchoolMarks(studentUid),
        getSchoolAttendance(studentUid),
        enr ? getSchoolExaminations(enr.boardId, enr.classId) : getSchoolExaminations(),
        getSchoolSubmissions(studentUid),
        getSchoolPresentations(studentUid),
        getSchoolFees(studentUid),
        getSchoolMessagesForUser(parentUid),
      ]);
      if (!active) return;
      setEnrollment(enr);
      setProgress(prog);
      setMarks(mrks);
      setAttendance(att);
      setExams(exms);
      setSubmissions(subs);
      setPresentations(pres);
      setFees(feeList);
      setMessages(msgs);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [studentUid, parentUid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setSending(true);
    await sendSchoolParentTeacherMessage({
      parentUid,
      parentName,
      teacherUid: 'school-faculty-desk',
      teacherName: 'School Academic Faculty',
      studentId: studentUid,
      studentName: enrollment?.studentName || studentNameFallback,
      senderRole: 'parent',
      message: newMessage.trim(),
    });
    setNewMessage('');
    setMessages(await getSchoolMessagesForUser(parentUid));
    setSending(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-6 text-xs text-slate-500">
        Loading School Education (LKG–12) report...
      </div>
    );
  }

  const boardObj = SCHOOL_BOARDS.find((b) => b.id === (enrollment?.boardId || 'CBSE')) || SCHOOL_BOARDS[1];
  const classObj = SCHOOL_CLASSES.find((c) => c.id === (enrollment?.classId || '8')) || SCHOOL_CLASSES[9];

  const attendancePct =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === 'Present' || a.status === 'Online Attended').length /
            attendance.length) *
            100
        )
      : 100;

  const avgScore =
    marks.length > 0
      ? Math.round(marks.reduce((acc, m) => acc + (m.percentage || 0), 0) / marks.length)
      : 0;
  const overallGrade = computeBoardGrade(boardObj.id, avgScore).grade;

  const weakConcepts = progress.filter((p) => p.needsSupport || p.status === 'Needs Revision');
  const masteredCount = progress.filter((p) => p.status === 'Mastered').length;

  return (
    <div className="space-y-6">
      {/* Header Summary Strip */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-600 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>School Education LKG–12 Monitor</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {enrollment ? `${enrollment.studentName} · ${classObj.label} (${boardObj.shortName})` : `${studentNameFallback} · Not Yet Enrolled in School Module`}
            </h2>
            {enrollment && (
              <p className="text-xs text-slate-500">
                {enrollment.academicYear} · {enrollment.medium} · Preferred Language: {enrollment.preferredLanguage}
              </p>
            )}
          </div>

          {enrollment && (
            <button
              type="button"
              onClick={() =>
                exportSchoolReportCardPdf({
                  studentName: enrollment.studentName,
                  boardName: boardObj.name,
                  classLabel: classObj.label,
                  academicYear: enrollment.academicYear,
                  medium: enrollment.medium,
                  marks,
                  overallPercent: avgScore,
                  overallGrade,
                  attendancePercent: attendancePct,
                })
              }
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report Card PDF</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-slate-500">Attendance Rate</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{attendancePct}%</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-slate-500">Concepts Mastered</div>
            <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
              {masteredCount}/{progress.length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-slate-500">Overall Grade</div>
            <div className="text-xl font-bold text-blue-600 mt-1 tabular-nums">
              {marks.length > 0 ? `${avgScore}% (${overallGrade})` : 'Pending'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-slate-500">Learning Streak</div>
            <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
              {enrollment?.streakDays || 0} days · {enrollment?.xpPoints || 0} XP
            </div>
          </div>
        </div>
      </div>

      {/* Marks, Weak Concepts & Exam Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Marks & Homework Evaluations</span>
          </h3>
          {marks.length === 0 && submissions.length === 0 && presentations.length === 0 ? (
            <p className="text-slate-500">No school assessments graded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {marks.slice(0, 6).map((m) => (
                <div key={m.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{m.subjectName} · {m.category}</div>
                    <div className="text-slate-500">{m.examTitle}</div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="font-bold text-slate-900">{m.marksObtained}/{m.maxMarks}</span>
                    <span className="text-blue-600 font-semibold ml-2">{m.grade}</span>
                  </div>
                </div>
              ))}
              {submissions.slice(0, 3).map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{s.assignmentTitle} (Homework)</div>
                    <div className="text-slate-500">{s.teacherComment || s.status}</div>
                  </div>
                  <div className="tabular-nums font-semibold text-slate-800">
                    {s.marksAwarded !== undefined ? `${s.marksAwarded}/${s.maxMarks}` : s.status}
                  </div>
                </div>
              ))}
              {presentations.slice(0, 3).map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{p.topicTitle} (Presentation)</div>
                    <div className="text-slate-500">{p.teacherFeedback || p.status}</div>
                  </div>
                  <div className="tabular-nums font-semibold text-slate-800">
                    {p.totalMarks !== undefined ? `${p.totalMarks}/${p.maxMarks}` : p.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Revision Focus & Weak Area Alerts</span>
            </h3>
            {weakConcepts.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All practiced concepts are currently on track with no flagged weak areas.</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {weakConcepts.map((wc) => (
                  <li key={wc.id} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950">
                    <span className="font-semibold">{wc.conceptTitle}</span> · Status: {wc.status}
                    {wc.latestQuizScore !== undefined ? ` (${wc.latestQuizScore}%)` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Upcoming Exams & Fee Status</span>
            </h3>
            {exams.length === 0 ? (
              <p className="text-slate-500">No upcoming board/school exams posted yet.</p>
            ) : (
              <div className="space-y-2">
                {exams.slice(0, 4).map((ex) => (
                  <div key={ex.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-900">{ex.subjectName} · {ex.title}</span>
                    <span className="text-slate-500 tabular-nums">{ex.examDate}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <div className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                <span>School Fee Records</span>
              </div>
              {fees.length === 0 ? (
                <p className="text-slate-500">No fee invoices recorded for this student.</p>
              ) : (
                fees.map((f) => (
                  <div key={f.id} className="flex items-center justify-between py-1">
                    <span>{f.termName} · ₹{f.amount.toLocaleString('en-IN')}</span>
                    <span className={f.status === 'Paid' ? 'text-emerald-600 font-semibold' : 'text-amber-600 font-semibold'}>
                      {f.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Parent-Teacher Communication */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          <span>Parent–Teacher Direct Communication</span>
        </h3>
        {messages.length > 0 && (
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border ${
                  m.senderRole === 'parent'
                    ? 'bg-blue-50 border-blue-100 ml-8'
                    : 'bg-slate-50 border-slate-200 mr-8'
                }`}
              >
                <div className="flex items-center justify-between font-semibold text-slate-800 mb-1">
                  <span>{m.senderRole === 'parent' ? 'You' : m.teacherName}</span>
                  <span className="text-slate-400 font-normal">{new Date(m.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-700">{m.message}</p>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message to your child's school faculty..."
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
