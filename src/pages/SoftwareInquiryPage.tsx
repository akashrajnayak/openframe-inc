import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  Code,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Server,
  Database,
  Smartphone,
  Cpu,
  ShieldCheck,
  Check
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitSoftwareEnquiryToFirestore } from '../services/firebase';

export const SoftwareInquiryPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    emailAddress: '',
    mobileNumber: '',
    requiredService: 'Enterprise Software & Cloud Systems',
    projectDescription: '',
    estimatedBudget: 'INR 5,00,000 – 15,00,000',
    timeline: '2 – 4 Months',
    preferredContactMethod: 'Email & Technical Call',
    consentAccepted: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const services = [
    'Enterprise Software & Cloud Systems',
    'Full-Stack Web Application (React / Node / TypeScript)',
    'Mobile Application Development (iOS / Android / Cross-Platform)',
    'API Architecture & Microservices Modernization',
    'Database Engineering & Distributed Storage',
    'DevOps, CI/CD Pipeline & Cloud Security',
    'Custom AI / Machine Learning Workflow Integration',
    'Legacy Software Refactoring & Audit'
  ];

  const budgetTiers = [
    'INR 2,00,000 – 5,00,000 (MVP / Pilot Phase)',
    'INR 5,00,000 – 15,00,000 (Production System)',
    'INR 15,00,000 – 35,00,000 (Comprehensive Enterprise Platform)',
    'Above INR 35,00,000 (Multi-Module Ecosystem)',
    'Undetermined / Needs Advisory'
  ];

  const timelineOptions = [
    '1 – 2 Months (Rapid MVP)',
    '2 – 4 Months (Standard Release)',
    '4 – 8 Months (Comprehensive Multi-Tier)',
    'Ongoing Retainer / Dedicated Team'
  ];

  const validateIndianMobile = (mobile: string): boolean => {
    const clean = mobile.replace(/[\s\-+()]/g, '');
    const mobile10 = clean.length > 10 ? clean.slice(-10) : clean;
    return /^[6-9]\d{9}$/.test(mobile10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.emailAddress.trim() || !formData.projectDescription.trim()) {
      setErrorMessage('Please fill in your name, email address, and project description.');
      return;
    }

    if (!validateIndianMobile(formData.mobileNumber)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        companyName: formData.companyName.trim() || undefined,
        emailAddress: formData.emailAddress.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        requiredService: formData.requiredService,
        projectDescription: formData.projectDescription.trim(),
        estimatedBudget: formData.estimatedBudget,
        timeline: formData.timeline,
        preferredContactMethod: formData.preferredContactMethod,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      // Dual write: storageService + Firestore software_enquiries
      storageService.saveDedicatedSoftwareEnquiry(payload);

      try {
        await submitSoftwareEnquiryToFirestore(payload);
      } catch (err) {
        console.warn('Firestore write warning:', err);
      }

      setSubmitted(true);
      setFormData({
        name: '',
        companyName: '',
        emailAddress: '',
        mobileNumber: '',
        requiredService: 'Enterprise Software & Cloud Systems',
        projectDescription: '',
        estimatedBudget: 'INR 5,00,000 – 15,00,000',
        timeline: '2 – 4 Months',
        preferredContactMethod: 'Email & Technical Call',
        consentAccepted: true,
      });
    } catch {
      setErrorMessage('Failed to transmit software requirement. Please retry or contact us directly.');
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
            to="/it-solutions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to IT Solutions Portfolio</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-sky-300 text-xs font-semibold uppercase tracking-wider block w-fit">
            Engineering Consultation & Scope Intake
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Software Development & Technical Quotation Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            Provide technical specifications, operational scale, and target architectural goals. Our engineering architects review every requirement under strict non-disclosure.
          </p>
        </div>
      </section>

      {/* Form Container */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Technical Intake
            </span>
            <h2 className="text-xl font-heading font-bold text-slate-900 mt-0.5">
              Project Parameters & Scope
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Logged to the <code className="text-blue-600 font-mono">software_enquiries</code> Firestore collection for architectural assessment.
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
                Software Specification Registered
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Thank you for submitting your project parameters. A senior software architect will review your technical description and prepare an architectural brief and feasibility roadmap.
              </p>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-colors"
                >
                  Submit Another Project Scope
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Roy"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organisation Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Industrial Systems"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
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
                  Required Service / Domain *
                </label>
                <select
                  value={formData.requiredService}
                  onChange={(e) => setFormData({ ...formData, requiredService: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Budget Range *
                  </label>
                  <select
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {budgetTiers.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Target Delivery Timeline *
                  </label>
                  <select
                    value={formData.timeline}
                    onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {timelineOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Description & Specifications *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Detail user roles, key features, database considerations, performance metrics, or integrations required..."
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Contact Method
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                >
                  <option value="Email & Technical Call">Email & Technical Call</option>
                  <option value="WhatsApp & Mobile Call">WhatsApp & Mobile Call</option>
                  <option value="Direct In-Person Meeting (Bengaluru HQ)">Direct In-Person Meeting (Bengaluru HQ)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Technical Scope...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Software Requirements</span>
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
