import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatFirebaseAuthError } from '../../services/firebase';
import { LmsUserProfile, LmsUserRole } from '../../types';

interface GoogleSignInButtonProps {
  role?: LmsUserRole;
  label?: string;
  variant?: 'dark' | 'light' | 'compact';
  className?: string;
  showInlineError?: boolean;
  onSuccess?: (profile?: LmsUserProfile) => void;
  onError?: (message: string) => void;
}

export const GoogleLogoSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4 shrink-0' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
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
);

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  role = 'student',
  label = 'Continue with Google',
  variant = 'dark',
  className = '',
  showInlineError = true,
  onSuccess,
  onError,
}) => {
  const { loginGoogle, loginPortalGoogle, clearAuthError } = useAuth();
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleClick = async () => {
    clearAuthError();
    setErrorMsg(null);
    setBusy(true);
    try {
      if (role === 'admin') {
        await loginGoogle(true);
        onSuccess?.();
      } else {
        const profile = await loginPortalGoogle(role, true);
        onSuccess?.(profile);
      }
    } catch (err) {
      const formatted = formatFirebaseAuthError(err, 'google');
      setErrorMsg(formatted);
      onError?.(formatted);
    } finally {
      setBusy(false);
    }
  };

  const baseStyles =
    variant === 'compact'
      ? 'inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300/90 text-[#18221F] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 shadow-2xs'
      : variant === 'light'
      ? 'w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#18221F] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs'
      : 'w-full py-3 px-4 rounded-xl bg-[#14213D] hover:bg-[#0d1629] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors cursor-pointer disabled:opacity-60 shadow-sm';

  return (
    <div className={variant === 'compact' ? 'inline-flex flex-col items-end' : 'w-full space-y-2'}>
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className={`${baseStyles} ${className}`}
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          <GoogleLogoSvg className={variant === 'compact' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
        )}
        <span>{busy ? 'Connecting...' : label}</span>
      </button>

      {showInlineError && errorMsg && (
        <div
          className={`p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-1.5 text-left ${
            variant === 'compact' ? 'max-w-xs mt-1' : 'w-full'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
