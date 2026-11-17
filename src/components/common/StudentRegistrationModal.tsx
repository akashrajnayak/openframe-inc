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
  Sparkles,
  Send,
  HelpCircle,
  Globe,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useRouter } from '../../router/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { submitStudentRegistration } from '../../services/firebase';
import { lmsService } from '../../services/lmsService';
import { quinnAiService } from '../../services/quinnAiService';
import { marketplaceService } from '../../services/marketplaceService';
import { SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES } from '../../utils/searchIntelligence';

interface StudentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle?: string;
  courseId?: string;
  videoId?: string;
  courseCategory?: string;
}

export const StudentRegistrationModal: React.FC<StudentRegistrationModalProps> = ({
  isOpen,
  onClose,
  courseTitle = 'General IT & Technology Programme',
  courseId = '',
  videoId = '',
  courseCategory = 'Information Technology'
}) => {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
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

  const targetLearnPath = videoId
    ? `/learn/video/${encodeURIComponent(videoId)}`
    : courseId && courseId !== 'VIDEO-SELECT'
    ? `/learn/${encodeURIComponent(courseId)}`
    : '/marketplace';

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
    const recordUid = currentUser?.uid || `reg_${generatedId}`;

    try {
      const payload = {
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        whatsappNumber: whatsappNumber.trim() || mobileNumber.trim(),
        emailAddress: emailAddress.trim().toLowerCase(),
        dob: dob || '',
        gender: gender || undefined,
        country: 'India',
        state: state.trim() || 'Karnataka',
        district: district.trim() || city.trim() || 'Bengaluru Urban',
        city: city.trim() || 'Bengaluru',
        houseNumber: houseNumber.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        pincode: pincode.trim() || undefined,
        preferredLanguage,
        schoolCollegeName: schoolCollegeName.trim() || 'Independent / Self-Paced',
        currentClassQualification: currentQualification,
        interestedCourse: courseTitle ? `${courseTitle} (${courseId || 'OpenFrame'})` : 'Free OpenFrame Learning Programme',
        parentName: parentName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
        isMinor,
        guardianConsentAccepted: isMinor ? guardianConsentAccepted : undefined,
        gpsConsentAccepted,
        gpsCoordinates: gpsConsentAccepted ? gpsCoordinates : undefined,
        preferredLearningMode,
        consentAccepted,
        registeredAt: new Date().toISOString(),
        status: 'Registered' as const,
        internalNotes: `100% Free Course Enrollment. Category: ${courseCategory}. Student Notes: ${notes || 'None'}. Application ID: ${generatedId}`,
      };

      try {
        await submitStudentRegistration(payload);
        await lmsService.recordConsentRecord({
          userId: recordUid,
          email: payload.emailAddress,
          fullName: payload.fullName,
          isMinor,
          guardianName: payload.parentName,
          guardianMobile: payload.parentMobile,
          dpdpConsentAccepted: consentAccepted,
          gpsOptInAccepted: gpsConsentAccepted,
          termsAccepted: consentAccepted,
        });

        // Isolated single-target enrollment when signed in
        if (currentUser?.uid) {
          const targetCourseId = videoId ? `yt_${videoId}` : courseId;
          if (targetCourseId && targetCourseId !== 'VIDEO-SELECT') {
            const catalogCourse = videoId
              ? null
              : await marketplaceService.getCourseById(targetCourseId).catch(() => null);
            const targetCourse = catalogCourse || ({
              id: targetCourseId,
              title: courseTitle,
              category: courseCategory,
              categoryGroup: 'Technology',
              level: 'Beginner',
              duration: 'Self-Paced',
              price: 0,
              isFree: true,
              courseType: videoId ? 'youtube_video' : 'standard',
              youtubeVideoId: videoId || undefined,
              language: preferredLanguage,
              description: `100% Free OpenFrame learning workspace for ${courseTitle}.`,
              skillsAcquired: [courseCategory],
              status: 'Published',
            } as any);
            await lmsService.enrollStudentInCourse(targetCourse, {
              uid: currentUser.uid,
              fullName: payload.fullName,
              email: payload.emailAddress,
            });
          }
        }
      } catch (firestoreErr) {
        console.warn('Firestore write fallback to local storage:', firestoreErr);
      }

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
              <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-semibold">
                100% Free Enrollment · Zero Course Fee
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">
                Student Programme Enrollment
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
            <span className="font-semibold text-blue-800">Selected Programme:</span>
            <span className="font-bold text-slate-900 truncate">{courseTitle}</span>
            {courseId && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                {courseId}
              </span>
            )}
          </div>
          <span className="hidden sm:inline text-[11px] text-emerald-700 font-bold shrink-0 ml-2">
            100% Free
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
                <h3 className="text-xl font-bold text-slate-900">Free Enrollment Confirmed!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Thank you, <strong className="text-slate-800">{fullName}</strong>. Your 100% free enrollment for <strong className="text-blue-700">{courseTitle}</strong> has been logged in OpenFrame Education.
                </p>
              </div>

              {/* Reference Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Enrollment Reference ID:</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">{applicationId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Enrolled Programme:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[220px]">{courseTitle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Course Fee:</span>
                  <span className="font-bold text-emerald-700">₹0 · 100% Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Registered Contact:</span>
                  <span className="font-medium text-slate-700">{mobileNumber}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-left max-w-md mx-auto text-xs text-emerald-950 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Instant Access Ready</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900">
                  Click &ldquo;Start Learning Now&rdquo; to launch your Quinn AI structured workspace, watch curated YouTube lectures, complete the 7-format assessment, and earn a QR-verified OpenFrame certificate.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    navigate(targetLearnPath);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Start Learning Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 100% Free Enrollment Notice */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 text-xs text-emerald-950 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-emerald-950">100% Free Enrollment · Zero Course Fee:</strong> All Quinn AI video learning paths, assessments, and certificates on OpenFrame Education are completely free. No payment or card is ever required.
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
                    <span>Mobile Number *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2: Email & City */}
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
                    <span>City / Village *</span>
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

              {/* Row 2b: House No, Street Address, State, District */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">House / Flat No.</label>
                  <input
                    type="text"
                    placeholder="e.g. #42, 2nd Floor"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1 text-left sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">Street / Road / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. 100 Feet Road, Indiranagar"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">District</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru Urban"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2c: DOB, WhatsApp, PIN, Language */}
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
                    School / College / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Optional — open to independent learners"
                    value={schoolCollegeName}
                    onChange={(e) => setSchoolCollegeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Row 4: Gender, State & Delivery Format */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">Gender (Optional)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary / Other">Non-Binary / Other</option>
                  </select>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">State / UT</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold text-slate-700">Learning Mode</label>
                  <select
                    value={preferredLearningMode}
                    onChange={(e) => setPreferredLearningMode(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-800"
                  >
                    <option value="Hybrid / Practical Labs">Hybrid (AI + Practical Labs)</option>
                    <option value="Online Live Classes">Live Online Mentorship</option>
                    <option value="Recorded Lessons">Self-Paced YouTube + Quinn AI</option>
                  </select>
                </div>
              </div>

              {/* Learning Goals */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Learning Goals / Topics of Interest (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Build practical projects, pass final assessment, and earn a verified certificate."
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
                  Opt-In: Share approximate GPS coordinates for regional learning hub matching (Optional
                  {gpsCoordinates ? ` · ${gpsCoordinates.lat}, ${gpsCoordinates.lng}` : ''}).
                </span>
              </label>

              {/* DPDP Notice + Consent checkbox */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 text-left">
                <strong>DPDP Act 2023 Notice:</strong> OpenFrame does not collect Aadhaar or government ID documents. Data is used strictly for educational enrollment and certificate verification.
              </div>
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer text-left">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I accept the DPDP Act 2023 privacy terms and agree to enroll in this 100% free OpenFrame Education programme.
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
                      <span>Completing Enrollment...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Complete Free Enrollment</span>
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
