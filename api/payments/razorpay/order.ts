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
  const { amountInr, receipt, institutionId, purpose, notes, courseId } = body;
  const numAmount = Number(amountInr);
  if (!Number.isFinite(numAmount) || numAmount < 1 || numAmount > 10000000) {
    return sendJson(res, 400, { ok: false, error: 'Valid positive amountInr is required.' });
  }

  const effectiveInstitutionId =
    typeof institutionId === 'string' && institutionId.trim()
      ? institutionId.trim()
      : 'OPENFRAME_MARKETPLACE';

  const creds = await getActiveRazorpayCredentials();
  if (!creds.configured || !creds.keyId || !creds.keySecret) {
    return sendJson(res, 503, {
      ok: false,
      configured: false,
      error:
        creds.source === 'super_admin_disabled'
          ? 'Razorpay checkout is currently paused by the Super Admin.'
          : 'Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel Environment Variables.',
    });
  }

  const sanitizedNotes = sanitizeNotes({
    institutionId: String(effectiveInstitutionId).slice(0, 80),
    ...(courseId ? { courseId: String(courseId).slice(0, 80) } : {}),
    purpose: String(purpose || 'Course Enrollment Fee').slice(0, 120),
    requestedByUid: caller?.uid || 'guest_learner',
    ...(notes && typeof notes === 'object' ? notes : {}),
  });

  try {
    const authBasic = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
    const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authBasic}`,
      },
      body: JSON.stringify({
        amount: Math.round(numAmount * 100),
        currency: 'INR',
        receipt: String(receipt || `OFRCP_${Date.now()}`).slice(0, 40),
        notes: sanitizedNotes,
      }),
      signal: AbortSignal.timeout(10000),
    });

    const data: any = await rzpResp.json().catch(() => null);
    if (!rzpResp.ok || !data?.id) {
      const isAuthError = rzpResp.status === 401;
      return sendJson(res, rzpResp.status || 502, {
        ok: false,
        authFailed: isAuthError,
        error: isAuthError
          ? 'Razorpay API authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
          : data?.error?.description || 'Failed to create Razorpay order.',
      });
    }

    return sendJson(res, 200, { ok: true, keyId: creds.keyId, order: data });
  } catch (err: any) {
    return sendJson(res, 502, {
      ok: false,
      error: err?.message || 'Razorpay gateway request failed.',
    });
  }
}
