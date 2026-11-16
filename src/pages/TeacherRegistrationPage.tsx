import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  School,
  BookOpen,
  CheckCircle2,
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Link as LinkIcon,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Award
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitTeacherRegistration, triggerAdminNotification } from '../services/firebase';

const TEACHING_DOMAINS = [
  'Mathematics & Quantitative Aptitude',
  'Physics & Engineering Science',
  'Computer Science & Programming (Python, C++, Java)',
  'Web & Mobile App Development (React, Node, Flutter)',
  'Artificial Intelligence & Machine Learning',
  'Robotics & Embedded Systems',
  'English Communication & Personality Development',
  'Digital Marketing & E-Commerce',
  'Graphic Design & Creative Media',
  'Business Studies & Entrepreneurship',
  'K-12 Foundation Sciences (Physics, Chemistry, Biology)',
  'Other Specialization'
];

export const TeacherRegistrationPage: React.FC = () => {
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    qualification: '',
    teachingExperience: '3-5 Years',
    subjectSpecialization: TEACHING_DOMAINS[0],
    preferredTeachingMode: 'Online Live' as 'Online Live' | 'In-Person / Campus' | 'Weekend Guest Faculty',
    location: '',
    resumeUrlOrProfile: '',
    bio: '',
    consentAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEntry, setSubmittedEntry] = useState<{
    id: string;
    fullName: string;
    subject: string;
    submittedAt: string;
  } | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your full legal name (minimum 3 characters).';
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = 'Please enter contact mobile number.';
    } else if (!phoneRegex.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Please enter an active email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }

    if (!formData.qualification.trim()) {
      errs.qualification = 'Please state your highest qualification (e.g. M.Tech, Ph.D, M.Sc, B.Ed).';
    }

    if (!formData.location.trim()) {
      errs.location = 'Please state your current city and state (e.g. Bangalore, Karnataka).';
    }

    if (!formData.resumeUrlOrProfile.trim()) {
      errs.resumeUrlOrProfile = 'Please share a link to your LinkedIn profile, portfolio, or Google Drive resume.';
    } else if (!formData.resumeUrlOrProfile.startsWith('http')) {
      errs.resumeUrlOrProfile = 'URL must begin with http:// or https://';
    }

    if (!formData.consentAccepted) {
      errs.consentAccepted = 'Please acknowledge that all academic and experience credentials provided are accurate.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        qualification: formData.qualification.trim(),
        teachingExperience: formData.teachingExperience,
        subjectSpecialization: formData.subjectSpecialization,
        preferredTeachingMode: formData.preferredTeachingMode,
        location: formData.location.trim(),
        resumeUrlOrProfile: formData.resumeUrlOrProfile.trim(),
        consentAccepted: formData.consentAccepted,
        submittedAt: new Date().toISOString(),
        status: 'Under Review' as const,
      };

      const created = storageService.saveTeacherRegistration(payload);

      try {
        await submitTeacherRegistration(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `Faculty Application: ${payload.subjectSpecialization}`,
          senderName: payload.fullName,
          senderEmail: payload.email,
          details: `Subject: ${payload.subjectSpecialization} | Exp: ${payload.teachingExperience} | Mode: ${payload.preferredTeachingMode}`,
        });
      } catch (err) {
        console.warn('Firestore faculty async notice:', err);
      }

      setIsSubmitting(false);
      setSubmittedEntry({
        id: created.id,
        fullName: created.fullName,
        subject: created.subjectSpecialization,
        submittedAt: created.submittedAt,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setIsSubmitting(false);
    }
  };

  if (submittedEntry) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6 border border-blue-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Application Received
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-4">
            Faculty Application Submitted
          </h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Thank you, <strong className="text-slate-900">{submittedEntry.fullName}</strong>. Your application to join OpenFrame Education as a mentor in{' '}
            <strong className="text-blue-700">{submittedEntry.subject}</strong> has been received by our Academic Board.
          </p>

          <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Application ID</span>
              <span className="font-mono font-bold text-slate-900">{submittedEntry.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Subject Specialization</span>
              <span className="font-semibold text-slate-800">{submittedEntry.subject}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Submission Date</span>
              <span className="text-slate-700">{new Date(submittedEntry.submittedAt).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Review Process</span>
              <span className="text-blue-600 font-medium">Profile Screening & Technical / Pedagogical Interaction</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Our academic recruitment coordinator will review your profile and connect via email/phone within 3–5 working days to schedule an initial interaction and demo lecture.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/education"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <School className="w-4 h-4" />
              <span>Explore OpenFrame Education</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/education"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to OpenFrame Education</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Faculty & Mentor Empanelment</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Join as Faculty / Teacher
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Inspire students, teach live interactive cohorts, and contribute to cutting-edge technical, academic, and intelligence curricula with OpenFrame Education.
          </p>
        </div>
      </section>

      {/* Main Registration Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="border-b border-slate-100 pb-5 mb-8">
            <h2 className="text-xl font-heading font-bold text-slate-900">
              Faculty Empanelment Application
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              We welcome experienced school educators, university professors, software practitioners, and domain specialists.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Basic Details */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Personal & Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar / Priya Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="educator@example.com"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-[11px] text-red-600 mt-1">{errors.mobileNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Current Location (City, State) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Bengaluru, Karnataka"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.location ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.location && <p className="text-[11px] text-red-600 mt-1">{errors.location}</p>}
                </div>
              </div>
            </div>

            {/* 2. Educational & Pedagogical Background */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>2. Qualifications & Domain Specialization</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Highest Educational Qualification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    placeholder="e.g. M.Tech in Computer Science, Ph.D in Mathematics, B.Ed"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.qualification ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                    }`}
                  />
                  {errors.qualification && <p className="text-[11px] text-red-600 mt-1">{errors.qualification}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Teaching / Professional Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.teachingExperience}
                    onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1-2 Years">1–2 Years</option>
                    <option value="3-5 Years">3–5 Years</option>
                    <option value="6-10 Years">6–10 Years</option>
                    <option value="10+ Years">10+ Years (Senior Faculty / Specialist)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Primary Subject Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subjectSpecialization}
                    onChange={(e) => setFormData({ ...formData, subjectSpecialization: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TEACHING_DOMAINS.map((domain) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Preferred Teaching Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.preferredTeachingMode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredTeachingMode: e.target.value as any
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Online Live">Online Live Virtual Classroom</option>
                    <option value="In-Person / Campus">In-Person / Institutional Labs</option>
                    <option value="Weekend Guest Faculty">Weekend Guest Expert / Masterclass Faculty</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Resume / LinkedIn / Portfolio Link <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      value={formData.resumeUrlOrProfile}
                      onChange={(e) => setFormData({ ...formData, resumeUrlOrProfile: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile or https://drive.google.com/..."
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.resumeUrlOrProfile ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {errors.resumeUrlOrProfile && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.resumeUrlOrProfile}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Consent & Declaration */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={formData.consentAccepted}
                  onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I certify that all educational credentials, teaching records, and employment history provided above are authentic. I agree to OpenFrame Education's educator empanelment guidelines and privacy terms. <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consentAccepted && (
                <p className="text-[11px] text-red-600">{errors.consentAccepted}</p>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/education"
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel and return to Education page
              </Link>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Faculty Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
