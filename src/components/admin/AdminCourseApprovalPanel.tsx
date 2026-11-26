import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Filter,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { lmsService } from '../../services/lmsService';
import { useRouter } from '../../router/RouterContext';
import type { CertificateType, CourseApprovalQueueItem } from '../../types';

interface AdminCourseApprovalPanelProps {
  adminEmail: string;
  onNotify: (msg: string) => void;
  onLogActivity?: (
    action: string,
    collectionName: string,
    recordId: string,
    details?: string
  ) => Promise<void>;
  onQueueUpdated?: (pendingCount: number) => void;
}

type ApprovalFilter =
  | 'pending'
  | 'ready'
  | 'issued'
  | 'revision_revoked'
  | 'all';

const CERTIFICATE_TYPE_OPTIONS: CertificateType[] = [
  'Course Completion Certificate',
  'Skill Development Certificate',
  'Practical Training Certificate',
  'Assessment Certificate',
  'Professional Development Certificate',
];

export const AdminCourseApprovalPanel: React.FC<AdminCourseApprovalPanelProps> = ({
  adminEmail,
  onNotify,
  onLogActivity,
  onQueueUpdated,
}) => {
  const { navigate } = useRouter();
  const [items, setItems] = useState<CourseApprovalQueueItem[]>([]);
  const [counts, setCounts] = useState({
    pending: 0,
    readyToApprove: 0,
    approved: 0,
    revisionOrRevoked: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ApprovalFilter>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Inspection / Review modal state
  const [selectedItem, setSelectedItem] = useState<CourseApprovalQueueItem | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [certificateType, setCertificateType] = useState<CertificateType>('Course Completion Certificate');
  const [submittingAction, setSubmittingAction] = useState<'approve' | 'revision' | 'revoke' | null>(null);
  const [modalError, setModalError] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    try {
      const result = await lmsService.getCourseApprovalQueue();
      setItems(result.items);
      setCounts(result.counts);
      onQueueUpdated?.(result.counts.pending + result.counts.readyToApprove);
    } catch {
      onNotify('Unable to load course approval queue right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === 'pending' && item.approvalState !== 'Pending Admin Approval') return false;
      if (filter === 'ready' && item.approvalState !== 'Ready for Approval') return false;
      if (filter === 'issued' && item.approvalState !== 'Issued') return false;
      if (
        filter === 'revision_revoked' &&
        item.approvalState !== 'Revision Requested' &&
        item.approvalState !== 'Revoked'
      ) {
        return false;
      }

      if (!q) return true;
      return (
        item.studentName.toLowerCase().includes(q) ||
        item.studentEmail.toLowerCase().includes(q) ||
        item.courseTitle.toLowerCase().includes(q) ||
        item.courseId.toLowerCase().includes(q) ||
        (item.registrationNumber || '').toLowerCase().includes(q) ||
        (item.certificate?.certificateId || '').toLowerCase().includes(q)
      );
    });
  }, [items, filter, searchTerm]);

  const openReviewModal = (item: CourseApprovalQueueItem) => {
    setSelectedItem(item);
    setReviewNote(item.adminReviewNote || '');
    setCertificateType(item.certificate?.certificateType || 'Course Completion Certificate');
    setModalError('');
  };

  const handleApproveAndIssue = async () => {
    if (!selectedItem) return;
    setModalError('');
    setSubmittingAction('approve');
    try {
      let issuedCertId = selectedItem.certificate?.certificateId || '';
      if (selectedItem.certificate) {
        const updated = await lmsService.approveCertificateByAdmin(
          selectedItem.certificate.certificateId,
          adminEmail,
          { reviewNote, certificateType }
        );
        issuedCertId = updated.certificateId;
      } else if (selectedItem.progress) {
        const issued = await lmsService.approveCompletedCourseProgressDirectly({
          progress: selectedItem.progress,
          enrollment: selectedItem.enrollment,
          adminEmail,
          reviewNote,
          certificateType,
        });
        issuedCertId = issued.certificateId;
      } else {
        throw new Error('Missing student progress or certificate record for approval.');
      }

      if (onLogActivity) {
        await onLogActivity(
          'Approved Course & Issued Certificate',
          'certificates',
          issuedCertId,
          `Approved ${selectedItem.studentName} (${selectedItem.studentEmail || selectedItem.studentId}) for "${selectedItem.courseTitle}" · ${certificateType}`
        );
      }
      onNotify(`Course approved & official certificate issued (${issuedCertId}) for ${selectedItem.studentName}.`);
      setSelectedItem(null);
      await loadQueue();
    } catch (err: any) {
      setModalError(err?.message || 'Unable to approve course right now. Please try again.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRequestRevision = async () => {
    if (!selectedItem?.certificate) {
      setModalError('A student submission record is required before requesting revisions.');
      return;
    }
    if (!reviewNote.trim()) {
      setModalError('Please add a clear note explaining what the student should complete or update.');
      return;
    }
    setModalError('');
    setSubmittingAction('revision');
    try {
      await lmsService.requestCertificateRevisionByAdmin(
        selectedItem.certificate.certificateId,
        adminEmail,
        reviewNote.trim()
      );
      if (onLogActivity) {
        await onLogActivity(
          'Requested Course Certificate Revision',
          'certificates',
          selectedItem.certificate.certificateId,
          `Requested revision from ${selectedItem.studentName} for "${selectedItem.courseTitle}": ${reviewNote.trim()}`
        );
      }
      onNotify(`Revision feedback sent to ${selectedItem.studentName}.`);
      setSelectedItem(null);
      await loadQueue();
    } catch (err: any) {
      setModalError(err?.message || 'Unable to send revision request.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRevokeCertificate = async () => {
    if (!selectedItem?.certificate) return;
    if (!reviewNote.trim()) {
      setModalError('Please enter a reason for revoking this certificate.');
      return;
    }
    setModalError('');
    setSubmittingAction('revoke');
    try {
      await lmsService.revokeCertificate(
        selectedItem.certificate.certificateId,
        adminEmail,
        reviewNote.trim()
      );
      if (onLogActivity) {
        await onLogActivity(
          'Revoked Course Certificate',
          'certificates',
          selectedItem.certificate.certificateId,
          `Revoked certificate ${selectedItem.certificate.certificateId} for ${selectedItem.studentName}: ${reviewNote.trim()}`
        );
      }
      onNotify(`Certificate ${selectedItem.certificate.certificateId} has been revoked.`);
      setSelectedItem(null);
      await loadQueue();
    } catch (err: any) {
      setModalError(err?.message || 'Unable to revoke certificate.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const renderStatusBadge = (state: CourseApprovalQueueItem['approvalState']) => {
    switch (state) {
      case 'Pending Admin Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Pending Admin Approval
          </span>
        );
      case 'Ready for Approval':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
            <GraduationCap className="w-3 h-3" />
            Completed · Ready to Approve
          </span>
        );
      case 'Issued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
            <ShieldCheck className="w-3 h-3" />
            Approved &amp; Certified
          </span>
        );
      case 'Revision Requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
            <RotateCcw className="w-3 h-3" />
            Revision Requested
          </span>
        );
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            Revoked
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#123D32] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-slate-900">
              Course Approval &amp; Certification Workflow
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
              Review completed student courses, inspect module &amp; quiz verification metrics, and manually approve learners to issue official QR-verified OpenFrame certificates.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing Queue...' : 'Refresh Queue'}</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setFilter('pending')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-800">
            <span>Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 mt-2 tabular-nums">
            {counts.pending}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Submitted by students</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('ready')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'ready'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-blue-800">
            <span>Completed &amp; Ready</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 mt-2 tabular-nums">
            {counts.readyToApprove}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Eligible for direct approval</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('issued')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'issued'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
            <span>Approved &amp; Certified</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 mt-2 tabular-nums">
            {counts.approved}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Live QR certificates</div>
        </button>

        <button
          type="button"
          onClick={() => setFilter('revision_revoked')}
          className={`text-left p-5 rounded-2xl border transition-all cursor-pointer ${
            filter === 'revision_revoked'
              ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-800">
            <span>Revision / Revoked</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 mt-2 tabular-nums">
            {counts.revisionOrRevoked}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Returned or cancelled</div>
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            {(
              [
                { id: 'pending', label: `Pending Approval (${counts.pending})` },
                { id: 'ready', label: `Completed Courses (${counts.readyToApprove})` },
                { id: 'issued', label: `Approved (${counts.approved})` },
                { id: 'revision_revoked', label: `Revision / Revoked (${counts.revisionOrRevoked})` },
                { id: 'all', label: `All (${counts.total})` },
              ] as Array<{ id: ApprovalFilter; label: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, email, course, serial..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-500">
              Loading completed student courses and certification requests...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">No records in this view</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                When students finish their course modules and verification quiz and submit for certification, their records will appear here for your approval.
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Course &amp; Serial</th>
                  <th className="py-3.5 px-4">Completion Metrics</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.studentName}</div>
                      {item.studentEmail && (
                        <div className="text-[11px] text-slate-500 font-mono">{item.studentEmail}</div>
                      )}
                      {item.registrationNumber && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Reg: {item.registrationNumber}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-2">{item.courseTitle}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.courseId}
                        {item.certificate?.certificateId ? ` · ${item.certificate.certificateId}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1.5 min-w-[175px]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600">
                            Lessons: <strong className="text-slate-900 tabular-nums">{item.lessonsCompleted}/{item.totalLessons}</strong>
                          </span>
                          <span className="font-bold text-slate-900 tabular-nums">{item.overallProgressPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.overallProgressPercent >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, item.overallProgressPercent))}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px]">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold tabular-nums ${
                              item.quizAveragePercent >= 70
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Quiz: {Math.round(item.quizAveragePercent)}%
                          </span>
                          <span
                            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold ${
                              item.addressVerified
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            {item.addressVerified ? 'Address Verified' : 'No Address'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="space-y-1">
                        {renderStatusBadge(item.approvalState)}
                        {item.submittedAt && (
                          <div className="text-[10px] text-slate-400">
                            {item.approvalState === 'Issued' ? 'Approved' : 'Updated'}:{' '}
                            {new Date(item.reviewedAt || item.submittedAt).toLocaleDateString()}
                          </div>
                        )}
                        {item.adminApproverEmail && item.approvalState === 'Issued' && (
                          <div className="text-[10px] text-emerald-700 font-medium truncate max-w-[180px]">
                            By: {item.adminApproverEmail}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openReviewModal(item)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                            item.approvalState === 'Pending Admin Approval' ||
                            item.approvalState === 'Ready for Approval'
                              ? 'bg-[#123D32] hover:bg-[#0D2E25] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          {item.approvalState === 'Pending Admin Approval' ||
                          item.approvalState === 'Ready for Approval'
                            ? 'Review & Approve'
                            : 'Inspect'}
                        </button>

                        {item.approvalState === 'Issued' && item.certificate && (
                          <>
                            <button
                              type="button"
                              onClick={() => void lmsService.downloadCertificatePdf(item.certificate!)}
                              title="Download Official Certificate PDF"
                              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/verify-certificate/${item.certificate!.certificateId}`)}
                              title="Open Public QR Verification Page"
                              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-blue-600 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review & Approval Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
          onClick={() => !submittingAction && setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#123D32]">
                  Admin Course Certification Review
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedItem.studentName} — {selectedItem.courseTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submittingAction && setSelectedItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {renderStatusBadge(selectedItem.approvalState)}
                {selectedItem.certificate?.certificateId && (
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                    Serial: {selectedItem.certificate.certificateId}
                  </span>
                )}
              </div>

              {/* Learner & Completion Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Learner Identity
                  </div>
                  <div className="font-bold text-slate-900">{selectedItem.studentName}</div>
                  <div className="text-slate-600 font-mono text-[11px]">
                    {selectedItem.studentEmail || 'No email recorded'}
                  </div>
                  {selectedItem.registrationNumber && (
                    <div className="text-slate-500 text-[11px]">Reg No: {selectedItem.registrationNumber}</div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Academic Completion Metrics
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Modules / Lessons Completed</span>
                    <strong className="text-slate-900 tabular-nums">
                      {selectedItem.lessonsCompleted} / {selectedItem.totalLessons}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Overall Course Progress</span>
                    <strong className="text-slate-900 tabular-nums">{selectedItem.overallProgressPercent}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Verification Quiz Score</span>
                    <strong
                      className={`tabular-nums ${
                        selectedItem.quizAveragePercent >= 70 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {Math.round(selectedItem.quizAveragePercent)}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Dispatch Address Record */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-[#123D32]" />
                  <span>Certificate Dispatch &amp; Contact Verification</span>
                </div>
                {selectedItem.addressSummary ? (
                  <p className="text-slate-600 leading-relaxed">{selectedItem.addressSummary}</p>
                ) : (
                  <p className="text-slate-500">
                    No residential dispatch address recorded yet. You can still approve digital certification directly.
                  </p>
                )}
                {(selectedItem.certificate?.mobileNumber || selectedItem.enrollment?.mobileNumber) && (
                  <p className="text-[11px] text-slate-500 tabular-nums">
                    Mobile: {selectedItem.certificate?.mobileNumber || selectedItem.enrollment?.mobileNumber}
                    {(selectedItem.certificate?.alternativeMobileNumber ||
                      selectedItem.enrollment?.alternativeMobileNumber)
                      ? ` · Alt: ${
                          selectedItem.certificate?.alternativeMobileNumber ||
                          selectedItem.enrollment?.alternativeMobileNumber
                        }`
                      : ''}
                  </p>
                )}
              </div>

              {/* Certificate Type & Admin Review Note */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Certificate Credential Type
                  </label>
                  <select
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value as CertificateType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32]"
                  >
                    {CERTIFICATE_TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Admin Approval Seal Note / Revision Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Optional note when approving (or required feedback when requesting revision / revoking)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#123D32] resize-none"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium">
                  {modalError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  {selectedItem.certificate &&
                    selectedItem.approvalState !== 'Issued' &&
                    selectedItem.approvalState !== 'Revoked' && (
                      <button
                        type="button"
                        onClick={handleRequestRevision}
                        disabled={Boolean(submittingAction)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{submittingAction === 'revision' ? 'Sending...' : 'Request Revision'}</span>
                      </button>
                    )}

                  {selectedItem.certificate && selectedItem.approvalState === 'Issued' && (
                    <button
                      type="button"
                      onClick={handleRevokeCertificate}
                      disabled={Boolean(submittingAction)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{submittingAction === 'revoke' ? 'Revoking...' : 'Revoke Certificate'}</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {selectedItem.approvalState === 'Issued' && selectedItem.certificate ? (
                    <>
                      <button
                        type="button"
                        onClick={() => void lmsService.downloadCertificatePdf(selectedItem.certificate!)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedItem(null);
                          navigate(`/verify-certificate/${selectedItem.certificate!.certificateId}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Verify QR Page</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApproveAndIssue}
                      disabled={Boolean(submittingAction)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {submittingAction === 'approve'
                          ? 'Approving & Issuing Certificate...'
                          : 'Approve Course & Issue Certificate'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
