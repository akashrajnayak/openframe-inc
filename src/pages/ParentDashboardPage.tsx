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
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import { lmsService } from '../services/lmsService';
import { ParentSchoolPanel } from '../components/school/ParentSchoolPanel';
import {
  ParentStudentLink,
  StudentProfile,
  StudentProgressRecord,
  IssuedCertificate,
  QuizAttempt,
  TeacherEvaluation,
  LearningStage
} from '../types';

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

export const ParentDashboardPage: React.FC = () => {
  const { currentUser, lmsUser, loading: authLoading } = useAuth();
  const { navigate } = useRouter();

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
      const data = await lmsService.getStudentReportForParent(selectedStudentUid);
      if (active) setReport(data);
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
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Parent Portal Sign In Required</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sign in with your parent account to view your child’s 8-stage learning progress, verification quiz scores, faculty feedback, and verified certificates.
          </p>
          <button
            type="button"
            onClick={() => navigate('/portal?role=parent&redirect=/parent/dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Sign In to Parent Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const avgQuiz =
    report && report.quizAttempts.length > 0
      ? Math.round(
          report.quizAttempts.reduce((acc, q) => acc + (q.percentageScore ?? 0), 0) /
            report.quizAttempts.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header & Link Child Form */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="text-xs font-medium text-blue-600">
              OpenFrame Parent & Guardian Portal
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Academic Progress Monitor
            </h1>
            <p className="text-xs text-slate-600">
              Signed in as {lmsUser?.displayName || currentUser.email}. Link your child’s student account to track coursework and certifications in real time.
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
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{linking ? 'Linking...' : 'Link Student'}</span>
            </button>
          </form>
        </div>

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

        {/* Child Tabs */}
        {linkedStudents.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {linkedStudents.map((link) => {
              const active = link.studentUid === selectedStudentUid;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => setSelectedStudentUid(link.studentUid)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {link.studentName} · {link.registrationNumber}
                </button>
              );
            })}
          </div>
        )}

        {linkedStudents.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h2 className="text-base font-semibold text-slate-900">No Student Linked Yet</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Enter your child’s registered student email address or OpenFrame registration ID above to connect their live learning dashboard.
            </p>
          </div>
        ) : report && (
          <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="text-xs text-slate-500">Enrolled Courses</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {report.progressList.length}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="text-xs text-slate-500">Quiz Average</div>
                <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">
                  {avgQuiz}%
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="text-xs text-slate-500">Faculty Evaluations</div>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                  {report.evaluations.length}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="text-xs text-slate-500">Verified Certificates</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                  {report.certificates.length}
                </div>
              </div>
            </div>

            {/* Course Progress Breakdown */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-slate-900">Course Progress & 8-Stage Tracker</h2>
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

            {/* Faculty Feedback & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span>Recent Faculty Evaluations</span>
                </h3>
                {report.evaluations.length === 0 ? (
                  <p className="text-xs text-slate-500">No faculty rubric evaluations recorded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {report.evaluations.map((ev) => (
                      <div key={ev.evaluationId || ev.id} className="py-3 space-y-1 text-xs">
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
                  <p className="text-xs text-slate-500">Certificates appear here once all 6 completion conditions and teacher approval are met.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {report.certificates.map((c) => (
                      <div key={c.certificateId} className="py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">{c.courseTitle}</div>
                          <div className="text-slate-500 font-mono tabular-nums">{c.certificateId} · {c.grade}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => lmsService.downloadCertificatePdf(c)}
                            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-medium flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => navigate(`/verify-certificate/${c.certificateId}`)}
                            className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1"
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

            {/* School Education LKG-12 Parent Monitor */}
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
          </div>
        )}
      </div>
    </div>
  );
};
