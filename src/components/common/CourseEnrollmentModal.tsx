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
  MapPin,
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
import {
  ALL_INDIAN_STATES_AND_UTS,
  compute90PercentCoursePricing,
  formatInr,
  validateCertificateAddressDetails,
  type CertificateAddressDetails,
} from '../../utils/pricingEngine';

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

  // Core learner details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationCategoryCode>('G');
  const [degreeOrClass, setDegreeOrClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');

  // Mandatory 7-field Certificate Address & Contact Verification
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
  const [gatewayUnavailable, setGatewayUnavailable] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedEnrollment, setCompletedEnrollment] = useState<CourseEnrollment | null>(null);

  useEffect(() => {
    if (!isOpen || !course) return;
    setStep('details');
    setErrorMsg('');
    setGatewayUnavailable(false);
    setCompletedEnrollment(null);
    setAlreadyEnrolled(null);

    setFullName(studentProfile?.fullName || lmsUser?.displayName || currentUser?.displayName || '');
    setEmail(studentProfile?.email || lmsUser?.email || currentUser?.email || '');
    setMobileNumber(studentProfile?.mobileNumber || '');
    setAlternativeMobileNumber(studentProfile?.alternativeMobileNumber || studentProfile?.whatsappNumber || '');
    setHomeAddress(studentProfile?.homeAddress || '');
    setFlatNumber(studentProfile?.flatNumber || studentProfile?.houseNumber || '');
    setStreetAddress(studentProfile?.streetAddress || '');
    setPincode(studentProfile?.pincode || '');
    setDob(studentProfile?.dob || '');
    setEducationLevel(studentProfile?.educationLevel || 'G');
    setDegreeOrClass(studentProfile?.degreeOrClass || studentProfile?.qualification || '');
    setInstitution(studentProfile?.institution || lmsUser?.institutionName || '');
    setCity(studentProfile?.city || '');
    setStateName(studentProfile?.state || 'Karnataka');
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

  const pricing = compute90PercentCoursePricing({
    rawPrice: course.price,
    category: course.category,
    categoryGroup: course.categoryGroup,
    level: course.level,
    pricingTier: course.pricingTier,
    educationLevel: course.educationLevels?.[0],
    degreeOrClass: course.degreeProgrammes?.[0] || course.gradeLevel,
    title: course.title,
  });
  const priceInr = pricing.finalPriceInr;
  const marketPriceInr = pricing.marketBenchmarkPrice;

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

  const hasVerifiedProfileCore = Boolean(
    currentUser &&
      studentProfile?.fullName &&
      studentProfile?.email &&
      studentProfile?.mobileNumber &&
      studentProfile?.alternativeMobileNumber &&
      studentProfile?.homeAddress &&
      studentProfile?.flatNumber &&
      studentProfile?.streetAddress &&
      studentProfile?.pincode &&
      studentProfile?.state
  );

  const handleProceedConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address.');
      return;
    }
    if (!degreeOrClass.trim()) {
      setErrorMsg('Please select or enter your current class, degree, or skill level.');
      return;
    }
    if (!addressCheck.valid) {
      setErrorMsg(addressCheck.error || 'Please complete all 7 mandatory certificate address and mobile fields.');
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
    if (!currentUser?.uid) return null;
    const updated = await lmsService.updateStudentProfile(currentUser.uid, {
      fullName: fullName.trim(),
      email: email.trim(),
      mobileNumber: addressDetails.mobileNumber,
      alternativeMobileNumber: addressDetails.alternativeMobileNumber,
      homeAddress: addressDetails.homeAddress,
      flatNumber: addressDetails.flatNumber,
      houseNumber: addressDetails.flatNumber,
      streetAddress: addressDetails.streetAddress,
      pincode: addressDetails.pincode,
      state: addressDetails.state,
      city: city.trim() || undefined,
      dob: dob || undefined,
      educationLevel,
      degreeOrClass: degreeOrClass.trim(),
      qualification: degreeOrClass.trim(),
      institution: institution.trim() || 'Independent Learner',
      isMinor,
      parentName: parentName.trim() || undefined,
      parentMobile: parentMobile.trim() || undefined,
    });
    await refreshUserProfile().catch(() => {});
    return updated;
  };

  const finalizeCourseEnrollment = async (
    paymentStatus: CourseEnrollment['paymentStatus'],
    feeAmount: number
  ) => {
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
        mobileNumber: addressDetails.mobileNumber,
        alternativeMobileNumber: addressDetails.alternativeMobileNumber,
        homeAddress: addressDetails.homeAddress,
        flatNumber: addressDetails.flatNumber,
        streetAddress: addressDetails.streetAddress,
        pincode: addressDetails.pincode,
        state: addressDetails.state,
        educationLevel,
        degreeOrClass: degreeOrClass.trim(),
        enrolledCourseIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

    const { enrollment } = await lmsService.enrollStudentInCourse(
      course,
      {
        uid: currentUser.uid,
        fullName: activeProfile.fullName,
        email: activeProfile.email,
        registrationNumber: activeProfile.registrationNumber,
        addressDetails,
      },
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

  const handleConfirmRazorpayCheckout = async () => {
    setErrorMsg('');
    if (!currentUser) {
      onClose();
      navigate('/login/student');
      return;
    }

    setProcessing(true);
    try {
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
          purpose: `90%-Off OpenFrame Grant Enrollment: ${course.title}`,
          notes: {
            studentName: fullName.trim(),
            courseTitle: course.title,
            marketBenchmarkPrice: String(marketPriceInr),
            discountPercent: '90',
            pincode: addressDetails.pincode,
            state: addressDetails.state,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.ok) {
        if (orderRes.status === 503 || orderData.configured === false) {
          setGatewayUnavailable(true);
          setErrorMsg(
            'Online Razorpay checkout keys are not active on this preview server. You may complete Provisional 90%-Off Grant Enrollment (Pay-Later / Offline Challan) below to unlock your modules immediately.'
          );
          return;
        }
        throw new Error(orderData.error || 'Unable to initiate payment checkout.');
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
          description: `${course.title} (90% Grant Fee)`,
          order_id: orderData.order.id,
          prefill: {
            name: fullName.trim(),
            email: email.trim(),
            contact: addressDetails.mobileNumber,
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
                marketBenchmarkPrice: marketPriceInr,
                discountPercent: 90,
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

  const handleProvisionalGrantEnrollment = async () => {
    setErrorMsg('');
    setProcessing(true);
    try {
      await finalizeCourseEnrollment('Pending', priceInr);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save provisional enrollment.');
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
              90% OpenFrame Grant · Verified Course Checkout
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
              <span className="line-through text-slate-400 tabular-nums">{formatInr(marketPriceInr)}</span>
              <span className="font-bold text-[#123D32] tabular-nums">{formatInr(priceInr)}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                90% Off
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
                    Status: {alreadyEnrolled.status} · Payment: {alreadyEnrolled.paymentStatus} · Fee:{' '}
                    <span className="font-semibold tabular-nums">{formatInr(alreadyEnrolled.feeAmount || priceInr)}</span> · Enrolled on{' '}
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
          ) : !currentUser ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-[#14213D] shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Sign in to enroll &amp; track your verified certificate
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Verified authentication is required to save your 7-field certificate address details, enroll at the 90%-off grant fee of{' '}
                    <strong className="text-[#123D32] tabular-nums">{formatInr(priceInr)}</strong> (Market Value{' '}
                    <span className="line-through tabular-nums">{formatInr(marketPriceInr)}</span>), and issue your QR-verified certificate.
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 cursor-pointer"
                >
                  Sign In / Register Student Account <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700 rounded-xl cursor-pointer"
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
                    <p className="font-semibold text-[#18221F]">Verified Learner &amp; Certificate Address Pre-Filled</p>
                    <p>
                      {fullName} · {email} · {mobileNumber} (Alt: {alternativeMobileNumber})
                    </p>
                    <p>
                      Flat {flatNumber}, {homeAddress}, {streetAddress}, {stateName} — {pincode}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Academic Identity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#18221F]">
                  1. Learner &amp; Academic Details
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Education Category (LKG–PhD &amp; Skills) *</label>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Class / Board / Degree *</label>
                    <select
                      value={programmeOptions.includes(degreeOrClass) ? degreeOrClass : ''}
                      onChange={(e) => setDegreeOrClass(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    >
                      <option value="">Select class / degree / programme</option>
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
                        placeholder="e.g. LKG, Class 10 SSLC, 2nd PUC, BCA, MBA"
                        className="w-full mt-2 px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">School / College / Board (Optional)</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Karnataka SSLC, CBSE, VTU, Self-Paced"
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
                </div>
              </div>

              {/* Mandatory 7-Field Certificate Issuance Address & Contact Verification */}
              <div className="bg-white border border-[#123D32]/25 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#123D32] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#18221F]">
                      2. Mandatory Certificate Issuance &amp; Dispatch Details
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      All 7 fields below are strictly required to verify your learner record and issue your official OpenFrame Certificate.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address *</label>
                    <input
                      type="text"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      placeholder="House / Building Name, Apartment / Residential Complex"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Flat Number *</label>
                    <input
                      type="text"
                      value={flatNumber}
                      onChange={(e) => setFlatNumber(e.target.value)}
                      placeholder="e.g. Flat 304 / House #12"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 4th Cross, MG Road, Indiranagar"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pin Code (6 Digits) *</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 560001"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">State / Union Territory *</label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      required
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Primary 10-digit mobile"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alternative Mobile Number (10 Digits) *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={alternativeMobileNumber}
                      onChange={(e) => setAlternativeMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Alternate / Parent 10-digit mobile"
                      required
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town / Village (Optional)</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru, Mysuru, Mangaluru, Hubballi"
                      className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
                    />
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
                        maxLength={10}
                        value={parentMobile}
                        onChange={(e) => setParentMobile(e.target.value.replace(/\D/g, ''))}
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
                    I confirm all address and mobile details are accurate for official OpenFrame Certificate verification and dispatch (DPDP Act 2023 compliant).
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
                  {addressCheck.valid ? 'All 7 certificate address fields verified' : 'Complete all 7 required address & mobile fields'}
                </span>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Review Fee &amp; Confirm <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : step === 'confirm' ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-heading text-lg font-bold text-[#18221F]">
                  Confirm 90%-Off Grant Enrollment &amp; Certificate Details
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
                    <span className="text-slate-600">Certificate Address</span>
                    <span className="font-medium text-[#18221F] text-right max-w-xs">
                      Flat {addressDetails.flatNumber}, {addressDetails.homeAddress}, {addressDetails.streetAddress}, {addressDetails.state} — {addressDetails.pincode}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Primary / Alternate Mobile</span>
                    <span className="font-medium text-[#18221F] text-right tabular-nums">
                      {addressDetails.mobileNumber} · {addressDetails.alternativeMobileNumber}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-slate-600">Market Benchmark Value</span>
                    <span className="text-slate-400 line-through tabular-nums">{formatInr(marketPriceInr)}</span>
                  </div>
                  <div className="py-2.5 flex justify-between gap-4">
                    <span className="text-emerald-700 font-semibold">OpenFrame Education Grant (90% Off)</span>
                    <span className="text-emerald-700 font-semibold tabular-nums">-{formatInr(pricing.savingsInr)}</span>
                  </div>
                  <div className="py-3 flex justify-between gap-4">
                    <span className="font-bold text-[#18221F]">Payable Certification Fee</span>
                    <span className="font-extrabold text-xl text-[#123D32] tabular-nums">
                      {formatInr(priceInr)}
                    </span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    disabled={processing}
                    className="px-4 py-2.5 border border-slate-300 bg-white text-sm font-medium text-slate-700 rounded-xl cursor-pointer"
                  >
                    Edit Details
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmRazorpayCheckout}
                      disabled={processing}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#123D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0D2E25] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      {processing ? 'Processing...' : `Pay ${formatInr(priceInr)} via Razorpay`}
                    </button>
                    {gatewayUnavailable && (
                      <button
                        type="button"
                        onClick={handleProvisionalGrantEnrollment}
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Provisional Enrollment ({formatInr(priceInr)} Pay-Later Challan)</span>
                      </button>
                    )}
                  </div>
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
                    {course.title} is now active in your Learning Workspace ({formatInr(priceInr)} · 90% OpenFrame Grant). Complete your modules and pass the Verification Test (&ge;70%) to download your official QR-verified certificate.
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Start Modules &amp; Verification Test <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/student/dashboard');
                  }}
                  className="px-5 py-3 border border-slate-300 bg-white text-sm font-semibold text-[#18221F] rounded-xl cursor-pointer"
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
