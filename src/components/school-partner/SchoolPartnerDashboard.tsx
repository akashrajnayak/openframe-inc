import React, { useMemo, useState } from 'react';
import {
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Brain,
  CreditCard,
  Award,
  Megaphone,
  Download,
  ArrowRight,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  SchoolInstitution,
  SchoolIqEqSqResult,
  SchoolTenantAnnouncement,
  SchoolProgramEnrollment,
  SchoolStaffMember,
  SchoolTenantAttendanceRecord,
  SchoolTenantCertificate,
  SchoolTenantClass,
  SchoolTenantPayment,
  SchoolTenantStudent,
} from '../../types';
import { SchoolPortalSection } from './SchoolPartnerLayout';
import { schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolPartnerDashboardProps {
  institution: SchoolInstitution | null;
  classes: SchoolTenantClass[];
  staff: SchoolStaffMember[];
  students: SchoolTenantStudent[];
  attendance: SchoolTenantAttendanceRecord[];
  programEnrollments: SchoolProgramEnrollment[];
  assessmentResults: SchoolIqEqSqResult[];
  payments: SchoolTenantPayment[];
  certificates: SchoolTenantCertificate[];
  announcements: SchoolTenantAnnouncement[];
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onNavigate: (section: SchoolPortalSection) => void;
}

export const SchoolPartnerDashboard: React.FC<SchoolPartnerDashboardProps> = ({
  institution,
  classes,
  staff,
  students,
  attendance,
  programEnrollments,
  assessmentResults,
  payments,
  certificates,
  announcements,
  isSchoolAdmin,
  isApproved,
  onNavigate,
}) => {
  const [period, setPeriod] = useState<'all' | '30d' | '90d'>('all');

  const cutoffMs = useMemo(() => {
    if (period === 'all') return 0;
    const days = period === '30d' ? 30 : 90;
    return Date.now() - days * 86400000;
  }, [period]);

  const filteredAttendance = useMemo(() => {
    if (!cutoffMs) return attendance;
    return attendance.filter((a) => {
      const t = Date.parse(a.date || a.createdAt || '');
      return !Number.isNaN(t) && t >= cutoffMs;
    });
  }, [attendance, cutoffMs]);

  const filteredResults = useMemo(() => {
    if (!cutoffMs) return assessmentResults;
    return assessmentResults.filter((r) => {
      const t = Date.parse(r.submittedAt || r.updatedAt || '');
      return !Number.isNaN(t) && t >= cutoffMs;
    });
  }, [assessmentResults, cutoffMs]);

  const filteredPayments = useMemo(() => {
    if (!cutoffMs) return payments;
    return payments.filter((p) => {
      const t = Date.parse(p.createdAt || '');
      return !Number.isNaN(t) && t >= cutoffMs;
    });
  }, [payments, cutoffMs]);

  const activeStudentsCount = students.filter((s) => s.enrollmentStatus === 'Active').length;
  const activeTeachersCount = staff.filter((s) => s.status === 'Active').length;

  const attendanceRatePct = useMemo(() => {
    const stuAtt = filteredAttendance.filter((a) => a.personType === 'Student');
    if (stuAtt.length === 0) return null;
    const present = stuAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    return Math.round((present / stuAtt.length) * 100);
  }, [filteredAttendance]);

  const avgAssessmentPct = useMemo(() => {
    const submitted = filteredResults.filter((r) => r.status === 'Submitted');
    if (submitted.length === 0) return null;
    const total = submitted.reduce((acc, cur) => acc + (cur.scorePercent || 0), 0);
    return Math.round(total / submitted.length);
  }, [filteredResults]);

  const totalCollectedInr = useMemo(
    () =>
      filteredPayments
        .filter((p) => p.status === 'Paid')
        .reduce((sum, p) => sum + (p.amountInr || 0), 0),
    [filteredPayments]
  );

  const totalOutstandingInr = useMemo(
    () =>
      filteredPayments
        .filter((p) => p.status === 'Pending')
        .reduce((sum, p) => sum + (p.outstandingBalanceInr || p.amountInr || 0), 0),
    [filteredPayments]
  );

  const classDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const cls of classes) {
      map.set(`${cls.gradeName}-${cls.section}`, 0);
    }
    for (const stu of students) {
      const label = `${stu.className}-${stu.section}`;
      map.set(label, (map.get(label) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .slice(0, 8);
  }, [classes, students]);

  const maxClassCount = Math.max(1, ...classDistribution.map((d) => d.count));

  const dimensionAverages = useMemo(() => {
    const dims: Array<'IQ' | 'EQ' | 'SQ'> = ['IQ', 'EQ', 'SQ'];
    return dims.map((dim) => {
      const items = filteredResults.filter((r) => r.dimension === dim && r.status === 'Submitted');
      if (items.length === 0) return { dim, avg: 0, count: 0 };
      const avg = Math.round(items.reduce((s, r) => s + r.scorePercent, 0) / items.length);
      return { dim, avg, count: items.length };
    });
  }, [filteredResults]);

  const handleExportSummaryCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['School Name', institution?.name || 'Not Registered'],
      ['Application Status', institution?.verificationStatus || 'Draft'],
      ['Institution Code', institution?.institutionCode || institution?.applicationRef || 'N/A'],
      ['Total Classes', String(classes.length)],
      ['Active Students', String(activeStudentsCount)],
      ['Active Teachers / Staff', String(activeTeachersCount)],
      ['Program Enrollments', String(programEnrollments.length)],
      ['Attendance Rate %', attendanceRatePct !== null ? `${attendanceRatePct}%` : 'No Records'],
      ['IQ/EQ/SQ Avg Index %', avgAssessmentPct !== null ? `${avgAssessmentPct}%` : 'No Records'],
      ['Certificates Issued', String(certificates.length)],
      ['Collected Payments (INR)', String(totalCollectedInr)],
      ['Outstanding Balance (INR)', String(totalOutstandingInr)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    schoolPartnerService.downloadCsvFile(
      `${institution?.institutionCode || 'school'}_executive_summary.csv`,
      csv
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-heading font-bold text-[#14213D]">
            {institution?.name || 'School Partner Onboarding'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            {institution
              ? `${institution.boardAffiliation} · ${institution.city || ''}${institution.city && institution.state ? ', ' : ''}${institution.state || ''} · Ref: ${institution.institutionCode || institution.applicationRef}`
              : 'Complete institutional onboarding to unlock your live K-12 campus management workspace.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-slate-200 rounded-xl bg-slate-50 p-1">
            {(['all', '30d', '90d'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-[#14213D] text-white'
                    : 'text-[#64748B] hover:text-slate-900'
                }`}
              >
                {p === 'all' ? 'All Time' : p === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleExportSummaryCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Verification Lock Notice if not yet Approved */}
      {!isApproved && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              {institution?.verificationStatus === 'More Information Required' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : institution?.verificationStatus === 'Submitted' || institution?.verificationStatus === 'Under Review' ? (
                <Clock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-sm font-bold text-[#14213D]">
                {institution
                  ? `School Approval Status: ${institution.verificationStatus}`
                  : 'Action Required: Submit School Verification Application'}
              </div>
              <p className="text-xs text-slate-700 mt-1">
                {institution?.reviewerNotes
                  ? `Reviewer Note: ${institution.reviewerNotes}`
                  : 'Operational modules (Students, Teachers, Assessments, Razorpay Invoices, QR Certificates) unlock automatically once OpenFrame Education approves your institutional profile.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('onboarding')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
          >
            <span>{institution ? 'View / Update Application' : 'Start Registration Wizard'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Total Students</span>
            <Users className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
            {activeStudentsCount}
          </div>
          <div className="text-[11px] text-[#64748B]">
            Across {classes.length} {classes.length === 1 ? 'class' : 'classes'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Active Teachers</span>
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
            {activeTeachersCount}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {staff.length} total staff records
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Program Enrollments</span>
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
            {programEnrollments.length}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {programEnrollments.filter((p) => p.status === 'Completed').length} completed
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Attendance Rate</span>
            <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
            {attendanceRatePct !== null ? `${attendanceRatePct}%` : '—'}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {filteredAttendance.length > 0
              ? `${filteredAttendance.length} logged records`
              : 'No sessions logged yet'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
            <span>Avg IQ/EQ/SQ Index</span>
            <Brain className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
            {avgAssessmentPct !== null ? `${avgAssessmentPct}%` : '—'}
          </div>
          <div className="text-[11px] text-[#64748B]">
            {filteredResults.length} educational submissions
          </div>
        </div>

        {isSchoolAdmin ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Payments Collected</span>
              <CreditCard className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
              ₹{totalCollectedInr.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#64748B]">
              ₹{totalOutstandingInr.toLocaleString('en-IN')} pending
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#64748B]">
              <span>Certificates Issued</span>
              <Award className="w-4 h-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#14213D] font-mono tabular-nums">
              {certificates.filter((c) => c.status !== 'Revoked').length}
            </div>
            <div className="text-[11px] text-[#64748B]">
              QR-verified credentials
            </div>
          </div>
        )}
      </div>

      {/* Analytics Charts Grid (2 columns, Honest Empty States) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Class-wise Student Enrollment SVG Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-[#14213D]">
                Class-Wise Student Strength
              </h2>
              <p className="text-xs text-[#64748B]">
                Live distribution derived from enrolled tenant rosters
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Manage Roster →
            </button>
          </div>

          {classDistribution.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-xs text-[#64748B]">
                No classes or students have been added to this school tenant yet.
              </p>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate(isApproved ? 'students' : 'onboarding')}
                  className="px-4 py-2 rounded-xl bg-[#14213D] text-white text-xs font-semibold hover:bg-[#0D172B]"
                >
                  {isApproved ? 'Add or Import Students' : 'Complete Onboarding'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <svg
                viewBox={`0 0 460 ${Math.max(120, classDistribution.length * 32)}`}
                className="w-full h-auto"
                role="img"
                aria-label="Class-wise student strength chart"
              >
                {classDistribution.map((item, idx) => {
                  const y = idx * 32 + 8;
                  const barWidth = Math.max(8, Math.round((item.count / maxClassCount) * 280));
                  return (
                    <g key={item.label}>
                      <text
                        x="4"
                        y={y + 14}
                        fontSize="11"
                        fontWeight="600"
                        fill="#334155"
                      >
                        {item.label.slice(0, 14)}
                      </text>
                      <rect
                        x="110"
                        y={y + 2}
                        width="280"
                        height="16"
                        rx="4"
                        fill="#F1F5F9"
                      />
                      <rect
                        x="110"
                        y={y + 2}
                        width={barWidth}
                        height="16"
                        rx="4"
                        fill="#2563EB"
                      />
                      <text
                        x="402"
                        y={y + 14}
                        fontSize="11"
                        fontWeight="700"
                        fill="#14213D"
                      >
                        {item.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* Chart 2: IQ / EQ / SQ Educational Reflections Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-heading font-bold text-[#14213D]">
                IQ / EQ / SQ Educational Reflection Index
              </h2>
              <p className="text-xs text-[#64748B]">
                Non-clinical student growth benchmarks across completed evaluations
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('assessments')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Assessments →
            </button>
          </div>

          {filteredResults.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-xs text-[#64748B]">
                No IQ, EQ, or SQ assessment responses have been submitted yet.
              </p>
              <button
                type="button"
                onClick={() => onNavigate(isApproved ? 'assessments' : 'onboarding')}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold hover:bg-blue-700"
              >
                {isApproved ? 'Schedule Assessment' : 'Complete Onboarding'}
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {dimensionAverages.map((d) => (
                <div key={d.dim} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#14213D]">
                      {d.dim === 'IQ'
                        ? 'IQ — Cognitive Reasoning'
                        : d.dim === 'EQ'
                        ? 'EQ — Emotional Awareness'
                        : 'SQ — Social & Values Reflection'}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[#14213D]">
                      {d.count > 0 ? `${d.avg}% (${d.count})` : 'No entries'}
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-lg bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#2563EB] transition-all duration-300"
                      style={{ width: `${d.avg}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-[11px] text-[#64748B] pt-1">
                Educational self-reflection indicator only — not a psychological or clinical diagnosis.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-heading font-bold text-[#14213D]">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: 'Add / Import Students (CSV/XLSX)', section: 'students' as SchoolPortalSection },
              { label: 'Create Classes & Allocate Teachers', section: 'classes' as SchoolPortalSection },
              { label: 'Enroll Cohort in OpenFrame Courses', section: 'programs' as SchoolPortalSection },
              { label: 'Schedule IQ / EQ / SQ Assessment', section: 'assessments' as SchoolPortalSection },
              { label: 'Issue QR-Verified Certificate', section: 'certificates' as SchoolPortalSection },
            ].map((act) => (
              <button
                key={act.label}
                type="button"
                onClick={() => onNavigate(act.section)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-[#2563EB] hover:bg-[#EFF6FF]/60 text-xs font-medium text-slate-800 transition-colors"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2563EB]" />
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#2563EB]" />
              <h2 className="text-sm font-heading font-bold text-[#14213D]">
                Recent School Announcements
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('communications')}
              className="text-xs font-semibold text-[#2563EB] hover:underline"
            >
              Compose Alert →
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
              No announcements published yet. Use Announcements & Alerts to broadcast notices to teachers, students, or guardians.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {announcements.slice(0, 4).map((ann) => (
                <div key={ann.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#14213D]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="truncate">{ann.title}</span>
                    </div>
                    <p className="text-xs text-[#64748B] line-clamp-2">{ann.message}</p>
                    <div className="text-[11px] text-slate-400">
                      Audience: {ann.audience} · {ann.deliveryStatus} · {new Date(ann.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
