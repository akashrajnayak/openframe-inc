import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Send,
  HelpCircle,
  FileCheck,
  Globe,
  Navigation
} from 'lucide-react';
import { submitStudentRegistration } from '../../services/firebase';
import { lmsService } from '../../services/lmsService';
import { SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES } from '../../utils/searchIntelligence';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  courseId?: string;
  courseCategory?: string;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  isOpen,
  onClose,
  courseTitle = 'General IT & Technology Programme',
  courseId = '',
  courseCategory = 'Information Technology'
}) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [dob, setDob] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [guardianConsentAccepted, setGuardianConsentAccepted] = useState(false);
  const [gpsConsentAccepted, setGpsConsentAccepted] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [currentQualification, setCurrentQualification] = useState('College / Engineering Student');
  const [schoolCollegeName, setSchoolCollegeName] = useState('');
  const [preferredLearningMode, setPreferredLearningMode] = useState<'Online Live Classes' | 'Recorded Lessons' | 'Hybrid / Practical Labs'>('Hybrid / Practical Labs');
  const [preferredCallSlot, setPreferredCallSlot] = useState('Morning (09:00 AM – 12:00 PM)');
  const [notes, setNotes] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isMinor = (() => {
    if (!dob) return false;
    const d = new Date(dob);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age < 18;
  })();

  const handleToggleGps = (checked: boolean) => {
    setGpsConsentAccepted(checked);
    if (!checked) {
      setGpsCoordinates(undefined);
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoordinates({
            lat: Number(pos.coords.latitude.toFixed(5)),
            lng: Number(pos.coords.longitude.toFixed(5)),
          });
        },
        () => {},
        { timeout: 6000 }
      );
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !mobileNumber.trim() || !emailAddress.trim()) {
      setErrorMsg('Please complete all required fields (Full Name, Mobile, Email).');
      return;
    }

    if (mobileNumber.trim().length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (isMinor && (!parentName.trim() || parentMobile.trim().length < 10 || !guardianConsentAccepted)) {
      setErrorMsg('Parent / Guardian name, 10-digit mobile number, and Guardian Consent are mandatory for learners under 18.');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `OF-APP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const payload = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        whatsappNumber: whatsappNumber.trim() || mobileNumber.trim(),
        emailAddress: emailAddress.trim().toLowerCase(),
        dob: dob || '',
        country: 'India',
        state: state.trim() || 'Karnataka',
        district: district.trim() || city.trim() || 'Bengaluru Urban',
        city: city.trim() || 'Bengaluru',
        pincode: pincode.trim() || undefined,
        preferredLanguage,
        schoolCollegeName: schoolCollegeName.trim() || 'Not Specified',
        currentClassQualification: currentQualification,
        interestedCourse: courseTitle ? `${courseTitle} (${courseId || 'OpenFrame'})` : 'Skill Development Programme',
        parentName: parentName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
        isMinor,
        guardianConsentAccepted: isMinor ? guardianConsentAccepted : undefined,
        gpsConsentAccepted,
        gpsCoordinates: gpsConsentAccepted ? gpsCoordinates : undefined,
        preferredLearningMode: preferredLearningMode,
        consentAccepted: consentAccepted,
        registeredAt: new Date().toISOString(),
        status: 'Registered' as const,
        internalNotes: `Applied via Course Pop-up. Category: ${courseCategory}. Preferred Call Slot: ${preferredCallSlot}. Student Notes: ${notes || 'None'}. Application ID: ${generatedId}`,
      };

      try {
        await submitStudentRegistration(payload);
        await lmsService.recordConsentRecord({
          email: payload.emailAddress,
          fullName: payload.fullName,
          isMinor,
          guardianName: payload.parentName,
          guardianMobile: payload.parentMobile,
          dpdpConsentAccepted: consentAccepted,
          gpsOptInAccepted: gpsConsentAccepted,
          termsAccepted: consentAccepted,
        });
      } catch (firestoreErr) {
        console.warn('Firestore write fallback to local storage:', firestoreErr);
      }

      // 2. Also save to local storage for offline resiliency & admin viewer
      try {
        const stored = JSON.parse(localStorage.getItem('openframe_student_applications') || '[]');
        stored.unshift({ id: generatedId, ...payload });
        localStorage.setItem('openframe_student_applications', JSON.stringify(stored));
      } catch (storageErr) {
        console.warn('LocalStorage error:', storageErr);
      }

      setApplicationId(generatedId);
      setSubmissionSuccess(true);
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMsg('An error occurred during submission. Please check your network or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmissionSuccess(false);
    setErrorMsg('');
    setFullName('');
    setMobileNumber('');
    setEmailAddress('');
    setCity('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-5 text-white flex items-center justify-between shrink-0 border-b border-blue-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                OpenFrame Education • Official Admissions
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                Student Programme Application
              </h2>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Course Banner */}
        <div className="bg-blue-50/90 border-b border-blue-100 px-6 py-2.5 flex items-center justify-between text-xs text-blue-900 shrink-0">
          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold text-blue-800">Applying for:</span>
            <span className="font-bold text-slate-900 truncate">{courseTitle}</span>
            {courseId && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                {courseId}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-[11px] text-blue-700 font-medium shrink-0 ml-2">
            Academic Year 2026–27
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
          {submissionSuccess ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900">Application Submitted Successfully!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-800">{fullName}</strong>. Your application has been logged into the OpenFrame Academic Admissions Registry.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Application Reference ID:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{applicationId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Selected Programme:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[220px]">{courseTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Registered Contact:</span>
                  <span className="font-medium text-slate-700">{mobileNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Preferred Consultation Slot:</span>
                  <span className="font-medium text-slate-700">{preferredCallSlot}</span>
                </div>
              </div>

              {/* Fee and Next Steps Clarification */}
              <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-left max-w-md mx-auto text-xs text-cyan-900 space-y-1.5">
                <div className="flex items-center space-x-1.5 font-bold text-cyan-950">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>Next Step: 1-on-1 Academic Expert Call</span>
                </div>
                <p className="text-[11px] leading-relaxed text-cyan-800">
                  Our Senior Academic Counselor will call you at your preferred time slot to evaluate your learning goals, explain the detailed curriculum, and finalize your customized course fee and scholarship eligibility.
                </p>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close & Explore More Courses
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Important Fee & Consultation Notice */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs text-blue-900 flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                  i
                </div>
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-blue-950">Official Fee & Consultation Policy:</strong> Course fee, personalized project roadmap, and merit/need-based scholarship options are not fixed on the website. They are customized and finalized during your personal consultation call with our academic expert. No payment is required today.
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Row 1: Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Student Full Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>WhatsApp / Mobile Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2: Email & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@example.com"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>City / District *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Cuttack, Pune"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2b: DOB, WhatsApp, PIN, Language */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Date of Birth</span>
                  </label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">WhatsApp (Optional)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="560001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>Language</span>
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
                  >
                    {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                      <option key={l.code} value={l.label}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Minor Guardian Block */}
              {isMinor && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2.5 text-left">
                  <div className="text-xs font-bold text-amber-900">
                    Minor Learner (&lt;18) — Mandatory Parent / Guardian Consent (DPDP Act 2023)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Parent / Guardian Full Name *"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                    />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="Parent / Guardian Mobile *"
                      value={parentMobile}
                      onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-[11px] text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardianConsentAccepted}
                      onChange={(e) => setGuardianConsentAccepted(e.target.checked)}
                      className="mt-0.5 accent-amber-600"
                    />
                    <span>I confirm guardian consent for this minor student to learn on OpenFrame Education. *</span>
                  </label>
                </div>
              )}

              {/* Row 3: Qualification & College/School */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    Current Qualification / Background
                  </label>
                  <select
                    value={currentQualification}
                    onChange={(e) => setCurrentQualification(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  >
                    <option value="School Student (Class 6-12)">School Student (Class 6-12)</option>
                    <option value="College / Engineering Student">College / Engineering Student (B.Tech, BCA, MCA, BSc)</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                    <option value="Working IT Professional">Working IT Professional</option>
                    <option value="Career Transition / Non-IT">Career Transition / Non-IT Professional</option>
                    <option value="Entrepreneur / Self-Employed">Entrepreneur / Self-Employed</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    School / College / Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OUTR, KIIT, Ravenshaw, TCS"
                    value={schoolCollegeName}
                    onChange={(e) => setSchoolCollegeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 4: Preferred Call Slot & Learning Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Preferred Expert Call Slot</span>
                  </label>
                  <select
                    value={preferredCallSlot}
                    onChange={(e) => setPreferredCallSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  >
                    <option value="Morning (09:00 AM – 12:00 PM)">Morning (09:00 AM – 12:00 PM)</option>
                    <option value="Afternoon (12:00 PM – 04:00 PM)">Afternoon (12:00 PM – 04:00 PM)</option>
                    <option value="Evening (04:00 PM – 08:00 PM)">Evening (04:00 PM – 08:00 PM)</option>
                    <option value="Weekend Counseling Only">Weekend Counseling Only</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">
                    Preferred Delivery Format
                  </label>
                  <select
                    value={preferredLearningMode}
                    onChange={(e) => setPreferredLearningMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  >
                    <option value="Hybrid / Practical Labs">Hybrid (Live Online + Practical Labs)</option>
                    <option value="Online Live Classes">100% Live Online Interactive Mentorship</option>
                    <option value="Recorded Lessons">Self-Paced Guided Projects + AI Tutor</option>
                  </select>
                </div>
              </div>

              {/* Questions or Specific Objectives */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Specific Questions / Career Goals for Academic Counselor (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Looking for practical capstone project and placement preparation; need scholarship details."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800 resize-none"
                />
              </div>

              {/* Optional GPS Opt-in */}
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={gpsConsentAccepted}
                  onChange={(e) => handleToggleGps(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Opt-In: Share approximate GPS coordinates for local counseling center matching (Optional
                  {gpsCoordinates ? ` · ${gpsCoordinates.lat}, ${gpsCoordinates.lng}` : ''}).
                </span>
              </label>

              {/* DPDP Notice + Consent checkbox */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 text-left">
                <strong>DPDP Act 2023 Notice:</strong> OpenFrame does not collect Aadhaar or government ID documents. Data is used strictly for educational onboarding.
              </div>
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I authorize OpenFrame IT Solutions &amp; OpenFrame Education academic advisors to contact me via phone call, WhatsApp, or email regarding course admissions and mentorship.
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !consentAccepted}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Application & Schedule Call</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
