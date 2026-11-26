import crypto from 'crypto';
import {
  getActiveRazorpayCredentials,
  readRawBody,
  sendJson,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const signature = String(req.headers?.['x-razorpay-signature'] || '');
  const creds = await getActiveRazorpayCredentials();
  const webhookSecret = creds.webhookSecret || creds.keySecret || '';

  if (!webhookSecret) {
    return sendJson(res, 503, { ok: false, error: 'Razorpay webhook secret is not configured.' });
  }
  if (!signature) {
    return sendJson(res, 400, { ok: false, error: 'Missing x-razorpay-signature header.' });
  }

  const rawBody = await readRawBody(req);
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  const a = Buffer.from(signature.toLowerCase(), 'utf8');
  const b = Buffer.from(expected.toLowerCase(), 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return sendJson(res, 400, { ok: false, error: 'Invalid Razorpay webhook signature.' });
  }

  let event = 'unknown';
  try {
    const parsed = JSON.parse(rawBody.toString('utf8'));
    if (parsed?.event) event = String(parsed.event);
  } catch {
    // Non-JSON payload already signature-verified
  }

  return sendJson(res, 200, {
    ok: true,
    verified: true,
    event,
    receivedAt: new Date().toISOString(),
  });
}
