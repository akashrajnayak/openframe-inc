import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Search,
  ExternalLink,
  RefreshCw,
  Shield,
  UserCog,
} from 'lucide-react';
import {
  SchoolApplicationStatus,
  SchoolInstitution,
  SchoolPartnerEnquiry,
  SchoolTenantAuditLog,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';
import { AdminDataTable } from '../admin/AdminDataTable';

interface AdminSchoolPartnerGovernanceProps {
  enquiries: SchoolPartnerEnquiry[];
  actor: SchoolAuditActor;
  isSuperAdmin: boolean;
  onInspectEnquiry: (row: SchoolPartnerEnquiry) => void;
  onEnquiryStatusChange: (id: string, status: string) => void;
  onDeleteEnquiry: (id: string) => void;
}

export const AdminSchoolPartnerGovernance: React.FC<AdminSchoolPartnerGovernanceProps> = ({
  enquiries,
  actor,
  isSuperAdmin,
  onInspectEnquiry,
  onEnquiryStatusChange,
  onDeleteEnquiry,
}) => {
  const [subTab, setSubTab] = useState<'applications' | 'enquiries'>('applications');
  const [institutions, setInstitutions] = useState<SchoolInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<SchoolInstitution | null>(null);
  const [schoolLogs, setSchoolLogs] = useState<SchoolTenantAuditLog[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [customSchoolCode, setCustomSchoolCode] = useState('');
  const [reassignUid, setReassignUid] = useState('');
  const [reassignEmail, setReassignEmail] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const loadInstitutions = async () => {
    setLoading(true);
    try {
      const list = await schoolPartnerService.getAllSchoolInstitutionsAdmin();
      setInstitutions(list);
      if (selectedSchool) {
        const refreshed = list.find((i) => i.id === selectedSchool.id);
        if (refreshed) setSelectedSchool(refreshed);
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Unable to load school applications.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInstitutions();
  }, []);

  const handleSelectSchool = async (inst: SchoolInstitution) => {
    setSelectedSchool(inst);
    setReviewComment(inst.reviewerNotes || '');
    setCustomSchoolCode(inst.institutionCode || '');
    setReassignUid('');
    setReassignEmail('');
    setFeedbackMsg(null);
    try {
      const logs = await schoolPartnerService.getSchoolAuditLogs(inst.id);
      setSchoolLogs(logs);
    } catch {
      setSchoolLogs([]);
    }
  };

  const handleReviewAction = async (nextStatus: SchoolApplicationStatus) => {
    if (!selectedSchool) return;
    if (
      (nextStatus === 'Rejected' ||
        nextStatus === 'More Information Required' ||
        nextStatus === 'Suspended') &&
      reviewComment.trim().length < 5
    ) {
      setFeedbackMsg({
        type: 'err',
        text: `Please provide a clear review comment (at least 5 characters) before marking as ${nextStatus}.`,
      });
      return;
    }

    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      const updated = await schoolPartnerService.adminReviewSchoolApplication({
        institution: selectedSchool,
        nextStatus,
        reviewComment: reviewComment.trim(),
        schoolCode: customSchoolCode.trim() || undefined,
        actor,
      });
      setInstitutions((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setSelectedSchool(updated);
      const logs = await schoolPartnerService.getSchoolAuditLogs(updated.id);
      setSchoolLogs(logs);
      setFeedbackMsg({
        type: 'ok',
        text: `${updated.name} status updated to ${nextStatus}.`,
      });
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Application review failed.' });
    } finally {
      setActionBusy(false);
    }
  };

  const handleReassignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    setActionBusy(true);
    setFeedbackMsg(null);
    try {
      await schoolPartnerService.adminReassignSchoolAdmin({
        institution: selectedSchool,
        newAdminUid: reassignUid,
        newAdminEmail: reassignEmail,
        actor,
      });
      await loadInstitutions();
      setFeedbackMsg({
        type: 'ok',
        text: `Primary school administrator reassigned to ${reassignEmail}.`,
      });
      setReassignUid('');
      setReassignEmail('');
    } catch (err: any) {
      setFeedbackMsg({ type: 'err', text: err?.message || 'Reassignment failed.' });
    } finally {
      setActionBusy(false);
    }
  };

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesStatus = statusFilter === 'All' || inst.verificationStatus === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesQuery =
      !q ||
      inst.name.toLowerCase().includes(q) ||
      (inst.city || '').toLowerCase().includes(q) ||
      (inst.institutionCode || '').toLowerCase().includes(q) ||
      (inst.applicationRef || '').toLowerCase().includes(q) ||
      (inst.adminEmail || '').toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const renderStatusDot = (status: SchoolApplicationStatus) => {
    const dot =
      status === 'Approved'
        ? 'bg-emerald-500'
        : status === 'Submitted' || status === 'Under Review'
        ? 'bg-blue-500'
        : status === 'More Information Required'
        ? 'bg-amber-500'
        : status === 'Rejected' || status === 'Suspended'
        ? 'bg-rose-500'
        : 'bg-slate-400';
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
        <span className={`w-2 h-2 rounded-full ${dot}`} />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-[#14213D]">
            School Partner Onboarding & Governance
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Verify school registrations, review documents, assign institution codes, and monitor incoming partnership enquiries.
          </p>
        </div>
        <div className="inline-flex border border-slate-200 rounded-xl bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setSubTab('applications')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              subTab === 'applications'
                ? 'bg-[#14213D] text-white'
                : 'text-[#64748B] hover:text-slate-900'
            }`}
          >
            School Applications ({institutions.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('enquiries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
              subTab === 'enquiries'
                ? 'bg-[#14213D] text-white'
                : 'text-[#64748B] hover:text-slate-900'
            }`}
          >
            Partnership Enquiries ({enquiries.length})
          </button>
        </div>
      </div>

      {subTab === 'enquiries' ? (
        <AdminDataTable<SchoolPartnerEnquiry>
          title="School Partnership Enquiries"
          description="Inbound partnership requests submitted by K-12 schools and colleges."
          data={enquiries}
          exportFileName="school_partnership_enquiries.csv"
          columns={[
            {
              header: 'School / Institution',
              accessor: (row) => (
                <div>
                  <div className="font-bold text-slate-900">{row.organizationName}</div>
                  <div className="text-[11px] text-slate-500">
                    {row.city}, {row.state}
                  </div>
                </div>
              ),
            },
            {
              header: 'Head / Contact',
              accessor: (row) => (
                <div>
                  <div className="font-medium text-slate-800">{row.contactPerson}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{row.emailAddress}</div>
                </div>
              ),
            },
            {
              header: 'Institution Type',
              accessor: (row) => (
                <span className="font-mono text-slate-700 font-semibold">{row.institutionType}</span>
              ),
            },
          ]}
          onInspect={onInspectEnquiry}
          onStatusChange={onEnquiryStatusChange}
          canDelete={isSuperAdmin}
          onDelete={onDeleteEnquiry}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Applications List */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search school name, city, code, or admin email..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#2563EB]"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="All">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="More Information Required">Corrections Needed</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Draft">Draft</option>
                </select>
                <button
                  type="button"
                  onClick={() => void loadInstitutions()}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                  aria-label="Refresh applications"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Loading registered partner schools...
              </div>
            ) : filteredInstitutions.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                No school applications match your current filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 pr-3">School & Board</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Code / Ref</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredInstitutions.map((inst) => (
                      <tr
                        key={inst.id}
                        className={`hover:bg-slate-50 cursor-pointer ${
                          selectedSchool?.id === inst.id ? 'bg-[#EFF6FF]/60' : ''
                        }`}
                        onClick={() => void handleSelectSchool(inst)}
                      >
                        <td className="py-3 pr-3">
                          <div className="font-bold text-[#14213D]">{inst.name || '(Untitled Draft)'}</div>
                          <div className="text-[11px] text-slate-500">
                            {inst.boardAffiliation} · {inst.adminEmail}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {inst.city || '—'}, {inst.state || '—'}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums text-[11px] text-slate-700">
                          {inst.institutionCode || inst.applicationRef}
                        </td>
                        <td className="py-3 px-3">{renderStatusDot(inst.verificationStatus)}</td>
                        <td className="py-3 pl-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleSelectSchool(inst);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#2563EB] text-[11px] font-semibold text-[#14213D]"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Governance Review Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
            {!selectedSchool ? (
              <div className="py-16 text-center space-y-2 text-xs text-slate-500">
                <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Select a school application from the table to inspect documents and perform approval governance.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-200 pb-4 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-heading font-bold text-[#14213D] truncate">
                      {selectedSchool.name}
                    </h3>
                    {renderStatusDot(selectedSchool.verificationStatus)}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Ref: {selectedSchool.applicationRef} · UDISE: {selectedSchool.udiseCode || 'N/A'}
                  </div>
                </div>

                {feedbackMsg && (
                  <div
                    className={`p-3 rounded-xl border text-xs ${
                      feedbackMsg.type === 'ok'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Principal:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSchool.principalName} ({selectedSchool.principalDesignation})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="font-mono text-slate-800">
                      {selectedSchool.principalMobile} · {selectedSchool.principalEmail}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Scale:</span>
                    <span className="font-mono tabular-nums text-slate-800">
                      {selectedSchool.studentCountEstimate} Students · {selectedSchool.teacherCountEstimate} Teachers
                    </span>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-[#14213D]">Verification Documents</div>
                  {selectedSchool.documents.length === 0 ? (
                    <div className="text-xs text-slate-500 border border-dashed border-slate-200 rounded-xl p-3">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedSchool.documents.map((docItem) => (
                        <a
                          key={docItem.id}
                          href={docItem.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs"
                        >
                          <span className="truncate font-medium text-slate-800">
                            {docItem.docType}: {docItem.fileName}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Review Form */}
                <div className="space-y-3 border-t border-slate-200 pt-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Institution Code (auto-generated on approval if blank)
                    </label>
                    <input
                      type="text"
                      value={customSchoolCode}
                      onChange={(e) => setCustomSchoolCode(e.target.value.toUpperCase())}
                      placeholder="e.g. OFS-BLR-0102"
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reviewer Decision Note / Feedback
                    </label>
                    <textarea
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Required when requesting corrections, rejecting, or suspending..."
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void handleReviewAction('Approved')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve School</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void handleReviewAction('Under Review')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark Review</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => void handleReviewAction('More Information Required')}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold disabled:opacity-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Ask Correction</span>
                    </button>
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() =>
                        void handleReviewAction(
                          selectedSchool.verificationStatus === 'Approved' ? 'Suspended' : 'Rejected'
                        )
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>
                        {selectedSchool.verificationStatus === 'Approved' ? 'Suspend' : 'Reject'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Admin Reassignment (Recovery) */}
                <form onSubmit={handleReassignAdmin} className="space-y-2 border-t border-slate-200 pt-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#14213D]">
                    <UserCog className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Reassign School Admin UID</span>
                  </div>
                  <input
                    type="text"
                    value={reassignUid}
                    onChange={(e) => setReassignUid(e.target.value)}
                    placeholder="New Admin Firebase UID"
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg"
                  />
                  <input
                    type="email"
                    value={reassignEmail}
                    onChange={(e) => setReassignEmail(e.target.value)}
                    placeholder="New Admin Email"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                  />
                  <button
                    type="submit"
                    disabled={actionBusy || !reassignUid.trim() || !reassignEmail.trim()}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 disabled:opacity-50"
                  >
                    Transfer Primary School Admin
                  </button>
                </form>

                {/* Recent Tenant Audit Trail */}
                {schoolLogs.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#14213D]">
                      <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Recent Audit Trail</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {schoolLogs.slice(0, 6).map((l) => (
                        <div key={l.id} className="text-[11px] bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <div className="font-semibold text-slate-800">{l.action}</div>
                          <div className="text-slate-600">{l.summary}</div>
                          <div className="text-slate-400 font-mono">
                            {l.actorEmail} · {new Date(l.createdAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
