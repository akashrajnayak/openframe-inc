import React, { useEffect, useState, useCallback } from 'react';
import {
  CreditCard,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlugZap,
  Save,
  Trash2,
  Lock,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  db,
  auth,
  logActivity,
  handleFirestoreError,
  OperationType,
} from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';

export interface PaymentSettingsProps {
  isSuperAdmin: boolean;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface FirestorePaymentSettingsDoc {
  provider: 'razorpay';
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  mode: 'live' | 'test';
  enabled: boolean;
  updatedByUid: string;
  updatedByEmail: string;
  updatedAt: string;
}

interface ServerGatewayStatus {
  configured: boolean;
  enabled: boolean;
  keyId: string | null;
  hasSecret: boolean;
  secretPreview: string;
  hasWebhookSecret: boolean;
  mode: 'live' | 'test';
  source: 'super_admin' | 'super_admin_disabled' | 'environment' | 'unconfigured';
  updatedAt: string | null;
  updatedByEmail: string | null;
}

const RAZORPAY_DOC_PATH = 'payment_settings/razorpay';
const RAZORPAY_KEY_ID_REGEX = /^rzp_(live|test)_[a-zA-Z0-9]+$/;

function detectModeFromKeyId(keyId: string, fallback: 'live' | 'test' = 'live'): 'live' | 'test' {
  const trimmed = keyId.trim();
  if (trimmed.startsWith('rzp_test_')) return 'test';
  if (trimmed.startsWith('rzp_live_')) return 'live';
  return fallback;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  isSuperAdmin,
  showToast,
}) => {
  const { adminBearerToken } = useAuth();
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [mode, setMode] = useState<'live' | 'test'>('live');
  const [enabled, setEnabled] = useState(true);

  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const [firestoreRecordMeta, setFirestoreRecordMeta] = useState<{
    exists: boolean;
    updatedAt: string | null;
    updatedByEmail: string | null;
  }>({ exists: false, updatedAt: null, updatedByEmail: null });

  const [serverStatus, setServerStatus] = useState<ServerGatewayStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
    checkedAt: string;
    ordersApiOk?: boolean;
    paymentLinksApiOk?: boolean;
  } | null>(null);

  const getAuthToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
    const user = auth.currentUser;
    if (user) {
      try {
        const idToken = await user.getIdToken(forceRefresh);
        if (idToken) return idToken;
      } catch {
        // fall through to admin credential Bearer token
      }
    }
    return adminBearerToken || null;
  }, [adminBearerToken]);

  const fetchAdminApiWithRetry = useCallback(async (url: string, init: RequestInit): Promise<Response> => {
    let token = await getAuthToken(false);
    if (!token) {
      throw new Error('Super Admin authentication token required. Please sign in again.');
    }
    let resp = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (resp.status === 401) {
      token = await getAuthToken(true);
      if (token) {
        resp = await fetch(url, {
          ...init,
          headers: {
            ...(init.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }
    return resp;
  }, [getAuthToken]);

  const loadSettings = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);

    let fsDocData: FirestorePaymentSettingsDoc | null = null;
    if (auth.currentUser) {
      try {
        const snap = await getDoc(doc(db, 'payment_settings', 'razorpay'));
        if (snap.exists()) {
          fsDocData = snap.data() as FirestorePaymentSettingsDoc;
          setKeyId(fsDocData.keyId || '');
          setKeySecret(fsDocData.keySecret || '');
          setWebhookSecret(fsDocData.webhookSecret || '');
          setMode(detectModeFromKeyId(fsDocData.keyId || '', fsDocData.mode || 'live'));
          setEnabled(fsDocData.enabled !== false);
          setFirestoreRecordMeta({
            exists: true,
            updatedAt: fsDocData.updatedAt || null,
            updatedByEmail: fsDocData.updatedByEmail || null,
          });
        } else {
          setFirestoreRecordMeta({ exists: false, updatedAt: null, updatedByEmail: null });
        }
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, RAZORPAY_DOC_PATH);
        } catch {
          // Non-blocking: live server settings endpoint below is authoritative
        }
      }
    } else {
      setFirestoreRecordMeta({ exists: false, updatedAt: null, updatedByEmail: null });
    }

    try {
      const resp = await fetchAdminApiWithRetry('/api/admin/payment-settings', {
        method: 'GET',
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.settings) {
          const s = data.settings as ServerGatewayStatus;
          setServerStatus(s);
          if (!fsDocData && s.keyId) {
            setKeyId(s.keyId);
            setMode(s.mode || 'live');
            setEnabled(s.enabled);
          }
        }
      } else {
        const errData = await resp.json().catch(() => ({}));
        setLoadError(errData?.error || 'Unable to load Razorpay gateway status from the server.');
      }
    } catch (err: any) {
      setLoadError(err?.message || 'Unable to reach Razorpay server settings endpoint.');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, fetchAdminApiWithRetry]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleKeyIdChange = (val: string) => {
    setKeyId(val);
    setMode(detectModeFromKeyId(val, mode));
    setTestResult(null);
  };

  const validateForm = (): string | null => {
    const cleanKeyId = keyId.trim();
    const cleanSecret = keySecret.trim();
    if (!cleanKeyId) {
      return 'Razorpay Key ID is required (starts with rzp_live_ or rzp_test_).';
    }
    if (!RAZORPAY_KEY_ID_REGEX.test(cleanKeyId)) {
      return 'Invalid Razorpay Key ID format. Must start with rzp_live_ or rzp_test_ followed by alphanumeric characters.';
    }
    if (!cleanSecret && !serverStatus?.hasSecret) {
      return 'Razorpay Key Secret is required (minimum 8 characters).';
    }
    if (cleanSecret && (cleanSecret.length < 8 || cleanSecret.length > 200)) {
      return 'Razorpay Key Secret must be between 8 and 200 characters.';
    }
    if (webhookSecret.trim().length > 200) {
      return 'Webhook Secret exceeds maximum allowed length.';
    }
    return null;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    const validationError = validateForm();
    if (validationError) {
      showToast(validationError, 'error');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser && !adminBearerToken) {
      showToast('You must be signed in as Super Admin to save Razorpay keys.', 'error');
      return;
    }

    setSaving(true);
    setTestResult(null);

    const cleanKeyId = keyId.trim();
    const cleanKeySecret = keySecret.trim();
    const cleanWebhookSecret = webhookSecret.trim();
    const resolvedMode = detectModeFromKeyId(cleanKeyId, mode);
    const nowIso = new Date().toISOString();

    try {
      // 1. Primary save on server (updates live Razorpay Orders + Payment Links + Webhook endpoints immediately)
      const resp = await fetchAdminApiWithRetry('/api/admin/payment-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyId: cleanKeyId,
          ...(cleanKeySecret ? { keySecret: cleanKeySecret } : {}),
          ...(cleanWebhookSecret ? { webhookSecret: cleanWebhookSecret } : {}),
          mode: resolvedMode,
          enabled,
        }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        throw new Error(data.error || 'Failed to update Razorpay API settings on server.');
      }

      if (data.settings) {
        setServerStatus(data.settings);
      }
      setPersistenceWarning(
        typeof data.persistenceWarning === 'string' && data.persistenceWarning.trim()
          ? data.persistenceWarning.trim()
          : null
      );

      // 2. Mirror to Firestore when signed in via Firebase Super Admin (non-blocking)
      let firestoreSynced = false;
      if (cleanKeySecret && currentUser) {
        const firestorePayload: FirestorePaymentSettingsDoc = {
          provider: 'razorpay',
          keyId: cleanKeyId,
          keySecret: cleanKeySecret,
          mode: resolvedMode,
          enabled,
          updatedByUid: currentUser.uid,
          updatedByEmail: currentUser.email || 'superadmin@openframeitsolutions.com',
          updatedAt: nowIso,
          ...(cleanWebhookSecret ? { webhookSecret: cleanWebhookSecret } : {}),
        };
        try {
          await setDoc(doc(db, 'payment_settings', 'razorpay'), firestorePayload);
          firestoreSynced = true;
          setFirestoreRecordMeta({
            exists: true,
            updatedAt: nowIso,
            updatedByEmail: firestorePayload.updatedByEmail,
          });
        } catch {
          // Server-side Razorpay settings are already live even if Firestore mirror skipped
        }
      }

      if (currentUser) {
        await logActivity(
          'Updated Razorpay Gateway Credentials',
          'payment_settings',
          'razorpay',
          `Mode: ${resolvedMode.toUpperCase()} | Enabled: ${enabled ? 'Yes' : 'No'} | Key ID: ${cleanKeyId.slice(0, 14)}…`
        ).catch(() => {});
      }

      showToast(
        enabled
          ? firestoreSynced
            ? `Razorpay ${resolvedMode.toUpperCase()} API updated and linked live.`
            : `Razorpay ${resolvedMode.toUpperCase()} API updated on live checkout server.`
          : 'Razorpay credentials saved (checkout currently paused).'
      );
    } catch (err: any) {
      showToast(err?.message || 'Unable to update Razorpay API settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!isSuperAdmin) return;
    const cleanKeyId = keyId.trim();
    const cleanSecret = keySecret.trim();

    if (cleanKeyId && !RAZORPAY_KEY_ID_REGEX.test(cleanKeyId)) {
      showToast('Enter a valid Razorpay Key ID (rzp_live_... or rzp_test_...) before testing.', 'error');
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetchAdminApiWithRetry('/api/admin/payment-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          cleanKeyId && cleanSecret
            ? { keyId: cleanKeyId, keySecret: cleanSecret }
            : {}
        ),
      });
      const data = await resp.json().catch(() => ({}));
      const checkedAt = new Date().toLocaleTimeString();
      if (resp.ok && data.ok && data.verified) {
        setTestResult({
          ok: true,
          message: data.message || `Razorpay ${String(data.mode || mode).toUpperCase()} API authentication verified.`,
          checkedAt,
          ordersApiOk: Boolean(data.ordersApiOk),
          paymentLinksApiOk: Boolean(data.paymentLinksApiOk),
        });
        showToast('Razorpay API credentials verified successfully!');
      } else {
        setTestResult({
          ok: false,
          message: data.error || 'Razorpay API rejected these credentials. Double-check Key ID and Key Secret.',
          checkedAt,
          ordersApiOk: Boolean(data.ordersApiOk),
          paymentLinksApiOk: Boolean(data.paymentLinksApiOk),
        });
        showToast(data.error || 'Razorpay connection test failed.', 'error');
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err?.message || 'Unable to reach Razorpay verification endpoint.',
        checkedAt: new Date().toLocaleTimeString(),
      });
      showToast('Connection test failed.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleClearCredentials = async () => {
    if (!isSuperAdmin) return;
    setClearing(true);
    setTestResult(null);

    try {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'payment_settings', 'razorpay'));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, RAZORPAY_DOC_PATH);
        }
      }

      const resp = await fetchAdminApiWithRetry('/api/admin/payment-settings', {
        method: 'DELETE',
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data.settings) {
        setServerStatus(data.settings);
        setKeyId(data.settings.keyId || '');
        setMode(data.settings.mode || 'live');
        setEnabled(Boolean(data.settings.enabled));
      } else {
        setKeyId('');
        setEnabled(true);
        setMode('live');
      }

      setKeySecret('');
      setWebhookSecret('');
      setConfirmClear(false);
      setFirestoreRecordMeta({ exists: false, updatedAt: null, updatedByEmail: null });

      if (auth.currentUser) {
        await logActivity(
          'Cleared Razorpay Gateway Override',
          'payment_settings',
          'razorpay',
          'Removed custom Firestore/server Razorpay credentials'
        ).catch(() => {});
      }

      showToast('Saved Razorpay override cleared.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to clear Razorpay credentials.', 'error');
    } finally {
      setClearing(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-xs max-w-2xl">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h2 className="text-base font-heading font-bold text-slate-900">
              Super Admin Clearance Required
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Razorpay API keys and payment gateway secrets are strictly restricted to Super Admin principals. Contact your organization Super Admin to update payment credentials.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isLinkedLive = Boolean(serverStatus?.configured && serverStatus?.enabled);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Live Status Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-heading font-bold text-slate-900">
                  Razorpay Payment Gateway Settings
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Super Admin Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bind your Razorpay Key ID and Key Secret to Firestore and link them directly to Course Enrollments, Token Recharges, and School Finance checkout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setKeyId('');
                setKeySecret('');
                setWebhookSecret('');
                setTestResult(null);
                setPersistenceWarning(null);
                const el = document.getElementById('razorpay-key-id');
                if (el) el.focus();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Insert New Key</span>
            </button>
            <button
              type="button"
              onClick={loadSettings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Status Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Checkout Link Status
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              {isLinkedLive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-emerald-700">
                    Active &amp; Linked ({(serverStatus?.mode || mode).toUpperCase()})
                  </span>
                </>
              ) : serverStatus?.source === 'super_admin_disabled' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-amber-700">Paused by Super Admin</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Not Configured Yet</span>
                </>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Credential Source
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800 truncate">
                {serverStatus?.source === 'super_admin' || serverStatus?.source === 'super_admin_disabled'
                  ? 'Admin Database Override'
                  : serverStatus?.source === 'environment'
                  ? 'Server Environment Secrets'
                  : firestoreRecordMeta.exists
                  ? 'payment_settings/razorpay'
                  : 'Not configured yet'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Last Updated
            </div>
            <div className="mt-1.5 text-xs font-semibold text-slate-800 truncate">
              {firestoreRecordMeta.updatedAt || serverStatus?.updatedAt
                ? new Date(
                    (firestoreRecordMeta.updatedAt || serverStatus?.updatedAt) as string
                  ).toLocaleString()
                : 'Never updated in console'}
            </div>
            {(firestoreRecordMeta.updatedByEmail || serverStatus?.updatedByEmail) && (
              <div className="text-[11px] text-slate-500 truncate mt-0.5">
                by {firestoreRecordMeta.updatedByEmail || serverStatus?.updatedByEmail}
              </div>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{loadError}</span>
          </div>
        )}

        {persistenceWarning && (
          <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Action Required for Vercel Deployment</div>
              <p className="leading-relaxed">{persistenceWarning}</p>
            </div>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Razorpay Key ID */}
            <div>
              <label
                htmlFor="razorpay-key-id"
                className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                <span>Razorpay Key ID *</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    mode === 'live'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {mode === 'live' ? 'LIVE KEY' : 'TEST KEY'}
                </span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="razorpay-key-id"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={keyId}
                  onChange={(e) => handleKeyIdChange(e.target.value)}
                  placeholder="rzp_live_XXXXXXXXXXXXXX"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Public identifier from Razorpay Dashboard &rarr; Account &amp; Settings &rarr; API Keys.
              </p>
            </div>

            {/* Razorpay Key Secret */}
            <div>
              <label
                htmlFor="razorpay-key-secret"
                className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                <span>Razorpay Key Secret *</span>
                {serverStatus?.hasSecret && !keySecret && (
                  <span className="text-[10px] font-mono text-slate-500 normal-case">
                    Active: {serverStatus.secretPreview}
                  </span>
                )}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="razorpay-key-secret"
                  type={showKeySecret ? 'text' : 'password'}
                  autoComplete="new-password"
                  spellCheck={false}
                  value={keySecret}
                  onChange={(e) => {
                    setKeySecret(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={
                    serverStatus?.hasSecret
                      ? 'Leave blank to keep existing active secret, or paste new secret'
                      : 'Enter Razorpay Key Secret'
                  }
                  required={!serverStatus?.hasSecret}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKeySecret((prev) => !prev)}
                  aria-label={showKeySecret ? 'Hide Razorpay Key Secret' : 'Show Razorpay Key Secret'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Used strictly server-side for order creation and HMAC-SHA256 payment verification.
              </p>
            </div>
          </div>

          {/* Optional Webhook Secret & Enabled Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
            <div>
              <label
                htmlFor="razorpay-webhook-secret"
                className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Webhook Secret (Optional)
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="razorpay-webhook-secret"
                  type={showWebhookSecret ? 'text' : 'password'}
                  autoComplete="new-password"
                  spellCheck={false}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="Optional Razorpay webhook signing secret"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret((prev) => !prev)}
                  aria-label={showWebhookSecret ? 'Hide Webhook Secret' : 'Show Webhook Secret'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                >
                  {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="pr-3">
                <div className="text-xs font-bold text-slate-900">
                  Enable Razorpay Online Checkout
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Toggle off to temporarily pause Razorpay across checkout pages.
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((prev) => !prev)}
                className="shrink-0 text-blue-600 focus:outline-none"
              >
                {enabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-600" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* Live Test Result Feedback */}
          {testResult && (
            <div
              className={`rounded-2xl border px-4 py-3.5 text-xs flex items-start gap-3 ${
                testResult.ok
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold">
                  {testResult.ok ? 'Razorpay API Connection Verified' : 'Razorpay Verification Failed'}
                </div>
                <div className="mt-0.5 opacity-90">{testResult.message}</div>
                {(testResult.ordersApiOk !== undefined || testResult.paymentLinksApiOk !== undefined) && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        testResult.ordersApiOk
                          ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                          : 'bg-rose-100/80 border-rose-300 text-rose-900'
                      }`}
                    >
                      Orders API: {testResult.ordersApiOk ? 'OK' : 'Failed'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border ${
                        testResult.paymentLinksApiOk
                          ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900'
                          : 'bg-amber-100/80 border-amber-300 text-amber-900'
                      }`}
                    >
                      Hosted Payment Links API: {testResult.paymentLinksApiOk ? 'OK' : 'Not Enabled'}
                    </span>
                  </div>
                )}
                <div className="text-[10px] opacity-70 mt-1">Checked at {testResult.checkedAt}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-blue-500/20 whitespace-nowrap shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving & Linking…' : 'Save & Link Razorpay Keys'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing || loading || saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <PlugZap className={`w-4 h-4 ${testing ? 'animate-pulse' : ''}`} />
                <span>{testing ? 'Testing Razorpay…' : 'Test Connection'}</span>
              </button>
            </div>

            {(firestoreRecordMeta.exists ||
              serverStatus?.source === 'super_admin' ||
              serverStatus?.source === 'super_admin_disabled') && (
              <div className="flex items-center gap-2">
                {!confirmClear ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Saved Keys</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5">
                    <span className="text-[11px] font-semibold text-rose-800">Remove keys?</span>
                    <button
                      type="button"
                      onClick={handleClearCredentials}
                      disabled={clearing}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold whitespace-nowrap"
                    >
                      {clearing ? 'Clearing…' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 rounded-lg text-slate-600 hover:bg-white text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Linked Platform Checkout Flows & Setup Reference */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-7 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-heading font-bold text-white">
              Connected Checkout Flows &amp; Security Controls
            </h3>
          </div>
          <a
            href="https://dashboard.razorpay.com/app/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 whitespace-nowrap"
          >
            <span>Open Razorpay API Keys</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/80 p-3.5">
            <div className="font-bold text-white">Course Marketplace Checkout</div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Automatically uses your saved Key ID for Razorpay popup checkout and Key Secret for server-side HMAC verification.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/80 p-3.5">
            <div className="font-bold text-white">Self-Study Token Recharges</div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Links directly to student recharge order creation and cryptographic payment verification endpoints.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-800/70 border border-slate-700/80 p-3.5">
            <div className="font-bold text-white">Strict Super Admin Isolation</div>
            <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
              Firestore rules restrict <code className="text-sky-300">payment_settings/razorpay</code> strictly to Super Admins; Key Secret is never sent to public clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
