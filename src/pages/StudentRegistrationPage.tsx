import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin,
  Building,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Clock,
  Printer,
  Globe,
  Navigation,
  ChevronRight,
  ChevronLeft,
  KeyRound,
  Upload,
  Camera
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { storageService } from '../services/storageService';
import {
  db,
  stripUndefinedDeep,
  submitStudentRegistration,
  triggerAdminNotification,
  registerPortalAccountWithEmail,
  syncLmsUserProfile
} from '../services/firebase';
import { lmsService } from '../services/lmsService';
import { initialEducationCourses } from '../data/initialData';
import { UNIVERSAL_12_CATEGORIES, SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES } from '../utils/searchIntelligence';

const INDIAN_STATES = [
  'Karnataka',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Andhra Pradesh',
  'Kerala',
  'Delhi (NCT)',
  'Gujarat',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Haryana',
  'Punjab',
  'Bihar',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Goa',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Other State / UT'
];

const QUALIFICATION_LEVELS = [
  'Nursery / Kindergarten',
  'Primary School (Classes 1–5)',
  'Middle School (Classes 6–8)',
  'Secondary School (Classes 9–10)',
  'Higher Secondary (Classes 11–12 / PUC)',
  'Diploma / Polytechnic Student',
  'Undergraduate Degree (B.Tech / B.E / B.Sc / BCA / B.Com / B.A)',
  'Postgraduate Degree (M.Tech / M.Sc / MCA / MBA / M.A)',
  'Graduate / Fresher (Job Seeking)',
  'Working Professional',
  'Homemaker / Self-Paced Learner',
  'Entrepreneur / Small Business Owner'
];

export const StudentRegistrationPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();

  // Extract query course if present
  const getPreselectedCourse = (): string => {
    try {
      const search = currentPath.includes('?')
        ? currentPath.split('?')[1]
        : window.location.search.slice(1);
      const params = new URLSearchParams(search);
      const course = params.get('course');
      return course ? decodeURIComponent(course) : '';
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    emailAddress: '',
    dob: '',
    gender: '',
    profilePhotoUrl: '',
    country: 'India',
    state: 'Karnataka',
    district: '',
    city: '',
    houseNumber: '',
    streetAddress: '',
    pincode: '',
    schoolCollegeName: '',
    currentClassQualification: 'Higher Secondary (Classes 11–12 / PUC)',
    interestedCourse: '',
    preferredLanguage: 'English',
    preferredCategories: [] as string[],
    parentName: '',
    parentMobile: '',
    parentWhatsapp: '',
    parentEmail: '',
    guardianConsentAccepted: false,
    gpsConsentAccepted: false,
    gpsCoordinates: undefined as { lat: number; lng: number } | undefined,
    preferredLearningMode: 'Online Live Classes' as 'Online Live Classes' | 'Recorded Lessons' | 'Hybrid / Practical Labs',
    consentAccepted: false,
    createPortalAccount: true,
    portalPassword: '',
    portalConfirmPassword: '',
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [authStatusInfo, setAuthStatusInfo] = useState<{ emailVerificationAvailable: boolean; smsOtpConfigured: boolean; note: string } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEntry, setRegisteredEntry] = useState<{
    id: string;
    fullName: string;
    course: string;
    registeredAt: string;
    portalActivated?: boolean;
    verificationEmailSent?: boolean;
  } | null>(null);

  useEffect(() => {
    fetch('/api/auth/verification-status')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.ok) setAuthStatusInfo(data);
      })
      .catch(() => {});
  }, []);

  const isMinor = (() => {
    if (!formData.dob) return false;
    const dobDate = new Date(formData.dob);
    if (Number.isNaN(dobDate.getTime())) return false;
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const mDiff = today.getMonth() - dobDate.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dobDate.getDate())) age--;
    return age < 18;
  })();

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;
    setPhotoError('');
    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5 MB.');
      return;
    }
    setUploadingPhoto(true);
    try {
      const uploaded = await lmsService.uploadDeliverableFile(file, 'student-photos');
      setFormData((prev) => ({ ...prev, profilePhotoUrl: uploaded.url }));
    } catch {
      setPhotoError('Photo upload failed. You may enter an image URL or continue without a photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleTogglePrefCategory = (catName: string) => {
    setFormData((prev) => {
      const exists = prev.preferredCategories.includes(catName);
      return {
        ...prev,
        preferredCategories: exists
          ? prev.preferredCategories.filter((c) => c !== catName)
          : [...prev.preferredCategories, catName],
      };
    });
  };

  const handleGpsOptInChange = (checked: boolean) => {
    if (!checked) {
      setFormData((prev) => ({ ...prev, gpsConsentAccepted: false, gpsCoordinates: undefined }));
      setGpsStatus('');
      return;
    }
    setFormData((prev) => ({ ...prev, gpsConsentAccepted: true }));
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setGpsStatus('Requesting location permission...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData((prev) => ({
            ...prev,
            gpsCoordinates: {
              lat: Number(pos.coords.latitude.toFixed(5)),
              lng: Number(pos.coords.longitude.toFixed(5)),
            },
          }));
          setGpsStatus('Opt-in coordinates captured.');
        },
        () => {
          setGpsStatus('Location permission declined or unavailable; registration continues without GPS.');
        },
        { timeout: 6000 }
      );
    } else {
      setGpsStatus('Geolocation not supported on this browser.');
    }
  };

  useEffect(() => {
    const preselected = getPreselectedCourse();
    if (preselected) {
      setFormData(prev => ({
        ...prev,
        interestedCourse: preselected
      }));
    } else if (initialEducationCourses.length > 0) {
      setFormData(prev => ({
        ...prev,
        interestedCourse: prev.interestedCourse || initialEducationCourses[0].name
      }));
    }
  }, [currentPath]);

  const validateStep = (stepNum: number): boolean => {
    const errs: Record<string, string> = {};
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (stepNum === 1 || stepNum === 0) {
      if (!formData.fullName.trim() || formData.fullName.trim().length < 3) {
        errs.fullName = 'Please enter student full name (minimum 3 characters).';
      }
      if (!formData.dob) {
        errs.dob = 'Please select student date of birth.';
      }
    }

    if (stepNum === 2 || stepNum === 0) {
      if (!formData.mobileNumber.trim()) {
        errs.mobileNumber = 'Please enter student mobile number.';
      } else if (!phoneRegex.test(formData.mobileNumber.replace(/\s+/g, ''))) {
        errs.mobileNumber = 'Enter a valid 10-digit Indian mobile number.';
      }
      if (!formData.emailAddress.trim()) {
        errs.emailAddress = 'Please enter an active email address.';
      } else if (!emailRegex.test(formData.emailAddress.trim())) {
        errs.emailAddress = 'Please enter a valid email address.';
      }
    }

    if (stepNum === 3 || stepNum === 0) {
      if (!formData.city.trim()) {
        errs.city = 'Please specify city / town.';
      }
      if (!formData.district.trim()) {
        errs.district = 'Please specify district.';
      }
      if (formData.pincode && formData.country === 'India' && !/^\d{6}$/.test(formData.pincode.trim())) {
        errs.pincode = 'Enter a valid 6-digit Indian PIN code.';
      }
    }

    if (stepNum === 5 || stepNum === 0) {
      if (!formData.interestedCourse.trim()) {
        errs.interestedCourse = 'Please select an education course or programme.';
      }
    }

    if (stepNum === 6 || stepNum === 0) {
      if (formData.parentMobile && !phoneRegex.test(formData.parentMobile.replace(/\s+/g, ''))) {
        errs.parentMobile = 'Enter a valid 10-digit Indian mobile number for parent/guardian.';
      }
      if (isMinor) {
        if (!formData.parentName.trim()) {
          errs.parentName = 'Parent / Guardian full name is required for learners under 18.';
        }
        if (!formData.parentMobile.trim() || !phoneRegex.test(formData.parentMobile.replace(/\s+/g, ''))) {
          errs.parentMobile = 'Valid 10-digit Parent / Guardian mobile number is required for minors.';
        }
        if (!formData.guardianConsentAccepted) {
          errs.guardianConsentAccepted = 'Verifiable Parent / Guardian consent is required for learners under 18 (DPDP Act 2023).';
        }
      }
      if (!formData.consentAccepted) {
        errs.consentAccepted = 'Please acknowledge and agree to the DPDP Act notice and academic consent.';
      }
    }

    if (stepNum === 7 || stepNum === 0) {
      if (formData.createPortalAccount) {
        if (!formData.portalPassword || formData.portalPassword.length < 6) {
          errs.portalPassword = 'Password must be at least 6 characters to activate your portal account.';
        } else if (formData.portalPassword !== formData.portalConfirmPassword) {
          errs.portalConfirmPassword = 'Passwords do not match.';
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(7, prev + 1));
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(0)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        whatsappNumber: formData.whatsappNumber.trim() || formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        dob: formData.dob,
        gender: formData.gender || undefined,
        profilePhotoUrl: formData.profilePhotoUrl.trim() || undefined,
        country: formData.country.trim() || 'India',
        state: formData.state,
        district: formData.district.trim(),
        city: formData.city.trim(),
        houseNumber: formData.houseNumber.trim() || undefined,
        streetAddress: formData.streetAddress.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        schoolCollegeName: formData.schoolCollegeName.trim() || 'Self-Paced Learner',
        currentClassQualification: formData.currentClassQualification,
        interestedCourse: formData.interestedCourse,
        preferredLanguage: formData.preferredLanguage,
        preferredCategories: formData.preferredCategories,
        parentName: formData.parentName.trim() || undefined,
        parentMobile: formData.parentMobile.trim() || undefined,
        parentWhatsapp: formData.parentWhatsapp.trim() || undefined,
        parentEmail: formData.parentEmail.trim() || undefined,
        isMinor,
        guardianConsentAccepted: isMinor ? formData.guardianConsentAccepted : undefined,
        gpsCoordinates: formData.gpsConsentAccepted ? formData.gpsCoordinates : undefined,
        gpsConsentAccepted: formData.gpsConsentAccepted,
        preferredLearningMode: formData.preferredLearningMode,
        consentAccepted: formData.consentAccepted,
        registeredAt: new Date().toISOString(),
        status: 'Registered' as const,
      };

      const created = storageService.saveStudentRegistration(payload);

      let portalActivated = false;
      let verificationEmailSent = false;

      if (formData.createPortalAccount && formData.portalPassword.length >= 6) {
        try {
          const authUser = await registerPortalAccountWithEmail(
            payload.fullName,
            payload.emailAddress,
            formData.portalPassword
          );
          await syncLmsUserProfile(authUser, 'student');
          await setDoc(
            doc(db, 'student_profiles', authUser.uid),
            stripUndefinedDeep({
              uid: authUser.uid,
              fullName: payload.fullName,
              mobileNumber: payload.mobileNumber,
              whatsappNumber: payload.whatsappNumber,
              email: payload.emailAddress,
              profilePhotoUrl: payload.profilePhotoUrl,
              dob: payload.dob,
              gender: payload.gender,
              country: payload.country,
              state: payload.state,
              district: payload.district,
              city: payload.city,
              houseNumber: payload.houseNumber,
              streetAddress: payload.streetAddress,
              pincode: payload.pincode,
              qualification: payload.currentClassQualification,
              institution: payload.schoolCollegeName,
              preferredLanguage: payload.preferredLanguage,
              preferredCategories: payload.preferredCategories,
              isMinor: payload.isMinor,
              emailVerified: authUser.emailVerified,
              updatedAt: new Date().toISOString(),
            }),
            { merge: true }
          ).catch(() => {});
          portalActivated = true;
          verificationEmailSent = true;
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            setErrors({ portalPassword: 'An account already exists with this email. Uncheck portal creation or sign in after registration.' });
            setIsSubmitting(false);
            return;
          }
        }
      }

      try {
        await submitStudentRegistration(payload);
        await lmsService.recordConsentRecord({
          email: payload.emailAddress,
          fullName: payload.fullName,
          isMinor,
          guardianName: payload.parentName,
          guardianEmail: payload.parentEmail,
          guardianMobile: payload.parentMobile,
          dpdpConsentAccepted: Boolean(payload.consentAccepted),
          gpsOptInAccepted: Boolean(payload.gpsConsentAccepted),
          termsAccepted: Boolean(payload.consentAccepted),
        });
        await triggerAdminNotification({
          category: 'Student',
          title: `Student Enrolment: ${payload.interestedCourse}`,
          senderName: payload.fullName,
          senderEmail: payload.emailAddress,
          details: `Course: ${payload.interestedCourse} | Lang: ${payload.preferredLanguage} | Location: ${payload.city}, ${payload.state}${isMinor ? ' | Minor (Guardian Consented)' : ''}`,
        });
      } catch (err) {
        console.warn('Firestore student registration async notice:', err);
      }

      setIsSubmitting(false);
      setRegisteredEntry({
        id: created.id,
        fullName: created.fullName,
        course: created.interestedCourse,
        registeredAt: created.registeredAt,
        portalActivated,
        verificationEmailSent,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setIsSubmitting(false);
    }
  };

  if (registeredEntry) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6 border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Registration Confirmed
          </span>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-4">
            Welcome to OpenFrame Education!
          </h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Thank you, <strong className="text-slate-900">{registeredEntry.fullName}</strong>. Your student registration for{' '}
            <strong className="text-blue-700">{registeredEntry.course}</strong> has been successfully received by our academic admissions council.
          </p>

          <div className="mt-8 bg-slate-50 rounded-xl p-5 border border-slate-200 text-left space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Registration Reference ID</span>
              <span className="font-mono font-bold text-slate-900">{registeredEntry.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Registered Programme</span>
              <span className="font-semibold text-slate-800">{registeredEntry.course}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-200">
              <span>Timestamp</span>
              <span className="text-slate-700">{new Date(registeredEntry.registeredAt).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Next Step</span>
              <span className="text-blue-600 font-medium">Batch Induction & Syllabus Kit via Email / SMS</span>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 text-left flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Our academic counsellor will connect with you on your registered mobile number within 24 working hours to confirm class timings, learning portal credentials, and batch schedule.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Registration Slip</span>
            </button>
            <Link
              to={registeredEntry.portalActivated ? '/student/dashboard' : '/marketplace'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{registeredEntry.portalActivated ? 'Go to Student Dashboard' : 'Explore Courses'}</span>
            </Link>
          </div>
          {registeredEntry.verificationEmailSent && (
            <p className="text-xs text-emerald-700 font-medium mt-4">
              Portal account activated — a Firebase email verification link has been sent to your registered inbox.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/education"
            className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to OpenFrame Education</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Admissions & Enrolment Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Student Course Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
            Enrol in OpenFrame Education academic tutoring, technology programming, intelligence enhancement, or professional development programmes.
          </p>
        </div>
      </section>

      {/* Main 7-Step Registration Wizard */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          {/* 7-Step Progress Header */}
          <div className="border-b border-slate-100 pb-6 mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-heading font-bold text-slate-900">
                  7-Step Student Onboarding &amp; Enrolment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Step {currentStep} of 7 · Progressive registration compliant with DPDP Act 2023 (No Aadhaar/PAN collected)
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg tabular-nums self-start">
                {Math.round((currentStep / 7) * 100)}% Complete
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {[
                { num: 1, title: 'Personal' },
                { num: 2, title: 'Contact' },
                { num: 3, title: 'Location' },
                { num: 4, title: 'Education' },
                { num: 5, title: 'Subjects' },
                { num: 6, title: 'Consent' },
                { num: 7, title: 'Activate' },
              ].map((st) => (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num < currentStep) setCurrentStep(st.num);
                  }}
                  className={`p-2 rounded-xl border text-center transition-colors ${
                    currentStep === st.num
                      ? 'bg-blue-600 border-blue-600 text-white font-bold'
                      : st.num < currentStep
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold cursor-pointer'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] tabular-nums">{st.num}</div>
                  <div className="text-[10px] truncate hidden sm:block">{st.title}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: Student Personal Details */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Step 1: Student Personal Details</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name of Student <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Enter student legal name"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.dob ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.dob && <p className="text-[11px] text-red-600 mt-1">{errors.dob}</p>}
                    {isMinor && (
                      <p className="text-[11px] text-amber-700 font-medium mt-1">
                        Learner is under 18 — Guardian consent will be required in Step 6.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Gender (Optional)
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary / Other">Non-Binary / Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Profile Photo (Optional Upload or URL)
                    </label>
                    <div className="flex items-center gap-3">
                      {formData.profilePhotoUrl ? (
                        <img
                          src={formData.profilePhotoUrl}
                          alt="Student preview"
                          className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                          <Camera className="w-4 h-4" />
                        </div>
                      )}
                      <label className="px-3.5 py-2 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingPhoto}
                          onChange={(e) => handlePhotoUpload(e.target.files?.[0])}
                        />
                      </label>
                      <input
                        type="url"
                        value={formData.profilePhotoUrl}
                        onChange={(e) => setFormData({ ...formData, profilePhotoUrl: e.target.value })}
                        placeholder="or paste image URL"
                        className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {photoError && <p className="text-[11px] text-amber-700 mt-1">{photoError}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Contact Info & Verification Status */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>Step 2: Contact Details &amp; Verification Readiness</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Student Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.mobileNumber}
                        onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.mobileNumber ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-[11px] text-red-600 mt-1">{errors.mobileNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      WhatsApp Number (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                        placeholder="Same as mobile if blank"
                        className="w-full pl-12 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.emailAddress}
                      onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                      placeholder="student@example.com"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.emailAddress ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.emailAddress && <p className="text-[11px] text-red-600 mt-1">{errors.emailAddress}</p>}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Account Verification Status</span>
                  </div>
                  <p>
                    {authStatusInfo?.note ||
                      'Real email verification link will be dispatched via Firebase Auth when activating your student portal account in Step 7.'}
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: Residential Location */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Step 3: Residential Location</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State / UT <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      District <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="e.g. Bangalore Urban"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.district ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.district && <p className="text-[11px] text-red-600 mt-1">{errors.district}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City / Village <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Indiranagar"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.city && <p className="text-[11px] text-red-600 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      House / Door No. (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      placeholder="e.g. #42-B"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Street Address / Locality (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      placeholder="Street, Area, Landmark"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      PIN Code (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="560001"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.pincode ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.pincode && <p className="text-[11px] text-red-600 mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.gpsConsentAccepted}
                      onChange={(e) => handleGpsOptInChange(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>
                      <strong className="text-slate-900 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        Opt-In: Share approximate GPS location for regional study center matching (Optional)
                      </strong>
                      <span className="block text-[11px] text-slate-500 mt-0.5">
                        Strictly optional. Coordinates are never captured unless you explicitly check this box.
                      </span>
                    </span>
                  </label>
                  {gpsStatus && (
                    <div className="text-[11px] text-blue-700 pl-6">
                      {gpsStatus}
                      {formData.gpsCoordinates && ` (${formData.gpsCoordinates.lat}, ${formData.gpsCoordinates.lng})`}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: Education & Qualification (School/College strictly OPTIONAL) */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Step 4: Education &amp; Learning Mode</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      School / College / Organization Name <span className="text-slate-400 font-normal">(Optional — open to self-paced &amp; independent learners)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.schoolCollegeName}
                      onChange={(e) => setFormData({ ...formData, schoolCollegeName: e.target.value })}
                      placeholder="Optional: Leave blank if studying independently"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Current Class or Qualification Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.currentClassQualification}
                      onChange={(e) => setFormData({ ...formData, currentClassQualification: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {QUALIFICATION_LEVELS.map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Preferred Learning Mode <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.preferredLearningMode}
                      onChange={(e) => setFormData({ ...formData, preferredLearningMode: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Online Live Classes">Online Live Interactive Classes</option>
                      <option value="Recorded Lessons">Recorded Lessons &amp; Self-Paced Library</option>
                      <option value="Hybrid / Practical Labs">Hybrid / Practical Lab Practicum</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Courses, Categories (A-L) & Preferred Language */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Step 5: Preferred Course, Categories (A–L) &amp; Language</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Primary Interested Course / Programme <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.interestedCourse}
                      onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.interestedCourse ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    >
                      <option value="">-- Choose Course --</option>
                      {formData.interestedCourse && !initialEducationCourses.some((c) => c.name === formData.interestedCourse) && (
                        <option value={formData.interestedCourse}>★ {formData.interestedCourse}</option>
                      )}
                      {initialEducationCourses.map((c) => (
                        <option key={c.id} value={c.name}>
                          [{c.category}] {c.name} ({c.level} - {c.duration})
                        </option>
                      ))}
                    </select>
                    {errors.interestedCourse && <p className="text-[11px] text-red-600 mt-1">{errors.interestedCourse}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preferred Learning Language</span>
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.filter((l) => l.code !== 'auto').map((l) => (
                        <option key={l.code} value={l.label}>{l.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Preferred Subject Categories (Select all that interest you)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {UNIVERSAL_12_CATEGORIES.map((uc) => {
                        const checked = formData.preferredCategories.includes(uc.name);
                        return (
                          <label
                            key={uc.code}
                            className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                              checked
                                ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleTogglePrefCategory(uc.name)}
                              className="accent-blue-600 rounded"
                            />
                            <span className="truncate">{uc.code}. {uc.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: Guardian Details (<18 Minor Guardrail) & DPDP Act 2023 Consent */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Step 6: Parent / Guardian &amp; DPDP Act 2023 Consent</span>
                  </h3>
                  {isMinor && (
                    <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                      Minor Protection Active (&lt;18 yrs)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian Full Name {isMinor && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      placeholder="Parent or Guardian name"
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.parentName ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                      }`}
                    />
                    {errors.parentName && <p className="text-[11px] text-red-600 mt-1">{errors.parentName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian Mobile Number {isMinor && <span className="text-red-500">*</span>}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-medium">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.parentMobile}
                        onChange={(e) => setFormData({ ...formData, parentMobile: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className={`w-full pl-12 pr-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.parentMobile ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.parentMobile && <p className="text-[11px] text-red-600 mt-1">{errors.parentMobile}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={formData.parentWhatsapp}
                      onChange={(e) => setFormData({ ...formData, parentWhatsapp: e.target.value.replace(/\D/g, '') })}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Parent / Guardian Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      placeholder="parent@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {isMinor && (
                  <div>
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                      <input
                        type="checkbox"
                        checked={formData.guardianConsentAccepted}
                        onChange={(e) => setFormData({ ...formData, guardianConsentAccepted: e.target.checked })}
                        className="mt-0.5 w-4 h-4 accent-amber-600 rounded"
                      />
                      <span>
                        <strong>Verifiable Parent / Guardian Consent (DPDP Act 2023):</strong> As parent or legal guardian of the minor student, I consent to OpenFrame Education providing child-safe guided learning tools, progress tracking, and academic counseling. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {errors.guardianConsentAccepted && (
                      <p className="text-[11px] text-red-600 mt-1">{errors.guardianConsentAccepted}</p>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800">
                    Data Privacy Notice (Indian DPDP Act, 2023) &amp; Certificate Transparency:
                  </p>
                  <p className="leading-relaxed">
                    <strong>No Government ID Collection:</strong> OpenFrame Education does NOT collect Aadhaar numbers, PAN, passport copies, or government identity documents for student enrolment.
                  </p>
                  <p className="leading-relaxed">
                    OpenFrame Education issues certificates based on internal verified assessments and faculty rubrics; these represent skill training delivered by OpenFrame IT Solutions Private Limited and are not university degrees or statutory accreditation.
                  </p>
                </div>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I confirm the information provided above is accurate and accept the DPDP Act 2023 privacy terms. <span className="text-red-500">*</span>
                  </span>
                </label>
                {errors.consentAccepted && <p className="text-[11px] text-red-600">{errors.consentAccepted}</p>}
              </div>
            )}

            {/* STEP 7: Optional Student Portal Account Activation & Final Review */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  <span>Step 7: Activate Student Portal Account &amp; Submit</span>
                </h3>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-900">Registration Summary</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>Student: <strong>{formData.fullName}</strong></div>
                    <div>Email: <strong>{formData.emailAddress}</strong></div>
                    <div>Location: <strong>{formData.city}, {formData.district}, {formData.state}</strong></div>
                    <div>Course: <strong>{formData.interestedCourse}</strong></div>
                    <div>Language: <strong>{formData.preferredLanguage}</strong></div>
                    <div>Mode: <strong>{formData.preferredLearningMode}</strong></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-4">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-800">
                    <input
                      type="checkbox"
                      checked={formData.createPortalAccount}
                      onChange={(e) => setFormData({ ...formData, createPortalAccount: e.target.checked })}
                      className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>
                      <strong>Activate instant LMS Student Portal login now</strong> (creates your student account with <strong>{formData.emailAddress}</strong> and sends a Firebase email verification link)
                    </span>
                  </label>

                  {formData.createPortalAccount && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Create Portal Password (min 6 chars) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.portalPassword}
                          onChange={(e) => setFormData({ ...formData, portalPassword: e.target.value })}
                          placeholder="Enter password"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.portalPassword ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.portalPassword && <p className="text-[11px] text-red-600 mt-1">{errors.portalPassword}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Confirm Portal Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          value={formData.portalConfirmPassword}
                          onChange={(e) => setFormData({ ...formData, portalConfirmPassword: e.target.value })}
                          placeholder="Repeat password"
                          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.portalConfirmPassword ? 'border-red-400 bg-red-50/20' : 'border-slate-300'
                          }`}
                        />
                        {errors.portalConfirmPassword && <p className="text-[11px] text-red-600 mt-1">{errors.portalConfirmPassword}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stepper Navigation Footer */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              {currentStep === 1 ? (
                <Link
                  to="/education"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel and return to courses
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
              )}

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto px-7 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Processing Enrolment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
