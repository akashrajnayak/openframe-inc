import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Briefcase,
  Handshake,
  Building,
  School,
  HeartHandshake,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Globe,
  Upload,
  FileCheck,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitGeneralWorkEnquiry, triggerAdminNotification } from '../services/firebase';

export const WorkWithUsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    collaborationType: 'Freelance & Contract Tech Development',
    currentLocation: '',
    experienceYears: '3 - 5 Years',
    keyCompetencies: '',
    proposalSummary: '',
    portfolioOrWebsite: '',
    resumeName: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const collaborationTypes = [
    'Freelance & Contract Tech Development',
    'Curriculum & Technical Content Creation',
    'Field Operations, Campus Outreach & Training',
    'Technology Vendor / Solutions Partner',
    'Corporate Advisory & Strategic Alliance',
    'Other Specialized Collaboration',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name or entity name.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setErrorMsg('Please enter a valid corporate or personal email address.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile contact number.');
      return;
    }
    if (!formData.currentLocation.trim()) {
      setErrorMsg('Please enter your city and state.');
      return;
    }
    if (!formData.keyCompetencies.trim()) {
      setErrorMsg('Please specify your key skills or domain competencies.');
      return;
    }
    if (!formData.proposalSummary.trim()) {
      setErrorMsg('Please outline your proposal or expression of interest.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the collaboration terms.');
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        collaborationType: formData.collaborationType,
        currentLocation: formData.currentLocation.trim(),
        experienceYears: formData.experienceYears,
        keyCompetencies: formData.keyCompetencies.trim(),
        proposalSummary: formData.proposalSummary.trim(),
        portfolioOrWebsite: formData.portfolioOrWebsite.trim() || undefined,
        resumeName: formData.resumeName || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newEnquiry = storageService.submitGeneralWork(payload);

      try {
        await submitGeneralWorkEnquiry(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `Collaboration Enquiry: ${payload.collaborationType}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Type: ${payload.collaborationType} | Exp: ${payload.experienceYears} | Location: ${payload.currentLocation}`,
        });
      } catch (err) {
        console.warn('Firestore general work async notice:', err);
      }

      setEnquiryId(newEnquiry.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit collaboration proposal. Please check your network.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-6xl mx-auto space-y-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            <Handshake className="w-3.5 h-3.5" />
            Strategic Collaborations & Alliances
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight">
            Work With OpenFrame
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We partner with institutions, businesses, non-profits, independent developers, and subject-matter experts to co-create digital solutions and expand technological capabilities.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#collaboration-form"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
            >
              Express Collaboration Interest
            </a>
            <Link
              to="/partner/school"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              School Partnerships
            </Link>
            <Link
              to="/partner/ngo"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              NGO Alliances
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* 4 Dedicated Collaboration Hubs */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Partnership Pathways
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
              Choose the Relevant Partnership Gateway
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Dedicated procedures and institutional frameworks for specific collaborative models:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gateway 1: School */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Schools & PU Colleges
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Adopt OpenFrame computer science syllabus, practical coding labs, StudyNotePro digital classrooms, and teacher enablement workshops.
                </p>
              </div>
              <Link
                to="/partner/school"
                className="pt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Institutional Enquiry Form</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Gateway 2: NGO */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  NGOs & Social Foundations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join forces for rural digital literacy drives, youth livelihood skill programs, and grassroots community technology enablement.
                </p>
              </div>
              <Link
                to="/partner/ngo"
                className="pt-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
              >
                <span>NGO Alliance Portal</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Gateway 3: Professional */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Experts & Consultants
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join our advisory network as an enterprise solutions architect, guest instructor, capstone evaluator, or consulting lead.
                </p>
              </div>
              <Link
                to="/join/professional"
                className="pt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
              >
                <span>Professional Network</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Gateway 4: Faculty */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-base">
                  Teaching Faculty
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Educators, academic tutors, and subject-matter specialists conducting live online batches, campus labs, or evening classes.
                </p>
              </div>
              <Link
                to="/join/teacher"
                className="pt-2 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 group"
              >
                <span>Teacher Registration</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* GENERAL COLLABORATION FORM SECTION */}
        <section id="collaboration-form" className="max-w-4xl mx-auto">
          {submitted ? (
            <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Proposal Submitted Successfully
                </span>
                <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                  Thank You, {formData.fullName}!
                </h2>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Your collaboration proposal for <strong className="text-slate-900">{formData.collaborationType}</strong> has been received by OpenFrame IT Solutions Strategic Partnerships.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                  <span>Proposal Reference ID:</span>
                  <span className="font-mono font-bold text-blue-700">{enquiryId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Registered Contact:</span>
                  <span className="font-medium text-slate-800">{formData.emailAddress}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Collaboration Scope:</span>
                  <span className="font-medium text-blue-700">{formData.collaborationType}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Return to Home
                </Link>
                <Link
                  to="/careers"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
                >
                  View Careers Hub
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                  General Collaboration & Work Proposal Form
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  For freelance technical developers, subject matter specialists, field ambassadors, vendors, and strategic corporate associates.
                </p>
              </div>

              {errorMsg && (
                <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                {/* Step 1: Type */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                    Collaboration Stream
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Nature of Collaboration <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.collaborationType}
                      onChange={(e) => setFormData({ ...formData, collaborationType: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      {collaborationTypes.map((type, i) => (
                        <option key={i} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 2: Contact Info */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                    Contact & Professional Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Full Name / Business Lead <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Harish Verma"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={formData.emailAddress}
                          onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                          placeholder="harish@example.com"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="tel"
                          value={formData.mobileNumber}
                          onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                          placeholder="+91 98450 12345"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Location (City, State) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={formData.currentLocation}
                          onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                          placeholder="e.g. Hubballi, Karnataka"
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Competencies & Proposal */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                    Competencies & Proposal Summary
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Years of Industry Experience
                      </label>
                      <select
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="1 - 3 Years">1 - 3 Years</option>
                        <option value="3 - 5 Years">3 - 5 Years</option>
                        <option value="5 - 8 Years">5 - 8 Years</option>
                        <option value="8+ Years">8+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Portfolio / Website / LinkedIn URL
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="url"
                          value={formData.portfolioOrWebsite}
                          onChange={(e) => setFormData({ ...formData, portfolioOrWebsite: e.target.value })}
                          placeholder="https://github.com/username or your site"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Core Technical Skills / Specialized Offerings <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.keyCompetencies}
                      onChange={(e) => setFormData({ ...formData, keyCompetencies: e.target.value })}
                      placeholder="e.g. Next.js, Node.js, Cloud APIs, Course Design, Student Outreach, QA"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Proposal Summary / How Can We Collaborate? <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.proposalSummary}
                      onChange={(e) => setFormData({ ...formData, proposalSummary: e.target.value })}
                      placeholder="Outline your availability, proposed scope of work, technical deliverables, or synergy with OpenFrame..."
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
                        I authorize OpenFrame IT Solutions Private Limited to process this collaboration submission and contact me for exploratory discussions.
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Transparent business alliances with clear scope definition.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Collaboration Proposal
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
