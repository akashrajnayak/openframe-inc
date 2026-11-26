import {
  getActiveRazorpayCredentials,
  inferRazorpayMode,
  isVerifiedSuperAdmin,
  RAZORPAY_KEY_ID_PATTERN,
  readJsonBody,
  sendJson,
  verifyFirebaseBearerToken,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, verified: false, error: 'Method not allowed.' });
  }

  const caller = await verifyFirebaseBearerToken(req);
  if (!caller) {
    return sendJson(res, 401, { ok: false, verified: false, error: 'Authentication required.' });
  }
  const allowed = await isVerifiedSuperAdmin(caller);
  if (!allowed) {
    return sendJson(res, 403, { ok: false, verified: false, error: 'Super Admin access required.' });
  }

  const active = await getActiveRazorpayCredentials();
  const body = await readJsonBody(req);
  const submittedKeyId = typeof body?.keyId === 'string' ? body.keyId.trim() : '';
  const submittedSecret = typeof body?.keySecret === 'string' ? body.keySecret.trim() : '';

  const testKeyId = submittedKeyId || active.keyId;
  const testSecret = submittedSecret || active.keySecret;

  if (!testKeyId || !testSecret) {
    return sendJson(res, 400, {
      ok: false,
      verified: false,
      error: 'Provide both Razorpay Key ID and Key Secret (or save them first) to test the connection.',
    });
  }
  if (!RAZORPAY_KEY_ID_PATTERN.test(testKeyId)) {
    return sendJson(res, 400, {
      ok: false,
      verified: false,
      error: 'Invalid Razorpay Key ID format. Must start with rzp_live_ or rzp_test_.',
    });
  }

  try {
    const authBasic = Buffer.from(`${testKeyId}:${testSecret}`).toString('base64');
    const [ordersResp, linksResp] = await Promise.all([
      fetch('https://api.razorpay.com/v1/orders?count=1', {
        method: 'GET',
        headers: { Authorization: `Basic ${authBasic}` },
        signal: AbortSignal.timeout(10000),
      }),
      fetch('https://api.razorpay.com/v1/payment_links?count=1', {
        method: 'GET',
        headers: { Authorization: `Basic ${authBasic}` },
        signal: AbortSignal.timeout(10000),
      }).catch(() => null),
    ]);

    const testMode = inferRazorpayMode(testKeyId, 'live');
    const ordersApiOk = ordersResp.ok;
    const paymentLinksApiOk = Boolean(linksResp && linksResp.ok);

    if (ordersApiOk) {
      return sendJson(res, 200, {
        ok: true,
        verified: true,
        mode: testMode,
        ordersApiOk,
        paymentLinksApiOk,
        keyIdPrefix: testKeyId.slice(0, 14),
        message: paymentLinksApiOk
          ? `Razorpay ${testMode.toUpperCase()} Orders API & Hosted Payment Links API authenticated successfully.`
          : `Razorpay ${testMode.toUpperCase()} Orders API verified (Hosted Payment Links API not enabled on merchant account).`,
      });
    }

    const errBody: any = await ordersResp.json().catch(() => ({}));
    const isAuthErr = ordersResp.status === 401;
    return sendJson(res, isAuthErr ? 401 : 502, {
      ok: false,
      verified: false,
      ordersApiOk: false,
      paymentLinksApiOk,
      mode: testMode,
      error: isAuthErr
        ? 'Razorpay rejected these credentials (401 Unauthorized). Check that your Key ID and Key Secret match.'
        : errBody?.error?.description || `Razorpay API returned HTTP ${ordersResp.status}.`,
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      ok: false,
      verified: false,
      ordersApiOk: false,
      paymentLinksApiOk: false,
      error: err?.message || 'Unable to connect to Razorpay API.',
    });
  }
}
