import {
  clearRazorpayGatewaySettings,
  getActiveRazorpayCredentials,
  inferRazorpayMode,
  isVerifiedSuperAdmin,
  RAZORPAY_KEY_ID_PATTERN,
  readJsonBody,
  saveRazorpayGatewaySettings,
  sendJson,
  serializeAdminPaymentSettings,
  verifyFirebaseBearerToken,
  type VercelApiRequest,
  type VercelApiResponse,
} from '../_razorpay.js';

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  const caller = await verifyFirebaseBearerToken(req);
  if (!caller) {
    return sendJson(res, 401, { ok: false, error: 'Authentication required.' });
  }
  const allowed = await isVerifiedSuperAdmin(caller);
  if (!allowed) {
    return sendJson(res, 403, { ok: false, error: 'Super Admin access required.' });
  }

  if (req.method === 'GET') {
    const creds = await getActiveRazorpayCredentials();
    return sendJson(res, 200, {
      ok: true,
      settings: serializeAdminPaymentSettings(creds),
    });
  }

  if (req.method === 'PUT') {
    const body = await readJsonBody(req);
    const { keyId, keySecret, webhookSecret, mode, enabled } = body;
    const cleanKeyId = typeof keyId === 'string' ? keyId.trim() : '';
    const submittedKeySecret = typeof keySecret === 'string' ? keySecret.trim() : '';
    const submittedWebhookSecret = typeof webhookSecret === 'string' ? webhookSecret.trim() : '';

    if (!cleanKeyId || cleanKeyId.length > 120 || !RAZORPAY_KEY_ID_PATTERN.test(cleanKeyId)) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Valid Razorpay Key ID is required (must start with rzp_live_ or rzp_test_).',
      });
    }

    const existingCreds = await getActiveRazorpayCredentials();
    const cleanKeySecret = submittedKeySecret || existingCreds.keySecret || '';
    const cleanWebhookSecret =
      typeof webhookSecret === 'string'
        ? submittedWebhookSecret
        : existingCreds.webhookSecret || '';

    if (!cleanKeySecret || cleanKeySecret.length < 8 || cleanKeySecret.length > 200) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Valid Razorpay Key Secret is required (8–200 characters).',
      });
    }
    if (cleanWebhookSecret.length > 200) {
      return sendJson(res, 400, {
        ok: false,
        error: 'Webhook secret exceeds maximum allowed length (200 characters).',
      });
    }

    const resolvedMode = inferRazorpayMode(cleanKeyId, mode === 'test' ? 'test' : 'live');
    try {
      const saved = await saveRazorpayGatewaySettings({
        keyId: cleanKeyId,
        keySecret: cleanKeySecret,
        webhookSecret: cleanWebhookSecret,
        mode: resolvedMode,
        enabled: enabled !== false,
        updatedByUid: caller.uid,
        updatedByEmail: caller.email || 'superadmin@openframeitsolutions.com',
      });
      const needsVercelEnv = Boolean(process.env.VERCEL) && !saved.persistedToDatabase;
      return sendJson(res, 200, {
        ok: true,
        persistedToDatabase: saved.persistedToDatabase,
        ...(needsVercelEnv
          ? {
              persistenceWarning:
                'Vercel serverless functions do not share in-memory keys across routes without a Postgres database. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Vercel → Project Settings → Environment Variables (Production & Preview) and click Redeploy.',
            }
          : {}),
        settings: serializeAdminPaymentSettings(saved),
      });
    } catch (err: any) {
      return sendJson(res, 500, {
        ok: false,
        error: err?.message || 'Failed to persist Razorpay settings.',
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const fallback = await clearRazorpayGatewaySettings();
      return sendJson(res, 200, {
        ok: true,
        settings: serializeAdminPaymentSettings(fallback),
      });
    } catch (err: any) {
      return sendJson(res, 500, {
        ok: false,
        error: err?.message || 'Failed to clear Razorpay settings.',
      });
    }
  }

  return sendJson(res, 405, { ok: false, error: 'Method not allowed.' });
}
