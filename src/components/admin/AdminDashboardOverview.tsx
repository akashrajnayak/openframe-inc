import React from 'react';
import {
  Inbox,
  Sparkles,
  GraduationCap,
  School,
  Award,
  Briefcase,
  Cpu,
  Package,
  HeartHandshake,
  Heart,
  TrendingUp,
  PieChart,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AdminModuleKey } from './AdminSidebar';

export interface DashboardMetricCounts {
  totalEnquiries: number;
  newEnquiries: number;
  totalStudents: number;
  totalTeachers: number;
  totalInternships: number;
  totalJobs: number;
  totalSoftware: number;
  totalProducts: number;
  totalPartnerships: number;
  totalHopeNest: number;
}

export interface RecentSubmissionItem {
  id: string;
  moduleKey: AdminModuleKey;
  moduleTitle: string;
  name: string;
  contact: string;
  date: string;
  status: string;
  details?: string;
  rawRecord: any;
}

export interface MonthlyTrendData {
  month: string;
  count: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
  color: string;
}

export interface AdminLmsTelemetry {
  totalCatalogCourses: number;
  categoriesCount: number;
  activeStudents: number;
  activeTeachers: number;
  totalEnrollments: number;
  certificatesIssued: number;
  youtubeQuotaUsed: number;
  youtubeQuotaLimit: number;
  geminiCallsToday: number;
}

interface AdminDashboardOverviewProps {
  metrics: DashboardMetricCounts;
  recentSubmissions: RecentSubmissionItem[];
  monthlyTrends: MonthlyTrendData[];
  statusDistribution: StatusDistribution[];
  lmsTelemetry?: AdminLmsTelemetry;
  onSelectModule: (key: AdminModuleKey) => void;
  onViewRecord: (record: any, moduleKey: AdminModuleKey) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({
  metrics,
  recentSubmissions,
  monthlyTrends,
  statusDistribution,
  lmsTelemetry,
  onSelectModule,
  onViewRecord
}) => {
  // Find highest monthly count for scaling the SVG chart
  const maxTrend = Math.max(...monthlyTrends.map((t) => t.count), 1);

  // Calculate total status items for percentage
  const totalStatusCount = statusDistribution.reduce((acc, curr) => acc + curr.count, 0);

  const kpiCards = [
    {
      title: 'Total Enquiries',
      value: metrics.totalEnquiries,
      subtext: 'Across all public forms',
      icon: Inbox,
      color: 'blue',
      module: 'general_enquiries' as AdminModuleKey
    },
    {
      title: 'New / Unread',
      value: metrics.newEnquiries,
      subtext: 'Awaiting first contact',
      icon: AlertCircle,
      color: 'rose',
      module: 'general_enquiries' as AdminModuleKey,
      highlight: true
    },
    {
      title: 'Student Registrations',
      value: metrics.totalStudents,
      subtext: 'Training & course batches',
      icon: GraduationCap,
      color: 'emerald',
      module: 'students' as AdminModuleKey
    },
    {
      title: 'Teacher Network',
      value: metrics.totalTeachers,
      subtext: 'Educator onboarding',
      icon: School,
      color: 'teal',
      module: 'teachers' as AdminModuleKey
    },
    {
      title: 'Internship Applications',
      value: metrics.totalInternships,
      subtext: 'Student & graduate interns',
      icon: Award,
      color: 'indigo',
      module: 'internships' as AdminModuleKey
    },
    {
      title: 'Job Applications',
      value: metrics.totalJobs,
      subtext: 'Talent recruitment pool',
      icon: Briefcase,
      color: 'purple',
      module: 'jobs' as AdminModuleKey
    },
    {
      title: 'Software Quotes',
      value: metrics.totalSoftware,
      subtext: 'Custom IT & web builds',
      icon: Cpu,
      color: 'sky',
      module: 'software_enquiries' as AdminModuleKey
    },
    {
      title: 'Product Inquiries',
      value: metrics.totalProducts,
      subtext: 'Off-the-shelf software',
      icon: Package,
      color: 'amber',
      module: 'product_enquiries' as AdminModuleKey
    },
    {
      title: 'Strategic Partnerships',
      value: metrics.totalPartnerships,
      subtext: 'School & NGO tie-ups',
      icon: HeartHandshake,
      color: 'cyan',
      module: 'school_partners' as AdminModuleKey
    },
    {
      title: 'HopeNest Foundation',
      value: metrics.totalHopeNest,
      subtext: 'Volunteers, donors, drives',
      icon: Heart,
      color: 'pink',
      module: 'hopenest_management' as AdminModuleKey
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#071326] via-[#0D2447] to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-blue-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OpenFrame Central Administration &amp; Governance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white mb-2">
            Enterprise Operations Overview
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Live telemetry and operational records synchronized with Firebase Firestore. All 22 modules are operational with full audit trails, strict Role-Based Access Control (RBAC), and customer record protection.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onSelectModule('software_enquiries')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <span>Software Inquiries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectModule('students')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <span>Student Enrollments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSelectModule('activity_logs')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <span>Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 10 KPI Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Key Performance Indicators (10 Metrics)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Aggregated from live Firestore collections
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                onClick={() => onSelectModule(kpi.module)}
                className={`p-4 rounded-2xl bg-white border cursor-pointer hover:shadow-lg transition-all group relative overflow-hidden ${
                  kpi.highlight
                    ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      kpi.color === 'rose'
                        ? 'bg-rose-100 text-rose-600'
                        : kpi.color === 'emerald'
                        ? 'bg-emerald-100 text-emerald-600'
                        : kpi.color === 'teal'
                        ? 'bg-teal-100 text-teal-600'
                        : kpi.color === 'indigo'
                        ? 'bg-indigo-100 text-indigo-600'
                        : kpi.color === 'purple'
                        ? 'bg-purple-100 text-purple-600'
                        : kpi.color === 'sky'
                        ? 'bg-sky-100 text-sky-600'
                        : kpi.color === 'amber'
                        ? 'bg-amber-100 text-amber-600'
                        : kpi.color === 'cyan'
                        ? 'bg-cyan-100 text-cyan-600'
                        : kpi.color === 'pink'
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                <div className="text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs font-bold text-slate-700 truncate mt-0.5">
                  {kpi.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {kpi.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LMS, AI & Course Discovery Telemetry */}
      {lmsTelemetry && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>LMS, AI &amp; Course Discovery Telemetry</span>
              </h3>
              <p className="text-xs text-slate-500">
                Live catalog density, active LMS learners, certificate issuance, and server AI / YouTube quota consumption.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => onSelectModule('courses')}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 font-semibold text-slate-700 hover:text-blue-700 transition-colors"
              >
                Catalog Manager &rarr;
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('lms_management')}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
              >
                LMS &amp; AI Control Center &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Published Catalog</div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                {lmsTelemetry.totalCatalogCourses.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">{lmsTelemetry.categoriesCount} categories</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">LMS Learners</div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                {lmsTelemetry.activeStudents}
              </div>
              <div className="text-[10px] text-slate-400">{lmsTelemetry.activeTeachers} active teachers</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Course Enrollments</div>
              <div className="text-lg font-extrabold text-blue-700 tabular-nums mt-0.5">
                {lmsTelemetry.totalEnrollments}
              </div>
              <div className="text-[10px] text-slate-400">Active Firestore progress</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Certificates Issued</div>
              <div className="text-lg font-extrabold text-emerald-700 tabular-nums mt-0.5">
                {lmsTelemetry.certificatesIssued}
              </div>
              <div className="text-[10px] text-slate-400">QR verifiable</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">YouTube Quota Today</div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                {lmsTelemetry.youtubeQuotaUsed.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400">
                of {lmsTelemetry.youtubeQuotaLimit.toLocaleString()} daily units
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-medium text-slate-500">Quinn AI Calls Today</div>
              <div className="text-lg font-extrabold text-indigo-700 tabular-nums mt-0.5">
                {lmsTelemetry.geminiCallsToday}
              </div>
              <div className="text-[10px] text-slate-400">Server-side Gemini proxy</div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Registration Trends (SVG Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Monthly Inflow &amp; Registration Trends
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated volume of incoming enquiries &amp; registrations over recent months
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              Total: {monthlyTrends.reduce((a, b) => a + b.count, 0)} Records
            </span>
          </div>

          {/* Responsive SVG Bar Chart */}
          <div className="h-56 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-100">
            {monthlyTrends.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data points recorded yet.
              </div>
            ) : (
              monthlyTrends.map((item, index) => {
                const heightPercent = maxTrend > 0 ? (item.count / maxTrend) * 100 : 0;
                const clampedHeight = Math.max(heightPercent, 8); // minimum visible bar

                return (
                  <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="text-[11px] font-mono font-bold text-slate-700 mb-1 opacity-80 group-hover:opacity-100 group-hover:text-blue-600 transition-opacity">
                      {item.count}
                    </div>
                    <div className="w-full max-w-[48px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                      <div
                        style={{ height: `${clampedHeight}%` }}
                        className="w-full bg-gradient-to-t from-blue-700 to-sky-400 rounded-t-xl transition-all duration-500 group-hover:from-blue-600 group-hover:to-sky-300 shadow-sm"
                      />
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 mt-2 truncate w-full text-center">
                      {item.month}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
            <span>Historical volume calculated from record timestamps</span>
            <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => onSelectModule('activity_logs')}>
              Detailed Audit Logs &rarr;
            </span>
          </div>
        </div>

        {/* Enquiry Status Distribution */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-emerald-600" />
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                Enquiry Status Distribution
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Current lifecycle of all pending &amp; converted requests
            </p>

            {/* Distribution Bars */}
            <div className="space-y-3.5">
              {statusDistribution.map((statusItem, idx) => {
                const percentage =
                  totalStatusCount > 0
                    ? Math.round((statusItem.count / totalStatusCount) * 100)
                    : 0;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: statusItem.color }}
                        />
                        {statusItem.status}
                      </span>
                      <span className="text-slate-900 font-mono">
                        {statusItem.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: statusItem.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center justify-between font-medium">
              <span>Overall Pipeline Volume</span>
              <span className="font-bold text-slate-900">{totalStatusCount} Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Feed Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              Recent Inbound Submissions
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated across all public enquiry, registration, career and partnership gateways
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              Showing {recentSubmissions.length} latest items
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Channel / Module</th>
                <th className="py-3 px-4">Applicant / Sender</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No submissions recorded yet. Submit a test form on the public website to verify real-time ingestion.
                  </td>
                </tr>
              ) : (
                recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px]">
                        {sub.moduleTitle}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {sub.name}
                      {sub.details && (
                        <div className="text-[10px] text-slate-500 truncate max-w-xs font-normal">
                          {sub.details}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {sub.contact}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {sub.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'New'
                            ? 'bg-rose-100 text-rose-700'
                            : sub.status === 'Contacted'
                            ? 'bg-blue-100 text-blue-700'
                            : sub.status === 'In Progress'
                            ? 'bg-amber-100 text-amber-700'
                            : sub.status === 'Approved' || sub.status === 'Converted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {sub.status || 'New'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onViewRecord(sub.rawRecord, sub.moduleKey)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors font-medium text-xs shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
