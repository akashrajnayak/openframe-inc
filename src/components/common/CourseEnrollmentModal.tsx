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
  KeyRound,
  ExternalLink,
  RefreshCw,
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
import { db } from '../../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import {
  ALL_INDIAN_STATES_AND_UTS,
  compute90PercentCoursePricing,
  formatInr,
  validateCertificateAddressDetails,
  type CertificateAddressDetails,
} from '../../utils/pricingEngine';
import { GoogleSignInButton } from './GoogleSignInButton';
import { standaloneMockService } from '../../services/standaloneMockService';
import {
  fetchLiveRazorpayConfig,
  launchLiveRazorpayPayment,
  createRazorpayPaymentLink,
  checkRazorpayPaymentLinkStatus,
  isRunningInEmbeddedIframe,
  type LiveRazorpayConfig,
  type HostedRazorpayPaymentLink,
} from '../../services/razorpayCheckoutService';
import { RazorpayKeyPromptModal } from './RazorpayKeyPromptModal';

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
  skipAutoRedirect = false,
}) => {
  const { currentUser, studentProfile, lmsUser, isSuperAdmin, refreshUserProfile } = useAuth();
  const { navigate } = useRouter();

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState<CourseEnrollment | null>(null);
  const [pendingEnrollment, setPendingEnrollment] = useState<CourseEnrollment | null>(null);
  const [showAddressFields, setShowAddressFields] = useState(false);
  const [continueStandalone, setContinueStandalone] = useState(false);
  const [step, setStep] = useState<'details' | 'confirm' | 'hosted_link' | 'success'>('details');
  const [razorpayConfig, setRazorpayConfig] = useState<LiveRazorpayConfig | null>(null);
  const [keyPromptOpen, setKeyPromptOpen] = useState(false);
  const [hostedLink, setHostedLink] = useState<HostedRazorpayPaymentLink | null>(null);
  const [checkingHostedStatus, setCheckingHostedStatus] = useState(false);
  const [creatingHostedLink, setCreatingHostedLink] = useState(false);
  const inEmbeddedIframe = useMemo(() => isRunningInEmbeddedIframe(), []);

  // Core learner details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationCategoryCode>('G');
  const [degreeOrClass, setDegreeOrClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [city, setCity] = useState('');

  // Optional at checkout / mandatory before certificate dispatch: 7-field Certificate Address
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

  const activeLearnerUid = currentUser?.uid || standaloneMockService.getActiveLearner().uid;

  useEffect(() => {
    if (!isOpen || !course) return;
    setStep('details');
    setErrorMsg('');
    setGatewayUnavailable(false);
    setHostedLink(null);
    setCheckingHostedStatus(false);
    setCreatingHostedLink(false);
    setCompletedEnrollment(null);
    setAlreadyEnrolled(null);
    setPendingEnrollment(null);
    setShowAddressFields(false);
    setContinueStandalone(false);

    fetchLiveRazorpayConfig()
      .then((cfg) => {
        setRazorpayConfig(cfg);
        if (!cfg.configured || !cfg.keyId) {
          setGatewayUnavailable(true);
        }
      })
      .catch(() => {});

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
          (e) => e.courseId.toLowerCase() === course.id.toLowerCase() && e.status !== 'Suspended'
        );
        if (match) {
          if (lmsService.isVerifiedPaidEnrollment(match)) {
            setAlreadyEnrolled(match);
          } else {
            setPendingEnrollment(match);
          }
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

  // Automatic background polling while Hosted Razorpay Payment Link is open
  useEffect(() => {
    if (!isOpen || step !== 'hosted_link' || !hostedLink?.paymentLinkId || !course) return;
    let cancelled = false;
    const interval = window.setInterval(async () => {
      if (cancelled) return;
      try {
        const status = await checkRazorpayPaymentLinkStatus(hostedLink.paymentLinkId);
        if (!cancelled && status.paid && status.paymentId) {
          window.clearInterval(interval);
          await recordVerifiedPaymentAndFinalize({
            orderId: status.orderId,
            paymentId: status.paymentId,
            verifiedAt: status.verifiedAt || new Date().toISOString(),
          });
        }
      } catch {
        // Silent retry on next poll tick
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step, hostedLink?.paymentLinkId, course?.id]);

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
  // Respect exact positive course/department price (e.g., ₹50, ₹100, ₹300, ₹400, ₹500, ₹1000, ₹2500)
  const priceInr = course.price > 0 ? Math.round(course.price) : pricing.finalPriceInr;
  const marketPriceInr = Math.max(pricing.marketBenchmarkPrice, priceInr * 10);

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
    if (!consentAccepted) {
      setErrorMsg('Please confirm the learner data & DPDP consent policy to continue.');
      return;
    }
    // Launch Razorpay checkout directly once core details are ready
    void handleConfirmRazorpayCheckout();
  };

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

  const finalizeCourseEnrollment = async (
    paymentStatus: CourseEnrollment['paymentStatus'],
    feeAmount: number,
    paymentMetadata?: {
      razorpayOrderId?: string;
      razorpayPaymentId?: string;
      paymentGateway?: string;
      verifiedAt?: string;
    }
  ) => {
    const effectiveUid = activeLearnerUid;

    // Persist user profile locally in browser storage
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

    // Cache the course immediately so /learn/:courseId ALWAYS finds it instantaneously after payment
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
      paymentStatus,
      feeAmount,
      paymentMetadata
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
  };

  const recordVerifiedPaymentAndFinalize = async (verified: {
    orderId: string;
    paymentId: string;
    verifiedAt: string;
  }) => {
    // Best-effort mirror to Firestore when signed in
    if (currentUser?.uid) {
      const payId = `rzp_${verified.paymentId}`;
      await setDoc(doc(db, 'payments', payId), {
        id: payId,
        userId: currentUser.uid,
        studentId: currentUser.uid,
        institutionId: lmsUser?.institutionId || 'OPENFRAME_MARKETPLACE',
        courseId: course.id,
        courseTitle: course.title,
        amount: priceInr,
        amountInr: priceInr,
        marketBenchmarkPrice: marketPriceInr,
        discountPercent: 90,
        gateway: 'Razorpay',
        status: 'Paid',
        razorpayOrderId: verified.orderId,
        razorpayPaymentId: verified.paymentId,
        verifiedServerSide: true,
        createdAt: verified.verifiedAt,
      }).catch(() => {});
    }

    await finalizeCourseEnrollment('Paid', priceInr, {
      razorpayOrderId: verified.orderId,
      razorpayPaymentId: verified.paymentId,
      paymentGateway: 'Razorpay',
      verifiedAt: verified.verifiedAt,
    });
  };

  const handleLaunchHostedRazorpayLink = async () => {
    setErrorMsg('');
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Please enter your full name and email address first.');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('Please confirm the learner data & DPDP consent policy to continue.');
      return;
    }
    setGatewayUnavailable(false);
    setCreatingHostedLink(true);
    try {
      const cfg = await fetchLiveRazorpayConfig();
      setRazorpayConfig(cfg);
      if (!cfg.configured || !cfg.keyId) {
        setGatewayUnavailable(true);
        setErrorMsg(
          isSuperAdmin
            ? 'Razorpay API keys are not configured yet. Insert your Razorpay Key ID and Key Secret in the prompt to enable payment checkout.'
            : 'Razorpay payment gateway is currently being configured by the administrator. Please try again shortly.'
        );
        if (isSuperAdmin) setKeyPromptOpen(true);
        return;
      }

      const link = await createRazorpayPaymentLink({
        amountInr: priceInr,
        courseId: course.id,
        courseTitle: course.title,
        institutionId: lmsUser?.institutionId || 'OPENFRAME_MARKETPLACE',
        purpose: `90%-Off OpenFrame Grant Enrollment: ${course.title}`,
        description: `${course.title} (${course.id})`,
        customerName: fullName.trim() || currentUser?.displayName || 'OpenFrame Learner',
        customerEmail: email.trim() || currentUser?.email || undefined,
        customerPhone: addressDetails.mobileNumber || undefined,
        userId: activeLearnerUid,
        notes: {
          studentName: (fullName.trim() || 'OpenFrame Learner').slice(0, 120),
          courseTitle: course.title.slice(0, 120),
          marketBenchmarkPrice: String(marketPriceInr),
          discountPercent: '90',
        },
      });
      setHostedLink(link);
      setStep('hosted_link');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to generate Official Razorpay Hosted Payment Page.');
      if (err?.code === 'RAZORPAY_NOT_CONFIGURED' || err?.code === 'RAZORPAY_AUTH_FAILED') {
        setGatewayUnavailable(true);
        if (isSuperAdmin) setKeyPromptOpen(true);
      }
    } finally {
      setCreatingHostedLink(false);
    }
  };

  const handleVerifyHostedLinkPayment = async () => {
    if (!hostedLink?.paymentLinkId) return;
    setErrorMsg('');
    setCheckingHostedStatus(true);
    try {
      const status = await checkRazorpayPaymentLinkStatus(hostedLink.paymentLinkId);
      if (status.paid && status.paymentId) {
        await recordVerifiedPaymentAndFinalize({
          orderId: status.orderId,
          paymentId: status.paymentId,
          verifiedAt: status.verifiedAt || new Date().toISOString(),
        });
      } else {
        setErrorMsg(
          `Payment status on Razorpay is currently "${status.status}". Please finish paying on the Razorpay page and click Verify again.`
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to check payment status on Razorpay right now.');
    } finally {
      setCheckingHostedStatus(false);
    }
  };

  const handleConfirmRazorpayCheckout = async () => {
    setErrorMsg('');
    setGatewayUnavailable(false);
    setProcessing(true);
    try {
      const cfg = await fetchLiveRazorpayConfig();
      setRazorpayConfig(cfg);

      if (!cfg.configured || !cfg.keyId) {
        setGatewayUnavailable(true);
        setErrorMsg(
          isSuperAdmin
            ? 'Razorpay API keys are not configured yet. Insert your Razorpay Key ID and Key Secret in the prompt to enable live payment checkout.'
            : 'Razorpay payment gateway is currently being configured by the administrator. Please try again shortly.'
        );
        if (isSuperAdmin) {
          setKeyPromptOpen(true);
        }
        return;
      }

      const verified = await launchLiveRazorpayPayment({
        amountInr: priceInr,
        courseId: course.id,
        courseTitle: course.title,
        institutionId: lmsUser?.institutionId || 'OPENFRAME_MARKETPLACE',
        purpose: `90%-Off OpenFrame Grant Enrollment: ${course.title}`,
        description: `${course.title} (${course.id})`,
        customerName: fullName.trim() || currentUser?.displayName || 'OpenFrame Learner',
        customerEmail: email.trim() || currentUser?.email || undefined,
        customerPhone: addressDetails.mobileNumber || undefined,
        userId: activeLearnerUid,
        notes: {
          studentName: (fullName.trim() || 'OpenFrame Learner').slice(0, 120),
          courseTitle: course.title.slice(0, 120),
          marketBenchmarkPrice: String(marketPriceInr),
          discountPercent: '90',
          ...(addressDetails.pincode ? { pincode: addressDetails.pincode } : {}),
          ...(addressDetails.state ? { state: addressDetails.state } : {}),
        },
      });

      await recordVerifiedPaymentAndFinalize({
        orderId: verified.orderId,
        paymentId: verified.paymentId,
        verifiedAt: verified.verifiedAt,
      });
    } catch (err: any) {
      if (err?.code === 'PAYMENT_CANCELLED') {
        setErrorMsg(
          'Razorpay popup was closed before payment completed. You can retry the popup or use "Pay on Razorpay Hosted Page" below.'
        );
      } else {
        setErrorMsg(
          `${err?.message || 'Unable to launch Razorpay popup checkout.'} Tip: Try "Pay on Razorpay Hosted Page" below for guaranteed UPI, Card & NetBanking support.`
        );
        if (err?.code === 'RAZORPAY_NOT_CONFIGURED' || err?.code === 'RAZORPAY_AUTH_FAILED') {
          setGatewayUnavailable(true);
          if (isSuperAdmin) {
            setKeyPromptOpen(true);
          }
        }
      }
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
          {/* 2-Step Payment-First Flow Indicator */}
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
                <div className="font-bold truncate">Step 1: Register &amp; Pay {formatInr(priceInr)}</div>
                <div className="text-[10px] opacity-85 truncate">Razorpay Payment First</div>
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
                <div className="font-bold truncate">Step 2: Open Learning Workspace</div>
                <div className="text-[10px] opacity-85 truncate">Unlocks After Payment · My Learning</div>
              </div>
            </div>
          </div>

          {/* Super Admin Razorpay API Key Quick Prompt Strip */}
          {isSuperAdmin && (
            <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold truncate">
                  {razorpayConfig?.configured && razorpayConfig.keyId
                    ? `Razorpay Key Active: ${razorpayConfig.keyId}`
                    : 'Razorpay API Key Not Configured'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setKeyPromptOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Insert / Update Razorpay API Key</span>
              </button>
            </div>
          )}

          {checkingExisting && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-600">
              Verifying Razorpay payment &amp; registration status...
            </div>
          )}

          {alreadyEnrolled ? (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#123D32] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Payment Verified &amp; Registered — Learning Workspace Unlocked
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Paid Amount: <span className="font-bold text-[#123D32] tabular-nums">{formatInr(alreadyEnrolled.feeAmount || priceInr)}</span>
                    {(alreadyEnrolled as any).razorpayPaymentId ? ` · Razorpay ID: ${(alreadyEnrolled as any).razorpayPaymentId}` : ''} · Registered on{' '}
                    {new Date(alreadyEnrolled.enrolledAt).toLocaleDateString()}
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
                    Continue to Payment &amp; Instant Course Access
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Sign in to sync across devices, or proceed directly in standalone mode (saved locally in your browser) to pay{' '}
                    <strong className="text-[#123D32] tabular-nums">{formatInr(priceInr)}</strong> (Market Value{' '}
                    <span className="line-through tabular-nums">{formatInr(marketPriceInr)}</span>) and unlock your workspace immediately.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setContinueStandalone(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#123D32] hover:bg-[#0D2E25] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Continue Standalone &amp; Pay {formatInr(priceInr)} Now</span>
                </button>
                <GoogleSignInButton
                  role="student"
                  label="Or Continue with Google"
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
                    onClick={onClose}
                    className="px-4 py-2.5 border border-slate-300 bg-white text-xs sm:text-sm font-medium text-slate-700 rounded-xl cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          ) : step === 'details' ? (
            <form onSubmit={handleProceedConfirm} className="space-y-4">
              {pendingEnrollment && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-900 space-y-1">
                    <p className="font-bold">Payment Pending — Complete Razorpay Checkout to Unlock</p>
                    <p>
                      Your seat is reserved for <strong>{course.title}</strong>. Click{' '}
                      <strong>Pay {formatInr(priceInr)} via Razorpay</strong> below — once payment completes, your course workspace will open automatically.
                    </p>
                  </div>
                </div>
              )}

              {/* Fee & Instant Razorpay Summary Card */}
              <div className="bg-white border border-[#123D32]/25 rounded-2xl p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#123D32]">
                      Razorpay Instant Checkout · Auto-Unlocks Course
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Includes Modules, YouTube Lectures, Quiz, Practical Projects, Submission, Score &amp; QR-Verified Certificate
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <div className="text-xl font-extrabold text-[#123D32]">{formatInr(priceInr)}</div>
                    <div className="text-[11px] text-slate-500">
                      <span className="line-through mr-1">{formatInr(marketPriceInr)}</span>
                      <span className="font-bold text-emerald-700">90% Grant Off</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Academic Identity */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="font-heading text-base font-bold text-[#18221F]">
                  1. Learner Details for Razorpay Receipt &amp; Certificate
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
                      placeholder="10-digit mobile for Razorpay UPI/SMS"
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
                  <div>
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

              {/* Optional Collapsible 7-Field Certificate Address (can also be completed later before certificate download) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAddressFields((v) => !v)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#123D32] shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-[#18221F]">
                        2. Certificate Dispatch Address ({addressCheck.valid ? 'Saved & Verified' : 'Optional now — can fill before certificate download'})
                      </div>
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
                    I agree to complete secure Razorpay checkout ({formatInr(priceInr)}) for instant course access and OpenFrame certification tracking.
                  </span>
                </label>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                  {isSuperAdmin && gatewayUnavailable && (
                    <button
                      type="button"
                      onClick={() => setKeyPromptOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-bold rounded-lg cursor-pointer whitespace-nowrap"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Insert Razorpay API Key Now</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#123D32]" />
                  <span>Secured by Razorpay · UPI, Cards, NetBanking</span>
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLaunchHostedRazorpayLink}
                    disabled={processing || creatingHostedLink}
                    className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 cursor-pointer shadow-sm whitespace-nowrap ${
                      inEmbeddedIframe
                        ? 'bg-[#123D32] text-white hover:bg-[#0D2E25]'
                        : 'bg-[#2563EB] text-white hover:bg-blue-700'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>
                      {creatingHostedLink
                        ? 'Generating Razorpay Link...'
                        : `Pay ${formatInr(priceInr)} on Razorpay Page`}
                    </span>
                  </button>
                  <button
                    type="submit"
                    disabled={processing || creatingHostedLink}
                    className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap ${
                      inEmbeddedIframe
                        ? 'border border-[#123D32] bg-white text-[#123D32] hover:bg-emerald-50'
                        : 'bg-[#123D32] text-white hover:bg-[#0D2E25] shadow-sm'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>{processing ? 'Opening Razorpay Popup...' : 'Razorpay Popup Checkout'}</span>
                  </button>
                </div>
              </div>
            </form>
          ) : step === 'hosted_link' && hostedLink ? (
            <div className="bg-white border border-[#123D32]/30 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    <ShieldCheck className="w-4 h-4" />
                    Official Razorpay Hosted Payment Page ({hostedLink.mode.toUpperCase()})
                  </span>
                  <h3 className="font-heading text-lg font-bold text-[#18221F] mt-1">
                    Complete {formatInr(hostedLink.amountInr)} Payment on Razorpay
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Open Razorpay in a secure new tab to pay via UPI QR, Google Pay, PhonePe, Paytm, Cards, or NetBanking. Your course unlocks automatically once payment completes.
                  </p>
                </div>
                <div className="text-right shrink-0 tabular-nums">
                  <div className="text-xs text-slate-500">Payable</div>
                  <div className="text-2xl font-extrabold text-[#123D32]">{formatInr(hostedLink.amountInr)}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Razorpay Payment Link ID</span>
                  <span className="font-mono font-semibold text-slate-800">{hostedLink.paymentLinkId}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500">Official Razorpay URL</span>
                  <a
                    href={hostedLink.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-semibold text-[#2563EB] hover:underline truncate max-w-[260px]"
                  >
                    {hostedLink.shortUrl}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium pt-1">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                  <span>Auto-verifying payment status with Razorpay every 4 seconds...</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={hostedLink.shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#123D32] hover:bg-[#0D2E25] text-white text-sm font-bold rounded-xl transition-colors shadow-sm whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Official Razorpay Page ({formatInr(hostedLink.amountInr)})</span>
                </a>
                <button
                  type="button"
                  onClick={handleVerifyHostedLinkPayment}
                  disabled={checkingHostedStatus}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{checkingHostedStatus ? 'Checking Razorpay...' : "I've Paid — Verify & Unlock"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setErrorMsg('');
                  }}
                  className="px-4 py-3 border border-slate-300 bg-white text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>
              </div>
            </div>
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
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#123D32] text-white text-sm font-semibold rounded-xl hover:bg-[#0D2E25] transition-colors disabled:opacity-60 cursor-pointer whitespace-nowrap"
                    >
                      <CreditCard className="w-4 h-4" />
                      {processing ? 'Opening Razorpay...' : `Pay ${formatInr(priceInr)} via Razorpay`}
                    </button>
                    {isSuperAdmin && gatewayUnavailable && (
                      <button
                        type="button"
                        onClick={() => setKeyPromptOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Insert Razorpay API Key</span>
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
                <div className="space-y-1.5">
                  <h3 className="font-editorial text-2xl font-bold text-[#18221F]">
                    Razorpay Payment Verified &amp; Enrollment Confirmed
                  </h3>
                  <p className="text-sm text-slate-600">
                    <strong>{course.title}</strong> is now unlocked in your Learning Workspace ({formatInr(priceInr)} · 90% OpenFrame Grant).
                  </p>
                  {((completedEnrollment as any)?.razorpayPaymentId || (completedEnrollment as any)?.razorpayOrderId) && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-mono space-y-0.5">
                      {(completedEnrollment as any)?.razorpayPaymentId && (
                        <div>Razorpay Payment ID: {(completedEnrollment as any).razorpayPaymentId}</div>
                      )}
                      {(completedEnrollment as any)?.razorpayOrderId && (
                        <div>Razorpay Order ID: {(completedEnrollment as any).razorpayOrderId}</div>
                      )}
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
                    navigate(`/learn/${encodeURIComponent(course.id)}?paid=1`);
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

      {isSuperAdmin && (
        <RazorpayKeyPromptModal
          isOpen={keyPromptOpen}
          onClose={() => setKeyPromptOpen(false)}
          onSaved={async () => {
            const fresh = await fetchLiveRazorpayConfig();
            setRazorpayConfig(fresh);
            setGatewayUnavailable(!fresh.configured);
            setErrorMsg('');
            setKeyPromptOpen(false);
          }}
        />
      )}
    </div>
  );
};
