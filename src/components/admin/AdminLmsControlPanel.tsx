import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  BookOpen,
  Users,
  Settings,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Save,
  Activity,
  AlertTriangle,
  Download,
  Layers,
  Check
} from 'lucide-react';
import { lmsService } from '../../services/lmsService';
import { youtubeVideoService } from '../../services/youtubeVideoService';
import { marketplaceService } from '../../services/marketplaceService';
import { getActivityLogs } from '../../services/firebase';
import {
  LmsGlobalSettings,
  CertificateTemplate,
  IssuedCertificate,
  StudentProfile,
  TeacherProfile,
  MarketplaceCourse,
  AiLearningPath,
  ContentReport,
  ApiUsageTelemetry,
  ActivityLog,
  CertificateType
} from '../../types';
import { useAuth } from '../../context/AuthContext';

export const AdminLmsControlPanel: React.FC<{
  onNotify: (msg: string) => void;
}> = ({ onNotify }) => {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState<'analytics' | 'curriculum' | 'assignments' | 'certificates' | 'moderation' | 'telemetry'>('analytics');
  const [loading, setLoading] = useState(true);

  const [analytics, setAnalytics] = useState({
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
  });

  const [ytStatus, setYtStatus] = useState<{ apiKeyConfigured: boolean; mode: string }>({
    apiKeyConfigured: false,
    mode: 'Checking...',
  });

  const [settings, setSettings] = useState<LmsGlobalSettings>({
    id: 'global',
    quinnPersona: 'Socratic Mentor & Technical Architect',
    defaultBasicCount: 5,
    defaultIntermediateCount: 5,
    defaultAdvancedCount: 5,
    defaultPassingScore: 70,
    defaultMaxRetakes: 5,
    requireVideoCompletionConfirmation: true,
    youtubePreferredChannels: 'MIT OpenCourseWare, Stanford Online, freeCodeCamp.org, DeepLearning.AI, Harvard CS50',
    youtubeMaxRecommendations: 3,
    youtubeSafeSearch: 'strict',
    requireAdminCertApproval: false,
    updatedAt: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [certTemplate, setCertTemplate] = useState<CertificateTemplate>({
    id: 'default_2026',
    name: 'OpenFrame Academic Distinction Seal',
    accreditationLine: 'OpenFrame IT Solutions Private Limited in association with HopeNest Global Foundation',
    credentialTitle: 'Certificate of Applied Mastery',
    authorizedSignatoryName: 'Academic Director & CTO',
    authorizedSignatoryTitle: 'OpenFrame Education Council',
    requireAdminApprovalBeforeIssue: false,
    accentColor: '#1d4ed8',
    updatedAt: '',
  });

  // Curriculum Lesson Form
  const [selectedCourseId, setSelectedCourseId] = useState('OF-AI-001');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonObjectives, setLessonObjectives] = useState('');
  const [lessonMaterials, setLessonMaterials] = useState('');
  const [savingLesson, setSavingLesson] = useState(false);

  // Assignment Form
  const [assignTeacherUid, setAssignTeacherUid] = useState('');
  const [assignStudentUid, setAssignStudentUid] = useState('');
  const [assignCourseId, setAssignCourseId] = useState('OF-AI-001');
  const [savingAssignment, setSavingAssignment] = useState(false);

  // Telemetry, AI Paths Moderation, Content Reports & Logs
  const [telemetry, setTelemetry] = useState<ApiUsageTelemetry | null>(null);
  const [aiPaths, setAiPaths] = useState<AiLearningPath[]>([]);
  const [promotingPathId, setPromotingPathId] = useState<string | null>(null);
  const [contentReports, setContentReports] = useState<ContentReport[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const refreshData = async () => {
    setLoading(true);
    const [an, yt, gSet, catalog, stuList, tchList, certs, tpls, tel, paths, reps, logs] = await Promise.all([
      lmsService.getLmsAnalytics(),
      youtubeVideoService.getYouTubeApiStatus(),
      lmsService.getLmsGlobalSettings(),
      marketplaceService.filterCourses({ page: 1, pageSize: 50 }).then((r) => r.courses),
      lmsService.getAllStudentProfiles(),
      lmsService.getAllTeacherProfiles(),
      lmsService.getPendingCertificatesForAdmin(),
      lmsService.getCertificateTemplates(),
      lmsService.getSystemTelemetry().catch(() => null),
      lmsService.getAiLearningPaths(40).catch(() => []),
      lmsService.getContentReports(50).catch(() => []),
      getActivityLogs().catch(() => []),
    ]);
    setAnalytics(an);
    setYtStatus(yt);
    setSettings(gSet);
    setCourses(catalog);
    setStudents(stuList);
    setTeachers(tchList);
    setCertificates(certs);
    if (tpls[0]) setCertTemplate(tpls[0]);
    if (tchList[0] && !assignTeacherUid) setAssignTeacherUid(tchList[0].uid);
    if (stuList[0] && !assignStudentUid) setAssignStudentUid(stuList[0].uid);
    setTelemetry(tel);
    setAiPaths(paths);
    setContentReports(reps);
    setActivityLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleAiPathApproval = async (path: AiLearningPath) => {
    const next = !path.approvedByAdmin;
    await lmsService.approveAiLearningPath(path.id, next);
    setAiPaths((prev) => prev.map((p) => (p.id === path.id ? { ...p, approvedByAdmin: next } : p)));
    onNotify(`AI Learning Path "${path.title}" ${next ? 'approved for catalog discovery' : 'marked pending review'}.`);
  };

  const handlePromoteAiPathToCatalog = async (path: AiLearningPath) => {
    setPromotingPathId(path.id);
    try {
      const topicLower = (path.topic || path.title).toLowerCase();
      const inferredCategory =
        topicLower.includes('excel') || topicLower.includes('data')
          ? 'Excel & Data Analytics'
          : topicLower.includes('ai') || topicLower.includes('machine')
          ? 'Artificial Intelligence'
          : topicLower.includes('class ') || topicLower.includes('ncert') || topicLower.includes('cbse')
          ? 'School Education (Class 1–12)'
          : 'Technology & Digital Skills';

      const allVideoIds = (path.modules || []).flatMap((m) => m.videoIds || []).filter(Boolean);
      const firstVideoId = allVideoIds[0];

      const created = await marketplaceService.addCourse({
        title: path.title,
        shortDesc: path.overview || `Structured ${path.modules?.length || 3}-module AI learning path for ${path.topic}.`,
        description: `${path.overview}\n\n${path.aiDisclaimer}`,
        category: inferredCategory,
        categoryGroup: 'AI Curated Track',
        subcategory: path.topic,
        language: path.language || 'English',
        level: 'All Levels',
        price: 0,
        isFree: true,
        pricingTier: 'Starter',
        status: 'Published',
        courseType: firstVideoId ? 'youtube_video' : 'standard',
        youtubeVideoId: firstVideoId,
        instructorName: 'OpenFrame AI Curriculum Council',
        learningObjectives: (path.modules || []).flatMap((m) => m.objectives || []).slice(0, 8),
        modules: (path.modules || []).map((m) => ({
          moduleNumber: m.moduleNumber,
          title: `${m.level}: ${m.title}`,
          duration: '45 mins',
          lessons: m.objectives || [],
          description: m.summary,
        })),
        practicalProjects: (path.modules || []).flatMap((m) => m.practiceExercises || []).slice(0, 8),
      });

      if (!path.approvedByAdmin) {
        await lmsService.approveAiLearningPath(path.id, true);
        setAiPaths((prev) => prev.map((p) => (p.id === path.id ? { ...p, approvedByAdmin: true } : p)));
      }
      onNotify(`Promoted "${created.title}" to Published Marketplace Catalog (${created.id}).`);
    } catch (err: any) {
      onNotify(err?.message || 'Unable to promote AI path to catalog (it may already exist).');
    } finally {
      setPromotingPathId(null);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: ContentReport['status']) => {
    await lmsService.updateContentReportStatus(reportId, status);
    setContentReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status } : r)));
    onNotify(`Report ${reportId} updated to ${status}.`);
  };

  const handleExportStudentRosterCsv = () => {
    const headers = ['Registration No', 'Full Name', 'Email', 'Mobile', 'Assigned Teacher', 'Enrolled Courses Count', 'Updated At'];
    const rows = students.map((s) => [
      s.registrationNumber,
      s.fullName,
      s.email,
      s.mobileNumber || '',
      s.assignedTeacherName || 'Unassigned',
      String(s.enrolledCourseIds?.length || 0),
      s.updatedAt,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OpenFrame_Student_Progress_Roster_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`Exported ${students.length} student records to CSV.`);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    await lmsService.saveLmsGlobalSettings({
      ...settings,
      updatedBy: currentUser?.email || 'admin',
      updatedAt: new Date().toISOString(),
    });
    setSavingSettings(false);
    onNotify('Quinn AI, quiz threshold, and YouTube recommendation settings saved to Firestore.');
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;
    setSavingLesson(true);
    await lmsService.saveLesson({
      id: `${selectedCourseId}_l_${Date.now()}`,
      courseId: selectedCourseId,
      moduleId: `${selectedCourseId}_mod_1`,
      moduleNumber: 1,
      moduleTitle: 'Curriculum Module',
      topicName: lessonTitle.trim(),
      title: lessonTitle.trim(),
      durationMinutes: 45,
      mandatory: true,
      learningObjectives: lessonObjectives.split('\n').map((s) => s.trim()).filter(Boolean),
      learningMaterials: lessonMaterials.trim(),
      practicalProject: {
        courseId: selectedCourseId,
        title: `Practical Capstone: ${lessonTitle.trim()}`,
        description: 'Admin-authored practical project',
        objectives: [],
        instructions: [],
        submissionDeadlineDays: 14,
        evaluationCriteria: [],
        maxMarks: 100,
        difficultyLevel: 'Intermediate',
      },
      updatedBy: currentUser?.email || 'admin',
    });
    setLessonTitle('');
    setLessonObjectives('');
    setLessonMaterials('');
    setSavingLesson(false);
    onNotify(`Lesson added to ${selectedCourseId}.`);
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const tch = teachers.find((t) => t.uid === assignTeacherUid);
    if (!tch) {
      onNotify('Select an active teacher first.');
      return;
    }
    setSavingAssignment(true);
    await lmsService.assignTeacherToStudentOrCourse({
      teacherUid: tch.uid,
      teacherName: tch.fullName,
      studentUid: assignStudentUid || undefined,
      courseId: assignCourseId || undefined,
    });
    await refreshData();
    setSavingAssignment(false);
    onNotify(`Assigned ${tch.fullName} successfully without duplicating student records.`);
  };

  const handleSaveCertTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    await lmsService.saveCertificateTemplate(certTemplate);
    onNotify('Certificate template updated.');
  };

  const handleApproveCertificate = async (certId: string) => {
    await lmsService.approveCertificateByAdmin(certId, currentUser?.email || 'admin');
    await refreshData();
    onNotify(`Certificate ${certId} approved and issued.`);
  };

  const handleRevokeCertificate = async (certId: string) => {
    await lmsService.revokeCertificate(certId, currentUser?.email || 'admin');
    await refreshData();
    onNotify(`Certificate ${certId} revoked.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Quinn AI & LMS Control Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live Firestore LMS telemetry, video content curation policy, lesson builder, teacher-student assignments, and certificate seal management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs">
          {[
            { id: 'analytics', label: 'Analytics & AI Settings', icon: Settings },
            { id: 'curriculum', label: 'Course & Lesson Builder', icon: BookOpen },
            { id: 'assignments', label: 'Teacher Assignments', icon: Users },
            { id: 'certificates', label: 'Certificates & Templates', icon: Award },
            { id: 'moderation', label: `AI Paths & Reports (${contentReports.filter((r) => r.status === 'Submitted').length})`, icon: AlertTriangle },
            { id: 'telemetry', label: 'API Telemetry & Logs', icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            const active = subTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id as any)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
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

      {/* Live Firestore KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Enrollments</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{analytics.totalEnrollments}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Videos Completed</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{analytics.videosCompleted}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Quizzes Graded</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            {analytics.quizzesGraded} · {analytics.quizPassRate}% pass
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Projects Submitted</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{analytics.projectsSubmitted}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Faculty Reviews</span>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">{analytics.evaluationsCompleted}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-500 font-medium">Certificates Issued</span>
          <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">{analytics.certificatesIssued}</div>
        </div>
      </div>

      {/* SUBTAB 1: ANALYTICS & QUINN AI + YOUTUBE POLICY SETTINGS */}
      {subTab === 'analytics' && (
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Quinn AI Assessment & Pedagogical Settings
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pedagogical Persona</label>
              <select
                value={settings.quinnPersona}
                onChange={(e) => setSettings((s) => ({ ...s, quinnPersona: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option>Socratic Mentor & Technical Architect</option>
                <option>Strict Code Reviewer & Evaluator</option>
                <option>Guided Tutor with Progressive Hints</option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Basic Qs</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={settings.defaultBasicCount}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultBasicCount: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interm. Qs</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={settings.defaultIntermediateCount}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultIntermediateCount: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Advanced Qs</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={settings.defaultAdvancedCount}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultAdvancedCount: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
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
                  value={settings.defaultPassingScore}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultPassingScore: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Max Retakes</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={settings.defaultMaxRetakes}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultMaxRetakes: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireAdminCertApproval}
                onChange={(e) => setSettings((s) => ({ ...s, requireAdminCertApproval: e.target.checked }))}
                className="rounded text-blue-600"
              />
              <span className="font-medium text-slate-700">
                Require secondary Admin Approval before releasing student certificates
              </span>
            </label>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Educational Video Content Curation Policy</h3>
              <span className="text-[11px] font-medium text-slate-600">
                {ytStatus.mode}
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Approved Educational Channels</label>
              <input
                type="text"
                value={settings.youtubePreferredChannels}
                onChange={(e) => setSettings((s) => ({ ...s, youtubePreferredChannels: e.target.value }))}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Videos / Lesson</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={settings.youtubeMaxRecommendations}
                  onChange={(e) => setSettings((s) => ({ ...s, youtubeMaxRecommendations: Number(e.target.value) }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl tabular-nums"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SafeSearch Level</label>
                <select
                  value={settings.youtubeSafeSearch}
                  onChange={(e) => setSettings((s) => ({ ...s, youtubeSafeSearch: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="strict">Strict (Recommended)</option>
                  <option value="moderate">Moderate</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
              Video Completion Policy: Explicitly requires learner confirmation ("Have you completed this video?" · Yes, I completed it / Continue learning) or IFrame playback completion.
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingSettings ? 'Saving...' : 'Save Global LMS Settings'}</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SUBTAB 2: COURSE & LESSON BUILDER */}
      {subTab === 'curriculum' && (
        <form onSubmit={handleAddLesson} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Publish New Lesson to Course Curriculum</h3>
            <a
              href={`/learn/${selectedCourseId}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline font-medium flex items-center gap-1"
            >
              <span>Preview Learning Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lesson Topic Name *</label>
              <input
                type="text"
                required
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="e.g. Retrieval-Augmented Generation Pipelines"
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Learning Objectives (one per line)</label>
            <textarea
              rows={2}
              value={lessonObjectives}
              onChange={(e) => setLessonObjectives(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lesson Study Notes / Materials</label>
            <textarea
              rows={2}
              value={lessonMaterials}
              onChange={(e) => setLessonMaterials(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={savingLesson}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{savingLesson ? 'Adding...' : 'Publish Lesson'}</span>
          </button>
        </form>
      )}

      {/* SUBTAB 3: TEACHER-STUDENT & COURSE ASSIGNMENT */}
      {subTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <form onSubmit={handleAssignTeacher} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Assign Teacher to Student & Course</h3>
            <p className="text-slate-500">
              Updates existing student and teacher Firestore profiles in place without creating duplicate student entries.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Member</label>
              <select
                value={assignTeacherUid}
                onChange={(e) => setAssignTeacherUid(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {teachers.length === 0 && <option value="">No registered teachers yet</option>}
                {teachers.map((t) => (
                  <option key={t.uid} value={t.uid}>
                    {t.fullName} ({t.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Student</label>
              <select
                value={assignStudentUid}
                onChange={(e) => setAssignStudentUid(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {students.length === 0 && <option value="">No active student profiles yet</option>}
                {students.map((s) => (
                  <option key={s.uid} value={s.uid}>
                    {s.fullName} ({s.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Course</label>
              <select
                value={assignCourseId}
                onChange={(e) => setAssignCourseId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id} — {c.title}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={savingAssignment || teachers.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {savingAssignment ? 'Assigning...' : 'Assign Mentor'}
            </button>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Active LMS Roster ({analytics.activeStudents} Students · {analytics.activeTeachers} Teachers)
            </h3>
            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {students.map((s) => (
                <div key={s.uid} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{s.fullName}</div>
                    <div className="text-slate-500">{s.registrationNumber} · {s.email}</div>
                  </div>
                  <div className="text-slate-600">{s.assignedTeacherName || 'Unassigned'}</div>
                </div>
              ))}
              {students.length === 0 && !loading && (
                <p className="text-slate-500 py-4">Students appear automatically when they sign in to the Student Portal.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CERTIFICATES & TEMPLATE MANAGEMENT */}
      {subTab === 'certificates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Issued & Pending Certificates</h3>
            {certificates.length === 0 ? (
              <p className="text-slate-500">No certificates have been issued yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {certificates.map((c) => (
                  <div key={c.certificateId} className="py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{c.studentName}</div>
                      <div className="text-slate-500 font-mono truncate">
                        {c.certificateId} · {c.courseTitle} · {c.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.status === 'Pending Admin Approval' && (
                        <button
                          type="button"
                          onClick={() => handleApproveCertificate(c.certificateId)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {c.status !== 'Revoked' && (
                        <button
                          type="button"
                          onClick={() => handleRevokeCertificate(c.certificateId)}
                          className="px-2.5 py-1 border border-rose-200 text-rose-700 rounded-lg font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Revoke</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSaveCertTemplate} className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Certificate Template & Seal Configuration</h3>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Credential Title</label>
              <input
                type="text"
                value={certTemplate.credentialTitle}
                onChange={(e) => setCertTemplate((t) => ({ ...t, credentialTitle: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accreditation Line</label>
              <input
                type="text"
                value={certTemplate.accreditationLine}
                onChange={(e) => setCertTemplate((t) => ({ ...t, accreditationLine: e.target.value }))}
                className="w-full p-2.5 border border-slate-200 rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signatory Name</label>
                <input
                  type="text"
                  value={certTemplate.authorizedSignatoryName}
                  onChange={(e) => setCertTemplate((t) => ({ ...t, authorizedSignatoryName: e.target.value }))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Signatory Title</label>
                <input
                  type="text"
                  value={certTemplate.authorizedSignatoryTitle}
                  onChange={(e) => setCertTemplate((t) => ({ ...t, authorizedSignatoryTitle: e.target.value }))}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Certificate Type</label>
              <select
                value={certTemplate.defaultCertificateType || 'Course Completion Certificate'}
                onChange={(e) =>
                  setCertTemplate((t) => ({ ...t, defaultCertificateType: e.target.value as CertificateType }))
                }
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
              >
                <option value="Course Completion Certificate">Course Completion Certificate</option>
                <option value="Skill Development Certificate">Skill Development Certificate</option>
                <option value="Practical Training Certificate">Practical Training Certificate</option>
                <option value="Assessment Certificate">Assessment Certificate</option>
                <option value="Professional Development Certificate">Professional Development Certificate</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold"
            >
              Save Certificate Template
            </button>
          </form>
        </div>
      )}

      {/* SUBTAB 5: AI LEARNING PATHS & CONTENT REPORTS MODERATION */}
      {subTab === 'moderation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>AI Learning Paths Moderation ({aiPaths.length})</span>
              </h3>
            </div>
            {aiPaths.length === 0 ? (
              <p className="text-slate-500 py-4">
                No AI-organized learning paths generated yet. Paths appear when learners use the Quinn AI Course Organizer.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {aiPaths.map((p) => (
                  <div key={p.id} className="py-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Topic: {p.topic} · Lang: {p.language} · {p.modules?.length || 0} modules · {p.sourceMode}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleAiPathApproval(p)}
                          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                            p.approvedByAdmin
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-900 text-white'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{p.approvedByAdmin ? 'Approved' : 'Approve Path'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={promotingPathId === p.id}
                          onClick={() => handlePromoteAiPathToCatalog(p)}
                          className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{promotingPathId === p.id ? 'Promoting...' : 'Promote to Catalog'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Content & Video Reports Queue ({contentReports.length})</span>
              </h3>
            </div>
            {contentReports.length === 0 ? (
              <p className="text-slate-500 py-4">No learner content reports submitted.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {contentReports.map((rep) => (
                  <div key={rep.id} className="py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">
                        {rep.reason} · {rep.courseId}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{rep.details || 'No extra details provided.'}</p>
                    <div className="text-[11px] text-slate-400">
                      Reporter: {rep.reporterEmail || 'Authenticated Learner'} · Video: {rep.videoId || 'N/A'}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(['Under Review', 'Resolved', 'Dismissed'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleUpdateReportStatus(rep.id, st)}
                          className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 rounded-lg font-medium text-slate-700"
                        >
                          Mark {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 6: API TELEMETRY, SEARCH ANALYTICS, CSV EXPORT & ACTIVITY LOGS */}
      {subTab === 'telemetry' && (
        <div className="space-y-6 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="font-bold text-sm text-slate-900">YouTube Data API v3 Quota</div>
              {telemetry ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Key Status</span>
                    <span className="font-semibold text-slate-900">
                      {telemetry.youtubeQuota.apiKeyConfigured ? 'Configured (Live)' : 'Fallback Mode'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Units Used Today</span>
                    <span className="font-bold tabular-nums">
                      {telemetry.youtubeQuota.unitsUsedToday} / {telemetry.youtubeQuota.dailyLimit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Units</span>
                    <span className="font-bold text-emerald-600 tabular-nums">
                      {telemetry.youtubeQuota.remainingUnits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cached Hits Saved</span>
                    <span className="font-bold text-blue-600 tabular-nums">
                      {telemetry.youtubeQuota.cachedHitsToday}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Telemetry unavailable.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <div className="font-bold text-sm text-slate-900">Quinn AI (Server Gemini) Usage</div>
              {telemetry ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Model</span>
                    <span className="font-mono font-semibold text-slate-900">{telemetry.geminiUsage.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Server Key Status</span>
                    <span className="font-semibold text-slate-900">
                      {telemetry.geminiUsage.apiKeyConfigured ? 'Configured (Server-Only)' : 'Fallback Mode'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calls Today</span>
                    <span className="font-bold tabular-nums">{telemetry.geminiUsage.totalCallsToday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Errors Today</span>
                    <span className="font-bold text-rose-600 tabular-nums">{telemetry.geminiUsage.errorsToday}</span>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500">Telemetry unavailable.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-sm text-slate-900">Student Progress & Audit Exports</div>
                <p className="text-slate-500">
                  Download the live student roster ({students.length} learners) or inspect recent live search queries ({telemetry?.searchStats.totalSearchesToday || 0} today).
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportStudentRosterCsv}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Student Roster CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Recent Multilingual Search Queries</h3>
              {telemetry && telemetry.searchStats.recentQueries.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {telemetry.searchStats.recentQueries.map((sq, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{sq.query}</div>
                        <div className="text-[11px] text-slate-500">
                          Language: {sq.detectedLanguage} · Results: {sq.resultCount}
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 tabular-nums">
                        {new Date(sq.searchedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 py-4">No live search queries logged yet in this server session.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Immutable System Activity Logs ({activityLogs.length})</h3>
              {activityLogs.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {activityLogs.slice(0, 30).map((log) => (
                    <div key={log.id} className="py-2.5 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{log.action}</span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {log.adminEmail} · {log.collection} · {log.details}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 py-4">No Firestore activity logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
