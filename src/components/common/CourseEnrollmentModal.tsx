import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Lock,
  BookOpen,
  AlertCircle,
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
import { auth, db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: MarketplaceCourse | null;
  onEnrolled?: (enrollment: CourseEnrollment) => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function loadRazorpayCheckoutScript(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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
  const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');

  // Form fields (only edited when missing from verified StudentProfile)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dob, setDob] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationCategoryCode>('G');
  const [degreeOrClass, setDegreeOrClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [consentAccepted, setConsentAccepted] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedEnrollment, setCompletedEnrollment] = useState<CourseEnrollment | null>(null);

  useEffect(() => {
    if (!isOpen || !course) return;
    setStep('details');
    setErrorMsg('');
    setCompletedEnrollment(null);
    setAlreadyEnrolled(null);

    setFullName(studentProfile?.fullName || lmsUser?.displayName || currentUser?.displayName || '');
    setEmail(studentProfile?.email || lmsUser?.email || currentUser?.email || '');
    setMobileNumber(studentProfile?.mobileNumber || '');
    setDob(studentProfile?.dob || '');
    setEducationLevel(studentProfile?.educationLevel || 'G');
    setDegreeOrClass(studentProfile?.degreeOrClass || studentProfile?.qualification || '');
    setInstitution(studentProfile?.institution || lmsUser?.institutionName || '');
    setCity(studentProfile?.city || '');
    setStateName(studentProfile?.state || 'Karnataka');
    setPincode(studentProfile?.pincode || '');
    setParentName(studentProfile?.parentName || '');
    setParentMobile(studentProfile?.parentMobile || '');

    if (currentUser?.uid) {
      setCheckingExisting(true);
      lmsService
        .getStudentEnrollments(currentUser.uid)
        .then((enrollments) => {
          const match = enrollments.find((e) => e.courseId === course.id && e.status !== 'Suspended');
          if (match) setAlreadyEnrolled(match);
        })
        .catch(() => {})
        .finally(() => setCheckingExisting(false));
    }
  }, [isOpen, course, currentUser, studentProfile, lmsUser]);

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

  const isFreeCourse = Number(course.price || 0) === 0 || Boolean(course.isFree);
  const priceInr = isFreeCourse ? 0 : Math.max(0, Number(course.price || 0));

  const missingFields = {
    fullName: !fullName.trim(),
    email: !email.trim(),
    mobileNumber: !mobileNumber.trim() || mobileNumber.trim().length < 10,
    educationLevel: !educationLevel,
    degreeOrClass: !degreeOrClass.trim(),
    location: !city.trim() || !stateName.trim(),
  };

  const hasVerifiedProfileCore = Boolean(
    currentUser &&
      studentProfile?.fullName &&
      studentProfile?.email &&
      studentProfile?.mobileNumber &&
      studentProfile?.degreeOrClass &&
      studentProfile?.city
  );

  const handleProceedConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }
    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!degreeOrClass.trim()) {
      setErrorMsg('Please select or enter your current class, degree, or skill level.');
      return;
    }
    if (isMinor && (!parentName.trim() || !parentMobile.trim())) {
      setErrorMsg('Guardian name and contact number are required for learners under 18.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm the learner data & DPDP consent policy to continue.');
      return;
    }
    setStep('confirm');
  };

  const syncUpdatedStudentProfile = async () => {
    if (!currentUser?.uid || !studentProfile) return studentProfile;
    const updated = await lmsService.updateStudentProfile(currentUser.uid, {
      fullName: fullName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      dob: dob || undefined,
      educationLevel,
      degreeOrClass: degreeOrClass.trim(),
      qualification: degreeOrClass.trim(),
      institution: institution.trim() || 'Independent Learner',
      city: city.trim(),
      state: stateName.trim(),
      pincode: pincode.trim() || undefined,
      isMinor,
      parentName: parentName.trim() || undefined,
      parentMobile: parentMobile.trim() || undefined,
    });
    await refreshUserProfile().catch(() => {});
    return updated;
  };

  const finalizeCourseEnrollment = async (paymentStatus: CourseEnrollment['paymentStatus'], feeAmount: number) => {
    if (!currentUser) {
      throw new Error('Please sign in to your learner account to complete enrollment.');
    }
    const activeProfile =
      (await syncUpdatedStudentProfile()) || {
        id: currentUser.uid,
        uid: currentUser.uid,
        studentId: currentUser.uid,
        registrationNumber: lmsUser?.registrationNumber || `OF-STU-${Date.now().toString().slice(-6)}`,
        fullName: fullName.trim(),
        email: email.trim(),
        mobileNumber: mobileNumber.trim(),
        educationLevel,
        degreeOrClass: degreeOrClass.trim(),
        enrolledCourseIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    const { enrollment } = await lmsService.enrollStudentInCourse(
      course,
      activeProfile,
      paymentStatus,
      feeAmount
    );
    await lmsService.logDiscoveryAnalyticsEvent({
      userId: currentUser.uid,
      eventType: 'course_enroll_click',
      query: course.title,
      educationLevelCode: educationLevel,
      degreeOrClass: degreeOrClass.trim(),
      subject: course.category,
      courseId: course.id,
    });
    setCompletedEnrollment(enrollment);
    setStep('success');
    if (onEnrolled) onEnrolled(enrollment);
  };

  const handleConfirmEnrollment = async () => {
    setErrorMsg('');
    if (!currentUser) {
      onClose();
      navigate('/login/student');
      return;
    }

    setProcessing(true);
    try {
      // FREE COURSE FLOW
      if (isFreeCourse || priceInr <= 0) {
        await finalizeCourseEnrollment('Complimentary', 0);
        return;
      }

      // PAID COURSE FLOW VIA RAZORPAY
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('Authentication session expired. Please sign in again.');
      }

      const orderRes = await fetch('/api/payments/razorpay/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          amountInr: priceInr,
          courseId: course.id,
          institutionId: lmsUser?.institutionId || 'OPENFRAME_MARKETPLACE',
          purpose: `Course Enrollment: ${course.title}`,
          notes: {
            studentName: fullName.trim(),
            courseTitle: course.title,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.ok) {
        throw new Error(
          orderData.error ||
            'Online Razorpay checkout is not configured on this server environment. Contact OpenFrame Support to complete paid enrollment.'
        );
      }

      const loaded = await loadRazorpayCheckoutScript();
      if (!loaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay Checkout SDK. Please check network connectivity and retry.');
      }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency || 'INR',
          name: 'OpenFrame Education',
          description: course.title,
          order_id: orderData.order.id,
          prefill: {
            name: fullName.trim(),
            email: email.trim(),
            contact: mobileNumber.trim(),
          },
          theme: { color: '#123D32' },
          handler: async (response: any) => {
            try {
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                reject(new Error(verifyData.error || 'Payment signature verification failed.'));
                return;
              }

              const payId = `pay_${Date.now().toString(36)}`;
              await setDoc(doc(db, 'payments', payId), {
                id: payId,
                userId: currentUser.uid,
                studentId: currentUser.uid,
                institutionId: lmsUser?.institutionId || 'OPENFRAME_MARKETPLACE',
                courseId: course.id,
                courseTitle: course.title,
                amountInr: priceInr,
                gateway: 'Razorpay',
                status: 'Paid',
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                verifiedServerSide: true,
                createdAt: new Date().toISOString(),
              }).catch(() => {});

              await finalizeCourseEnrollment('Paid', priceInr);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled before completion.')),
          },
        });
        rzp.open();
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to complete enrollment.');
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
              {isFreeCourse ? 'OpenFrame Free Course Enrollment' : 'OpenFrame Verified Course Checkout'}
            </p>
            <h2 className="font-editorial text-2xl font-bold text-[#18221F] mt-0.5 line-clamp-1">
              {course.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              {course.category} · {course.level} · {course.duration} ·{' '}
              <span className="font-bold text-[#123D32] tabular-nums">
                {isFreeCourse ? 'Free Access' : `₹${priceInr.toLocaleString('en-IN')}`}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-[#18221F] rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close enrollment dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {checkingExisting && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600">
              Verifying existing enrollment records...
            </div>
          )}

          {alreadyEnrolled ? (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#123D32] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    You are already enrolled in this course
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Status: {alreadyEnrolled.status} · Payment: {alreadyEnrolled.paymentStatus} · Enrolled on{' '}
                    {new Date(alreadyEnrolled.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/learn/${encodeURIComponent(course.id)}`);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Open Learning Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/dashboard');
                  }}
                  className="px-5 py-2.5 border border-slate-300 bg-white text-sm font-semibold text-[#18221F] rounded-xl hover:border-[#123D32]"
                >
                  Go to My Learning
                </button>
              </div>
            </div>
          ) : !currentUser ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#14213D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Sign in to enroll & track your certification
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {isFreeCourse
                      ? 'Your verified learner account saves course progress, quizzes, and certificates automatically.'
                      : `Verified authentication is required before processing Razorpay payment of ₹${priceInr.toLocaleString('en-IN')}.`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/login/student');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
                >
                  Sign In / Register Student Account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700 rounded-xl"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleProceedConfirm} className="space-y-4">
              {hasVerifiedProfileCore && (
                <div className="p-4 bg-white border border-[#123D32]/25 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#123D32] shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-[#18221F]">Verified Learner Profile Auto-Prefilled</p>
                    <p>
                      {fullName} · {email} · {mobileNumber}
                    </p>
                    <p>
                      Level {educationLevel} · {degreeOrClass} · {city}, {stateName}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#18221F]">
                  {hasVerifiedProfileCore ? 'Confirm or Update Enrollment Details' : 'Complete Required Learner Details'}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="10-digit mobile number"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Education Category (A–J) *</label>
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
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Class / Track *</label>
                    <select
                      value={programmeOptions.includes(degreeOrClass) ? degreeOrClass : ''}
                      onChange={(e) => setDegreeOrClass(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    >
                      <option value="">Select programme / class</option>
                      {programmeOptions.map((prog) => (
                        <option key={prog} value={prog}>
                          {prog}
                        </option>
                      ))}
                    </select>
                    {!programmeOptions.includes(degreeOrClass) && (
                      <input
                        type="text"
                        value={degreeOrClass}
                        onChange={(e) => setDegreeOrClass(e.target.value)}
                        placeholder="Or enter degree/class (e.g. BCA, Class 10)"
                        className="w-full mt-2 px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Institution / School / Workplace</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="College, school, or Self-Paced"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bengaluru"
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    </div>
                  </div>
                </div>

                {isMinor && (
                  <div className="p-4 bg-[#FAF7F2] border border-amber-300 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Mobile *</label>
                      <input
                        type="tel"
                        value={parentMobile}
                        onChange={(e) => setParentMobile(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm"
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
                    I confirm these enrollment details are accurate and consent to saving them to my OpenFrame Learner Profile (DPDP Act compliant).
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  {Object.values(missingFields).some(Boolean) ? 'Required fields highlighted above' : 'All profile checks verified'}
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Review Enrollment Summary <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : step === 'confirm' ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-heading text-lg font-bold text-[#18221F]">
                  Confirm Enrollment & Fee Summary
                </h3>

                <div className="divide-y divide-slate-100 text-sm">
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Course</span>
                    <span className="font-semibold text-[#18221F] text-right">{course.title}</span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Learner</span>
                    <span className="font-medium text-[#18221F] text-right">
                      {fullName} ({degreeOrClass || educationLevel})
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Certification</span>
                    <span className="font-medium text-[#18221F] text-right">
                      {course.certificateEligibility ? 'Verified OpenFrame Certificate Eligible' : 'Self-Paced Track'}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Course Fee</span>
                    <span className="font-bold text-lg text-[#123D32] tabular-nums">
                      {isFreeCourse ? '₹0 (Free Course)' : `₹${priceInr.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={processing}
                    className="px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700 rounded-xl"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEnrollment}
                    disabled={processing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0D2E25] transition-colors disabled:opacity-60"
                  >
                    {isFreeCourse ? <GraduationCap className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    {processing
                      ? 'Processing...'
                      : isFreeCourse
                      ? 'Confirm Free Enrollment'
                      : `Pay ₹${priceInr.toLocaleString('en-IN')} with Razorpay`}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#123D32] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[#18221F]">
                    Enrollment Confirmed
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {course.title} has been added to your My Learning workspace.
                    {completedEnrollment?.registrationNumber ? ` Reference: ${completedEnrollment.registrationNumber}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(`/learn/${encodeURIComponent(course.id)}`);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Course Workspace <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/dashboard');
                  }}
                  className="px-5 py-3 border border-slate-300 bg-white text-sm font-semibold text-[#18221F] rounded-xl"
                >
                  View in Student Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
