import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Lock,
  BookOpen,
  AlertCircle,
  MapPin,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/RouterContext';
import {
  MarketplaceCourse,
  EducationCategoryCode,
  CourseEnrollment,
} from '../../types';
import {
  EDUCATION_CLASSIFICATION_CATEGORIES,
  getAllProgrammesForCategory,
} from '../../data/educationClassificationData';
import { lmsService } from '../../services/lmsService';
import { cacheYouTubeCourse } from '../../services/marketplaceService';
import {
  ALL_INDIAN_STATES_AND_UTS,
  validateCertificateAddressDetails,
  type CertificateAddressDetails,
} from '../../utils/pricingEngine';
import { GoogleSignInButton } from './GoogleSignInButton';
import { standaloneMockService } from '../../services/standaloneMockService';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: MarketplaceCourse | null;
  onEnrolled?: (enrollment: CourseEnrollment) => void;
  skipAutoRedirect?: boolean;
}

export const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnrolled,
}) => {
  const { currentUser, studentProfile, lmsUser, refreshUserProfile } = useAuth();
  const { navigate } = useRouter();

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<CourseEnrollment | null>(null);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [continueStandalone, setContinueStandalone] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');

  // Core learner details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationCategoryCode>('G');
  const [degreeOrClass, setDegreeOrClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');

  // Optional at enrollment / mandatory before submitting for Admin certification approval
  const [homeAddress, setHomeAddress] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternativeMobileNumber, setAlternativeMobileNumber] = useState('');
  const [stateName, setStateName] = useState('Karnataka');

  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedEnrollment, setCompletedEnrollment] = useState<CourseEnrollment | null>(null);

  const activeLearnerUid = currentUser?.uid || standaloneMockService.getActiveLearner().uid;

  useEffect(() => {
    if (!isOpen || !course) return;
    setStep('details');
    setErrorMsg('');
    setCompletedEnrollment(null);
    setAlreadyEnrolled(null);
    setShowAddressFields(false);
    setContinueStandalone(false);

    const savedLocal = standaloneMockService.getUserData(activeLearnerUid);
    setFullName(studentProfile?.fullName || lmsUser?.displayName || currentUser?.displayName || savedLocal?.fullName || '');
    setEmail(studentProfile?.email || lmsUser?.email || currentUser?.email || savedLocal?.email || '');
    setMobileNumber(studentProfile?.mobileNumber || savedLocal?.phone || '');
    setAlternativeMobileNumber(studentProfile?.alternativeMobileNumber || studentProfile?.whatsappNumber || '');
    setHomeAddress(studentProfile?.homeAddress || savedLocal?.address?.homeAddress || '');
    setFlatNumber(studentProfile?.flatNumber || studentProfile?.houseNumber || savedLocal?.address?.flatNumber || '');
    setStreetAddress(studentProfile?.streetAddress || savedLocal?.address?.streetAddress || '');
    setPincode(studentProfile?.pincode || savedLocal?.address?.pincode || '');
    setDob(studentProfile?.dob || '');
    setEducationLevel((studentProfile?.educationLevel || savedLocal?.educationLevel || 'G') as EducationCategoryCode);
    setDegreeOrClass(studentProfile?.degreeOrClass || studentProfile?.qualification || savedLocal?.degreeOrClass || 'Skill Development / Self-Paced');
    setInstitution(studentProfile?.institution || lmsUser?.institutionName || savedLocal?.institution || '');
    setCity(studentProfile?.city || savedLocal?.city || '');
    setStateName(studentProfile?.state || savedLocal?.address?.state || 'Karnataka');
    setParentName(studentProfile?.parentName || '');
    setParentMobile(studentProfile?.parentMobile || '');

    setCheckingExisting(true);
    lmsService
      .getStudentEnrollments(activeLearnerUid)
      .then((enrollments) => {
        const match = enrollments.find(
          (e) =>
            e.courseId.toLowerCase() === course.id.toLowerCase() &&
            lmsService.isVerifiedPaidEnrollment(e)
        );
        if (match) {
          setAlreadyEnrolled(match);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingExisting(false));
  }, [isOpen, course, currentUser, studentProfile, lmsUser, activeLearnerUid]);

  const programmeOptions = useMemo(() => {
    return getAllProgrammesForCategory(educationLevel);
  }, [educationLevel]);

  const isMinor = useMemo(() => {
    if (!dob) return false;
    const dt = new Date(dob);
    if (Number.isNaN(dt.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - dt.getFullYear();
    if (now.getMonth() < dt.getMonth() || (now.getMonth() === dt.getMonth() && now.getDate() < dt.getDate())) {
      age--;
    }
    return age < 18;
  }, [dob]);

  if (!isOpen || !course) return null;

  const addressDetails: CertificateAddressDetails = {
    homeAddress: homeAddress.trim(),
    flatNumber: flatNumber.trim(),
    streetAddress: streetAddress.trim(),
    pincode: pincode.replace(/\D/g, '').trim(),
    mobileNumber: mobileNumber.replace(/\D/g, '').trim(),
    alternativeMobileNumber: alternativeMobileNumber.replace(/\D/g, '').trim(),
    state: stateName.trim(),
  };

  const addressCheck = validateCertificateAddressDetails(addressDetails);

  const syncUpdatedStudentProfile = async () => {
    if (!currentUser?.uid) return null;
    try {
      const updated = await lmsService.updateStudentProfile(currentUser.uid, {
        fullName: fullName.trim() || currentUser.displayName || 'Student Learner',
        email: email.trim() || currentUser.email || '',
        mobileNumber: addressDetails.mobileNumber || undefined,
        alternativeMobileNumber: addressDetails.alternativeMobileNumber || undefined,
        homeAddress: addressDetails.homeAddress || undefined,
        flatNumber: addressDetails.flatNumber || undefined,
        houseNumber: addressDetails.flatNumber || undefined,
        streetAddress: addressDetails.streetAddress || undefined,
        pincode: addressDetails.pincode || undefined,
        state: addressDetails.state || undefined,
        city: city.trim() || undefined,
        dob: dob || undefined,
        educationLevel,
        degreeOrClass: degreeOrClass.trim() || 'Skill Development / Self-Paced',
        qualification: degreeOrClass.trim() || 'Skill Development / Self-Paced',
        institution: institution.trim() || 'Independent Learner',
        isMinor,
        parentName: parentName.trim() || undefined,
        parentMobile: parentMobile.trim() || undefined,
      });
      await refreshUserProfile().catch(() => {});
      return updated;
    } catch {
      return null;
    }
  };

  const handleConfirmDirectEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm the learner data & DPDP consent policy to continue.');
      return;
    }

    setProcessing(true);
    try {
      const effectiveUid = activeLearnerUid;

      standaloneMockService.saveUserData(effectiveUid, {
        fullName: fullName.trim() || currentUser?.displayName || 'OpenFrame Learner',
        email: email.trim() || currentUser?.email || 'learner@openframe.local',
        phone: addressDetails.mobileNumber || undefined,
        educationLevel,
        degreeOrClass: degreeOrClass.trim() || 'Skill Development / Self-Paced',
        institution: institution.trim() || 'Independent Learner',
        city: city.trim() || undefined,
        address: {
          homeAddress: addressDetails.homeAddress || '',
          flatNumber: addressDetails.flatNumber || '',
          streetAddress: addressDetails.streetAddress || '',
          pincode: addressDetails.pincode || '',
          state: addressDetails.state || '',
        },
      });

      cacheYouTubeCourse(course);

      const activeProfile =
        (await syncUpdatedStudentProfile()) || {
          id: effectiveUid,
          uid: effectiveUid,
          studentId: effectiveUid,
          registrationNumber: lmsUser?.registrationNumber || `OF-STU-${Date.now().toString().slice(-6)}`,
          fullName: fullName.trim() || currentUser?.displayName || 'OpenFrame Learner',
          email: email.trim() || currentUser?.email || 'learner@openframe.local',
          mobileNumber: addressDetails.mobileNumber,
          alternativeMobileNumber: addressDetails.alternativeMobileNumber,
          homeAddress: addressDetails.homeAddress,
          flatNumber: addressDetails.flatNumber,
          streetAddress: addressDetails.streetAddress,
          pincode: addressDetails.pincode,
          state: addressDetails.state,
          educationLevel,
          degreeOrClass: degreeOrClass.trim() || 'Skill Development / Self-Paced',
          enrolledCourseIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

      const { enrollment } = await lmsService.enrollStudentInCourse(
        course,
        {
          uid: effectiveUid,
          fullName: activeProfile.fullName,
          email: activeProfile.email,
          registrationNumber: activeProfile.registrationNumber,
          addressDetails,
        },
        'Complimentary',
        0
      );

      lmsService
        .logDiscoveryAnalyticsEvent({
          userId: effectiveUid,
          eventType: 'course_enroll_click',
          query: course.title,
          educationLevelCode: educationLevel,
          degreeOrClass: degreeOrClass.trim() || 'Skill Development / Self-Paced',
          subject: course.category,
          courseId: course.id,
        })
        .catch(() => {});

      setCompletedEnrollment(enrollment);
      setStep('success');
      if (onEnrolled) onEnrolled(enrollment);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to complete enrollment right now. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#123D32]">
              OpenFrame Education · Direct Course Enrollment
            </p>
            <h2 className="font-editorial text-2xl font-bold text-[#18221F] mt-0.5 line-clamp-1">
              {course.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5">
              <span>{course.category}</span>
              <span>·</span>
              <span>{course.level}</span>
              <span>·</span>
              <span>{course.duration}</span>
              <span>·</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Instant Access · Admin-Approved Certification
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#18221F] rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close enrollment dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* 2-Step Learning & Admin Certification Flow Indicator */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center gap-2 ${
                alreadyEnrolled || step === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-[#123D32] border-[#123D32] text-white'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-[11px] shrink-0">
                {alreadyEnrolled || step === 'success' ? '✓' : '1'}
              </span>
              <div className="min-w-0">
                <div className="font-bold truncate">Step 1: Enroll &amp; Complete Course</div>
                <div className="text-[10px] opacity-85 truncate">Modules, Quinn AI &amp; Quiz</div>
              </div>
            </div>
            <div
              className={`rounded-xl border px-3.5 py-2.5 flex items-center gap-2 ${
                alreadyEnrolled || step === 'success'
                  ? 'bg-[#2563EB] border-[#2563EB] text-white'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-200/80 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                2
              </span>
              <div className="min-w-0">
                <div className="font-bold truncate">Step 2: Admin Course Approval</div>
                <div className="text-[10px] opacity-85 truncate">Unlocks Official QR Certificate</div>
              </div>
            </div>
          </div>

          {checkingExisting && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600">
              Checking your enrollment status...
            </div>
          )}

          {alreadyEnrolled ? (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#123D32] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Already Enrolled — Learning Workspace Active
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Enrolled on {new Date(alreadyEnrolled.enrolledAt).toLocaleDateString()}. Complete your lessons &amp; Verification Quiz (≥70%), then submit for Admin Course Approval to unlock your certificate.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    cacheYouTubeCourse(course);
                    onClose();
                    navigate(`/learn/${encodeURIComponent(course.id)}`);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Open Learning Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/dashboard');
                  }}
                  className="px-5 py-2.5 border border-slate-300 bg-white text-sm font-semibold text-[#18221F] rounded-xl hover:border-[#123D32] cursor-pointer"
                >
                  Go to My Learning
                </button>
              </div>
            </div>
          ) : !currentUser && !continueStandalone ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#14213D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Sign In for Cloud Progress &amp; Admin Certification Tracking
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Sign in with Google or email so your completed lessons, quiz scores, and certificate approval request sync directly with the OpenFrame Admin Dashboard.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <GoogleSignInButton
                  role="student"
                  label="Continue with Google to Enroll"
                  variant="dark"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/login/student');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                  >
                    Email Sign In / Register <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setContinueStandalone(true)}
                    className="px-4 py-2.5 border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#18221F] rounded-xl hover:border-[#123D32] cursor-pointer"
                  >
                    Continue Without Sign In
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleConfirmDirectEnrollment} className="space-y-4">
              {/* Direct Access & Admin Certification Summary Card */}
              <div className="bg-white border border-[#123D32]/25 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#123D32] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
                    Instant Course Access · Admin-Approved Certification
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    Start learning immediately with full access to modules, lectures, Quinn AI tutor, and quizzes. Once you finish the course and pass the Verification Quiz (&ge;70%), submit your completion for Admin Course Approval to unlock your official QR-verified certificate.
                  </p>
                </div>
              </div>

              {/* Core Academic Identity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#18221F]">
                  1. Learner Details for Enrollment &amp; Certificate
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 Digits)</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Level (LKG to PG &amp; Skills)</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => {
                        const next = e.target.value as EducationCategoryCode;
                        setEducationLevel(next);
                        setDegreeOrClass('');
                      }}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    >
                      {EDUCATION_CLASSIFICATION_CATEGORIES.map((cat) => (
                        <option key={cat.code} value={cat.code}>
                          {cat.code}: {cat.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Degree / Skill Track</label>
                    <select
                      value={programmeOptions.includes(degreeOrClass) ? degreeOrClass : ''}
                      onChange={(e) => setDegreeOrClass(e.target.value || 'Skill Development / Self-Paced')}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    >
                      <option value="">Select Class / Degree (LKG–PG) or Skill Track</option>
                      {programmeOptions.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Optional Collapsible 7-Field Certificate Address */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAddressFields((v) => !v)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#123D32] shrink-0" />
                    <div className="text-xs font-bold text-[#18221F]">
                      2. Certificate Dispatch Address ({addressCheck.valid ? 'Saved & Verified' : 'Optional now — required before Admin approval submission'})
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#2563EB]">
                    {showAddressFields ? 'Hide' : 'Edit / Add'}
                  </span>
                </button>

                {showAddressFields && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address</label>
                      <input
                        type="text"
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        placeholder="House / Building Name, Apartment / Residential Complex"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Number</label>
                      <input
                        type="text"
                        value={flatNumber}
                        onChange={(e) => setFlatNumber(e.target.value)}
                        placeholder="e.g. Flat 304 / House #12"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                      <input
                        type="text"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. 4th Cross, MG Road"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pin Code (6 Digits)</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 560001"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State / Union Territory</label>
                      <select
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      >
                        <option value="">Select State / UT</option>
                        {ALL_INDIAN_STATES_AND_UTS.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Alternative Mobile (10 Digits)</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={alternativeMobileNumber}
                        onChange={(e) => setAlternativeMobileNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="Alternate / Parent 10-digit mobile"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru, Mysuru"
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-start gap-2.5 text-xs text-slate-600 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentAccepted}
                    onChange={(e) => setConsentAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#123D32]"
                  />
                  <span>
                    I accept the DPDP Act 2023 learner policy and understand that official certification is issued after course completion and Admin review.
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#123D32]" />
                  <span>Direct Enrollment · Verified Admin Certification</span>
                </span>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D32] hover:bg-[#0D2E25] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 cursor-pointer shadow-sm whitespace-nowrap"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{processing ? 'Enrolling...' : 'Enroll & Unlock Workspace'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#123D32] shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-editorial text-2xl font-bold text-[#18221F]">
                    Enrollment Confirmed — Start Learning!
                  </h3>
                  <p className="text-sm text-slate-600">
                    <strong>{course.title}</strong> is now unlocked in your Learning Workspace. Complete your lessons and Verification Test (&ge;70%), then submit for Admin Course Approval to receive your official QR-verified certificate.
                  </p>
                  {completedEnrollment?.registrationNumber && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-mono">
                      Learner Reg No: {completedEnrollment.registrationNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    cacheYouTubeCourse(course);
                    onClose();
                    navigate(`/learn/${encodeURIComponent(course.id)}?enrolled=1`);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-4 h-4" />
                  Open Learning Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/dashboard');
                  }}
                  className="px-5 py-3 border border-slate-300 bg-white text-sm font-semibold text-[#18221F] rounded-xl cursor-pointer whitespace-nowrap"
                >
                  Go to My Learning
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
