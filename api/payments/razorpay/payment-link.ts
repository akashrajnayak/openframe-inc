import {
  getActiveRazorpayCredentials,
  readJsonBody,
  sanitizeNotes,
  sendJson,
  verifyFirebaseBearerToken,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const authHeader = String(req.headers?.authorization || '').trim();
  const caller = authHeader ? await verifyFirebaseBearerToken(req).catch(() => null) : null;

  const body = await readJsonBody(req);
  const {
    amountInr,
    courseId,
    institutionId,
    purpose,
    description,
    customerName,
    customerEmail,
    customerPhone,
    notes,
  } = body;

  const numAmount = Number(amountInr);
  if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 10000000) {
    return sendJson(res, 400, { ok: false, error: 'Valid positive amountInr is required.' });
  }

  const creds = await getActiveRazorpayCredentials();
  if (!creds.configured || !creds.keyId || !creds.keySecret) {
    return sendJson(res, 503, {
      ok: false,
      configured: false,
      error:
        'Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables.',
    });
  }

  const cleanName = typeof customerName === 'string' ? customerName.trim().slice(0, 100) : '';
  const rawEmail = typeof customerEmail === 'string' ? customerEmail.trim().slice(0, 120) : '';
  const validEmail =
    /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(rawEmail) && !rawEmail.toLowerCase().endsWith('.local')
      ? rawEmail
      : '';
  const digitsPhone = String(customerPhone || '').replace(/\D/g, '').slice(-10);
  const validPhone = /^[6-9]\d{9}$/.test(digitsPhone) ? `+91${digitsPhone}` : '';

  const customerObj: Record<string, string> = {};
  if (cleanName) customerObj.name = cleanName;
  if (validEmail) customerObj.email = validEmail;
  if (validPhone) customerObj.contact = validPhone;

  const sanitizedNotes = sanitizeNotes({
    institutionId: String(institutionId || 'OPENFRAME_MARKETPLACE').slice(0, 80),
    ...(courseId ? { courseId: String(courseId).slice(0, 80) } : {}),
    purpose: String(purpose || 'Course Enrollment Fee').slice(0, 120),
    requestedByUid: caller?.uid || 'guest_learner',
    ...(notes && typeof notes === 'object' ? notes : {}),
  });

  const expireByUnix = Math.floor(Date.now() / 1000) + 30 * 60;
  const payload: Record<string, any> = {
    amount: Math.round(numAmount * 100),
    currency: 'INR',
    accept_partial: false,
    expire_by: expireByUnix,
    reference_id: `OFPL_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`.slice(0, 40),
    description: String(description || purpose || 'OpenFrame Education Course Enrollment').slice(0, 200),
    notes: sanitizedNotes,
    notify: { sms: false, email: false },
    reminder_enable: false,
  };
  if (Object.keys(customerObj).length > 0) {
    payload.customer = customerObj;
  }

  try {
    const authBasic = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
    const rzpResp = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authBasic}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    const data: any = await rzpResp.json().catch(() => null);
    if (!rzpResp.ok || !data?.id || !data?.short_url) {
      const isAuthError = rzpResp.status === 401;
      return sendJson(res, rzpResp.status || 502, {
        ok: false,
        authFailed: isAuthError,
        error: isAuthError
          ? 'Razorpay API authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
          : data?.error?.description || 'Unable to create Razorpay Hosted Payment Link.',
      });
    }

    return sendJson(res, 200, {
      ok: true,
      keyId: creds.keyId,
      mode: creds.mode,
      paymentLinkId: String(data.id),
      shortUrl: String(data.short_url),
      status: String(data.status || 'created'),
      amountInr: Math.round(numAmount),
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      ok: false,
      error: err?.message || 'Unable to reach Razorpay Payment Links API.',
    });
  }
}
