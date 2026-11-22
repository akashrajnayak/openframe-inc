import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  PlugZap,
  Save,
  ExternalLink,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  db,
  auth,
  logActivity,
  handleFirestoreError,
  OperationType,
} from '../../services/firebase';

interface RazorpayKeyPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (info: { keyId: string; mode: 'live' | 'test' }) => void;
}

const RAZORPAY_KEY_ID_REGEX = /^rzp_(live|test)_[a-zA-Z0-9]+$/;
const RAZORPAY_DOC_PATH = 'payment_settings/razorpay';

function detectMode(keyId: string): 'live' | 'test' {
  return keyId.trim().startsWith('rzp_test_') ? 'test' : 'live';
}

export const RazorpayKeyPromptModal: React.FC<RazorpayKeyPromptModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    setStatusMsg('');
    setLoading(true);

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'payment_settings', 'razorpay'));
        if (snap.exists()) {
          const data = snap.data() as any;
          setKeyId(data.keyId || '');
          setKeySecret(data.keySecret || '');
        }
      } catch {
        // Non-blocking if doc doesn't exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const mode = detectMode(keyId);

  const getToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Please sign in with your Super Admin account first.');
    }
    return user.getIdToken();
  };

  const handleTest = async () => {
    setErrorMsg('');
    setStatusMsg('');
    const cleanId = keyId.trim();
    const cleanSecret = keySecret.trim();

    if (!RAZORPAY_KEY_ID_REGEX.test(cleanId)) {
      setErrorMsg('Razorpay Key ID must start with rzp_live_ or rzp_test_ followed by alphanumeric characters.');
      return;
    }
    if (cleanSecret.length < 8) {
      setErrorMsg('Razorpay Key Secret must be at least 8 characters.');
      return;
    }

    setTesting(true);
    try {
      const token = await getToken();
      const resp = await fetch('/api/admin/payment-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyId: cleanId, keySecret: cleanSecret }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.ok && data.verified) {
        setStatusMsg(data.message || `Razorpay ${mode.toUpperCase()} API credentials verified!`);
      } else {
        setErrorMsg(data.error || 'Razorpay rejected these API credentials. Please check Key ID & Key Secret.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to verify credentials with Razorpay.');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');

    const cleanId = keyId.trim();
    const cleanSecret = keySecret.trim();

    if (!RAZORPAY_KEY_ID_REGEX.test(cleanId)) {
      setErrorMsg('Invalid Razorpay Key ID. Must start with rzp_live_ or rzp_test_.');
      return;
    }
    if (cleanSecret.length < 8 || cleanSecret.length > 200) {
      setErrorMsg('Razorpay Key Secret must be between 8 and 200 characters.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setErrorMsg('Super Admin sign-in is required to update Razorpay keys.');
      return;
    }

    setSaving(true);
    const nowIso = new Date().toISOString();
    const resolvedMode = detectMode(cleanId);

    try {
      // 1. Bind credentials to Firestore (strictly Super Admin protected)
      try {
        await setDoc(doc(db, 'payment_settings', 'razorpay'), {
          provider: 'razorpay',
          keyId: cleanId,
          keySecret: cleanSecret,
          mode: resolvedMode,
          enabled: true,
          updatedByUid: currentUser.uid,
          updatedByEmail: currentUser.email || 'superadmin@openframeitsolutions.com',
          updatedAt: nowIso,
        });
      } catch (fsErr) {
        handleFirestoreError(fsErr, OperationType.WRITE, RAZORPAY_DOC_PATH);
      }

      // 2. Link immediately to live server checkout gateway
      const token = await getToken();
      const resp = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyId: cleanId,
          keySecret: cleanSecret,
          mode: resolvedMode,
          enabled: true,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Failed to link Razorpay credentials to checkout server.');
      }

      await logActivity(
        'Configured Razorpay API Keys (Checkout Prompt)',
        'payment_settings',
        'razorpay',
        `Mode: ${resolvedMode.toUpperCase()} | Key ID: ${cleanId.slice(0, 14)}…`
      );

      setStatusMsg(`Razorpay ${resolvedMode.toUpperCase()} keys saved & linked! Ready for payment.`);
      if (onSaved) onSaved({ keyId: cleanId, mode: resolvedMode });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save Razorpay API credentials.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                Super Admin · Razorpay API Setup
              </div>
              <h3 className="text-sm font-bold text-white">
                Insert Razorpay API Key ID &amp; Key Secret
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Razorpay API key prompt"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-950 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                Your keys are saved to Firestore (<code className="font-mono text-[11px]">payment_settings/razorpay</code>) and linked immediately to live Razorpay Checkout.
              </span>
            </div>
            <a
              href="https://dashboard.razorpay.com/app/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline whitespace-nowrap shrink-0"
            >
              <span>Get Keys</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div>
            <label
              htmlFor="prompt-rzp-key-id"
              className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5"
            >
              <span>Razorpay Key ID *</span>
              {keyId.trim() && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mode === 'live'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {mode.toUpperCase()} MODE
                </span>
              )}
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="prompt-rzp-key-id"
                type="text"
                autoComplete="off"
                spellCheck={false}
                disabled={loading}
                value={keyId}
                onChange={(e) => {
                  setKeyId(e.target.value);
                  setErrorMsg('');
                  setStatusMsg('');
                }}
                placeholder="rzp_live_XXXXXXXXXXXXXX or rzp_test_XXXXXXXXXXXXXX"
                required
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="prompt-rzp-key-secret"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Razorpay Key Secret *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="prompt-rzp-key-secret"
                type={showSecret ? 'text' : 'password'}
                autoComplete="new-password"
                spellCheck={false}
                disabled={loading}
                value={keySecret}
                onChange={(e) => {
                  setKeySecret(e.target.value);
                  setErrorMsg('');
                  setStatusMsg('');
                }}
                placeholder="Enter your Razorpay Key Secret"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowSecret((v) => !v)}
                aria-label={showSecret ? 'Hide Key Secret' : 'Show Key Secret'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || saving || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlugZap className={`w-3.5 h-3.5 ${testing ? 'animate-pulse' : ''}`} />
              <span>{testing ? 'Verifying…' : 'Test Keys'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0D2E25] disabled:opacity-60 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving…' : 'Save & Activate Razorpay'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
