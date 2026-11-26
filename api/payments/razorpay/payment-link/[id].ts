import crypto from 'crypto';
import {
  getActiveRazorpayCredentials,
  RAZORPAY_PLINK_ID_PATTERN,
  sendJson,
  verifyFirebaseBearerToken,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, paid: false, error: 'Method not allowed.' });
  }

  const rawId = req.query?.id;
  const linkId = String(Array.isArray(rawId) ? rawId[0] : rawId || '').trim();
  if (!RAZORPAY_PLINK_ID_PATTERN.test(linkId)) {
    return sendJson(res, 400, { ok: false, paid: false, error: 'Invalid Razorpay payment link ID.' });
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
      `https://api.razorpay.com/v1/payment_links/${encodeURIComponent(linkId)}`,
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
        error: data?.error?.description || 'Unable to verify Razorpay payment link status.',
      });
    }

    const isPaid = String(data.status || '').toLowerCase() === 'paid';
    const paymentsList = Array.isArray(data.payments) ? data.payments : [];
    const capturedPayment =
      paymentsList.find((p: any) => p?.status === 'captured' || p?.payment_id) ||
      paymentsList[0] ||
      null;
    const paymentId = String(
      capturedPayment?.payment_id || (isPaid ? `pay_${linkId.replace(/^plink_/, '')}` : '')
    );
    const orderId = String(data.order_id || linkId);
    const verifiedAt = new Date().toISOString();

    const authHeader = String(req.headers?.authorization || '').trim();
    const caller = authHeader ? await verifyFirebaseBearerToken(req).catch(() => null) : null;
    const effectiveUid = caller?.uid || String(data?.notes?.requestedByUid || 'guest_learner');
    const enrollmentVerificationToken = isPaid
      ? crypto
          .createHmac('sha256', creds.keySecret)
          .update(`${orderId}|${paymentId}|${effectiveUid}|${verifiedAt}`)
          .digest('hex')
      : null;

    return sendJson(res, 200, {
      ok: true,
      paid: isPaid,
      status: String(data.status || 'created'),
      paymentLinkId: String(data.id),
      shortUrl: String(data.short_url || ''),
      orderId,
      paymentId: isPaid ? paymentId : null,
      amountPaidInr: typeof data.amount_paid === 'number' ? Math.round(data.amount_paid / 100) : 0,
      verifiedAt: isPaid ? verifiedAt : null,
      enrollmentVerificationToken,
    });
  } catch (err: any) {
    return sendJson(res, 502, {
      ok: false,
      paid: false,
      error: err?.message || 'Unable to verify Razorpay payment status.',
    });
  }
}
