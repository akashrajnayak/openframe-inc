import {
  getActiveRazorpayCredentials,
  getRazorpayEnvDiagnostics,
  sendJson,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
  }

  const creds = await getActiveRazorpayCredentials();
  const diag = getRazorpayEnvDiagnostics();
  let unconfiguredNote =
    'Razorpay credentials not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel → Settings → Environment Variables (Production) and Redeploy.';
  if (diag.hasKeyId && !diag.hasKeySecret) {
    unconfiguredNote =
      'RAZORPAY_KEY_ID is set, but RAZORPAY_KEY_SECRET is missing in Vercel Environment Variables. Add RAZORPAY_KEY_SECRET and Redeploy.';
  } else if (!diag.hasKeyId && diag.hasKeySecret) {
    unconfiguredNote =
      'RAZORPAY_KEY_SECRET is set, but RAZORPAY_KEY_ID is missing in Vercel Environment Variables. Add RAZORPAY_KEY_ID and Redeploy.';
  }

  return sendJson(res, 200, {
    ok: true,
    gateway: 'razorpay',
    configured: creds.configured,
    keyId: creds.configured ? creds.keyId : null,
    mode: creds.mode,
    currency: 'INR',
    note: creds.configured
      ? `Razorpay ${creds.mode.toUpperCase()} server-side verification active.`
      : creds.source === 'super_admin_disabled'
      ? 'Razorpay online checkout is currently paused by Super Admin.'
      : unconfiguredNote,
  });
}
