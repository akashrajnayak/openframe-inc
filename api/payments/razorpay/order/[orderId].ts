import {
  getActiveRazorpayCredentials,
  RAZORPAY_ORDER_ID_PATTERN,
  sendJson,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, paid: false, error: 'Method not allowed.' });
  }

  const rawId = req.query?.orderId;
  const orderId = String(Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
  if (!RAZORPAY_ORDER_ID_PATTERN.test(orderId)) {
    return sendJson(res, 400, { ok: false, paid: false, error: 'Invalid Razorpay order ID.' });
  }

  const creds = await getActiveRazorpayCredentials();
  if (!creds.configured || !creds.keyId || !creds.keySecret) {
    return sendJson(res, 503, {
      ok: false,
      paid: false,
      error: 'Razorpay credentials are not configured on the server.',
    });
  }

  try {
    const authBasic = Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString('base64');
    const rzpResp = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Basic ${authBasic}` },
        signal: AbortSignal.timeout(10000),
      }
    );
    const data: any = await rzpResp.json().catch(() => null);
    if (!rzpResp.ok || !data?.id) {
      return sendJson(res, rzpResp.status || 502, {
        ok: false,
        paid: false,
        error: data?.error?.description || 'Unable to fetch Razorpay order status.',
      });
    }

    const isPaid = String(data.status || '').toLowerCase() === 'paid';
    return sendJson(res, 200, {
      ok: true,
      paid: isPaid,
      status: String(data.status || 'created'),
      orderId: String(data.id),
      amountInr: typeof data.amount === 'number' ? Math.round(data.amount / 100) : 0,
      amountPaidInr: typeof data.amount_paid === 'number' ? Math.round(data.amount_paid / 100) : 0,
      attempts: Number(data.attempts || 0),
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      ok: false,
      paid: false,
      error: err?.message || 'Unable to verify Razorpay order status.',
    });
  }
}
