import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Star,
  ExternalLink,
  Award,
  BookOpen,
  History,
  Settings,
  Users,
  ArrowRight,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { lmsService } from '../services/lmsService';
import { marketplaceService } from '../services/marketplaceService';
import { TeacherSchoolPanel } from '../components/school/TeacherSchoolPanel';
import {
  TeacherEvaluationRubricScores,
  TeacherEvaluation,
  QuizConfigDoc,
  StudentProfile,
  MarketplaceCourse,
  CertificateType
} from '../types';

type TeacherTab = 'queue' | 'history' | 'curriculum' | 'students' | 'school';

export const TeacherDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, lmsUser, teacherProfile, portalRole, isSuperAdmin, loading: authLoading } = useAuth();

  const isAuthorizedEducator = Boolean(
    currentUser &&
      (isSuperAdmin ||
        portalRole === 'teacher' ||
        portalRole === 'admin' ||
        lmsUser?.roles?.includes('teacher') ||
        lmsUser?.roles?.includes('admin'))
  );

  const [activeTab, setActiveTab] = useState<TeacherTab>('queue');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [history, setHistory] = useState<TeacherEvaluation[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Evaluation Modal state
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [rubricScores, setRubricScores] = useState<TeacherEvaluationRubricScores>({
    subjectKnowledge: 17,
    conceptUnderstanding: 17,
    conceptsMastery: 17,
    practicalImplementation: 18,
    creativityInnovation: 13,
    presentationSkills: 13,
    presentationQuality: 13,
    communicationSkills: 9,
  });
  const [decision, setDecision] = useState<
    'Approved' | 'Corrections Requested' | 'Rejected' | 'Reassessment Scheduled'
  >('Approved');
  const [evalCertificateType, setEvalCertificateType] = useState<CertificateType>('Course Completion Certificate');
  const [feedback, setFeedback] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [submittingEval, setSubmittingEval] = useState(false);

  // Quiz & Lesson Organization Config
  const [configCourseId, setConfigCourseId] = useState('OF-AI-001');
  const [quizCfg, setQuizCfg] = useState<QuizConfigDoc>({
    id: 'OF-AI-001_lesson_1',
    courseId: 'OF-AI-001',
    lessonId: 'lesson_1',
    basicCount: 5,
    intermediateCount: 5,
    advancedCount: 5,
    passingScorePercent: 70,
    maxRetakes: 5,
    timeLimitMinutes: 30,
    updatedBy: '',
    updatedAt: '',
  });
  const [savingQuizCfg, setSavingQuizCfg] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonObjectives, setNewLessonObjectives] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !isAuthorizedEducator) {
      setLoading(false);
      return;
    }

    async function loadEducatorData() {
      setLoading(true);
      const isAdmin = isSuperAdmin || portalRole === 'admin';
      const [queue, hist, stuList, catalog] = await Promise.all([
        lmsService.getPendingSubmissionsForTeacher(currentUser!.uid, isAdmin),
        lmsService.getEvaluationsHistory(currentUser!.uid, isAdmin),
        lmsService.getAllStudentProfiles(),
        marketplaceService.filterCourses({ page: 1, pageSize: 50 }).then((r) => r.courses),
      ]);
      setSubmissions(queue);
      setHistory(hist);
      setStudents(stuList);
      setCourses(catalog);
      setLoading(false);
    }

    loadEducatorData();
  }, [currentUser?.uid, authLoading, isAuthorizedEducator]);

  useEffect(() => {
    if (!configCourseId) return;
    lmsService.getQuizConfig(configCourseId, 'lesson_1').then((cfg) => setQuizCfg(cfg));
  }, [configCourseId]);

  const totalScore =
    Number(rubricScores.subjectKnowledge) +
    Number(rubricScores.conceptUnderstanding ?? rubricScores.conceptsMastery ?? 0) +
    Number(rubricScores.practicalImplementation) +
    Number(rubricScores.creativityInnovation) +
    Number(rubricScores.presentationSkills ?? rubricScores.presentationQuality ?? 0) +
    Number(rubricScores.communicationSkills);

  const handleOpenEvaluation = (sub: any) => {
    setSelectedSubmission(sub);
    setDecision('Approved');
    setEvalCertificateType('Course Completion Certificate');
    setFeedback(
      sub.type === 'PROJECT'
        ? 'Practical project demonstrates sound implementation and documented objectives.'
        : 'Clear walkthrough and thorough technical understanding demonstrated during presentation.'
    );
    setActionItems('');
    setEvalModalOpen(true);
  };

  const handleSubmitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !currentUser) return;
    setSubmittingEval(true);

    const evalData: TeacherEvaluation = {
      evaluationId: `eval_${selectedSubmission.studentId}_${Date.now()}`,
      submissionId: selectedSubmission.submissionId,
      studentId: selectedSubmission.studentId,
      studentName: selectedSubmission.studentName || 'Student Learner',
      registrationNumber: selectedSubmission.registrationNumber,
      courseId: selectedSubmission.courseId,
      courseName: selectedSubmission.courseTitle,
      projectTitle: selectedSubmission.projectData?.projectTitle,
      evaluatedBy: currentUser.uid,
      teacherId: currentUser.uid,
      teacherName: teacherProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Faculty Evaluator',
      rubricScores,
      scores: rubricScores,
      totalScore,
      writtenFeedback: feedback,
      actionItemsRequired: actionItems.trim() || undefined,
      correctionsRequested: decision === 'Corrections Requested' ? actionItems.trim() : undefined,
      decision,
      certificateType: evalCertificateType,
      status: decision,
      isApproved: decision === 'Approved' && totalScore >= 70,
      evaluatedAt: new Date().toISOString(),
    };

    const result = await lmsService.submitTeacherEvaluation(evalData);
    setSubmittingEval(false);
    setEvalModalOpen(false);

    const isAdmin = isSuperAdmin || portalRole === 'admin';
    const [updatedQueue, updatedHistory] = await Promise.all([
      lmsService.getPendingSubmissionsForTeacher(currentUser.uid, isAdmin),
      lmsService.getEvaluationsHistory(currentUser.uid, isAdmin),
    ]);
    setSubmissions(updatedQueue);
    setHistory(updatedHistory);

    setStatusMessage(
      result.certificate
        ? `Evaluation recorded (${totalScore}/100). Certificate ${result.certificate.certificateId} generated (${result.certificate.status}).`
        : `Evaluation recorded (${totalScore}/100 · ${decision}). Student notified.`
    );
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const handleSaveQuizConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSavingQuizCfg(true);
    await lmsService.saveQuizConfig({
      ...quizCfg,
      courseId: configCourseId,
      updatedBy: currentUser.email || currentUser.uid,
      updatedAt: new Date().toISOString(),
    });
    setSavingQuizCfg(false);
    setStatusMessage(`Quiz rules updated for ${configCourseId} (Passing: ${quizCfg.passingScorePercent}%, Retakes: ${quizCfg.maxRetakes}).`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !currentUser) return;
    await lmsService.saveLesson({
      id: `${configCourseId}_l_${Date.now()}`,
      courseId: configCourseId,
      moduleId: `${configCourseId}_mod_1`,
      moduleNumber: 1,
      moduleTitle: 'Custom Curriculum Module',
      topicName: newLessonTitle.trim(),
      title: newLessonTitle.trim(),
      durationMinutes: 45,
      mandatory: true,
      learningObjectives: newLessonObjectives.split('\n').map((s) => s.trim()).filter(Boolean),
      practicalProject: {
        courseId: configCourseId,
        title: `Practical Assignment: ${newLessonTitle.trim()}`,
        description: 'Faculty-authored applied assignment',
        objectives: [],
        instructions: [],
        submissionDeadlineDays: 14,
        evaluationCriteria: [],
        maxMarks: 100,
        difficultyLevel: 'Intermediate',
      },
      updatedBy: currentUser.email || currentUser.uid,
    });
    setNewLessonTitle('');
    setNewLessonObjectives('');
    setStatusMessage(`Lesson added to ${configCourseId}. Open the learning workspace to view it.`);
    setTimeout(() => setStatusMessage(null), 5000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[70vh] bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !isAuthorizedEducator) {
    return (
      <div className="min-h-[75vh] bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Award className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Faculty Evaluation Portal</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sign in with a Teacher or Administrator account to evaluate practical projects, grade live or recorded presentations, and organize course assessments.
          </p>
          <button
            type="button"
            onClick={() => navigate('/portal?role=teacher&redirect=/teacher/dashboard')}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <span>Sign In as Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Educator Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-blue-600">
              OpenFrame Faculty Workspace · {teacherProfile?.registrationNumber || lmsUser?.registrationNumber || 'Faculty'}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Teacher Evaluation Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Review submitted deliverables, grade with the 100-mark 6-criteria rubric, manage quiz benchmarks, and approve certifications.
            </p>
          </div>

          {/* Interactive Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs self-start">
            {[
              { id: 'queue', label: `Pending Queue (${submissions.length})`, icon: FileCheck },
              { id: 'history', label: `Evaluated (${history.length})`, icon: History },
              { id: 'curriculum', label: 'Lessons & Quiz Config', icon: Settings },
              { id: 'students', label: `Students (${students.length})`, icon: Users },
              { id: 'school', label: 'School (LKG–12)', icon: BookOpen },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as TeacherTab)}
                  className={`px-3.5 py-2 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                    active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </span>
            <button type="button" onClick={() => setStatusMessage(null)}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: PENDING SUBMISSIONS QUEUE */}
        {activeTab === 'queue' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Pending Projects & Presentations</h2>
              <span className="text-xs text-slate-500">Minimum 70/100 required for certificate approval</span>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                No pending project or presentation submissions in your evaluation queue right now.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {submissions.map((sub) => {
                  const fileLink =
                    sub.projectData?.fileUrl ||
                    sub.projectData?.githubOrProjectUrl ||
                    sub.presentationData?.slidesUrl ||
                    sub.presentationData?.videoUrl ||
                    sub.presentationData?.meetingLink;
                  return (
                    <div
                      key={sub.submissionId}
                      className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-slate-900 text-sm">
                          {sub.studentName} · {sub.type} · {sub.status}
                        </div>
                        <div className="text-slate-600 font-medium">{sub.courseTitle}</div>
                        <div className="text-slate-500">
                          Submitted {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                        {(sub.projectData?.submissionNotes || sub.presentationData?.notes) && (
                          <p className="text-slate-600 pt-1 max-w-2xl">
                            {sub.projectData?.submissionNotes || sub.presentationData?.notes}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {fileLink && (
                            <a
                              href={fileLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Open Submitted Deliverable</span>
                            </a>
                          )}
                          {sub.projectData?.demoVideoUrl && (
                            <a
                              href={sub.projectData.demoVideoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Watch Demo Video</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenEvaluation(sub)}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Evaluate Rubric</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVALUATION HISTORY */}
        {activeTab === 'history' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Evaluation History & Accountability</h2>
            </div>
            {history.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">No completed evaluations recorded yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.map((ev) => (
                  <div key={ev.evaluationId || ev.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">
                        {ev.studentName} · {ev.courseName || ev.courseId}
                      </div>
                      <div className="text-slate-500">
                        Evaluated by {ev.teacherName} on {new Date(ev.evaluatedAt || ev.evaluationDate || '').toLocaleString()}
                      </div>
                      <p className="text-slate-600 max-w-2xl">{ev.writtenFeedback}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-bold text-slate-900 tabular-nums">{ev.totalScore}/100</div>
                      <div className={`font-semibold ${ev.isApproved ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {ev.decision || (ev.isApproved ? 'Approved' : 'Revision Requested')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LESSONS & QUIZ CONFIGURATION */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            <form onSubmit={handleSaveQuizConfig} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900">Quiz Question Count & Passing Rules</h2>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  value={configCourseId}
                  onChange={(e) => setConfigCourseId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.id} — {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Basic Qs</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={quizCfg.basicCount}
                    onChange={(e) => setQuizCfg((p) => ({ ...p, basicCount: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Intermediate Qs</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={quizCfg.intermediateCount}
                    onChange={(e) => setQuizCfg((p) => ({ ...p, intermediateCount: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advanced Qs</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={quizCfg.advancedCount}
                    onChange={(e) => setQuizCfg((p) => ({ ...p, advancedCount: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Mark (%)</label>
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={quizCfg.passingScorePercent}
                    onChange={(e) => setQuizCfg((p) => ({ ...p, passingScorePercent: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Retakes</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={quizCfg.maxRetakes}
                    onChange={(e) => setQuizCfg((p) => ({ ...p, maxRetakes: Number(e.target.value) }))}
                    className="w-full p-2.5 border border-slate-200 rounded-xl tabular-nums"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={savingQuizCfg}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
              >
                {savingQuizCfg ? 'Saving...' : 'Save Quiz Configuration'}
              </button>
            </form>

            <form onSubmit={handleAddLesson} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Add Custom Lesson to Course</h2>
                <button
                  type="button"
                  onClick={() => navigate(`/learn/${configCourseId}`)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Open Course Workspace
                </button>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lesson Topic Title *</label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Evaluating Model Bias & Safety Benchmarks"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Learning Objectives (one per line)</label>
                <textarea
                  rows={3}
                  value={newLessonObjectives}
                  onChange={(e) => setNewLessonObjectives(e.target.value)}
                  placeholder="Design repeatable evaluation benchmarks&#10;Measure precision and recall trade-offs"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Lesson to {configCourseId}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: STUDENT ROSTER */}
        {activeTab === 'students' && (
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Student Learning Roster</h2>
            </div>
            {students.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">No active student profiles recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6 font-semibold">Student Name</th>
                      <th className="py-3 px-6 font-semibold">Registration ID</th>
                      <th className="py-3 px-6 font-semibold">Enrolled Courses</th>
                      <th className="py-3 px-6 font-semibold">Assigned Mentor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.map((st) => (
                      <tr key={st.uid} className="hover:bg-slate-50">
                        <td className="py-3.5 px-6 font-semibold text-slate-900">{st.fullName}</td>
                        <td className="py-3.5 px-6 font-mono text-slate-600 tabular-nums">{st.registrationNumber}</td>
                        <td className="py-3.5 px-6 tabular-nums">{st.enrolledCourseIds?.length || 0}</td>
                        <td className="py-3.5 px-6 text-slate-600">{st.assignedTeacherName || 'Unassigned'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: SCHOOL EDUCATION LKG-12 */}
        {activeTab === 'school' && (
          <TeacherSchoolPanel
            teacherUid={currentUser.uid}
            teacherName={teacherProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Faculty Evaluator'}
            onStatus={(msg) => {
              setStatusMessage(msg);
              setTimeout(() => setStatusMessage(null), 5000);
            }}
          />
        )}
      </div>

      {/* 6-CRITERIA RUBRIC EVALUATION MODAL */}
      {evalModalOpen && selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitEvaluation}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl text-xs"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="text-blue-600 font-semibold">6-Criteria Faculty Rubric (100 Marks)</div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Evaluating {selectedSubmission.studentName}
                </h3>
                <div className="text-slate-500">{selectedSubmission.courseTitle}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Cumulative Total</div>
                <div className={`text-2xl font-bold tabular-nums ${totalScore >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {totalScore} / 100
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>1. Subject Knowledge (Max 20)</span>
                  <span className="font-bold tabular-nums">{rubricScores.subjectKnowledge}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={rubricScores.subjectKnowledge}
                  onChange={(e) => setRubricScores((p) => ({ ...p, subjectKnowledge: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>2. Understanding of Concepts (Max 20)</span>
                  <span className="font-bold tabular-nums">
                    {rubricScores.conceptUnderstanding ?? rubricScores.conceptsMastery ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={rubricScores.conceptUnderstanding ?? rubricScores.conceptsMastery ?? 0}
                  onChange={(e) =>
                    setRubricScores((p) => ({
                      ...p,
                      conceptUnderstanding: Number(e.target.value),
                      conceptsMastery: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>3. Practical Implementation (Max 20)</span>
                  <span className="font-bold tabular-nums">{rubricScores.practicalImplementation}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={rubricScores.practicalImplementation}
                  onChange={(e) => setRubricScores((p) => ({ ...p, practicalImplementation: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>4. Creativity & Innovation (Max 15)</span>
                  <span className="font-bold tabular-nums">{rubricScores.creativityInnovation}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={rubricScores.creativityInnovation}
                  onChange={(e) => setRubricScores((p) => ({ ...p, creativityInnovation: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>5. Presentation Skills (Max 15)</span>
                  <span className="font-bold tabular-nums">
                    {rubricScores.presentationSkills ?? rubricScores.presentationQuality ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  value={rubricScores.presentationSkills ?? rubricScores.presentationQuality ?? 0}
                  onChange={(e) =>
                    setRubricScores((p) => ({
                      ...p,
                      presentationSkills: Number(e.target.value),
                      presentationQuality: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-medium text-slate-700 mb-1">
                  <span>6. Communication Skills (Max 10)</span>
                  <span className="font-bold tabular-nums">{rubricScores.communicationSkills}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={rubricScores.communicationSkills}
                  onChange={(e) => setRubricScores((p) => ({ ...p, communicationSkills: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evaluation Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Approved">Approve Deliverable (Certify if all 6 conditions met)</option>
                  <option value="Corrections Requested">Request Corrections</option>
                  <option value="Reassessment Scheduled">Schedule Reassessment Presentation</option>
                  <option value="Rejected">Reject Submission</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Credential Type</label>
                <select
                  value={evalCertificateType}
                  onChange={(e) => setEvalCertificateType(e.target.value as CertificateType)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="Course Completion Certificate">Course Completion Certificate</option>
                  <option value="Skill Development Certificate">Skill Development Certificate</option>
                  <option value="Practical Training Certificate">Practical Training Certificate</option>
                  <option value="Assessment Certificate">Assessment Certificate</option>
                  <option value="Professional Development Certificate">Professional Development Certificate</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Written Faculty Feedback *</label>
              <textarea
                rows={3}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Action Items (If Requesting Revision)</label>
              <input
                type="text"
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                placeholder="Specific improvements required before approval..."
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEvalModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingEval}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
              >
                {submittingEval ? 'Saving Grade...' : 'Record Evaluation'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
