import React, { useState, useEffect } from 'react';
import {
  Users,
  Link2,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  ExternalLink,
  Star,
  CalendarCheck,
  CreditCard,
  Bell,
  MessageSquare,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../router/RouterContext';
import { lmsService } from '../services/lmsService';
import { getSchoolAttendance, getSchoolMarks, getSchoolFees } from '../services/schoolService';
import { ParentSchoolPanel } from '../components/school/ParentSchoolPanel';
import { SocialAppShell, WorkspaceNavItem } from '../components/workspace/SocialAppShell';
import { DonutRingChart, MiniBarChart } from '../components/workspace/DashboardCharts';
import {
  ParentStudentLink,
  StudentProfile,
  StudentProgressRecord,
  IssuedCertificate,
  QuizAttempt,
  TeacherEvaluation,
  LearningStage,
  LmsNotification,
} from '../types';

interface ParentAttendanceEntry {
  id: string;
  date: string;
  status: string;
  remarks?: string;
}

interface ParentResultEntry {
  id: string;
  examTitle: string;
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
}

interface ParentFeeEntry {
  id: string;
  receiptNumber: string;
  description: string;
  amount: number;
  status: string;
}

const TRACK_STAGES: Array<{ id: LearningStage; label: string }> = [
  { id: 'COURSE_ENROLLMENT', label: 'Enrolled' },
  { id: 'VIDEO_LEARNING', label: 'Videos' },
  { id: 'QUIZ_COMPLETION', label: 'Quiz' },
  { id: 'PROJECT_ASSIGNMENT', label: 'Assigned' },
  { id: 'PROJECT_SUBMISSION', label: 'Project' },
  { id: 'PRESENTATION', label: 'Presentation' },
  { id: 'TEACHER_EVALUATION', label: 'Evaluated' },
  { id: 'CERTIFICATE', label: 'Certified' },
];

type ParentNavId =
  | 'my_children'
  | 'academic_progress'
  | 'attendance'
  | 'examination_results'
  | 'teacher_communication'
  | 'fee_information'
  | 'my_profile';

export const ParentDashboardPage: React.FC = () => {
  const { currentUser, lmsUser, logout, loading: authLoading } = useAuth();
  const { navigate } = useRouter();

  const [activeNav, setActiveNav] = useState<ParentNavId>('my_children');
  const [linkedStudents, setLinkedStudents] = useState<ParentStudentLink[]>([]);
  const [selectedStudentUid, setSelectedStudentUid] = useState<string>('');
  const [report, setReport] = useState<{
    profile: StudentProfile | null;
    progressList: StudentProgressRecord[];
    certificates: IssuedCertificate[];
    quizAttempts: QuizAttempt[];
    evaluations: TeacherEvaluation[];
  } | null>(null);

  const [linkInput, setLinkInput] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [childAttendance, setChildAttendance] = useState<ParentAttendanceEntry[]>([]);
  const [childResults, setChildResults] = useState<ParentResultEntry[]>([]);
  const [childPayments, setChildPayments] = useState<ParentFeeEntry[]>([]);
  const [childNotifications, setChildNotifications] = useState<LmsNotification[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadLinks() {
      setLoading(true);
      const links = await lmsService.getLinkedStudentsForParent(currentUser!.uid);
      setLinkedStudents(links);
      if (links.length > 0) {
        setSelectedStudentUid(links[0].studentUid);
      }
      setLoading(false);
    }
    loadLinks();
  }, [currentUser, authLoading]);

  useEffect(() => {
    if (!selectedStudentUid) {
      setReport(null);
      return;
    }
    let active = true;
    async function loadReport() {
      const [data, schAtt, schMarks, schFees, notifs] = await Promise.all([
        lmsService.getStudentReportForParent(selectedStudentUid),
        getSchoolAttendance(selectedStudentUid).catch(() => []),
        getSchoolMarks(selectedStudentUid).catch(() => []),
        getSchoolFees(selectedStudentUid).catch(() => []),
        lmsService.getNotifications(selectedStudentUid).catch(() => []),
      ]);
      if (!active) return;
      setReport(data);
      setChildAttendance(
        schAtt.map((a) => ({
          id: a.id,
          date: a.date,
          status: a.status === 'Online Attended' ? 'Present' : a.status || 'Present',
          remarks: `${a.learningMinutesToday || 0} min logged`,
        }))
      );
      setChildResults(
        schMarks.map((m) => ({
          id: m.id,
          examTitle: m.examTitle || 'School Assessment',
          subjectName: m.subjectName,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
          grade: m.grade,
        }))
      );
      setChildPayments(
        schFees.map((f) => ({
          id: f.id,
          receiptNumber: f.receiptNumber || f.id,
          description: `${f.termName} (${f.academicYear})`,
          amount: f.amount,
          status: f.status === 'Paid' || f.status === 'Scholarship Covered' ? 'Paid' : 'Pending',
        }))
      );
      setChildNotifications(notifs);
    }
    loadReport();
    return () => {
      active = false;
    };
  }, [selectedStudentUid]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLinkError(null);
    setLinkSuccess(null);
    setLinking(true);
    try {
      const created = await lmsService.linkStudentToParent(
        currentUser.uid,
        currentUser.email || '',
        lmsUser?.displayName || currentUser.displayName || 'Parent Guardian',
        linkInput
      );
      const updated = await lmsService.getLinkedStudentsForParent(currentUser.uid);
      setLinkedStudents(updated);
      setSelectedStudentUid(created.studentUid);
      setLinkInput('');
      setLinkSuccess(`Linked ${created.studentName} (${created.registrationNumber}) successfully.`);
    } catch (err: any) {
      setLinkError(err?.message || 'Could not link student account.');
    } finally {
      setLinking(false);
    }
  };

  const avgQuiz =
    report && report.quizAttempts.length > 0
      ? Math.round(
          report.quizAttempts.reduce((acc, q) => acc + (q.percentageScore ?? 0), 0) /
            report.quizAttempts.length
        )
      : 0;

  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#123D32]/10 text-[#123D32] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-editorial font-semibold text-[#18221F]">
            Parent Progress &amp; Engagement Portal
          </h1>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Sign in with your Parent account to view your child’s courses, quiz scores, attendance, faculty evaluations, and verified certificates.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate('/portal/parent')}
              className="flex-1 py-2.5 px-4 bg-[#123D32] hover:bg-[#0D2E25] text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Sign In as Parent
            </button>
            <Link
              to="/"
              className="py-2.5 px-4 border border-slate-200 text-[#18221F] hover:bg-[#FAF7F2] rounded-xl text-xs font-semibold"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems: WorkspaceNavItem[] = [
    { id: 'my_children', label: 'My Children', icon: Users, badge: linkedStudents.length },
    { id: 'academic_progress', label: 'Academic Progress', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, badge: childAttendance.length },
    { id: 'examination_results', label: 'Examination Results', icon: Award, badge: childResults.length },
    { id: 'teacher_communication', label: 'Teacher Updates', icon: MessageSquare, badge: childNotifications.length },
    { id: 'fee_information', label: 'Fee Information', icon: CreditCard },
    { id: 'my_profile', label: 'My Profile', icon: UserCheck },
  ];

  const avgCompletion =
    report && report.progressList.length > 0
      ? Math.round(
          report.progressList.reduce((sum, p) => sum + (p.overallProgressPercent || 0), 0) /
            report.progressList.length
        )
      : 0;
  const presentSessions = childAttendance.filter((a) => a.status === 'Present').length;
  const attendancePct = childAttendance.length > 0 ? Math.round((presentSessions / childAttendance.length) * 100) : 0;

  return (
    <SocialAppShell
      roleLabel="Parent Guardian"
      userName={lmsUser?.displayName || currentUser?.displayName || 'Parent Guardian'}
      userEmail={lmsUser?.email || currentUser?.email || ''}
      navItems={navItems}
      activeNavId={activeNav}
      onSelectNav={(id) => setActiveNav(id as ParentNavId)}
      notifications={childNotifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        read: n.read,
      }))}
      onLogout={() => logout().then(() => navigate('/portal'))}
    >
      <div className="space-y-6">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
              Guardian Engagement Workspace
            </div>
            <h1 className="text-xl sm:text-2xl font-editorial font-semibold text-[#18221F] mt-1">
              Welcome, {lmsUser?.displayName || currentUser?.displayName || 'Parent Guardian'}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Track real-time coursework milestones, quiz averages, attendance logs, and verified certificates.
            </p>
          </div>
          {linkedStudents.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveNav('academic_progress')}
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              View 8-Stage Progress
            </button>
          )}
        </div>

        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-[#123D32] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {linkError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{linkError}</span>
          </div>
        )}
        {linkSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{linkSuccess}</span>
          </div>
        )}

        {!loading && linkedStudents.length > 0 && activeNav !== 'my_profile' && (
          <div className="flex flex-wrap items-center gap-2">
            {linkedStudents.map((link) => {
              const active = link.studentUid === selectedStudentUid;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setSelectedStudentUid(link.studentUid)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {link.studentName} · {link.registrationNumber}
                </button>
              );
            })}
          </div>
        )}

        {!loading && activeNav === 'my_children' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-[#0B1930]">Link Child Student Account</h2>
                <p className="text-xs text-slate-600">
                  Connect your child using their registered student email or OpenFrame Registration ID (`OF-STU-...`).
                </p>
              </div>
              <form onSubmit={handleLinkStudent} className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Student Email or ID (OF-STU-...)"
                  className="px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[260px]"
                />
                <button
                  type="submit"
                  disabled={linking || !linkInput.trim()}
                  className="px-4 py-2.5 bg-[#0B1930] hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>{linking ? 'Linking...' : 'Link Student'}</span>
                </button>
              </form>
            </div>

            {linkedStudents.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <h2 className="text-base font-semibold text-slate-900">No Student Linked Yet</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Enter your child’s registered student email address or OpenFrame registration ID above to connect their live learning dashboard.
                </p>
              </div>
            ) : report && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
                    <div className="text-xs text-[#64748B]">Enrolled Courses</div>
                    <div className="text-2xl font-bold text-[#18221F] mt-1 tabular-nums">
                      {report.progressList.length}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
                    <div className="text-xs text-[#64748B]">Quiz Average</div>
                    <div className="text-2xl font-bold text-[#2563EB] mt-1 tabular-nums">
                      {avgQuiz}%
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
                    <div className="text-xs text-[#64748B]">Faculty Evaluations</div>
                    <div className="text-2xl font-bold text-[#18221F] mt-1 tabular-nums">
                      {report.evaluations.length}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-5">
                    <div className="text-xs text-[#64748B]">Verified Certificates</div>
                    <div className="text-2xl font-bold text-[#123D32] mt-1 tabular-nums">
                      {report.certificates.length}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5">
                    <DonutRingChart
                      percent={avgCompletion}
                      label="Overall Coursework Completion"
                      sublabel={`${report.progressList.length} active track(s) · Average quiz score ${avgQuiz}%`}
                      color="#123D32"
                    />
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
                      Student Milestones &amp; Attendance ({attendancePct}%)
                    </div>
                    <MiniBarChart
                      items={[
                        { label: 'Coursework Avg (%)', value: avgCompletion, maxValue: 100, suffix: '%', color: '#123D32' },
                        { label: 'Quiz Average (%)', value: avgQuiz, maxValue: 100, suffix: '%', color: '#2563EB' },
                        { label: 'Attendance Rate (%)', value: attendancePct, maxValue: 100, suffix: '%', color: '#059669' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeNav === 'academic_progress' && (
          linkedStudents.length === 0 || !report ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
              Link a child account under My Children to view 8-stage coursework progress.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900">Course Progress &amp; 8-Stage Tracker</h2>
                {report.progressList.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 text-xs text-slate-500">
                    {report.profile?.fullName || 'Student'} has not enrolled in a course yet.
                  </div>
                ) : (
                  report.progressList.map((prog) => (
                    <div key={prog.courseId} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="text-xs text-slate-500">
                            {prog.courseId} · Assigned Mentor: {prog.assignedTeacherName || 'Faculty Review Board'}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {prog.courseTitle || prog.courseId}
                          </h3>
                        </div>
                        <div className="text-sm font-bold text-blue-600 tabular-nums">
                          {prog.overallProgressPercent || 0}% Complete
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                        {TRACK_STAGES.map((st, idx) => {
                          const isDone = prog.completedStages.includes(st.id);
                          const isFailed = prog.failedStages?.includes(st.id);
                          const isActive = !isDone && !isFailed && prog.currentStage === st.id;
                          return (
                            <div
                              key={st.id}
                              className={`p-3 rounded-xl border text-xs ${
                                isDone
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                  : isFailed
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : isActive
                                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold tabular-nums">{idx + 1}</span>
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                ) : isFailed ? (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                )}
                              </div>
                              <div className="font-medium truncate">{st.label}</div>
                              <div className="text-[11px] mt-0.5">
                                {isDone ? 'Completed' : isFailed ? 'Revision Needed' : isActive ? 'In Progress' : 'Pending'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentUser && (
                <ParentSchoolPanel
                  studentUid={selectedStudentUid}
                  studentNameFallback={
                    report.profile?.fullName ||
                    linkedStudents.find((l) => l.studentUid === selectedStudentUid)?.studentName ||
                    'Student'
                  }
                  parentUid={currentUser.uid}
                  parentName={lmsUser?.displayName || currentUser.displayName || 'Parent Guardian'}
                />
              )}
            </div>
          )
        )}

        {!loading && activeNav === 'attendance' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span>Attendance Summary ({childAttendance.length} Sessions)</span>
            </h3>
            {childAttendance.length === 0 ? (
              <p className="text-slate-500">No attendance entries recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {childAttendance.map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div>
                      <span className="tabular-nums font-medium text-slate-900">{a.date}</span>
                      {a.remarks && <span className="text-slate-500 ml-2">· {a.remarks}</span>}
                    </div>
                    <span className={a.status === 'Present' ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeNav === 'examination_results' && (
          <div className="space-y-6 text-xs">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Examination Results ({childResults.length})</span>
              </h3>
              {childResults.length === 0 ? (
                <p className="text-slate-500">No published exam scores yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {childResults.map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-900">{r.subjectName}</div>
                        <div className="text-slate-500">{r.examTitle}</div>
                      </div>
                      <div className="text-right tabular-nums font-bold text-blue-700">
                        {r.marksObtained}/{r.maxMarks} ({r.grade})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {report && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span>Recent Faculty Evaluations</span>
                  </h3>
                  {report.evaluations.length === 0 ? (
                    <p className="text-slate-500">No faculty rubric evaluations recorded yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {report.evaluations.map((ev) => (
                        <div key={ev.evaluationId || ev.id} className="py-3 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-slate-900">
                            <span>{ev.courseName || ev.courseId}</span>
                            <span className="tabular-nums text-blue-600">{ev.totalScore}/100 · {ev.decision || (ev.isApproved ? 'Approved' : 'Revision')}</span>
                          </div>
                          <p className="text-slate-600">{ev.writtenFeedback}</p>
                          <div className="text-[11px] text-slate-400">Evaluated by {ev.teacherName}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Earned Certificates</span>
                  </h3>
                  {report.certificates.length === 0 ? (
                    <p className="text-slate-500">Certificates appear here once all 6 completion conditions and teacher approval are met.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {report.certificates.map((c) => (
                        <div key={c.certificateId} className="py-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate">{c.courseTitle}</div>
                            <div className="text-slate-500 font-mono tabular-nums">{c.certificateId} · {c.grade}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => lmsService.downloadCertificatePdf(c)}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/verify-certificate/${c.certificateId}`)}
                              className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeNav === 'teacher_communication' && (
          <div className="space-y-6 text-xs">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <span>Academic Notifications ({childNotifications.length})</span>
              </h3>
              {childNotifications.length === 0 ? (
                <p className="text-slate-500">No notifications for this student yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {childNotifications.map((n) => (
                    <div key={n.id} className="py-2.5 space-y-0.5">
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-slate-500">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentUser && selectedStudentUid && (
              <ParentSchoolPanel
                studentUid={selectedStudentUid}
                studentNameFallback={
                  report?.profile?.fullName ||
                  linkedStudents.find((l) => l.studentUid === selectedStudentUid)?.studentName ||
                  'Student'
                }
                parentUid={currentUser.uid}
                parentName={lmsUser?.displayName || currentUser.displayName || 'Parent Guardian'}
              />
            )}
          </div>
        )}

        {!loading && activeNav === 'fee_information' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 text-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Fee Payment History ({childPayments.length})</span>
            </h3>
            {childPayments.length === 0 ? (
              <p className="text-slate-500">No fee receipts recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {childPayments.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-mono font-semibold text-slate-900">{p.receiptNumber}</div>
                      <div className="text-slate-500">{p.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold tabular-nums">INR {p.amount.toLocaleString()}</div>
                      <div className="text-emerald-700 font-semibold">{p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && activeNav === 'my_profile' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-[#0B1930] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Parent &amp; Guardian Profile</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="text-slate-500">Guardian Name</div>
                <div className="font-bold text-slate-900 mt-1">{lmsUser?.displayName || currentUser?.displayName || 'Parent Guardian'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="text-slate-500">Account Email</div>
                <div className="font-mono text-slate-800 mt-1 truncate">{lmsUser?.email || currentUser?.email}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <div className="text-slate-500">Linked Children</div>
                <div className="font-bold text-blue-700 mt-1 tabular-nums">{linkedStudents.length} Student(s)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SocialAppShell>
  );
};
