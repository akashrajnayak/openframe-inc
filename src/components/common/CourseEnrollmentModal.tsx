import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  BookOpen,
  AlertCircle,
  MapPin,
  CreditCard,
  ExternalLink,
  RefreshCw,
  KeyRound,
  Loader2,
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
  compute90PercentCoursePricing,
  formatInr,
  validateCertificateAddressDetails,
  type CertificateAddressDetails,
} from '../../utils/pricingEngine';
import {
  fetchLiveRazorpayConfig,
  launchLiveRazorpayPayment,
  createRazorpayPaymentLink,
  checkRazorpayPaymentLinkStatus,
  isRunningInEmbeddedIframe,
  type LiveRazorpayConfig,
  type HostedRazorpayPaymentLink,
} from '../../services/razorpayCheckoutService';
import { GoogleSignInButton } from './GoogleSignInButton';
import { RazorpayKeyPromptModal } from './RazorpayKeyPromptModal';
import { standaloneMockService } from '../../services/standaloneMockService';

interface CourseEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: MarketplaceCourse | null;
  onEnrolled?: (enrollment: CourseEnrollment) => void;
  skipAutoRedirect?: boolean;
}

interface VerifiedPaymentReceipt {
  orderId: string;
  paymentId: string;
  amountInr: number;
  verifiedAt: string;
}

export const CourseEnrollmentModal: React.FC<CourseEnrollmentModalProps> = ({
  isOpen,
  onClose,
  course,
  onEnrolled,
}) => {
  const { currentUser, studentProfile, lmsUser, isSuperAdmin, refreshUserProfile } = useAuth();
  const { navigate } = useRouter();

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<CourseEnrollment | null>(null);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [continueStandalone, setContinueStandalone] = useState(false);
  const [step, setStep] = useState<'details' | 'success'>('details');

  // Razorpay live gateway state
  const [razorpayConfig, setRazorpayConfig] = useState<LiveRazorpayConfig | null>(null);
  const [loadingGateway, setLoadingGateway] = useState(false);
  const [hostedLink, setHostedLink] = useState<HostedRazorpayPaymentLink | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);
  const [keySetupOpen, setKeySetupOpen] = useState(false);
  const [verifiedReceipt, setVerifiedReceipt] = useState<VerifiedPaymentReceipt | null>(null);
  const pollTimerRef = useRef<number | null>(null);

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
  const embeddedIframe = useMemo(() => isRunningInEmbeddedIframe(), []);

  const pricing = useMemo(() => {
    if (!course) {
      return compute90PercentCoursePricing({ category: 'General', title: 'Course' });
    }
    return compute90PercentCoursePricing({
      id: course.id,
      title: course.title,
      category: course.category,
      categoryGroup: course.categoryGroup,
      level: course.level,
      educationLevels: course.educationLevels,
      rawPrice: course.price,
      pricingTier: course.pricingTier,
    });
  }, [course]);

  const loadGatewayConfig = async () => {
    setLoadingGateway(true);
    try {
      const cfg = await fetchLiveRazorpayConfig();
      setRazorpayConfig(cfg);
    } finally {
      setLoadingGateway(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !course) return;
    setStep('details');
    setErrorMsg('');
    setCompletedEnrollment(null);
    setVerifiedReceipt(null);
    setAlreadyEnrolled(null);
    setShowAddressFields(false);
    setContinueStandalone(false);
    setHostedLink(null);

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

    loadGatewayConfig();

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

  // Clean up hosted link polling when modal closes or step advances
  useEffect(() => {
    if (!isOpen || !hostedLink || step === 'success') {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const poll = async () => {
      if (cancelled) return;
      try {
        const status = await checkRazorpayPaymentLinkStatus(hostedLink.paymentLinkId);
        if (cancelled) return;
        if (status.paid) {
          if (pollTimerRef.current) {
            window.clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          await finalizeVerifiedEnrollment({
            orderId: status.orderId || hostedLink.paymentLinkId,
            paymentId: status.paymentId || `pay_${hostedLink.paymentLinkId.replace(/^plink_/, '')}`,
            amountInr: status.amountPaidInr || hostedLink.amountInr || pricing.finalPriceInr,
            verifiedAt: status.verifiedAt || new Date().toISOString(),
          });
        }
      } catch {
        // Keep polling silently until learner completes payment
      }
    };

    pollTimerRef.current = window.setInterval(poll, 3500);
    return () => {
      cancelled = true;
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isOpen, hostedLink, step]);

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

  const validateBeforePayment = (): boolean => {
    setErrorMsg('');
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address before proceeding to Razorpay checkout.');
      return false;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm the Razorpay checkout and DPDP learner policy checkbox to continue.');
      return false;
    }
    if (!razorpayConfig?.configured) {
      setErrorMsg(
        razorpayConfig?.note ||
          'Razorpay payment gateway is currently being configured by the administrator. Please try again shortly.'
      );
      return false;
    }
    return true;
  };

  const finalizeVerifiedEnrollment = async (receipt: VerifiedPaymentReceipt) => {
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
      'Paid',
      receipt.amountInr,
      {
        razorpayOrderId: receipt.orderId,
        razorpayPaymentId: receipt.paymentId,
        paymentGateway: 'Razorpay',
        verifiedAt: receipt.verifiedAt,
      }
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

    setVerifiedReceipt(receipt);
    setCompletedEnrollment(enrollment);
    setHostedLink(null);
    setStep('success');
    if (onEnrolled) onEnrolled(enrollment);
  };

  const handleLaunchPopupCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateBeforePayment()) return;

    setProcessing(true);
    setErrorMsg('');
    try {
      const verified = await launchLiveRazorpayPayment({
        amountInr: pricing.finalPriceInr,
        courseId: course.id,
        courseTitle: course.title,
        userId: activeLearnerUid,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: addressDetails.mobileNumber,
        purpose: `Course Enrollment: ${course.title}`,
        description: `${course.title} (90% OpenFrame Grant)`,
        notes: {
          courseId: course.id,
          courseTitle: course.title.slice(0, 120),
          studentEmail: email.trim().slice(0, 120),
          educationLevel,
        },
      });

      await finalizeVerifiedEnrollment({
        orderId: verified.orderId,
        paymentId: verified.paymentId,
        amountInr: pricing.finalPriceInr,
        verifiedAt: verified.verifiedAt,
      });
    } catch (err: any) {
      const code = err?.code;
      if (code === 'PAYMENT_CANCELLED') {
        setErrorMsg('Razorpay checkout window was closed before completing payment. You can retry or use the Hosted Razorpay Page.');
      } else {
        setErrorMsg(err?.message || 'Unable to complete Razorpay checkout. Try the Razorpay Hosted Payment Page option below.');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateHostedPaymentLink = async () => {
    if (!validateBeforePayment()) return;

    setCreatingLink(true);
    setErrorMsg('');
    try {
      const link = await createRazorpayPaymentLink({
        amountInr: pricing.finalPriceInr,
        courseId: course.id,
        courseTitle: course.title,
        userId: activeLearnerUid,
        customerName: fullName.trim(),
        customerEmail: email.trim(),
        customerPhone: addressDetails.mobileNumber,
        purpose: `Course Enrollment: ${course.title}`,
        description: `${course.title} (90% OpenFrame Grant)`,
        notes: {
          courseId: course.id,
          courseTitle: course.title.slice(0, 120),
          studentEmail: email.trim().slice(0, 120),
          educationLevel,
        },
      });
      setHostedLink(link);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to generate Razorpay Hosted Payment Link right now.');
    } finally {
      setCreatingLink(false);
    }
  };

  const handleVerifyHostedLinkNow = async () => {
    if (!hostedLink) return;
    setCheckingLinkStatus(true);
    setErrorMsg('');
    try {
      const status = await checkRazorpayPaymentLinkStatus(hostedLink.paymentLinkId);
      if (status.paid) {
        await finalizeVerifiedEnrollment({
          orderId: status.orderId || hostedLink.paymentLinkId,
          paymentId: status.paymentId || `pay_${hostedLink.paymentLinkId.replace(/^plink_/, '')}`,
          amountInr: status.amountPaidInr || hostedLink.amountInr || pricing.finalPriceInr,
          verifiedAt: status.verifiedAt || new Date().toISOString(),
        });
      } else {
        setErrorMsg(`Payment status is currently "${status.status}". Complete payment on the Razorpay page and click Verify again.`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to check payment link status. Please try again.');
    } finally {
      setCheckingLinkStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14213D]/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FAF7F2] border border-slate-200 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#123D32]">
              90% OpenFrame Grant · Verified Razorpay Checkout
            </p>
            <h2 className="font-editorial text-2xl font-bold text-[#18221F] mt-0.5 line-clamp-1">
              {course.title}
            </h2>
            <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5 tabular-nums">
              <span>{course.category}</span>
              <span>·</span>
              <span>{course.level}</span>
              <span>·</span>
              <span>{course.duration}</span>
              <span>·</span>
              <span className="line-through text-slate-400">
                {formatInr(pricing.marketBenchmarkPriceInr)}
              </span>
              <span className="font-extrabold text-[#123D32] text-sm">
                {formatInr(pricing.finalPriceInr)}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {pricing.discountPercent}% Off
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
          {/* 2-Step Checkout & Admin Certification Flow Indicator */}
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
                <div className="font-bold truncate">Step 1: Razorpay Checkout ({formatInr(pricing.finalPriceInr)})</div>
                <div className="text-[10px] opacity-85 truncate">UPI, Cards, NetBanking · Instant Unlock</div>
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
                <div className="font-bold truncate">Step 2: Complete &amp; Admin Cert Approval</div>
                <div className="text-[10px] opacity-85 truncate">Quiz ≥70% → Official QR Certificate</div>
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
                    Enrolled on {new Date(alreadyEnrolled.enrolledAt).toLocaleDateString()}. Complete your lessons &amp; Verification Quiz (≥70%), then submit for Admin Course Approval to unlock your official QR certificate.
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
                    Sign In for Verified Payment Receipt &amp; Cloud Progress
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Sign in with Google or email so your Razorpay receipt, completed lessons, quiz scores, and certificate sync securely across devices.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <GoogleSignInButton
                  role="student"
                  label="Continue with Google to Pay & Enroll"
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
                    Continue as Guest Checkout
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleLaunchPopupCheckout} className="space-y-4">
              {/* Fee Breakdown & Live Razorpay Gateway Status */}
              <div className="bg-white border border-[#123D32]/25 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
                    {pricing.bandLabel} · One-Time Course Fee
                  </p>
                  <div className="flex items-baseline gap-2.5 mt-1 tabular-nums">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatInr(pricing.finalPriceInr)}
                    </span>
                    <span className="text-sm text-slate-400 line-through">
                      {formatInr(pricing.marketBenchmarkPriceInr)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      Save {formatInr(pricing.savingsInr)} ({pricing.discountPercent}% Off)
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {loadingGateway ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checking Razorpay...
                    </span>
                  ) : razorpayConfig?.configured ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Razorpay Live Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Gateway Setup Required
                    </span>
                  )}
                </div>
              </div>

              {/* Core Academic Identity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#18221F]">
                  1. Learner Details for Receipt &amp; Certificate
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
                      placeholder="10-digit mobile for UPI / receipt"
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
                      2. Certificate Dispatch Address ({addressCheck.valid ? 'Saved & Verified' : 'Optional now — can fill before certificate download'})
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
                    I agree to complete secure Razorpay checkout ({formatInr(pricing.finalPriceInr)}) for instant course access and OpenFrame certification tracking under the DPDP Act 2023.
                  </span>
                </label>
              </div>

              {/* Active Hosted Payment Link Verification Card */}
              {hostedLink && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-blue-950">
                        Official Razorpay Payment Page Ready ({formatInr(hostedLink.amountInr)})
                      </div>
                      <p className="text-[11px] text-blue-800 mt-0.5">
                        Click below to open Razorpay in a new tab (UPI, Cards, NetBanking). This window automatically detects your verified payment and unlocks the course.
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono text-[10px] shrink-0">
                      {hostedLink.paymentLinkId}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={hostedLink.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Razorpay Page &amp; Pay {formatInr(hostedLink.amountInr)}</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleVerifyHostedLinkNow}
                      disabled={checkingLinkStatus}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-blue-300 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingLinkStatus ? 'animate-spin' : ''}`} />
                      <span>{checkingLinkStatus ? 'Verifying...' : "I've Paid — Verify Now"}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Gateway Unconfigured Warning + Super Admin Quick Setup */}
              {!loadingGateway && razorpayConfig && !razorpayConfig.configured && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      {razorpayConfig.note ||
                        'Razorpay payment gateway is currently being configured by the administrator. Please try again shortly.'}
                    </span>
                  </div>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => setKeySetupOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Configure Razorpay Keys Now (Super Admin)</span>
                    </button>
                  )}
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Razorpay Checkout Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#123D32]" />
                    <span>Secured by Razorpay · UPI, Cards, NetBanking · HMAC Verified</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="button"
                    onClick={handleCreateHostedPaymentLink}
                    disabled={creatingLink || processing || !razorpayConfig?.configured}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm whitespace-nowrap ${
                      embeddedIframe
                        ? 'bg-[#2563EB] hover:bg-blue-700 text-white'
                        : 'bg-[#2563EB] hover:bg-blue-700 text-white'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      {creatingLink
                        ? 'Creating Payment Page...'
                        : `Pay ${formatInr(pricing.finalPriceInr)} on Razorpay Page`}
                    </span>
                  </button>

                  <button
                    type="submit"
                    disabled={processing || creatingLink || !razorpayConfig?.configured}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#123D32] hover:bg-[#0D2E25] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-sm whitespace-nowrap"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {processing
                        ? 'Opening Razorpay...'
                        : `Razorpay Popup Checkout (${formatInr(pricing.finalPriceInr)})`}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-7 h-7 text-[#123D32] shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h3 className="font-editorial text-2xl font-bold text-[#18221F]">
                    Payment Verified — Start Learning!
                  </h3>
                  <p className="text-sm text-slate-600">
                    <strong>{course.title}</strong> is now unlocked in your Learning Workspace. Complete your lessons and Verification Test (&ge;70%), then submit for Admin Course Approval to receive your official QR-verified certificate.
                  </p>
                  <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-mono space-y-1">
                    {verifiedReceipt && (
                      <>
                        <div>Amount Paid: {formatInr(verifiedReceipt.amountInr)} (Razorpay Verified)</div>
                        <div>Payment ID: {verifiedReceipt.paymentId}</div>
                        <div>Order Ref: {verifiedReceipt.orderId}</div>
                      </>
                    )}
                    {completedEnrollment?.registrationNumber && (
                      <div>Learner Reg No: {completedEnrollment.registrationNumber}</div>
                    )}
                  </div>
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

      {/* Super Admin Inline Razorpay Key Setup Modal */}
      {isSuperAdmin && (
        <RazorpayKeyPromptModal
          isOpen={keySetupOpen}
          onClose={() => setKeySetupOpen(false)}
          onSaved={() => {
            setKeySetupOpen(false);
            loadGatewayConfig();
          }}
        />
      )}
    </div>
  );
};
