import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  ArrowRight,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import { LmsUserRole } from '../types';

export const PortalLoginPage: React.FC = () => {
  const {
    currentUser,
    lmsUser,
    portalRole,
    loginPortalGoogle,
    loginPortalEmail,
    registerPortalEmail,
    switchPortalRole,
    sendPasswordReset,
    logout,
    loading
  } = useAuth();
  const { currentPath, navigate } = useRouter();

  const queryParams = new URLSearchParams(currentPath.split('?')[1] || '');
  const initialRoleParam = queryParams.get('role') as LmsUserRole | null;
  const redirectTarget = queryParams.get('redirect') || '';

  const [selectedRole, setSelectedRole] = useState<LmsUserRole>(
    initialRoleParam && ['student', 'teacher', 'parent'].includes(initialRoleParam)
      ? initialRoleParam
      : 'student'
  );
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoleParam && ['student', 'teacher', 'parent'].includes(initialRoleParam)) {
      setSelectedRole(initialRoleParam);
    }
  }, [initialRoleParam]);

  const getDestination = (role: LmsUserRole) => {
    if (redirectTarget && redirectTarget.startsWith('/')) return redirectTarget;
    if (role === 'teacher') return '/teacher/dashboard';
    if (role === 'parent') return '/parent/dashboard';
    return '/student/dashboard';
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);
    try {
      const profile = await loginPortalGoogle(selectedRole);
      navigate(getDestination(selectedRole || profile.role));
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google sign-in was cancelled or could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);
    setSubmitting(true);

    try {
      if (authMode === 'register') {
        if (!fullName.trim()) throw new Error('Please enter your full name.');
        const profile = await registerPortalEmail(fullName.trim(), email.trim(), password, selectedRole, {
          specialization: selectedRole === 'teacher' ? specialization : undefined,
        });
        navigate(getDestination(selectedRole || profile.role));
      } else {
        const profile = await loginPortalEmail(email.trim(), password, selectedRole);
        navigate(getDestination(selectedRole || profile.role));
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMsg(
          'Email/password authentication is currently restricted in this workspace. Please use Continue with Google above.'
        );
      } else if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Double-check your credentials or sign in with Google.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Switch to Sign In or use Google.');
      } else {
        setErrorMsg(err?.message || 'Unable to authenticate with email.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email.trim()) {
      setErrorMsg('Enter your email address first to receive a password reset link.');
      return;
    }
    try {
      await sendPasswordReset(email.trim());
      setInfoMsg(`Password reset instructions sent to ${email.trim()}.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not send password reset email.');
    }
  };

  const roleDetails: Record<'student' | 'teacher' | 'parent', { title: string; subtitle: string; icon: any }> = {
    student: {
      title: 'Student Learning Portal',
      subtitle: 'Access Quinn AI video lectures, 15-question assessments, projects, presentations, and verified certificates.',
      icon: GraduationCap,
    },
    teacher: {
      title: 'Faculty Evaluation Portal',
      subtitle: 'Organize modules & lessons, review student deliverables, grade 6-criteria rubrics, and certify mastery.',
      icon: BookOpen,
    },
    parent: {
      title: 'Parent Progress Portal',
      subtitle: 'Link your child’s OpenFrame registration to monitor course progression, quiz results, and teacher feedback.',
      icon: Users,
    },
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-blue-700">
            <span>OpenFrame Education</span>
            <span aria-hidden="true">·</span>
            <span>Quinn AI Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Sign In to Your Learning Portal
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Select your portal role to launch your personalized workspace or continue an active certification track.
          </p>
        </div>

        {/* Already Signed-In Quick Switcher */}
        {currentUser && lmsUser && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Signed in as {lmsUser.displayName}</span>
              </div>
              <div className="text-xs text-slate-500 truncate">
                {lmsUser.email} · {lmsUser.registrationNumber}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  switchPortalRole(selectedRole);
                  navigate(getDestination(selectedRole || portalRole));
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                Open {selectedRole === 'teacher' ? 'Teacher' : selectedRole === 'parent' ? 'Parent' : 'Student'} Workspace
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Portal Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Interactive Role Selector */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {(['student', 'teacher', 'parent'] as const).map((r) => {
              const Icon = roleDetails[r].icon;
              const active = selectedRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRole(r)}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="capitalize">{r}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {roleDetails[selectedRole as 'student' | 'teacher' | 'parent'].title}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {roleDetails[selectedRole as 'student' | 'teacher' | 'parent'].subtitle}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Primary Recommended Sign-In: Google */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleAuth}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>Continue with Google as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink mx-3 text-[11px] text-slate-400">or with email & password</span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  authMode === 'signin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
            </div>
            {authMode === 'signin' && (
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3.5 text-xs">
            {authMode === 'register' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full legal name"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {authMode === 'register' && selectedRole === 'teacher' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Artificial Intelligence, Full-Stack Systems"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting
                ? 'Authenticating...'
                : authMode === 'register'
                ? `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`
                : `Sign In to ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Portal`}
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Are you an institutional administrator?</span>
            <button
              type="button"
              onClick={() => navigate('/admin/login')}
              className="text-blue-600 hover:underline font-medium"
            >
              Admin Console Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
