import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  School,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitSchoolPartnerEnquiry, triggerAdminNotification } from '../services/firebase';

export const SchoolPartnerPage: React.FC = () => {
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    designation: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    state: 'Karnataka',
    institutionType: 'K-12 School' as 'K-12 School' | 'Junior College / PUC' | 'Degree College / University' | 'Coaching / Academy' | 'Other Institution',
    partnershipInterest: 'Computer Science & AI Curriculum (Class 1-12)',
    studentStrength: '',
    message: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const partnershipOptions = [
    'Computer Science & AI Curriculum (Class 1-12)',
    'StudyNotePro Digital Study & Classroom Management Tool',
    'STEM, IoT & Robotics Practical Laboratory Setup',
    'Faculty Enablement & Digital Pedagogy Masterclasses',
    'Comprehensive Digital Campus Software & Attendance Management',
    'Campus Hackathons & Student Technology Innovation Clubs',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.organizationName.trim()) {
      setErrorMsg('Please enter the official name of your school or institution.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      setErrorMsg('Please specify the authorized contact person name.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMsg('Please provide your official designation (e.g. Principal, Director).');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setErrorMsg('Please provide a valid institutional email address.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please provide a valid 10-digit contact number.');
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg('Please enter your institution city.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the institutional enquiry terms to submit.');
      return;
    }

    try {
      const payload = {
        organizationName: formData.organizationName.trim(),
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || 'Karnataka',
        institutionType: formData.institutionType,
        partnershipInterest: formData.partnershipInterest,
        studentStrength: formData.studentStrength.trim() || undefined,
        message: formData.message.trim() || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newEnquiry = storageService.submitSchoolPartner(payload);

      try {
        await submitSchoolPartnerEnquiry(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `School Partnership: ${payload.organizationName}`,
          senderName: `${payload.contactPerson} (${payload.designation})`,
          senderEmail: payload.emailAddress,
          details: `Type: ${payload.institutionType} | Interest: ${payload.partnershipInterest} | Location: ${payload.city}, ${payload.state}`,
        });
      } catch (err) {
        console.warn('Firestore school partner async notice:', err);
      }

      setEnquiryId(newEnquiry.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit enquiry. Please check your network connection.');
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
            <School className="w-3.5 h-3.5" />
            Institutional Collaboration
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            School & College Partnership Enquiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Partner with OpenFrame IT Solutions Private Limited to equip your campus with modern computer science curriculum, digital classrooms, and teacher enablement workshops.
          </p>
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
                Institutional Enquiry Registered
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Thank You, {formData.contactPerson}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your partnership enquiry on behalf of <strong className="text-slate-900">{formData.organizationName}</strong> has been assigned to our Institutional Academic Outreach Division.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Enquiry Tracking ID:</span>
                <span className="font-mono font-bold text-blue-700">{enquiryId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Institution:</span>
                <span className="font-medium text-slate-800">{formData.organizationName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Program Interest:</span>
                <span className="font-medium text-blue-700">{formData.partnershipInterest}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Location:</span>
                <span className="font-medium text-slate-800">{formData.city}, {formData.state}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-xs text-blue-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Next Steps for Institutional Alignment</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed">
                  Our regional academic coordinator will contact your office within 24 to 48 business hours to arrange an in-person meeting or virtual demonstration for your faculty leadership.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/education"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Explore Education Catalog
              </Link>
              <Link
                to="/products/studynotepro"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                Discover StudyNotePro
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Institutional Partnership Application
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Designed for K-12 schools, CBSE/ICSE/State boards, PU colleges, universities, and educational foundations.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Institution Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  Institution Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      School / College / Institution Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <School className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="e.g. St. Xavier Modern Academy"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Institution Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.institutionType}
                      onChange={(e) => setFormData({ ...formData, institutionType: e.target.value as any })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="K-12 School">K-12 School (Primary & Secondary)</option>
                      <option value="Junior College / PUC">Junior College / Pre-University (PUC)</option>
                      <option value="Degree College / University">Degree College / University / Polytechnic</option>
                      <option value="Coaching / Academy">Coaching Institute / Training Academy</option>
                      <option value="Other Institution">Other Educational Trust / Organization</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Approximate Student Strength
                    </label>
                    <input
                      type="text"
                      value={formData.studentStrength}
                      onChange={(e) => setFormData({ ...formData, studentStrength: e.target.value })}
                      placeholder="e.g. 1,200 Students"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Authorized Contact Person */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Authorized Contact Official
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Contact Official Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="e.g. Dr. Rajeshwari Hegde"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Designation / Role <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Principal / Academic Director"
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
                        placeholder="principal@school.edu.in"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Official Contact / Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                        placeholder="+91 94480 12345"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Hubballi"
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

              {/* Partnership Scope */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Partnership Scope & Requirements
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Primary Area of Collaboration <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.partnershipInterest}
                    onChange={(e) => setFormData({ ...formData, partnershipInterest: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    {partnershipOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Specific Institutional Requirements or Questions
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Mention academic year timeline, targeted grades/batches, laboratory hardware availability, or key objectives..."
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
                      I submit this enquiry on behalf of the mentioned educational institution and agree to receive formal academic proposals and demonstration details from OpenFrame IT Solutions Private Limited.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official academic coordination & customized lab proposals.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Institutional Enquiry
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
