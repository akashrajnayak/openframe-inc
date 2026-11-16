import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Briefcase,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CareerOpening } from '../types';
import { submitJobApplication, uploadDocumentToStorage, triggerAdminNotification } from '../services/firebase';

export const JobApplyPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [openings, setOpenings] = useState<CareerOpening[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    jobId: '',
    jobTitle: '',
    fullName: '',
    email: '',
    phone: '',
    currentLocation: '',
    qualification: '',
    experience: '',
    skills: '',
    portfolioUrl: '',
    coverNote: '',
    resumeName: '',
    consentAccepted: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadProgress, setUploadProgress] = useState(false);

  useEffect(() => {
    const activeJobs = storageService.getCareerOpenings().filter(j => j.isActive);
    setOpenings(activeJobs);

    // Read ?job= query param
    const queryPart = currentPath.split('?')[1];
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      const preselectedJobId = params.get('job');
      if (preselectedJobId) {
        const found = activeJobs.find(j => j.id === preselectedJobId);
        if (found) {
          setFormData(prev => ({
            ...prev,
            jobId: found.id,
            jobTitle: found.title,
          }));
        }
      }
    }
  }, [currentPath]);

  const handleJobSelect = (jobId: string) => {
    if (jobId === 'open-general') {
      setFormData(prev => ({
        ...prev,
        jobId: 'open-general',
        jobTitle: 'Open Application / General Technical Profile',
      }));
    } else {
      const selected = openings.find(j => j.id === jobId);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          jobId: selected.id,
          jobTitle: selected.title,
        }));
      }
    }
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Resume file must be under 10MB in PDF or DOCX format.');
        return;
      }
      setSelectedFile(file);
      setUploadProgress(true);
      try {
        const uploadResult = await uploadDocumentToStorage(file, 'resumes');
        setFormData(prev => ({
          ...prev,
          resumeName: uploadResult.fileName,
        }));
      } catch (err: any) {
        console.warn('Storage upload error (fallback enabled):', err);
        setFormData(prev => ({
          ...prev,
          resumeName: file.name,
        }));
      } finally {
        setUploadProgress(false);
        setErrorMsg('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please provide a valid corporate or personal email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile contact number.');
      return;
    }
    if (!formData.jobTitle) {
      setErrorMsg('Please select the position you are applying for.');
      return;
    }
    if (!formData.qualification.trim()) {
      setErrorMsg('Please specify your highest educational qualification.');
      return;
    }
    if (!formData.experience.trim()) {
      setErrorMsg('Please specify your total relevant work experience.');
      return;
    }
    if (!formData.skills.trim()) {
      setErrorMsg('Please provide your key technical or operational skills.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('You must confirm the privacy terms and truthfulness of information to submit.');
      return;
    }

    try {
      const appPayload = {
        jobId: formData.jobId || 'direct-apply',
        jobTitle: formData.jobTitle,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        currentLocation: formData.currentLocation.trim() || 'Not specified',
        qualification: formData.qualification.trim(),
        experience: formData.experience.trim(),
        skills: formData.skills.trim(),
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        resumeName: formData.resumeName || (selectedFile ? selectedFile.name : 'Applicant_Resume.pdf'),
        resumeUrl: formData.resumeName ? `https://openframe.in/resumes/${encodeURIComponent(formData.resumeName)}` : undefined,
        coverNote: formData.coverNote.trim() || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      const newApp = storageService.submitJobApplication(appPayload);

      // Save directly to Firestore job_applications
      try {
        await submitJobApplication(appPayload);
        await triggerAdminNotification({
          category: 'Job Application',
          title: `Job Application: ${appPayload.jobTitle}`,
          senderName: appPayload.fullName,
          senderEmail: appPayload.email,
          details: `Role: ${appPayload.jobTitle} | Exp: ${appPayload.experience} | Location: ${appPayload.currentLocation}`
        });
      } catch (err) {
        console.warn('Firestore async sync notice:', err);
      }

      setApplicationId(newApp.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit application. Please check your network connection and retry.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Careers & Culture
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            Official Application Portal
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-white tracking-tight">
            Apply for a Position at OpenFrame
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Submit your professional profile directly to OpenFrame IT Solutions Private Limited engineering and talent acquisition board.
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
                Application Received Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Thank You, {formData.fullName}!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Your application for <strong className="text-slate-900">{formData.jobTitle}</strong> has been logged in our talent management database.
              </p>
            </div>

            {/* Reference Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500 pb-2 border-b border-slate-200">
                <span>Application Reference:</span>
                <span className="font-mono font-bold text-blue-700">{applicationId}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Registered Email:</span>
                <span className="font-medium text-slate-800">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Contact Number:</span>
                <span className="font-medium text-slate-800">{formData.phone}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Resume Attached:</span>
                <span className="font-medium text-emerald-700">{formData.resumeName || 'Attached on file'}</span>
              </div>
            </div>

            {/* Verification Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-lg mx-auto text-xs text-blue-800 text-left flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transparent Verification Process</p>
                <p className="mt-0.5 text-blue-700 leading-relaxed">
                  Our technical leads review applications within 3 to 5 business days. Shortlisted candidates are invited directly for an initial technical evaluation and team conversation.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/careers/jobs"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                View Other Openings
              </Link>
              <Link
                to="/about-us"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors"
              >
                About Company
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Employment Application Form
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Please complete all required fields (*). Your application will be evaluated based on merit, engineering standards, and relevant experience.
              </p>
            </div>

            {errorMsg && (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Step 1: Position */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">1</span>
                  Target Position & Department
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select Role / Vacancy <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.jobId}
                    onChange={(e) => handleJobSelect(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-medium"
                  >
                    <option value="">-- Choose an active opening --</option>
                    {openings.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.department} · {job.type} · {job.location})
                      </option>
                    ))}
                    <option value="open-general">General Technical Profile / Open Application</option>
                  </select>
                </div>
              </div>

              {/* Step 2: Personal & Contact */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  Candidate Information
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
                        placeholder="e.g. Rahul Sharma"
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
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="rahul@example.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Mobile Number (India) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Current Location (City, State) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={formData.currentLocation}
                        onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                        placeholder="e.g. Bengaluru, Karnataka"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Qualifications & Experience */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">3</span>
                  Qualifications & Professional Experience
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Highest Qualification <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Select Qualification --</option>
                      <option value="B.Tech / B.E. (Computer Science / IT)">B.Tech / B.E. (Computer Science / IT)</option>
                      <option value="B.Tech / B.E. (Other Branches)">B.Tech / B.E. (Other Branches)</option>
                      <option value="M.Tech / M.E. / M.S.">M.Tech / M.E. / M.S.</option>
                      <option value="MCA / M.Sc Computer Science">MCA / M.Sc Computer Science</option>
                      <option value="BCA / B.Sc Computing">BCA / B.Sc Computing</option>
                      <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                      <option value="Other Degree / Diploma">Other Degree / Diploma</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Total Relevant Experience <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Select Experience --</option>
                      <option value="Fresher / Entry Level (0-1 Year)">Fresher / Entry Level (0-1 Year)</option>
                      <option value="1 - 3 Years">1 - 3 Years</option>
                      <option value="3 - 5 Years">3 - 5 Years</option>
                      <option value="5 - 8 Years">5 - 8 Years</option>
                      <option value="8+ Years (Senior / Lead)">8+ Years (Senior / Lead)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Core Technical Skills & Tools <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    placeholder="e.g. TypeScript, React, Node.js, PostgreSQL, Docker, AWS, Git"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    List languages, frameworks, databases, and engineering tools you actively use.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    GitHub / LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://github.com/username or https://linkedin.com/in/username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Step 4: Resume Attachment & Note */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">4</span>
                  Resume Attachment & Profile Summary
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Attach Resume / Curriculum Vitae (.pdf, .docx, max 5MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 text-center transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="resumeFile"
                      accept=".pdf,.docx,.doc"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="resumeFile" className="cursor-pointer block space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {uploadProgress ? (
                          <span className="text-blue-600 animate-pulse">Processing file upload...</span>
                        ) : formData.resumeName ? (
                          <span className="text-emerald-700 flex items-center justify-center gap-1.5">
                            <FileCheck className="w-4 h-4" /> Selected: {formData.resumeName}
                          </span>
                        ) : (
                          <span>Click to browse and upload resume file</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">PDF is preferred for automated evaluation</p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Cover Note or Key Highlights (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.coverNote}
                    onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                    placeholder="Briefly describe why you are interested in this position and the major engineering or organizational projects you have delivered..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Consent & Submission */}
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
                      I certify that all details submitted in this application are authentic. I authorise OpenFrame IT Solutions Private Limited and its recruitment team to process my application data and verify credentials in accordance with corporate data protection standards.
                    </span>
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No application fees are charged by OpenFrame at any stage.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Application
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
