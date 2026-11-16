import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Users,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Award,
  Globe,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  Building2,
  Sparkles,
  Layers
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitProfessionalRegistration, triggerAdminNotification, uploadDocumentToStorage } from '../services/firebase';

export const ProfessionalRegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    primaryDomain: '',
    qualification: '',
    experienceYears: '',
    keySkills: '',
    portfolioOrLinkedIn: '',
    areaOfInterest: 'Consulting / Advisory' as 'Full-Time Employment' | 'Consulting / Advisory' | 'Guest Lecturing / Mentorship' | 'Contract / Project Basis',
    currentLocation: '',
    message: '',
    resumeName: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  const domains = [
    'Enterprise Software Architecture & Distributed Systems',
    'Full-Stack Web & Mobile Application Engineering',
    'Cloud Systems, Kubernetes, DevOps & Cybersecurity',
    'Artificial Intelligence, Machine Learning & NLP',
    'EdTech Pedagogical Frameworks & Curriculum Architecture',
    'Database Systems, Relational Modeling & Performance Tuning',
    'Technical Project Management & Agile Delivery',
  ];

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedResumeUrl, setUploadedResumeUrl] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Resume / profile dossier must be under 5MB in PDF or DOCX format.');
        return;
      }
      setSelectedFile(file);
      setUploadProgress(true);
      setErrorMsg('');

      try {
        const uploadResult = await uploadDocumentToStorage(file, 'resumes');
        setUploadedResumeUrl(uploadResult.url);
        setFormData(prev => ({
          ...prev,
          resumeName: file.name,
        }));
      } catch (err: any) {
        console.warn('Storage upload fallback:', err);
        setFormData(prev => ({
          ...prev,
          resumeName: file.name,
        }));
      } finally {
        setUploadProgress(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full professional name.');
      return;
    }
    if (!formData.emailAddress.trim() || !formData.emailAddress.includes('@')) {
      setErrorMsg('Please enter a valid professional email address.');
      return;
    }
    if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.primaryDomain) {
      setErrorMsg('Please select your primary professional domain.');
      return;
    }
    if (!formData.qualification.trim()) {
      setErrorMsg('Please state your highest academic or technical qualification.');
      return;
    }
    if (!formData.experienceYears.trim()) {
      setErrorMsg('Please specify your total years of professional experience.');
      return;
    }
    if (!formData.keySkills.trim()) {
      setErrorMsg('Please list your core technologies, architectures, or expertise areas.');
      return;
    }
    if (!formData.portfolioOrLinkedIn.trim()) {
      setErrorMsg('Please provide your LinkedIn profile URL or portfolio link.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the confidentiality and registration terms.');
      return;
    }

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        primaryDomain: formData.primaryDomain,
        qualification: formData.qualification.trim(),
        experienceYears: formData.experienceYears.trim(),
        keySkills: formData.keySkills.trim(),
        portfolioOrLinkedIn: formData.portfolioOrLinkedIn.trim(),
        areaOfInterest: formData.areaOfInterest,
        currentLocation: formData.currentLocation.trim() || 'Not specified',
        resumeName: formData.resumeName || (selectedFile ? selectedFile.name : 'Professional_CV.pdf'),
        resumeUrl: uploadedResumeUrl || (formData.resumeName ? `https://openframe.in/resumes/${encodeURIComponent(formData.resumeName)}` : undefined),
        message: formData.message.trim() || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newRecord = storageService.submitProfessional(payload);

      try {
        await submitProfessionalRegistration(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `Professional Registration: ${payload.primaryDomain}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Domain: ${payload.primaryDomain} | Exp: ${payload.experienceYears} | Area: ${payload.areaOfInterest}`,
        });
      } catch (err) {
        console.warn('Firestore professional async notice:', err);
      }

      setRegistrationId(newRecord.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to complete registration. Please check your network and retry.');
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
            <Users className="w-3.5 h-3.5" />
            Senior Industry Network
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Register as an Industry Professional
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Collaborate with OpenFrame IT Solutions Private Limited as an architectural consultant, technical mentor, curriculum advisor, or specialized delivery lead.
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
                Professional Profile Registered
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Welcome, {formData.fullName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your profile has been entered into the OpenFrame Executive & Expert Directory under{' '}
                <strong className="text-blue-700">{formData.areaOfInterest}</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Profile ID:</span>
                <span className="font-mono font-bold text-blue-700">{registrationId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Domain:</span>
                <span className="font-medium text-slate-800">{formData.primaryDomain}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Total Experience:</span>
                <span className="font-medium text-slate-800">{formData.experienceYears}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Engagement Model:</span>
                <span className="font-medium text-indigo-700">{formData.areaOfInterest}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-xs text-blue-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Next Steps for Senior Engagement</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed">
                  Our Managing Director or Principal Solution Architect will review your credentials and reach out for an exploratory alignment conversation.
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
                to="/it-solutions"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                Explore IT Solutions
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Professional Profile Registration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                For experienced technology leads, software architects, corporate trainers, and consulting specialists.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Engagement Type */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  Area of Engagement Interest
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'Consulting / Advisory', label: 'Consulting & Technical Advisory', desc: 'Part-time system architecture & strategy' },
                    { id: 'Guest Lecturing / Mentorship', label: 'Guest Lecturing & Mentorship', desc: 'Teach advanced modules & evaluate labs' },
                    { id: 'Contract / Project Basis', label: 'Project-Based / Sprint Contract', desc: 'Deliver dedicated software deliverables' },
                    { id: 'Full-Time Employment', label: 'Full-Time Senior Position', desc: 'Corporate lead engineer or director role' },
                  ].map(item => (
                    <label
                      key={item.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        formData.areaOfInterest === item.id
                          ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="areaOfInterest"
                        value={item.id}
                        checked={formData.areaOfInterest === item.id}
                        onChange={(e) => setFormData({ ...formData, areaOfInterest: e.target.value as any })}
                        className="hidden"
                      />
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Professional Identity & Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Full Legal Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Vikramaditya Rao"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Corporate / Professional Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={formData.emailAddress}
                        onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                        placeholder="vikram@domain.com"
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
                      Current Location (City, State)
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

              {/* Domain & Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Expertise & Credentials
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Primary Specialization Domain <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.primaryDomain}
                    onChange={(e) => setFormData({ ...formData, primaryDomain: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Select Specialization Domain --</option>
                    {domains.map((dom, i) => (
                      <option key={i} value={dom}>{dom}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Highest Academic / Technical Degree <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. M.Tech / M.S. / Ph.D."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Total Professional Experience <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Select Total Experience --</option>
                      <option value="3 - 5 Years">3 - 5 Years</option>
                      <option value="5 - 8 Years">5 - 8 Years</option>
                      <option value="8 - 12 Years">8 - 12 Years</option>
                      <option value="12 - 15 Years">12 - 15 Years</option>
                      <option value="15+ Years (Principal / Executive)">15+ Years (Principal / Executive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Core Technical Competencies & Frameworks <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.keySkills}
                    onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
                    placeholder="e.g. Microservices, Event Sourcing, PostgreSQL, Go, React, Kubernetes, AWS"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    LinkedIn Profile or Personal Portfolio URL <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="url"
                      value={formData.portfolioOrLinkedIn}
                      onChange={(e) => setFormData({ ...formData, portfolioOrLinkedIn: e.target.value })}
                      placeholder="https://linkedin.com/in/your-profile"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dossier & Collaboration Note */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">4</span>
                  Executive Summary & Dossier
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Attach Professional Profile / CV (.pdf, .docx, max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-4 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="profResume"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="profResume" className="cursor-pointer block space-y-1.5">
                      <Upload className="w-5 h-5 text-blue-600 mx-auto" />
                      <div className="text-xs font-semibold text-slate-800">
                        {uploadProgress ? (
                          <span className="text-blue-600 animate-pulse">Uploading file...</span>
                        ) : formData.resumeName ? (
                          <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                            <FileCheck className="w-4 h-4" /> Attached: {formData.resumeName}
                          </span>
                        ) : (
                          <span>Upload professional executive profile</span>
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Collaboration Vision or Advisory Areas
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Outline your availability, areas where you can add strategic value, or proposed technical initiatives..."
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
                      I agree to allow OpenFrame IT Solutions Private Limited leadership to store my credentials and contact me for technical consulting, mentorship, or leadership discussions.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Strict professional confidentiality maintained.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Professional Registration
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
