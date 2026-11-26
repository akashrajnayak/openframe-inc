import crypto from 'crypto';
import {
  getActiveRazorpayCredentials,
  readJsonBody,
  sendJson,
  verifyFirebaseBearerToken,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { verified: false, error: 'Method not allowed.' });
  }

  const authHeader = String(req.headers?.authorization || '').trim();
  const caller = authHeader ? await verifyFirebaseBearerToken(req).catch(() => null) : null;

  const body = await readJsonBody(req);
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendJson(res, 400, {
      verified: false,
      error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
    });
  }

  const creds = await getActiveRazorpayCredentials();
  if (!creds.configured || !creds.keySecret) {
    return sendJson(res, 503, {
      verified: false,
      error: 'Razorpay Key Secret is not configured on the server.',
    });
  }

  const expectedHex = crypto
    .createHmac('sha256', creds.keySecret)
    .update(`${String(razorpay_order_id)}|${String(razorpay_payment_id)}`)
    .digest('hex');

  const providedBuf = Buffer.from(String(razorpay_signature).toLowerCase(), 'utf8');
  const expectedBuf = Buffer.from(expectedHex.toLowerCase(), 'utf8');
  const isMatch =
    providedBuf.length === expectedBuf.length && crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isMatch) {
    return sendJson(res, 400, {
      verified: false,
      error: 'Razorpay payment signature verification failed.',
    });
  }

  const verifiedAt = new Date().toISOString();
  const effectiveUid =
    caller?.uid ||
    (typeof userId === 'string' && userId.trim() ? userId.trim().slice(0, 128) : 'guest_learner');
  const enrollmentVerificationToken = crypto
    .createHmac('sha256', creds.keySecret)
    .update(`${String(razorpay_order_id)}|${String(razorpay_payment_id)}|${effectiveUid}|${verifiedAt}`)
    .digest('hex');

  return sendJson(res, 200, {
    verified: true,
    orderId: String(razorpay_order_id),
    paymentId: String(razorpay_payment_id),
    verifiedByUid: effectiveUid,
    verifiedAt,
    enrollmentVerificationToken,
  });
}
