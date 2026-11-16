import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  GraduationCap,
  User,
  Mail,
  Phone,
  Building,
  BookOpen,
  MapPin,
  Calendar,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  Sparkles,
  Award,
  Code
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitInternshipApplication, triggerAdminNotification } from '../services/firebase';

export const InternshipRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    collegeOrUniversity: '',
    courseAndYear: '',
    preferredDomain: '',
    keySkills: '',
    internshipDuration: '3 Months' as '2 Months' | '3 Months' | '6 Months',
    currentLocation: '',
    portfolioOrGithub: '',
    statementOfInterest: '',
    resumeName: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const domains = [
    'Web & Full-Stack Application Development (React / Node / TypeScript)',
    'Mobile Application Development (Flutter / Android / iOS)',
    'Python, Data Analysis & AI Fundamentals',
    'Cloud Systems, Linux & DevOps Tooling',
    'UI/UX Design & User Research for EdTech',
    'Quality Assurance (QA), Automated Testing & Documentation',
    'Digital Education Content & Curriculum Assistance',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Resume file must be under 5MB in PDF or DOCX format.');
        return;
      }
      setUploadProgress(true);
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          resumeName: file.name,
        }));
        setUploadProgress(false);
        setErrorMsg('');
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full student name.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile contact number.');
      return;
    }
    if (!formData.collegeOrUniversity.trim()) {
      setErrorMsg('Please enter your college or university name.');
      return;
    }
    if (!formData.courseAndYear.trim()) {
      setErrorMsg('Please specify your current degree course and year/semester.');
      return;
    }
    if (!formData.preferredDomain) {
      setErrorMsg('Please select your preferred internship domain.');
      return;
    }
    if (!formData.keySkills.trim()) {
      setErrorMsg('Please list your programming languages, tools, or relevant skills.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the privacy consent terms to proceed.');
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        collegeOrUniversity: formData.collegeOrUniversity.trim(),
        courseAndYear: formData.courseAndYear.trim(),
        preferredDomain: formData.preferredDomain,
        keySkills: formData.keySkills.trim(),
        internshipDuration: formData.internshipDuration,
        currentLocation: formData.currentLocation.trim() || 'Not specified',
        portfolioOrGithub: formData.portfolioOrGithub.trim() || undefined,
        resumeName: formData.resumeName || 'Student_Intern_Resume.pdf',
        resumeUrl: formData.resumeName ? `https://openframe.in/resumes/${encodeURIComponent(formData.resumeName)}` : undefined,
        statementOfInterest: formData.statementOfInterest.trim() || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newApp = storageService.submitInternship(payload);

      try {
        await submitInternshipApplication(payload);
        await triggerAdminNotification({
          category: 'Internship',
          title: `Internship Registration: ${payload.preferredDomain} (${payload.internshipDuration})`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `College: ${payload.collegeOrUniversity} | Course: ${payload.courseAndYear} | Domain: ${payload.preferredDomain}`
        });
      } catch (err) {
        console.warn('Firestore async sync notice:', err);
      }

      setApplicationId(newApp.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit application. Please check your network connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Careers & Opportunities
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            OpenFrame Student & Graduate Internships
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Apply for Technical Internship
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hands-on learning under senior software developers, working on real products, software testing, and pedagogical research.
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
                Internship Registration Submitted
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Registration Confirmed!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-slate-900">{formData.fullName}</strong>. Your internship application for{' '}
                <strong className="text-blue-700">{formData.preferredDomain}</strong> has been received.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Application Reference ID:</span>
                <span className="font-mono font-bold text-blue-700">{applicationId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>College / University:</span>
                <span className="font-medium text-slate-800">{formData.collegeOrUniversity}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Course & Year:</span>
                <span className="font-medium text-slate-800">{formData.courseAndYear}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Duration Requested:</span>
                <span className="font-medium text-slate-800">{formData.internshipDuration}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-xs text-blue-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transparent Evaluation Notice</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed">
                  OpenFrame does not charge any registration fees or certificate charges. Internships are allocated on academic merit, foundational coding knowledge, and mentor bandwidth.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/careers"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Careers Home
              </Link>
              <Link
                to="/education"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                Explore Education Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Internship Application Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Open to undergraduate and postgraduate students enrolled in recognized universities and colleges.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  Student & Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Full Student Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Priya Sharma"
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
                        placeholder="priya@college.edu or gmail"
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
                        placeholder="+91 98765 43210"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Current City & State
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                        placeholder="e.g. Bengaluru, Karnataka"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Background */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Academic Institution & Course
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      College / University Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.collegeOrUniversity}
                        onChange={(e) => setFormData({ ...formData, collegeOrUniversity: e.target.value })}
                        placeholder="e.g. RV College of Engineering"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Course & Year of Study <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.courseAndYear}
                        onChange={(e) => setFormData({ ...formData, courseAndYear: e.target.value })}
                        placeholder="e.g. B.Tech Computer Science, 3rd Year"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Internship Preferences & Skills */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Domain Preference & Technical Competencies
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Preferred Internship Domain <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.preferredDomain}
                      onChange={(e) => setFormData({ ...formData, preferredDomain: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="">-- Select Preferred Domain --</option>
                      {domains.map((dom, i) => (
                        <option key={i} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Desired Duration <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.internshipDuration}
                      onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value as any })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="2 Months">2 Months (Summer / Fast-Track)</option>
                      <option value="3 Months">3 Months (Standard Semester Practicum)</option>
                      <option value="6 Months">6 Months (Comprehensive Capstone)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Key Skills / Programming Languages <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.keySkills}
                    onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                    placeholder="e.g. React, JavaScript, Python, HTML/CSS, Git, SQL, Figma"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    GitHub / GitLab / Project Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioOrGithub}
                    onChange={(e) => setFormData({ ...formData, portfolioOrGithub: e.target.value })}
                    placeholder="https://github.com/your-username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Resume & Statement */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">4</span>
                  Resume & Statement of Interest
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Attach College / Student Resume (.pdf, .docx, max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="internResume"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="internResume" className="cursor-pointer block space-y-1.5">
                      <Upload className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800">
                        {uploadProgress ? (
                          <span className="text-blue-600 animate-pulse">Uploading file...</span>
                        ) : formData.resumeName ? (
                          <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                            <FileCheck className="w-4 h-4" /> Attached: {formData.resumeName}
                          </span>
                        ) : (
                          <span>Upload student resume or academic marksheet</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Why do you wish to intern at OpenFrame? (Brief Statement)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.statementOfInterest}
                    onChange={(e) => setFormData({ ...formData, statementOfInterest: e.target.value })}
                    placeholder="Tell us what you hope to learn and build during your internship period..."
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
                      I confirm that I am currently a student or recent graduate and the details provided above are correct. I agree to receive internship communications and evaluation details from OpenFrame IT Solutions Private Limited.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Direct application. Mentorship-focused evaluation.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Internship Application
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
