import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  HeartHandshake,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  Sparkles,
  FileText,
  ExternalLink
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitNgoPartnerEnquiry, triggerAdminNotification } from '../services/firebase';

export const NgoPartnerPage: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    registrationNumber: '',
    contactPerson: '',
    designation: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    state: 'Karnataka',
    focusArea: 'Rural Education & Digital Literacy',
    partnershipInterest: 'Joint Skill Training Workshops & Digital Literacy Drives',
    targetBeneficiaryCount: '',
    message: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const focusAreas = [
    'Rural Education & Digital Literacy',
    'Youth Employability & Technical Skill Development',
    'Women Livelihood & Self-Help Group (SHG) Technology Training',
    'Underprivileged Student Support & Scholarships',
    'Differently-Abled Technical Enablement',
    'Community Welfare & Digital Access Centers',
  ];

  const partnershipInterests = [
    'Joint Skill Training Workshops & Digital Literacy Drives',
    'Digital Education Kit & Hardware Enablement',
    'Institutional Social Initiative Collaboration',
    'Volunteer Exchanges & Youth Field Mentorship',
    'Joint Research & Community Impact Assessment',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.organizationName.trim()) {
      setErrorMsg('Please enter your NGO / Trust organization name.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMsg('Please specify the contact person name.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMsg('Please enter your designation (e.g. Managing Trustee, Director).');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please provide your operational city / district.');
      return;
    }
    if (!formData.message.trim()) {
      setErrorMsg('Please provide a brief description of the proposed collaboration.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the partnership data terms.');
      return;
    }

    try {
      const payload = {
        organizationName: formData.organizationName.trim(),
        registrationNumber: formData.registrationNumber.trim() || undefined,
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || 'Karnataka',
        focusArea: formData.focusArea,
        partnershipInterest: formData.partnershipInterest,
        targetBeneficiaryCount: formData.targetBeneficiaryCount.trim() || undefined,
        message: formData.message.trim(),
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newEnquiry = storageService.submitNgoPartner(payload);

      try {
        await submitNgoPartnerEnquiry(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `NGO Partnership: ${payload.organizationName}`,
          senderName: `${payload.contactPerson} (${payload.designation})`,
          senderEmail: payload.emailAddress,
          details: `Focus: ${payload.focusArea} | Model: ${payload.partnershipInterest} | Location: ${payload.city}, ${payload.state}`,
        });
      } catch (err) {
        console.warn('Firestore NGO partner async notice:', err);
      }

      setEnquiryId(newEnquiry.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit NGO partnership enquiry. Please check your network.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/work-with-us"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Work With Us
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            Social & Community Alliance
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            NGO & Non-Profit Partnership Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Unite with OpenFrame IT Solutions Private Limited to expand digital literacy, technology training, and livelihood skills in underserved communities.
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-[11px] text-indigo-200 mt-2">
            <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>OpenFrame actively collaborates with HopeNest Global Foundation on verified grassroots social programs.</span>
            <Link to="/hopenest" className="text-sky-300 underline font-semibold flex items-center gap-1 ml-1 hover:text-white">
              Learn about HopeNest <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {submitted ? (
          <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Alliance Proposal Received
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Thank You, {formData.contactPerson}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your partnership enquiry for <strong className="text-slate-900">{formData.organizationName}</strong> has been logged with our Social Impact &amp; Community Coordination Board.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Enquiry Reference:</span>
                <span className="font-mono font-bold text-blue-700">{enquiryId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Organization:</span>
                <span className="font-medium text-slate-800">{formData.organizationName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Focus Area:</span>
                <span className="font-medium text-slate-800">{formData.focusArea}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Initiative:</span>
                <span className="font-medium text-blue-700">{formData.partnershipInterest}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-xs text-blue-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transparent Non-Profit Partnership Protocol</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed">
                  Our community coordination team evaluates non-profit proposals to explore mutual synergy and technical contributions. We will connect within 2-4 business days.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/hopenest"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                HopeNest Foundation
              </Link>
              <Link
                to="/work-with-us"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                Work With Us Hub
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                NGO Partnership & Collaboration Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                For registered societies, charitable trusts, Section 8 companies, and community advocacy organizations.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Organization Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  Non-Profit / NGO Organization Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Organization / Trust Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="e.g. Pragati Rural Education Trust"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      NGO Darpan / Registration Number
                    </label>
                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      placeholder="e.g. KA/2020/025412"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Operational City / District <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Raichur"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Authorized Representative */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Authorized Representative
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Representative Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="e.g. Anand Joshi"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Designation / Role in NGO <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Managing Trustee / Secretary"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={formData.emailAddress}
                        onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                        placeholder="trustee@organization.org"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Contact Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        placeholder="+91 98800 12345"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Partnership Scope */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Social Focus Area & Collaboration Proposal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Primary Social Impact Domain <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.focusArea}
                      onChange={(e) => setFormData({ ...formData, focusArea: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      {focusAreas.map((fa, i) => (
                        <option key={i} value={fa}>{fa}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Collaboration Format <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.partnershipInterest}
                      onChange={(e) => setFormData({ ...formData, partnershipInterest: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      {partnershipInterests.map((pi, i) => (
                        <option key={i} value={pi}>{pi}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Estimated Annual Beneficiary Count
                  </label>
                  <input
                    type="text"
                    value={formData.targetBeneficiaryCount}
                    onChange={(e) => setFormData({ ...formData, targetBeneficiaryCount: e.target.value })}
                    placeholder="e.g. 800 rural students across 10 centers"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Collaboration Objectives & Proposal Summary <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your current community work, the technical training needed, and how OpenFrame can support your mission..."
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Consent & Submit */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentAccepted}
                      onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                      required
                    />
                    <span className="text-xs text-slate-600 leading-relaxed">
                      I submit this alliance proposal on behalf of the registered NGO / non-profit organization and agree to allow OpenFrame IT Solutions Private Limited to assess social impact alignment.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Ethical community development. Verified non-profit partnerships.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit NGO Partnership Proposal
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
