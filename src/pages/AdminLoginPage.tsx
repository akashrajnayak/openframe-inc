import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import {
  Shield,
  Lock,
  User,
  Mail,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Copy,
  Check,
  Home,
} from 'lucide-react';

interface AdminAuthStatus {
  configured: boolean;
  needsSetup: boolean;
  source: 'environment' | 'claimed' | 'unconfigured';
  usernameHint: string;
}

function generateStrongRandomPassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = upper + lower + digits + symbols;
  const bytes = new Uint32Array(length);
  window.crypto.getRandomValues(bytes);

  const chars: string[] = [
    upper[bytes[0] % upper.length],
    lower[bytes[1] % lower.length],
    digits[bytes[2] % digits.length],
    symbols[bytes[3] % symbols.length],
  ];
  for (let i = 4; i < length; i++) {
    chars.push(all[bytes[i] % all.length]);
  }
  // Fisher-Yates shuffle using crypto randomness
  const shuffleBytes = new Uint32Array(chars.length);
  window.crypto.getRandomValues(shuffleBytes);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleBytes[i] % (i + 1);
    const tmp = chars[i];
    chars[i] = chars[j];
    chars[j] = tmp;
  }
  return chars.join('');
}

export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const {
    isAdminSession,
    authError,
    loginGoogle,
    loginEmail,
    loginAdminCredentials,
    bootstrapAdminCredentials,
    sendPasswordReset,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'credentials' | 'firebase_email'>('credentials');
  const [statusLoading, setStatusLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AdminAuthStatus>({
    configured: false,
    needsSetup: true,
    source: 'unconfigured',
    usernameHint: 'openframe_admin',
  });

  // Server-verified username & password fields
  const [usernameInput, setUsernameInput] = useState('openframe_admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Firebase email fallback fields
  const [emailInput, setEmailInput] = useState('');
  const [firebasePassInput, setFirebasePassInput] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Destination after sign-in: Home Page Admin Panel or Full Console
  const [destination, setDestination] = useState<'home' | 'dashboard'>('home');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');

  const fetchAuthStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/admin/auth/status');
      const data = await res.json();
      if (res.ok && data?.ok) {
        const nextStatus: AdminAuthStatus = {
          configured: Boolean(data.configured),
          needsSetup: Boolean(data.needsSetup),
          source: data.source || 'unconfigured',
          usernameHint: data.usernameHint || 'openframe_admin',
        };
        setAuthStatus(nextStatus);
        setUsernameInput(nextStatus.usernameHint);
        if (nextStatus.needsSetup) {
          setPasswordInput(generateStrongRandomPassword(16));
          setShowPassword(true);
        }
      }
    } catch {
      // Keep default setup state
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
  }, [fetchAuthStatus]);

  useEffect(() => {
    if (isAdminSession) {
      storageService.setAdminLoggedIn(true);
      navigate(destination === 'home' ? '/' : '/admin/dashboard');
    }
  }, [isAdminSession, destination, navigate]);

  const handleRegeneratePassword = () => {
    setPasswordInput(generateStrongRandomPassword(16));
    setShowPassword(true);
    setCopiedCreds(false);
  };

  const handleCopyCredentials = async () => {
    const text = `Admin Username: ${usernameInput.trim()}\nAdmin Password: ${passwordInput}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCreds(true);
      setTimeout(() => setCopiedCreds(false), 2500);
    } catch {
      setCopiedCreds(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setLoginError('');
    setResetSent(false);
    try {
      await loginGoogle();
      storageService.setAdminLoggedIn(true);
      navigate(destination === 'home' ? '/' : '/admin/dashboard');
    } catch (err: any) {
      setLoginError(
        err?.message || 'Google authentication failed or your account is not provisioned as an administrator.'
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      setLoginError('Please enter an admin username.');
      return;
    }
    if (!passwordInput) {
      setLoginError('Please enter or generate an admin password.');
      return;
    }
    if (authStatus.needsSetup && passwordInput.length < 10) {
      setLoginError('Admin password must be at least 10 characters long.');
      return;
    }

    setIsAuthenticating(true);
    setLoginError('');
    try {
      if (authStatus.needsSetup) {
        await bootstrapAdminCredentials(usernameInput.trim(), passwordInput);
      } else {
        await loginAdminCredentials(usernameInput.trim(), passwordInput);
      }
      storageService.setAdminLoggedIn(true);
      navigate(destination === 'home' ? '/' : '/admin/dashboard');
    } catch (err: any) {
      setLoginError(err?.message || 'Unable to verify administrator credentials.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleFirebaseEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !firebasePassInput) {
      setLoginError('Enter your corporate admin email and password.');
      return;
    }
    setIsAuthenticating(true);
    setLoginError('');
    setResetSent(false);
    try {
      await loginEmail(emailInput.trim(), firebasePassInput);
      storageService.setAdminLoggedIn(true);
      navigate(destination === 'home' ? '/' : '/admin/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setLoginError('Firebase Email/Password sign-in is disabled. Use Google Sign-In or Admin Username & Password.');
      } else {
        setLoginError(err?.message || 'Invalid Firebase admin credentials.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginError('Enter your corporate admin email address first to send a reset link.');
      return;
    }
    setIsAuthenticating(true);
    setLoginError('');
    try {
      await sendPasswordReset(emailInput.trim());
      setResetSent(true);
    } catch (err: any) {
      setLoginError(err?.message || 'Could not send password reset link.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const displayError = loginError || authError;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center px-4 py-10">
      <div className="max-w-lg w-full bg-[#162033] rounded-2xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl text-white space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-700/70 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#123D32] border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                OpenFrame Admin Access
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Student Intelligence Panel · Course Approvals · Platform Console
              </p>
            </div>
          </div>
        </div>

        {/* Landing Preference */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-medium">Open after sign-in</span>
          <div className="inline-flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-700">
            <button
              type="button"
              onClick={() => setDestination('home')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                destination === 'home'
                  ? 'bg-[#123D32] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Home Admin Panel
            </button>
            <button
              type="button"
              onClick={() => setDestination('dashboard')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                destination === 'dashboard'
                  ? 'bg-[#123D32] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Console
            </button>
          </div>
        </div>

        {displayError && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-xs text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <span>Password reset link sent to your email address.</span>
          </div>
        )}

        {/* Primary Option 1: Instant Google Super Admin Sign-In */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Sign in with Google (Full Firestore Live Sync)</span>
          </button>
          <p className="text-[11px] text-slate-400 text-center">
            Recommended for Super Admin (<span className="font-mono text-slate-300">akashrajnayak@gmail.com</span>) to stream live Firestore student enrollments &amp; approvals.
          </p>
        </div>

        {/* Divider + Mode Switch */}
        <div className="flex items-center gap-3">
          <div className="h-px bg-slate-700 flex-1" />
          <div className="inline-flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('credentials');
                setLoginError('');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                authMode === 'credentials' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Username &amp; Password
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('firebase_email');
                setLoginError('');
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap cursor-pointer ${
                authMode === 'firebase_email' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Firebase Email
            </button>
          </div>
          <div className="h-px bg-slate-700 flex-1" />
        </div>

        {/* Option 2: Server-Verified Admin Username & Password (First-Run Claim or Login) */}
        {authMode === 'credentials' ? (
          statusLoading ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              <span>Checking admin credential status...</span>
            </div>
          ) : (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              {authStatus.needsSetup && (
                <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-xs text-emerald-100 space-y-1">
                  <div className="font-semibold text-emerald-200">
                    First-Run Admin Credentials Setup
                  </div>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    A strong random password has been generated in your browser. Copy and save it now, then click Claim &amp; Sign In to lock these credentials on the server.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="openframe_admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    {authStatus.needsSetup ? 'Generated Random Password' : 'Admin Password'}
                  </label>
                  {authStatus.needsSetup && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRegeneratePassword}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 hover:text-emerald-200 cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generate New</span>
                      </button>
                      <span className="text-slate-600" aria-hidden="true">·</span>
                      <button
                        type="button"
                        onClick={handleCopyCredentials}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-300 hover:text-sky-200 cursor-pointer whitespace-nowrap"
                      >
                        {copiedCreds ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCreds ? 'Copied' : 'Copy Both'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={authStatus.needsSetup ? 'new-password' : 'current-password'}
                    placeholder={authStatus.needsSetup ? 'Strong random password (10+ chars)' : 'Enter admin password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-xl bg-[#123D32] hover:bg-[#174f41] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>Verifying on Server...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 text-emerald-300" />
                    <span>
                      {authStatus.needsSetup
                        ? 'Save Random Password & Enter Admin Panel'
                        : 'Sign In with Admin Credentials'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleFirebaseEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Corporate Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="admin@openframeitsolutions.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Firebase Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter Firebase password"
                  value={firebasePassInput}
                  onChange={(e) => setFirebasePassInput(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Verifying Firebase Session...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In with Firebase Email</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="pt-4 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-400">
          <Link to="/portal" className="text-slate-300 hover:text-white font-medium transition-colors">
            All User Portals
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
