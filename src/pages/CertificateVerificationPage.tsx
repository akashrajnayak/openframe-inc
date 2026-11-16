import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Download,
  Search,
  Printer,
  AlertCircle
} from 'lucide-react';
import { useRouter } from '../router/RouterContext';
import { lmsService } from '../services/lmsService';
import { IssuedCertificate } from '../types';

export const CertificateVerificationPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  const clean = currentPath.split('?')[0];
  const parts = clean.split('/').filter(Boolean);
  const certIdParam = parts[1] || '';

  const [searchCertId, setSearchCertId] = useState(certIdParam);
  const [cert, setCert] = useState<IssuedCertificate | null>(null);
  const [loading, setLoading] = useState(Boolean(certIdParam));

  useEffect(() => {
    setSearchCertId(certIdParam);
    if (!certIdParam) {
      setCert(null);
      setLoading(false);
      return;
    }

    let active = true;
    async function loadCert() {
      setLoading(true);
      const res = await lmsService.getCertificate(certIdParam);
      if (active) {
        setCert(res);
        setLoading(false);
      }
    }
    loadCert();
    return () => {
      active = false;
    };
  }, [certIdParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCertId.trim()) {
      navigate(`/verify-certificate/${encodeURIComponent(searchCertId.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>OpenFrame Official Public Credential Registry</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Certificate Verification Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Verify the authenticity of professional certifications issued by OpenFrame IT Solutions Private Limited in academic association with HopeNest Global Foundation.
          </p>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Enter Certificate Serial (e.g. OF-CERT-2026-4812)"
              value={searchCertId}
              onChange={(e) => setSearchCertId(e.target.value)}
              className="flex-1 text-xs p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Verify</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Checking official OpenFrame registry...</span>
          </div>
        ) : !certIdParam ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
            Enter a certificate serial number above or scan the QR code printed on an issued OpenFrame credential to verify authenticity.
          </div>
        ) : cert ? (
          <div className="space-y-6">
            {/* Status Banner */}
            <div
              className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                cert.status === 'Revoked'
                  ? 'bg-rose-50 border-rose-200'
                  : cert.status === 'Pending Admin Approval'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {cert.status === 'Revoked' ? (
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                ) : (
                  <CheckCircle2
                    className={`w-6 h-6 shrink-0 ${
                      cert.status === 'Pending Admin Approval' ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  />
                )}
                <div>
                  <h2 className="font-bold text-sm text-slate-900">
                    {cert.status === 'Revoked'
                      ? 'Credential Revoked'
                      : cert.status === 'Pending Admin Approval'
                      ? 'Pending Final Institutional Seal'
                      : 'Authentic & Verified Credential'}
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Serial {cert.certificateId} · Recorded on OpenFrame Academic Registry
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {cert.status !== 'Revoked' && cert.status !== 'Pending Admin Approval' && (
                  <button
                    type="button"
                    onClick={() => lmsService.downloadCertificatePdf(cert)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Official Certificate Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center space-y-6">
              <div className="flex justify-between items-start text-left">
                <div>
                  <div className="text-[11px] font-medium text-slate-400">Official Credential Serial</div>
                  <div className="font-mono text-sm font-bold text-blue-700 tabular-nums">{cert.certificateId}</div>
                </div>
                <Award className="w-8 h-8 text-blue-600 shrink-0" />
              </div>

              <div className="max-w-2xl mx-auto space-y-3">
                <div className="text-xs font-semibold text-slate-500">
                  OpenFrame IT Solutions Private Limited
                </div>
                <div className="text-[11px] text-slate-400">
                  {cert.accreditationBody || 'Academic Alliance with HopeNest Global Foundation'}
                </div>

                <div className="pt-2 text-xs font-bold tracking-wider uppercase text-blue-600">
                  {cert.certificateType || 'Course Completion Certificate'}
                </div>

                <p className="text-xs text-slate-500 pt-1">This is to certify that</p>

                <div className="text-3xl font-serif font-bold text-slate-900 border-b border-slate-200 pb-3 inline-block px-8">
                  {cert.studentName}
                </div>

                <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
                  has completed all mandatory coursework, verified theoretical comprehension through Quinn AI assessments, and passed faculty rubric evaluation with{' '}
                  <strong>{cert.grade}</strong> ({cert.score ?? cert.finalScore ?? 0}/100) in:
                </p>

                <h3 className="text-xl font-bold text-slate-900 py-1">
                  {cert.courseTitle || cert.courseName}
                </h3>

                <div className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-xs">
                  <div className="text-center sm:text-left">
                    <div className="text-slate-400">Issue Date</div>
                    <div className="font-semibold text-slate-800 mt-0.5 tabular-nums">
                      {cert.issuedDate ||
                        (cert.completionDate && !Number.isNaN(new Date(cert.completionDate).getTime())
                          ? new Date(cert.completionDate).toLocaleDateString()
                          : 'Verified Credential')}
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    {cert.qrCodeUrl && (
                      <img
                        src={cert.qrCodeUrl}
                        alt="Certificate Verification QR"
                        className="w-20 h-20 border border-slate-200 p-1 rounded-xl bg-white"
                      />
                    )}
                    <span className="text-[10px] text-slate-400 mt-1">
                      QR Proof Verified · {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="font-serif italic font-bold text-slate-900 text-sm">
                      {cert.teacherName || 'OpenFrame Academic Board'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {cert.authorizedSignatory || 'Authorized Signatory'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">
                Issuance Basis & Statutory Clarification
              </p>
              <p>
                Issued by OpenFrame IT Solutions Private Limited (OpenFrame Education) based on internal assessments, coursework completion, and faculty evaluation rubrics. This credential is an institutional skill & course completion certificate and does not constitute a university degree or statutory government accreditation.
              </p>
              <p className="text-[11px] text-slate-400">
                Public registry verification displays validated academic credentials without exposing private learner contact details.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h2 className="font-bold text-base text-slate-900">No Certificate Found for {certIdParam}</h2>
            <p className="text-xs text-slate-500">
              Verify the serial number printed on the certificate and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
