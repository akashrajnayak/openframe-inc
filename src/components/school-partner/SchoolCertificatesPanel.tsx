import React, { useState } from 'react';
import { Award, Plus, Download, ExternalLink, QrCode, X } from 'lucide-react';
import {
  SchoolInstitution,
  SchoolTenantCertificate,
  SchoolTenantStudent,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';
import { Link } from '../../router/RouterContext';

interface SchoolCertificatesPanelProps {
  institution: SchoolInstitution;
  students: SchoolTenantStudent[];
  certificates: SchoolTenantCertificate[];
  actor: SchoolAuditActor;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolCertificatesPanel: React.FC<SchoolCertificatesPanelProps> = ({
  institution,
  students,
  certificates,
  actor,
  isSchoolAdmin,
  isApproved,
  onRefresh,
}) => {
  const [issueOpen, setIssueOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [programTitle, setProgramTitle] = useState('');
  const [achievementSummary, setAchievementSummary] = useState(
    'Successfully demonstrated proficiency and academic commitment.'
  );
  const [issuerName, setIssuerName] = useState(institution.principalName || 'Principal');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // QR Preview Modal & Revoke/Correct Modal
  const [previewCert, setPreviewCert] = useState<SchoolTenantCertificate | null>(null);
  const [revokingCert, setRevokingCert] = useState<SchoolTenantCertificate | null>(null);
  const [nextAction, setNextAction] = useState<'Revoked' | 'Corrected'>('Revoked');
  const [reasonNote, setReasonNote] = useState('');
  const [correctedTitle, setCorrectedTitle] = useState('');

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = students.find((s) => s.id === studentId);
    if (!stu || !programTitle.trim()) {
      setErrorMsg('Please select a student and enter the program/award title.');
      return;
    }
    setBusy(true);
    setErrorMsg('');
    try {
      await schoolPartnerService.issueSchoolCertificate({
        institution,
        student: stu,
        programId: 'school-credential',
        programTitle: programTitle.trim(),
        achievementSummary: achievementSummary.trim(),
        issuerName: issuerName.trim(),
        actor,
      });
      setIssueOpen(false);
      setProgramTitle('');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Certificate issuance failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleRevokeOrCorrect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingCert || reasonNote.trim().length < 5) {
      setErrorMsg('Please enter an explicit audit reason or correction note (min 5 chars).');
      return;
    }
    setBusy(true);
    setErrorMsg('');
    try {
      await schoolPartnerService.revokeOrCorrectCertificate({
        certificate: revokingCert,
        nextStatus: nextAction,
        reasonOrNote: reasonNote.trim(),
        correctedProgramTitle: nextAction === 'Corrected' ? correctedTitle.trim() : undefined,
        actor,
      });
      setRevokingCert(null);
      setReasonNote('');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to update certificate.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            Certificates & Public QR Verification
          </h1>
          <p className="text-xs text-[#64748B]">
            Generate non-guessable serial certificates with embedded QR verification links exposing zero sensitive student PII.
          </p>
        </div>
        {isSchoolAdmin && isApproved && (
          <button
            type="button"
            disabled={students.length === 0}
            onClick={() => {
              setStudentId(students[0]?.id || '');
              setErrorMsg('');
              setIssueOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Certificate</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        {certificates.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No certificates issued by this school yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Serial ID</th>
                  <th className="py-2.5 px-3">Student & Class</th>
                  <th className="py-2.5 px-3">Program / Award</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {certificates.map((cert) => (
                  <tr key={cert.certificateId}>
                    <td className="py-3 pr-3 font-mono font-bold text-[#14213D]">
                      {cert.certificateId}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{cert.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {cert.studentCode} · {cert.className}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{cert.programTitle}</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            cert.status === 'Revoked'
                              ? 'bg-rose-500'
                              : cert.status === 'Corrected'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>{cert.status}</span>
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div className="inline-flex flex-wrap justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewCert(cert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold"
                        >
                          <QrCode className="w-3 h-3" />
                          <span>QR</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => void schoolPartnerService.downloadSchoolCertificatePdf(cert)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-[#14213D]"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        <Link
                          to={`/verify-certificate/${cert.certificateId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Verify</span>
                        </Link>
                        {isSchoolAdmin && isApproved && cert.status !== 'Revoked' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokingCert(cert);
                              setNextAction('Revoked');
                              setCorrectedTitle(cert.programTitle);
                              setReasonNote('');
                              setErrorMsg('');
                            }}
                            className="px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 text-[11px] font-semibold"
                          >
                            Correct / Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Issue Modal */}
      {issueOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleIssue}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              Issue QR-Verified Student Certificate
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Student *</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.studentCode} · {s.className}-{s.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Program / Achievement Title *
              </label>
              <input
                type="text"
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                placeholder="e.g. Python & AI Foundations Cohort"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Citation Summary
              </label>
              <textarea
                rows={2}
                value={achievementSummary}
                onChange={(e) => setAchievementSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Authorized Signatory Name *
              </label>
              <input
                type="text"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIssueOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {busy ? 'Generating QR...' : 'Issue Certificate'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* QR Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl relative">
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-[#14213D]">Public QR Verification</h3>
            {previewCert.qrDataUrl && (
              <img
                src={previewCert.qrDataUrl}
                alt={`QR for ${previewCert.certificateId}`}
                className="w-44 h-44 mx-auto border border-slate-200 rounded-xl p-2"
              />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-mono font-bold text-[#2563EB]">{previewCert.certificateId}</div>
              <div className="font-semibold text-slate-800">{previewCert.studentName}</div>
              <div className="text-[#64748B]">{previewCert.programTitle}</div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke / Correct Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleRevokeOrCorrect}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              Update Certificate {revokingCert.certificateId}
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Action</label>
              <select
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="Revoked">Revoke Certificate (Marks invalid publicly)</option>
                <option value="Corrected">Issue Correction Note / Update Title</option>
              </select>
            </div>
            {nextAction === 'Corrected' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Updated Program / Award Title
                </label>
                <input
                  type="text"
                  value={correctedTitle}
                  onChange={(e) => setCorrectedTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Mandatory Audit Reason / Note *
              </label>
              <textarea
                rows={3}
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevokingCert(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-[#14213D] text-white text-xs font-semibold"
              >
                {busy ? 'Updating...' : 'Apply & Propagate'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
