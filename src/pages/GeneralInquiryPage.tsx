import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  FileText,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitGeneralEnquiryToFirestore } from '../services/firebase';

export const GeneralInquiryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    state: 'Karnataka',
    enquiryCategory: 'General Business & Operations',
    subject: '',
    message: '',
    consentAccepted: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const indianStates = [
    'Karnataka',
    'Maharashtra',
    'Telangana',
    'Tamil Nadu',
    'Andhra Pradesh',
    'Kerala',
    'Delhi NCR',
    'Gujarat',
    'Rajasthan',
    'Uttar Pradesh',
    'West Bengal',
    'Madhya Pradesh',
    'Goa',
    'Other State / UT'
  ];

  const categories = [
    'General Business & Operations',
    'Enterprise IT Solutions & Cloud Advisory',
    'OpenFrame Education Programmes',
    'Digital Platforms & Products (Life Smart Card, LearnXcel, etc.)',
    'Academic & University Partnerships',
    'Vendor Empanelment & Procurement',
    'Press & Media Communications',
    'Other General Matters'
  ];

  const validateIndianMobile = (mobile: string): boolean => {
    const clean = mobile.replace(/[\s\-+()]/g, '');
    const mobile10 = clean.length > 10 ? clean.slice(-10) : clean;
    return /^[6-9]\d{9}$/.test(mobile10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim() || !formData.emailAddress.trim() || !formData.city.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (!validateIndianMobile(formData.mobileNumber)) {
      setErrorMessage('Please provide a valid 10-digit Indian mobile number (e.g. 9845012345).');
      return;
    }

    if (!formData.consentAccepted) {
      setErrorMessage('Please consent to communication before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        city: formData.city.trim(),
        state: formData.state,
        enquiryCategory: formData.enquiryCategory,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      // Dual write: storageService + Firestore
      storageService.saveGeneralEnquiry(payload);

      try {
        await submitGeneralEnquiryToFirestore(payload);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      setSubmitted(true);
      setFormData({
        fullName: '',
        mobileNumber: '',
        emailAddress: '',
        city: '',
        state: 'Karnataka',
        enquiryCategory: 'General Business & Operations',
        subject: '',
        message: '',
        consentAccepted: false,
      });
    } catch {
      setErrorMessage('Could not record your enquiry. Please check your connection and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto space-y-3">
          <Link
            to="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Contact & Directory</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-sky-300 text-xs font-semibold uppercase tracking-wider block w-fit">
            General Inquiries Registry
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            General Business & Corporate Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Submit formal communications, corporate queries, or questions about OpenFrame IT Solutions Private Limited directly to our executive triage registry.
          </p>
        </div>
      </section>

      {/* Main Form Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Enquiry Form
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 mt-0.5">
              Submit Your Detailed Query
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your submission will be stored securely in our centralized Firestore enquiry collection (<code className="text-blue-600 font-mono">general_enquiries</code>).
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
                General Enquiry Successfully Logged
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to OpenFrame IT Solutions Private Limited. Your enquiry has been received and routed to the corresponding corporate division for review.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-colors"
                >
                  Submit Another Enquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@company.com or personal email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru, Hubballi, Pune"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State / Region *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enquiry Category *
                  </label>
                  <select
                    value={formData.enquiryCategory}
                    onChange={(e) => setFormData({ ...formData, enquiryCategory: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief summary of your query"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Message / Detailed Context *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your requirements, background, or specific questions in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consentCheck"
                    required
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="consentCheck" className="text-xs text-slate-700 leading-relaxed">
                    <strong>Consent & Verification Declaration:</strong> I hereby confirm that the information provided is accurate, and I consent to OpenFrame IT Solutions Private Limited contacting me regarding this enquiry via phone, email, or official communications channels.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit General Enquiry</span>
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
