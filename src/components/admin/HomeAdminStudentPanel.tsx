import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { lmsService } from '../../services/lmsService';
import { storageService } from '../../services/storageService';
import {
  AdminStudentIntelligenceReport,
  AdminStudentRecord,
} from '../../types';
import {
  Shield,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Bell,
  Award,
  FolderGit2,
  GraduationCap,
  IndianRupee,
  TrendingUp,
  KeyRound,
} from 'lucide-react';
import { RazorpayKeyPromptModal } from '../common/RazorpayKeyPromptModal';

type StudentFilterTab = 'all' | 'enrolled' | 'projects' | 'high_ability' | 'pending_approval';

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Recently';
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return 'Recently';
  const diffMin = Math.max(0, Math.floor((Date.now() - ms) / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  return new Date(ms).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function getAbilityColorClass(tier: AdminStudentRecord['learningAbilityTier']): string {
  switch (tier) {
    case 'Advanced Mastery':
      return 'text-emerald-700';
    case 'Strong Progress':
      return 'text-blue-700';
    case 'Steady Learner':
      return 'text-amber-700';
    case 'Early Stage':
      return 'text-rose-700';
    default:
      return 'text-slate-500';
  }
}

function getAbilityBarClass(tier: AdminStudentRecord['learningAbilityTier']): string {
  switch (tier) {
    case 'Advanced Mastery':
      return 'bg-emerald-600';
    case 'Strong Progress':
      return 'bg-blue-600';
    case 'Steady Learner':
      return 'bg-amber-500';
    case 'Early Stage':
      return 'bg-rose-500';
    default:
      return 'bg-slate-300';
  }
}

export const HomeAdminStudentPanel: React.FC = () => {
  const { navigate } = useRouter();
  const {
    currentUser,
    adminProfile,
    adminCredentialSession,
    isAdminSession,
    isSuperAdmin,
    loginGoogle,
  } = useAuth();

  const [report, setReport] = useState<AdminStudentIntelligenceReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<StudentFilterTab>('all');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [linkingGoogle, setLinkingGoogle] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string>('');
  const [razorpayModalOpen, setRazorpayModalOpen] = useState<boolean>(false);

  const hasFirebaseAdminAuth = Boolean(currentUser && (adminProfile?.isActive || isSuperAdmin));

  const loadIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const liveReport = await lmsService.getAdminStudentIntelligence();

      // Merge local browser registrations if Firestore returned none (e.g., before Google link)
      if (liveReport.students.length === 0) {
        const localRegs = storageService.getStudentRegistrations();
        if (localRegs.length > 0) {
          const fallbackStudents: AdminStudentRecord[] = localRegs.map((r) => ({
            studentId: r.id,
            studentName: r.fullName,
            studentEmail: r.emailAddress,
            enrolledCoursesCount: r.interestedCourse ? 1 : 0,
            enrolledCourseTitles: r.interestedCourse ? [r.interestedCourse] : [],
            latestCourseTitle: r.interestedCourse,
            enrolledAmountInr: 0,
            projectsSubmitted: 0,
            projectsApproved: 0,
            averageQuizScore: null,
            bestQuizScore: null,
            quizAttemptsCount: 0,
            overallProgressPercent: 0,
            iqEqSqScore: null,
            learningAbilityScore: null,
            learningAbilityTier: 'Not Assessed Yet',
            learningAbilityBasis: 'Registered — awaiting course quiz or project telemetry',
            certificateStatus: 'In Progress',
            lastActivityAt: r.registeredAt || new Date().toISOString(),
          }));
          liveReport.students = fallbackStudents;
          liveReport.notifications = localRegs.slice(0, 15).map((r) => ({
            id: `local_reg_${r.id}`,
            kind: 'registration',
            studentName: r.fullName,
            studentEmail: r.emailAddress,
            courseTitle: r.interestedCourse,
            summary: `Registered for ${r.interestedCourse || 'OpenFrame Academy'}`,
            timestamp: r.registeredAt || new Date().toISOString(),
            actionPath: '/admin/dashboard',
          }));
          liveReport.totals.registeredStudents = fallbackStudents.length;
          liveReport.totals.enrolledStudents = fallbackStudents.filter((s) => s.enrolledCoursesCount > 0).length;
        }
      }

      setReport(liveReport);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminSession) return;
    loadIntelligence();
  }, [isAdminSession, hasFirebaseAdminAuth, loadIntelligence]);

  const filteredStudents = useMemo(() => {
    if (!report) return [];
    const q = searchQuery.trim().toLowerCase();
    return report.students.filter((st) => {
      if (activeTab === 'enrolled' && st.enrolledCoursesCount === 0) return false;
      if (activeTab === 'projects' && st.projectsSubmitted === 0) return false;
      if (
        activeTab === 'high_ability' &&
        (st.learningAbilityScore === null || st.learningAbilityScore < 70)
      ) {
        return false;
      }
      if (activeTab === 'pending_approval' && st.certificateStatus !== 'Pending Admin Approval') {
        return false;
      }
      if (!q) return true;
      return (
        st.studentName.toLowerCase().includes(q) ||
        st.studentEmail.toLowerCase().includes(q) ||
        st.enrolledCourseTitles.some((t) => t.toLowerCase().includes(q)) ||
        st.learningAbilityTier.toLowerCase().includes(q)
      );
    });
  }, [report, searchQuery, activeTab]);

  const handleLinkGoogleAdmin = async () => {
    setLinkingGoogle(true);
    setLinkError('');
    try {
      await loginGoogle();
      await loadIntelligence();
    } catch (err: any) {
      setLinkError(err?.message || 'Google admin sign-in failed. Verify you selected your admin Google account.');
    } finally {
      setLinkingGoogle(false);
    }
  };

  if (!isAdminSession) return null;

  const adminIdentityLabel =
    currentUser?.email || adminCredentialSession?.username || 'Administrator';

  const totals = report?.totals || {
    registeredStudents: 0,
    enrolledStudents: 0,
    totalEnrollments: 0,
    totalAmountEnrolledInr: 0,
    totalProjectsSubmitted: 0,
    totalProjectsApproved: 0,
    averageScoreAchieved: 0,
    averageLearningAbility: 0,
    pendingCourseApprovals: 0,
  };

  return (
    <section
      aria-label="Admin Student Intelligence and Enrollment Notifications"
      className="bg-slate-50 border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Command Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-3.5 h-3.5 text-[#123D32] shrink-0" />
              <span>Admin Command Panel</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700 truncate">{adminIdentityLabel}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Registered Students &amp; Learning Intelligence
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => loadIntelligence()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/admin/course-approvals"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Course Approvals</span>
              {totals.pendingCourseApprovals > 0 && (
                <span className="font-mono tabular-nums text-amber-700 font-semibold">
                  ({totals.pendingCourseApprovals})
                </span>
              )}
            </Link>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setRazorpayModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Insert Razorpay Key</span>
              </button>
            )}

            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <span>Full Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-medium text-slate-600 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-expanded={!collapsed}
            >
              {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              <span>{collapsed ? 'Expand' : 'Collapse'}</span>
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="pt-5 space-y-5">
            {/* Optional Firestore Sync Callout when logged in via Username/Password without Firebase Google link */}
            {!hasFirebaseAdminAuth && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-slate-700 space-y-0.5">
                  <div className="font-semibold text-slate-900">
                    Connect Google Admin to Stream Live Cloud Firestore Records
                  </div>
                  <p className="text-slate-600">
                    You are signed in with server admin credentials. Connect your authorized Google account (<span className="font-mono">akashrajnayak@gmail.com</span>) to pull real-time student enrollments, projects, and quiz scores from Firestore.
                  </p>
                  {linkError && <p className="text-rose-700 font-medium pt-1">{linkError}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleLinkGoogleAdmin}
                  disabled={linkingGoogle}
                  className="px-3.5 py-2 rounded-lg bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {linkingGoogle ? 'Connecting...' : 'Connect Google Admin'}
                </button>
              </div>
            )}

            {/* 4-Column Flat KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Registered &amp; Enrolled</span>
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totals.registeredStudents.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {totals.totalEnrollments} enrollments
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Amount Enrolled</span>
                  <IndianRupee className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    ₹{totals.totalAmountEnrolledInr.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    {totals.enrolledStudents} learners
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Projects Done</span>
                  <FolderGit2 className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totals.totalProjectsSubmitted.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-emerald-700 font-medium tabular-nums">
                    {totals.totalProjectsApproved} approved
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Avg Score · Learning Ability</span>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {totals.averageScoreAchieved}%
                  </span>
                  <span className="text-xs text-slate-500 tabular-nums">
                    Ability index {totals.averageLearningAbility}/100
                  </span>
                </div>
              </div>
            </div>

            {/* Two-Column Executive Split: Student Intelligence Table + Registered Student Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left 8 Columns: Enrolled Students Performance & Ability Grid */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                    {(
                      [
                        { id: 'all', label: 'All Students' },
                        { id: 'enrolled', label: 'Enrolled' },
                        { id: 'projects', label: 'Projects Done' },
                        { id: 'high_ability', label: 'Strong Ability' },
                        { id: 'pending_approval', label: 'Pending Approval' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative w-full sm:w-56 shrink-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter student or course..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="divide-y divide-slate-100">
                    {[0, 1, 2, 3].map((row) => (
                      <div key={row} className="px-4 py-3.5 flex items-center justify-between gap-4 animate-pulse">
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3.5 bg-slate-200 rounded w-40" />
                          <div className="h-2.5 bg-slate-100 rounded w-56" />
                        </div>
                        <div className="h-3.5 bg-slate-200 rounded w-16" />
                        <div className="h-3.5 bg-slate-200 rounded w-16" />
                        <div className="h-3.5 bg-slate-200 rounded w-24" />
                        <div className="h-3.5 bg-slate-200 rounded w-14" />
                      </div>
                    ))}
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      No matching student records found
                    </p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Once students register and enroll in courses, their enrolled amount, completed projects, learning ability, and quiz scores appear here automatically.
                    </p>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => navigate('/admin/dashboard')}
                        className="px-3.5 py-2 rounded-lg bg-[#123D32] text-white text-xs font-semibold hover:bg-[#0e3027] transition-colors cursor-pointer"
                      >
                        Open Student Management
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                          <th className="py-2.5 px-4">Student &amp; Enrolled Course</th>
                          <th className="py-2.5 px-3 text-right">Amount Enrolled</th>
                          <th className="py-2.5 px-3 text-right">Projects Done</th>
                          <th className="py-2.5 px-3">Learning Ability</th>
                          <th className="py-2.5 px-4 text-right">Score Achieved</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredStudents.slice(0, 12).map((st) => {
                          const isExpanded = expandedStudentId === st.studentId;
                          return (
                            <React.Fragment key={st.studentId}>
                              <tr
                                onClick={() =>
                                  setExpandedStudentId(isExpanded ? null : st.studentId)
                                }
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <td className="py-3 px-4 max-w-[240px]">
                                  <div className="font-semibold text-slate-900 truncate">
                                    {st.studentName}
                                  </div>
                                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                    {st.latestCourseTitle || 'Registered Learner'}
                                    {st.enrolledCoursesCount > 1
                                      ? ` · +${st.enrolledCoursesCount - 1} more`
                                      : ''}
                                  </div>
                                </td>

                                <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                                  {st.enrolledAmountInr > 0
                                    ? `₹${st.enrolledAmountInr.toLocaleString('en-IN')}`
                                    : st.enrolledCoursesCount > 0
                                    ? '₹0 · Direct'
                                    : '—'}
                                </td>

                                <td className="py-3 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                                  <span className="font-semibold text-slate-900">
                                    {st.projectsSubmitted}
                                  </span>
                                  <span className="text-slate-400"> / </span>
                                  <span className="text-emerald-700">
                                    {st.projectsApproved} ok
                                  </span>
                                </td>

                                <td className="py-3 px-3 min-w-[160px]">
                                  <div className="flex items-center justify-between gap-2">
                                    <span
                                      className={`font-medium ${getAbilityColorClass(
                                        st.learningAbilityTier
                                      )}`}
                                    >
                                      {st.learningAbilityTier}
                                    </span>
                                    {st.learningAbilityScore !== null && (
                                      <span className="font-mono tabular-nums text-[11px] text-slate-600">
                                        {st.learningAbilityScore}/100
                                      </span>
                                    )}
                                  </div>
                                  <div className="mt-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${getAbilityBarClass(
                                        st.learningAbilityTier
                                      )}`}
                                      style={{
                                        width: `${st.learningAbilityScore ?? 0}%`,
                                      }}
                                    />
                                  </div>
                                </td>

                                <td className="py-3 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                                  <div className="font-semibold text-slate-900">
                                    {st.averageQuizScore !== null ? `${st.averageQuizScore}%` : '—'}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {st.overallProgressPercent}% course
                                  </div>
                                </td>
                              </tr>

                              {isExpanded && (
                                <tr className="bg-slate-50/80">
                                  <td colSpan={5} className="px-4 py-3 text-xs text-slate-600">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="space-y-1">
                                        <div className="text-slate-800">
                                          <span className="font-medium">Email:</span>{' '}
                                          <span className="font-mono">{st.studentEmail || 'Not provided'}</span>
                                          <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
                                          <span className="font-medium">Status:</span> {st.certificateStatus}
                                          {st.bestQuizScore !== null && (
                                            <>
                                              <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
                                              <span className="font-medium">Best Quiz:</span>{' '}
                                              <span className="font-mono tabular-nums">{st.bestQuizScore}%</span>
                                            </>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                          Ability basis: {st.learningAbilityBasis}
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate('/admin/course-approvals');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer"
                                      >
                                        Review for Certification
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredStudents.length > 12 && (
                  <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                    <span className="tabular-nums">
                      Showing 12 of {filteredStudents.length} students
                    </span>
                    <Link
                      to="/admin/dashboard"
                      className="font-semibold text-[#123D32] hover:underline"
                    >
                      View all in Admin Console
                    </Link>
                  </div>
                )}
              </div>

              {/* Right 4 Columns: Registered Students Notifications Feed */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#123D32]" />
                    <h3 className="text-xs font-bold text-slate-900">
                      Registered Student Notifications
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {report?.notifications.length ?? 0} recent
                  </span>
                </div>

                {loading ? (
                  <div className="divide-y divide-slate-100">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="p-3.5 space-y-1.5 animate-pulse">
                        <div className="h-3 bg-slate-200 rounded w-32" />
                        <div className="h-2.5 bg-slate-100 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : !report || report.notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    New student registrations, course enrollments, project submissions, and certificate approval requests will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                    {report.notifications.slice(0, 10).map((notif) => (
                      <button
                        key={notif.id}
                        type="button"
                        onClick={() => navigate(notif.actionPath)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors cursor-pointer block"
                      >
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-slate-900 truncate">
                            {notif.studentName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono tabular-nums whitespace-nowrap shrink-0">
                            {formatRelativeTime(notif.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                          {notif.summary}
                        </p>
                        <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="capitalize text-[#123D32] font-medium">
                            {notif.kind === 'approval'
                              ? 'Course Approval'
                              : notif.kind === 'project'
                              ? 'Project Submission'
                              : notif.kind === 'enrollment'
                              ? 'Course Enrollment'
                              : 'Registration'}
                          </span>
                          {notif.studentEmail && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate font-mono">{notif.studentEmail}</span>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <RazorpayKeyPromptModal
          isOpen={razorpayModalOpen}
          onClose={() => setRazorpayModalOpen(false)}
          onSaved={() => {
            setRazorpayModalOpen(false);
          }}
        />
      )}
    </section>
  );
};
