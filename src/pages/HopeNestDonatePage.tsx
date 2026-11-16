import React, { useState } from 'react';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import { storageService } from '../services/storageService';
import { submitHopeNestDonation, triggerAdminNotification } from '../services/firebase';
import {
  Heart,
  ShieldCheck,
  Building,
  CheckCircle2,
  Send,
  AlertCircle,
  Package,
  Wrench,
  BookOpen,
  HelpCircle
} from 'lucide-react';

export const HopeNestDonatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    organizationName: '',
    supportType: 'Equipment & Hardware' as 'Equipment & Hardware' | 'Training Sponsorship' | 'Infrastructure Aid' | 'General Foundation Support',
    city: '',
    state: 'Karnataka',
    message: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber || !formData.emailAddress || !formData.consentAccepted) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        organizationName: formData.organizationName.trim() || undefined,
        supportType: formData.supportType,
        city: formData.city.trim() || 'Not specified',
        state: formData.state,
        message: formData.message.trim() || 'General foundation support enquiry',
        consentAccepted: formData.consentAccepted,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      storageService.saveHopeNestDonationEnquiry(payload);

      try {
        await submitHopeNestDonation(payload);
        await triggerAdminNotification({
          category: 'HopeNest',
          title: `Donation/Support Enquiry: ${payload.supportType}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Type: ${payload.supportType} | Org: ${payload.organizationName || 'Individual'} | Location: ${payload.city}, ${payload.state}`,
        });
      } catch (err) {
        console.warn('Firestore HopeNest donation async notice:', err);
      }

      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#021f24] to-[#06333a] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-teal-900">
        <div className="max-w-4xl mx-auto space-y-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <Heart className="w-3.5 h-3.5" />
            Support Our Grassroots Missions
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Support HopeNest Global Foundation
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mx-auto leading-relaxed">
            Partner with us to provide sewing machinery, digital learning hardware, health camp diagnostic supplies, and student learning kits directly to community beneficiaries.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        
        {/* COMPLIANCE & TRANSPARENCY NOTICE */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-teal-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Ethical Foundation Giving & Banking Transparency</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            HopeNest Global Foundation conducts community support via verifiable non-profit institutional banking channels. We do not operate instantaneous automated credit-card debits or unverified digital gateways on this portal. Official bank account details (RTGS / NEFT / Cheque), institutional MOUs, and formal receipting documentation are transmitted directly by foundation trustees following due compliance review of submitted enquiries.
          </p>
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Tax Exemption Note: Statutory exemptions under Section 80G/12A are subject to prevailing competent authority certifications; verified copy dossiers are made available during formal institutional correspondence.
          </div>
        </div>

        {/* Support Modes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              Equipment & Material Aid
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donate sewing machines, fabric rolls, refurbished desktop computers, or school stationery kits for direct workshop allocation.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              Batch Workshop Sponsorship
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Support the raw materials, trainer honorariums, and venue logistics for an entire cohort of 20 ASHA women participants.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
            <h4 className="font-heading font-bold text-slate-900 text-sm">
              Institutional Partnership
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Collaborate with our foundation to organize free eye camps, health screenings, or neighborhood tree canopy drives.
            </p>
          </div>
        </div>

        {/* Enquiry Form */}
        {submitted ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-teal-200 shadow-md text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-heading font-bold text-slate-900">
                Support Enquiry Logged
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-800">{formData.fullName}</strong>. Your enquiry regarding <strong className="text-teal-700">{formData.supportType}</strong> has been received by the HopeNest Secretariat. A foundation trustee will connect with you with authorized institutional documentation.
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    fullName: '',
                    mobileNumber: '',
                    emailAddress: '',
                    organizationName: '',
                    supportType: 'Equipment & Hardware',
                    city: '',
                    state: 'Karnataka',
                    message: '',
                    consentAccepted: false,
                  });
                }}
                className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6"
          >
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-xl font-heading font-bold text-slate-900">
                Foundation Support & Contribution Enquiry Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please provide your contact information and details of your proposed contribution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name / Primary Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98450 11223"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.org"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Organization / Trust Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Individual Well-Wisher / Family Trust / Enterprise"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  City / District <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bengaluru"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnataka"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-700">
                Nature of Support Proposed <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.supportType}
                onChange={(e) => setFormData({ ...formData, supportType: e.target.value as any })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Equipment & Hardware">Equipment & Hardware (Sewing Machines, Desktops, Tool Kits)</option>
                <option value="Training Sponsorship">ASHA Women Training Cohort Sponsorship</option>
                <option value="Infrastructure Aid">Community Study Center & Lab Infrastructure Aid</option>
                <option value="General Foundation Support">General Community Welfare & Health Camps</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Contribution Specifics & Notes
              </label>
              <textarea
                rows={3}
                placeholder="Please describe the number of units, proposed location, or details of your planned contribution..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>

            {/* Consent */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentAccepted}
                  onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I understand that this form is an expression of interest to support HopeNest Global Foundation and does not initiate an immediate financial transaction. I consent to receive official foundation banking and documentation particulars.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.consentAccepted}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Submitting Enquiry...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Support Enquiry</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
