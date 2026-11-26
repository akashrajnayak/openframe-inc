import { auth } from './firebase';
import { standaloneMockService } from './standaloneMockService';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
      close?: () => void;
      on?: (event: string, cb: (payload: any) => void) => void;
    };
  }
}

export interface LiveRazorpayConfig {
  ok: boolean;
  configured: boolean;
  keyId: string | null;
  currency: string;
  note: string;
  backendReachable: boolean;
}

export interface LiveRazorpayPaymentParams {
  amountInr: number;
  courseId?: string;
  institutionId?: string;
  purpose: string;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
  userId?: string;
  courseTitle?: string;
}

export interface LiveRazorpayPaymentResult {
  verified: true;
  orderId: string;
  paymentId: string;
  signature: string;
  verifiedAt: string;
  enrollmentVerificationToken?: string;
  mode: 'live_razorpay';
}

export interface HostedRazorpayPaymentLink {
  paymentLinkId: string;
  shortUrl: string;
  status: string;
  amountInr: number;
  keyId: string;
  mode: 'live' | 'test';
}

export interface HostedRazorpayLinkStatus {
  ok: boolean;
  paid: boolean;
  status: string;
  paymentLinkId: string;
  orderId: string;
  paymentId: string | null;
  verifiedAt: string | null;
  amountPaidInr: number;
  enrollmentVerificationToken?: string | null;
}

export interface LiveRazorpayOrderStatus {
  ok: boolean;
  paid: boolean;
  status: string;
  orderId: string;
  amountInr: number;
  amountPaidInr: number;
  attempts: number;
}

export function isRunningInEmbeddedIframe(): boolean {
  try {
    return typeof window !== 'undefined' && window.self !== window.top;
  } catch {
    return true;
  }
}

function sanitizeCustomerEmail(raw?: string): string | undefined {
  const email = String(raw || '').trim().slice(0, 120);
  if (!email) return undefined;
  if (email.toLowerCase().endsWith('.local')) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)) return undefined;
  return email;
}

function sanitizeIndianMobile(raw?: string): string | undefined {
  const digits = String(raw || '').replace(/\D/g, '').slice(-10);
  return /^[6-9]\d{9}$/.test(digits) ? digits : undefined;
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptLoadPromise: Promise<void> | null = null;

async function safeParseJson(resp: Response): Promise<any | null> {
  const ct = resp.headers.get('content-type') || '';
  if (!ct.toLowerCase().includes('application/json')) {
    return null;
  }
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

async function getOptionalAuthHeader(): Promise<Record<string, string>> {
  try {
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function fetchLiveRazorpayConfig(): Promise<LiveRazorpayConfig> {
  try {
    const resp = await fetch('/api/payments/razorpay/config', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const data = await safeParseJson(resp);
    if (!resp.ok || !data) {
      return {
        ok: false,
        configured: false,
        keyId: null,
        currency: 'INR',
        note: 'Razorpay backend config endpoint did not return JSON.',
        backendReachable: false,
      };
    }
    return {
      ok: Boolean(data.ok),
      configured: Boolean(data.configured && data.keyId),
      keyId: data.keyId || null,
      currency: data.currency || 'INR',
      note: data.note || '',
      backendReachable: true,
    };
  } catch {
    return {
      ok: false,
      configured: false,
      keyId: null,
      currency: 'INR',
      note: 'Unable to reach Razorpay payment server.',
      backendReachable: false,
    };
  }
}

export function loadRazorpayCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay Checkout requires a browser environment.'));
  }
  if (typeof window.Razorpay === 'function') {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existing) {
      if (typeof window.Razorpay === 'function') {
        resolve();
        return;
      }
      existing.remove();
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    const timer = window.setTimeout(() => {
      scriptLoadPromise = null;
      script.remove();
      reject(new Error('Timed out loading Razorpay Checkout script. Please check your internet connection and retry.'));
    }, 12000);

    script.onload = () => {
      window.clearTimeout(timer);
      if (typeof window.Razorpay === 'function') {
        resolve();
      } else {
        scriptLoadPromise = null;
        reject(new Error('Razorpay Checkout script loaded but window.Razorpay was unavailable.'));
      }
    };

    script.onerror = () => {
      window.clearTimeout(timer);
      scriptLoadPromise = null;
      script.remove();
      reject(new Error('Failed to load Razorpay Checkout (checkout.razorpay.com). Check ad-blockers or network connectivity.'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

export async function launchLiveRazorpayPayment(
  params: LiveRazorpayPaymentParams
): Promise<LiveRazorpayPaymentResult> {
  const amountInr = Math.max(1, Math.round(Number(params.amountInr) || 0));
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    throw new Error('Invalid payment amount.');
  }

  const authHeaders = await getOptionalAuthHeader();

  // 1. Create authentic Razorpay order on server (uses server-side RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET)
  const orderResp = await fetch('/api/payments/razorpay/order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({
      amountInr,
      courseId: params.courseId,
      institutionId: params.institutionId || 'OPENFRAME_MARKETPLACE',
      purpose: params.purpose,
      notes: params.notes || {},
    }),
  });

  const orderData = await safeParseJson(orderResp);
  if (!orderResp.ok || !orderData?.ok || !orderData?.order?.id || !orderData?.keyId) {
    const err = new Error(
      orderData?.error ||
        `Unable to create Razorpay order (HTTP ${orderResp.status}).`
    ) as Error & { code?: string; status?: number };
    err.status = orderResp.status;
    err.code = orderData?.authFailed
      ? 'RAZORPAY_AUTH_FAILED'
      : orderResp.status === 503
      ? 'RAZORPAY_NOT_CONFIGURED'
      : 'RAZORPAY_ORDER_FAILED';
    throw err;
  }

  // 2. Load official Razorpay Standard Checkout script
  await loadRazorpayCheckoutScript();
  const RazorpayCtor = window.Razorpay;
  if (typeof RazorpayCtor !== 'function') {
    throw new Error('Razorpay Checkout SDK could not be initialized.');
  }

  const sanitizedPhone = sanitizeIndianMobile(params.customerPhone);
  const sanitizedEmail = sanitizeCustomerEmail(params.customerEmail);
  const sanitizedName = params.customerName ? params.customerName.trim().slice(0, 100) : undefined;

  // 3. Open live Razorpay Checkout modal & verify HMAC-SHA256 signature on server upon completion
  return new Promise<LiveRazorpayPaymentResult>((resolve, reject) => {
    let settled = false;

    const prefill: Record<string, string> = {};
    if (sanitizedName) prefill.name = sanitizedName;
    if (sanitizedEmail) prefill.email = sanitizedEmail;
    if (sanitizedPhone) prefill.contact = sanitizedPhone;

    const options: Record<string, any> = {
      key: orderData.keyId,
      amount: orderData.order.amount,
      currency: orderData.order.currency || 'INR',
      name: 'OpenFrame Education',
      description: params.description.slice(0, 200),
      order_id: orderData.order.id,
      ...(Object.keys(prefill).length > 0 ? { prefill } : {}),
      notes: params.notes || {},
      theme: {
        color: '#123D32',
      },
      modal: {
        ondismiss: () => {
          if (settled) return;
          settled = true;
          const cancelErr = new Error('Razorpay checkout was closed before payment completed.') as Error & {
            code?: string;
          };
          cancelErr.code = 'PAYMENT_CANCELLED';
          reject(cancelErr);
        },
      },
      handler: async (response: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      }) => {
        if (settled) return;
        try {
          const freshAuthHeaders = await getOptionalAuthHeader();
          const verifyResp = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              ...freshAuthHeaders,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: params.userId,
            }),
          });

          const verifyData = await safeParseJson(verifyResp);
          if (!verifyResp.ok || !verifyData?.verified) {
            settled = true;
            reject(
              new Error(
                verifyData?.error || 'Razorpay payment signature verification failed on server.'
              )
            );
            return;
          }

          // Mirror verified receipt in localStorage for instant offline dashboard visibility
          standaloneMockService.verifyMockRazorpayPayment({
            razorpay_order_id: String(verifyData.orderId || response.razorpay_order_id),
            razorpay_payment_id: String(verifyData.paymentId || response.razorpay_payment_id),
            razorpay_signature: String(response.razorpay_signature || ''),
            userId: params.userId,
            studentName: params.customerName,
            studentEmail: params.customerEmail,
            courseId: params.courseId,
            courseTitle: params.courseTitle,
            institutionId: params.institutionId,
            purpose: params.purpose,
            amountInr,
          });

          settled = true;
          resolve({
            verified: true,
            orderId: String(verifyData.orderId || response.razorpay_order_id),
            paymentId: String(verifyData.paymentId || response.razorpay_payment_id),
            signature: String(response.razorpay_signature || ''),
            verifiedAt: String(verifyData.verifiedAt || new Date().toISOString()),
            enrollmentVerificationToken: verifyData.enrollmentVerificationToken,
            mode: 'live_razorpay',
          });
        } catch (err: any) {
          settled = true;
          reject(new Error(err?.message || 'Unable to verify Razorpay payment signature.'));
        }
      },
    };

    try {
      const rzp = new RazorpayCtor(options);
      if (typeof rzp.on === 'function') {
        rzp.on('payment.failed', (failPayload: any) => {
          if (settled) return;
          settled = true;
          const desc =
            failPayload?.error?.description ||
            failPayload?.error?.reason ||
            'Razorpay payment failed. Please retry or use the Official Razorpay Hosted Payment Page option.';
          const failErr = new Error(desc) as Error & { code?: string };
          failErr.code = 'PAYMENT_FAILED';
          reject(failErr);
        });
      }
      rzp.open();
    } catch (openErr: any) {
      if (!settled) {
        settled = true;
        reject(new Error(openErr?.message || 'Unable to open Razorpay Checkout window.'));
      }
    }
  });
}

export async function createRazorpayPaymentLink(
  params: LiveRazorpayPaymentParams
): Promise<HostedRazorpayPaymentLink> {
  const amountInr = Math.max(1, Math.round(Number(params.amountInr) || 0));
  if (!Number.isFinite(amountInr) || amountInr <= 0) {
    throw new Error('Invalid payment amount.');
  }

  const authHeaders = await getOptionalAuthHeader();
  const resp = await fetch('/api/payments/razorpay/payment-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify({
      amountInr,
      courseId: params.courseId,
      institutionId: params.institutionId || 'OPENFRAME_MARKETPLACE',
      purpose: params.purpose,
      description: params.description,
      customerName: params.customerName,
      customerEmail: sanitizeCustomerEmail(params.customerEmail),
      customerPhone: sanitizeIndianMobile(params.customerPhone),
      notes: params.notes || {},
    }),
  });

  const data = await safeParseJson(resp);
  if (!resp.ok || !data?.ok || !data?.paymentLinkId || !data?.shortUrl) {
    const err = new Error(
      data?.error || `Unable to create Razorpay Hosted Payment Link (HTTP ${resp.status}).`
    ) as Error & { code?: string; status?: number };
    err.status = resp.status;
    err.code = data?.authFailed
      ? 'RAZORPAY_AUTH_FAILED'
      : resp.status === 503
      ? 'RAZORPAY_NOT_CONFIGURED'
      : 'RAZORPAY_LINK_FAILED';
    throw err;
  }

  const rawShortUrl = String(data.shortUrl);
  let validatedShortUrl = '';
  try {
    const parsed = new URL(rawShortUrl);
    const host = parsed.hostname.toLowerCase();
    const isOfficialHost =
      host === 'rzp.io' ||
      host.endsWith('.rzp.io') ||
      host === 'razorpay.com' ||
      host.endsWith('.razorpay.com');
    if (parsed.protocol === 'https:' && isOfficialHost) {
      validatedShortUrl = parsed.toString();
    }
  } catch {
    validatedShortUrl = '';
  }

  if (!validatedShortUrl) {
    throw new Error('Razorpay returned an unexpected payment link URL.');
  }

  return {
    paymentLinkId: String(data.paymentLinkId),
    shortUrl: validatedShortUrl,
    status: String(data.status || 'created'),
    amountInr: Number(data.amountInr || amountInr),
    keyId: String(data.keyId || ''),
    mode: data.mode === 'test' ? 'test' : 'live',
  };
}

export async function checkRazorpayPaymentLinkStatus(
  paymentLinkId: string
): Promise<HostedRazorpayLinkStatus> {
  const authHeaders = await getOptionalAuthHeader();
  const resp = await fetch(
    `/api/payments/razorpay/payment-link/${encodeURIComponent(paymentLinkId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json', ...authHeaders },
    }
  );
  const data = await safeParseJson(resp);
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.error || `Unable to check payment status (HTTP ${resp.status}).`);
  }
  return {
    ok: true,
    paid: Boolean(data.paid),
    status: String(data.status || 'created'),
    paymentLinkId: String(data.paymentLinkId || paymentLinkId),
    orderId: String(data.orderId || paymentLinkId),
    paymentId: data.paymentId ? String(data.paymentId) : null,
    verifiedAt: data.verifiedAt ? String(data.verifiedAt) : null,
    amountPaidInr: Number(data.amountPaidInr || 0),
    enrollmentVerificationToken: data.enrollmentVerificationToken
      ? String(data.enrollmentVerificationToken)
      : null,
  };
}

export async function checkRazorpayOrderStatus(
  orderId: string
): Promise<LiveRazorpayOrderStatus> {
  const resp = await fetch(
    `/api/payments/razorpay/order/${encodeURIComponent(orderId)}`,
    {
      method: 'GET',
      headers: { Accept: 'application/json' },
    }
  );
  const data = await safeParseJson(resp);
  if (!resp.ok || !data?.ok) {
    throw new Error(data?.error || `Unable to verify Razorpay order status (HTTP ${resp.status}).`);
  }
  return {
    ok: true,
    paid: Boolean(data.paid),
    status: String(data.status || 'created'),
    orderId: String(data.orderId || orderId),
    amountInr: Number(data.amountInr || 0),
    amountPaidInr: Number(data.amountPaidInr || 0),
    attempts: Number(data.attempts || 0),
  };
}
