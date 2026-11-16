import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  Briefcase,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  Handshake,
  Check,
  HelpCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitBusinessEnquiryToFirestore } from '../services/firebase';

export const BusinessInquiryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    organisation: '',
    emailAddress: '',
    mobileNumber: '',
    businessRequirement: 'Commercial Collaboration & Strategic Alliance',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requirements = [
    'Commercial Collaboration & Strategic Alliance',
    'Enterprise Technology Modernization',
    'Vendor Empanelment & Procurement',
    'Institutional Education & Lab Licensing',
    'Digital Product Distribution (Life Smart Card / StudyNotePro / LinkX)',
    'Institutional Skill & Educational Sponsorship',
    'Joint Venture / Co-Development',
    'General Commercial Advisory'
  ];

  const validateIndianMobile = (mobile: string): boolean => {
    const clean = mobile.replace(/[\s\-+()]/g, '');
    const mobile10 = clean.length > 10 ? clean.slice(-10) : clean;
    return /^[6-9]\d{9}$/.test(mobile10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.organisation.trim() || !formData.emailAddress.trim() || !formData.message.trim()) {
      setErrorMessage('Please complete all mandatory fields.');
      return;
    }

    if (!validateIndianMobile(formData.mobileNumber)) {
      setErrorMessage('Please provide a valid 10-digit Indian mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        organisation: formData.organisation.trim(),
        emailAddress: formData.emailAddress.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        businessRequirement: formData.businessRequirement,
        message: formData.message.trim(),
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      // Dual write: storageService + Firestore business_enquiries
      storageService.saveBusinessEnquiry(payload);

      try {
        await submitBusinessEnquiryToFirestore(payload);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      setSubmitted(true);
      setFormData({
        name: '',
        organisation: '',
        emailAddress: '',
        mobileNumber: '',
        businessRequirement: 'Commercial Collaboration & Strategic Alliance',
        message: '',
      });
    } catch {
      setErrorMessage('Unable to record business enquiry at this time. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto space-y-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contact Directory</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-sky-300 text-xs font-semibold uppercase tracking-wider block w-fit">
            Corporate Development & Alliances
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Commercial & Business Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Propose institutional engagements, procurement relationships, enterprise solutions or commercial partnerships with OpenFrame IT Solutions Private Limited.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Commercial Proposal Form
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 mt-0.5">
              Business Engagement Details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recorded in the corporate <code className="text-blue-600 font-mono">business_enquiries</code> Firestore registry for business development evaluation.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {submitted ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-heading font-bold text-emerald-950">
                Business Proposal Logged
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you for your interest in partnering with OpenFrame IT Solutions Private Limited. Your proposal has been forwarded to our corporate alliances division.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-colors"
                >
                  Submit Another Commercial Proposal
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Authorized Representative Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Murthy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Organisation / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zenith Enterprises Pvt Ltd"
                    value={formData.organisation}
                    onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Corporate Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@organisation.com"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number (10 Digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9845012345"
                    maxLength={15}
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Business Requirement / Nature of Proposal *
                </label>
                <select
                  value={formData.businessRequirement}
                  onChange={(e) => setFormData({ ...formData, businessRequirement: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {requirements.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Detailed Proposal / Commercial Scope *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your organization's business model, expected terms of engagement, timelines, and commercial objectives..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Commercial Proposal...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Business Proposal</span>
                  </>
                )}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
