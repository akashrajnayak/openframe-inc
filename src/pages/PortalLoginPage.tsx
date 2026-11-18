import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Shield,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  LogOut,
  School,
  HeartHandshake,
  Compass,
  Briefcase,
  Eye,
  EyeOff,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, getAuthorizedDashboardPath } from '../context/AuthContext';
import { useRouter, Link } from '../router/RouterContext';
import { LmsUserProfile, LmsUserRole } from '../types';
import { db, formatFirebaseAuthError } from '../services/firebase';
import { getSchoolEnrollment, isSchoolQualificationLabel } from '../services/schoolService';

interface CategoryMeta {
  role: LmsUserRole;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  dashboardPath: string;
  canRegister: boolean;
  accentBg: string;
  accentText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACCOUNT_CATEGORIES: CategoryMeta[] = [
  {
    role: 'student',
    slug: 'student',
    title: 'Student',
    subtitle: 'Courses, Quinn AI & Credentials',
    description: 'Access enrolled courses, AI study mentor, quizzes, capstone projects, and QR-verified certificates.',
    dashboardPath: '/student/dashboard',
    canRegister: true,
    accentBg: 'bg-[#2563EB]',
    accentText: 'text-[#2563EB]',
    icon: GraduationCap,
  },
  {
    role: 'teacher',
    slug: 'teacher',
    title: 'Teacher',
    subtitle: 'Classes & Rubric Grading',
    description: 'Manage live cohorts, review capstone submissions, configure quizzes, and mentor learners.',
    dashboardPath: '/teacher/dashboard',
    canRegister: true,
    accentBg: 'bg-[#123D32]',
    accentText: 'text-[#123D32]',
    icon: BookOpen,
  },
  {
    role: 'parent',
    slug: 'parent',
    title: 'Parent',
    subtitle: 'Progress & Attendance Monitor',
    description: 'Follow your child’s academic milestones, attendance logs, evaluation scores, and fee records.',
    dashboardPath: '/parent/dashboard',
    canRegister: true,
    accentBg: 'bg-teal-700',
    accentText: 'text-teal-700',
    icon: Users,
  },
  {
    role: 'institution_admin',
    slug: 'school',
    title: 'School',
    subtitle: 'Campus & Multi-Tenant LMS',
    description: 'Onboard your school, manage classrooms, teachers, IQ/EQ/SQ diagnostics, fees, and certificates.',
    dashboardPath: '/partner/school/dashboard',
    canRegister: true,
    accentBg: 'bg-[#14213D]',
    accentText: 'text-[#14213D]',
    icon: School,
  },
  {
    role: 'ngo_partner',
    slug: 'ngo',
    title: 'NGO Partner',
    subtitle: 'Community & HopeNest Alliances',
    description: 'Coordinate literacy drives, track community beneficiaries, manage volunteers, and log programme impact.',
    dashboardPath: '/ngo/dashboard',
    canRegister: true,
    accentBg: 'bg-emerald-700',
    accentText: 'text-emerald-700',
    icon: HeartHandshake,
  },
  {
    role: 'field_executive',
    slug: 'field',
    title: 'Field Executive',
    subtitle: 'Outreach & School Visits',
    description: 'Record daily school visits, submit student onboarding leads, log check-ins, and track territory goals.',
    dashboardPath: '/field/dashboard',
    canRegister: true,
    accentBg: 'bg-amber-700',
    accentText: 'text-amber-700',
    icon: Compass,
  },
  {
    role: 'professional',
    slug: 'professional',
    title: 'Professional',
    subtitle: 'Career Tracks & Upskilling',
    description: 'Accelerate leadership, AI, Excel, and engineering proficiency with verified executive credentials.',
    dashboardPath: '/professional/dashboard',
    canRegister: true,
    accentBg: 'bg-indigo-700',
    accentText: 'text-indigo-700',
    icon: Briefcase,
  },
  {
    role: 'admin',
    slug: 'admin',
    title: 'Admin',
    subtitle: 'Authorized Governance Console',
    description: 'Restricted platform governance over institutions, course catalogs, credentials, and audit compliance.',
    dashboardPath: '/admin/dashboard',
    canRegister: false,
    accentBg: 'bg-slate-900',
    accentText: 'text-slate-900',
    icon: Shield,
  },
];

function formatRoleDisplayName(role: LmsUserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator';
    case 'institution_admin':
      return 'School Partner';
    case 'ngo_partner':
      return 'NGO Partner';
    case 'field_executive':
      return 'Field Executive';
    case 'professional':
      return 'Professional Learner';
    case 'teacher':
      return 'Teacher';
    case 'parent':
      return 'Parent';
    case 'student':
    default:
      return 'Student';
  }
}

function resolveInitialCategory(path: string): LmsUserRole | null {
  const [cleanPath, qs] = path.split('?');
  const normalized = cleanPath.length > 1 && cleanPath.endsWith('/') ? cleanPath.slice(0, -1) : cleanPath;
  const params = new URLSearchParams(qs || '');
  const qpRole = params.get('role');
  if (qpRole) {
    const found = ACCOUNT_CATEGORIES.find(
      (c) => c.role === qpRole || c.slug === qpRole || (qpRole === 'super_admin' && c.role === 'admin')
    );
    if (found) return found.role;
  }
  if (normalized === '/student/login' || normalized === '/login/student' || normalized === '/student-login') {
    return 'student';
  }
  if (normalized.startsWith('/portal/')) {
    const seg = normalized.replace('/portal/', '').split('/')[0];
    const found = ACCOUNT_CATEGORIES.find(
      (c) => c.slug === seg || c.role === seg || (seg === 'super_admin' && c.role === 'admin')
    );
    if (found) return found.role;
  }
  return null;
}

export const PortalLoginPage: React.FC = () => {
  const {
    currentUser,
    lmsUser,
    authorizedDashboardPath,
    authError,
    clearAuthError,
    loginGoogle,
    loginEmail,
    loginPortalGoogle,
    loginPortalEmail,
    registerPortalEmail,
    sendPasswordReset,
    logout,
    loading,
  } = useAuth();
  const { currentPath, navigate } = useRouter();

  const queryParams = new URLSearchParams(currentPath.split('?')[1] || '');
  const redirectTarget = queryParams.get('redirect') || '';
  const initialMode = queryParams.get('mode') === 'register' ? 'register' : 'signin';

  const [selectedRole, setSelectedRole] = useState<LmsUserRole | null>(() => resolveInitialCategory(currentPath));
  const [authMode, setAuthMode] = useState<'signin' | 'register'>(initialMode);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [specialization, setSpecialization] = useState('');
  const [parentStudentEmail, setParentStudentEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const allowSwitchAccount = queryParams.get('switch') === '1';

  useEffect(() => {
    const resolved = resolveInitialCategory(currentPath);
    setSelectedRole(resolved);
    const qp = new URLSearchParams(currentPath.split('?')[1] || '');
    setAuthMode(qp.get('mode') === 'register' ? 'register' : 'signin');
    setErrorMsg(null);
    setInfoMsg(null);
  }, [currentPath]);

  // Persistent session auto-forward: never ask an already logged-in user to log in again
  useEffect(() => {
    if (loading || submitting || !currentUser || !lmsUser || allowSwitchAccount) return;
    if (
      redirectTarget &&
      redirectTarget.startsWith('/') &&
      !redirectTarget.startsWith('/login') &&
      !redirectTarget.startsWith('/portal') &&
      !redirectTarget.startsWith('/student/login')
    ) {
      navigate(redirectTarget, { replace: true });
      return;
    }
    navigate(authorizedDashboardPath, { replace: true });
  }, [loading, submitting, currentUser, lmsUser, allowSwitchAccount, redirectTarget, authorizedDashboardPath, navigate]);

  const activeCategory = ACCOUNT_CATEGORIES.find((c) => c.role === selectedRole) || null;
  const isAdminCategory = selectedRole === 'admin';

  const resolveDestination = async (profile: LmsUserProfile): Promise<string> => {
    if (redirectTarget && redirectTarget.startsWith('/') && !redirectTarget.startsWith('/login') && !redirectTarget.startsWith('/portal')) {
      return redirectTarget;
    }
    if (profile.role === 'student') {
      try {
        const [schoolEnr, stuSnap] = await Promise.all([
          getSchoolEnrollment(profile.uid).catch(() => null),
          getDoc(doc(db, 'student_profiles', profile.uid)).catch(() => null),
        ]);
        const qual = stuSnap?.exists() ? (stuSnap.data()?.qualification as string | undefined) : undefined;
        if (schoolEnr || isSchoolQualificationLabel(qual)) {
          return '/school?tab=daily';
        }
      } catch {
        // fallback below
      }
    }
    return getAuthorizedDashboardPath(profile.role);
  };

  const handleSelectCategory = (cat: CategoryMeta) => {
    clearAuthError();
    setErrorMsg(null);
    setInfoMsg(null);
    setSelectedRole(cat.role);
    if (!cat.canRegister) {
      setAuthMode('signin');
    } else if (queryParams.get('mode') === 'register') {
      setAuthMode('register');
    } else {
      setAuthMode('signin');
    }
  };

  const handleGoogleAuth = async () => {
    if (!selectedRole) return;
    clearAuthError();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      if (isAdminCategory) {
        await loginGoogle(rememberMe);
        navigate('/admin/dashboard');
        return;
      }
      const profile = await loginPortalGoogle(selectedRole, rememberMe);
      navigate(await resolveDestination(profile));
    } catch (err: any) {
      setErrorMsg(formatFirebaseAuthError(err, 'google'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    clearAuthError();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      const resolvedEmail = email.trim().toLowerCase();
      if (isAdminCategory) {
        await loginEmail(resolvedEmail, password, rememberMe);
        navigate('/admin/dashboard');
        return;
      }

      if (authMode === 'register') {
        const display = fullName.trim();
        if (!display) throw new Error('Please enter your full name.');
        if (!resolvedEmail) throw new Error('Please enter a valid email address.');

        const profile = await registerPortalEmail(display, resolvedEmail, password, selectedRole, {
          specialization: selectedRole === 'teacher' ? specialization.trim() : undefined,
          parentStudentEmail: selectedRole === 'parent' ? parentStudentEmail.trim() : undefined,
        });
        navigate(await resolveDestination(profile));
      } else {
        const profile = await loginPortalEmail(resolvedEmail, password, selectedRole, rememberMe);
        navigate(await resolveDestination(profile));
      }
    } catch (err: any) {
      setErrorMsg(formatFirebaseAuthError(err, authMode === 'register' ? 'register' : 'email'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    clearAuthError();
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Enter your email address first to receive a password reset link.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setInfoMsg(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMsg(formatFirebaseAuthError(err, 'reset'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!allowSwitchAccount && !submitting && currentUser && lmsUser)) {
    return (
      <div className="min-h-[70vh] bg-[#FAF7F2] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-8 h-8 border-2 border-[#123D32] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-medium text-[#64748B]">
          {currentUser && lmsUser ? 'Opening your workspace...' : 'Loading portal...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
          {currentUser && lmsUser && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[#123D32] font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Signed in as {lmsUser.displayName} ({formatRoleDisplayName(lmsUser.role)})
                  </span>
                </div>
                <div className="text-xs text-[#64748B] truncate tabular-nums">
                  {lmsUser.email} · ID: {lmsUser.registrationNumber}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate(authorizedDashboardPath)}
                  className="px-4 py-2 bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  Open My Workspace
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-medium flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {authError && !activeCategory && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 max-w-3xl mx-auto">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{authError}</span>
            </div>
          )}

          {!activeCategory ? (
            <div className="space-y-10">
              {/* Facebook-Inspired Welcoming Portal Header */}
              <div className="text-center space-y-3 max-w-2xl mx-auto">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
                  OpenFrame Unified Sign In
                </div>
                <h1 className="text-3xl sm:text-5xl font-editorial font-semibold text-[#18221F] tracking-tight leading-tight">
                  Welcome to OpenFrame
                </h1>
                <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                  One platform. Multiple possibilities. Your learning journey starts here — choose your portal to continue.
                </p>
              </div>

              {/* 8 Graphical Role Portal Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {ACCOUNT_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.role}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className="text-left bg-white border border-slate-200/90 hover:border-[#2563EB] rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl ${cat.accentBg} text-white flex items-center justify-center shadow-xs`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
                        </div>

                        <div className="space-y-1.5">
                          <div className={`text-[11px] font-bold uppercase tracking-wider ${cat.accentText}`}>
                            {cat.subtitle}
                          </div>
                          <h2 className="text-lg font-heading font-bold text-[#18221F]">
                            {cat.title}
                          </h2>
                          <p className="text-xs text-[#64748B] leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#18221F] group-hover:text-[#2563EB]">
                        <span>{cat.canRegister ? 'Sign In or Join' : 'Authorized Sign In'}</span>
                        <span>Open →</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-5xl mx-auto">
              {/* Left Welcome Editorial Context (Facebook Split Inspiration) */}
              <div className="lg:col-span-5 space-y-5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole(null);
                    setErrorMsg(null);
                    setInfoMsg(null);
                    clearAuthError();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#18221F] cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All 8 Portals</span>
                </button>

                <div className={`w-14 h-14 rounded-2xl ${activeCategory.accentBg} text-white flex items-center justify-center shadow-md`}>
                  <activeCategory.icon className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <div className={`text-xs font-bold uppercase tracking-[0.14em] ${activeCategory.accentText}`}>
                    {activeCategory.title} Portal
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] leading-tight">
                    Sign in to your {activeCategory.title} workspace.
                  </h1>
                  <p className="text-sm text-[#64748B] leading-relaxed">
                    {activeCategory.description}
                  </p>
                </div>

                <div className="pt-2 space-y-2.5 text-xs text-[#18221F]/80">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#123D32] shrink-0" />
                    <span>Protected Firebase Authentication with role-verified routing</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#123D32] shrink-0" />
                    <span>Synced progress, certificates, and Quinn AI assistance</span>
                  </div>
                </div>
              </div>

              {/* Right Clean Authentication Card */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                {(errorMsg || authError) && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>{errorMsg || authError}</span>
                  </div>
                )}

                {infoMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{infoMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleGoogleAuth}
                  className="w-full py-3.5 px-4 bg-[#14213D] hover:bg-[#0d1629] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24Z" />
                    <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z" />
                  </svg>
                  <span>{submitting ? 'Connecting to Google...' : `Continue with Google (${activeCategory.title})`}</span>
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-white px-3 text-[#64748B] font-semibold">or use email &amp; password</span>
                  </div>
                </div>

                {!isAdminCategory && (
                  <div className="flex items-center justify-between gap-2 pb-1">
                    <div className="inline-flex items-center gap-1 p-1 bg-[#F5F5F2] rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setErrorMsg(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          authMode === 'signin' ? 'bg-white text-[#18221F] shadow-xs' : 'text-[#64748B]'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('register');
                          setErrorMsg(null);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          authMode === 'register' ? 'bg-white text-[#18221F] shadow-xs' : 'text-[#64748B]'
                        }`}
                      >
                        Create New Account
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
                  {authMode === 'register' && !isAdminCategory && (
                    <div>
                      <label className="block font-semibold text-[#18221F] mb-1">Full Name *</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={
                            selectedRole === 'ngo_partner'
                              ? 'Organization or Coordinator Name'
                              : selectedRole === 'institution_admin'
                              ? 'Principal / School Administrator Name'
                              : 'Enter your full name'
                          }
                          className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2]/60 border border-slate-200 rounded-xl text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {authMode === 'register' && selectedRole === 'teacher' && (
                    <div>
                      <label className="block font-semibold text-[#18221F] mb-1">Subject Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. Computer Science, Mathematics, Spoken English"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-slate-200 rounded-xl text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                      />
                    </div>
                  )}

                  {authMode === 'register' && selectedRole === 'parent' && (
                    <div>
                      <label className="block font-semibold text-[#18221F] mb-1">
                        Child’s Student Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={parentStudentEmail}
                        onChange={(e) => setParentStudentEmail(e.target.value)}
                        placeholder="student@domain.com"
                        className="w-full px-3.5 py-2.5 bg-[#FAF7F2]/60 border border-slate-200 rounded-xl text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-[#18221F] mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-[#FAF7F2]/60 border border-slate-200 rounded-xl text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#18221F] mb-1">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 bg-[#FAF7F2]/60 border border-slate-200 rounded-xl text-sm text-[#18221F] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="inline-flex items-center gap-2 text-xs text-[#64748B] cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      <span>Remember me on this device</span>
                    </label>

                    {(authMode === 'signin' || isAdminCategory) && (
                      <button
                        type="button"
                        onClick={handleResetPassword}
                        className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
                  >
                    {submitting
                      ? 'Authenticating...'
                      : authMode === 'register' && !isAdminCategory
                      ? `Create ${activeCategory.title} Account`
                      : `Sign In as ${activeCategory.title}`}
                  </button>
                </form>

                {selectedRole === 'student' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                    <span>Need LKG–12th / Course Onboarding?</span>
                    <Link to="/join/student" className="font-semibold text-[#2563EB] hover:underline">
                      7-Step Student Registration →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
};
