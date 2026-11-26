import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'http';

export type RazorpayMode = 'live' | 'test';

export interface ActiveRazorpayCredentials {
  configured: boolean;
  enabled: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: RazorpayMode;
  source: 'super_admin' | 'super_admin_disabled' | 'environment' | 'unconfigured';
  updatedAt: string | null;
  updatedByEmail: string | null;
}

export interface SaveRazorpaySettingsInput {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  mode: RazorpayMode;
  enabled: boolean;
  updatedByUid: string;
  updatedByEmail: string;
}

export type VercelApiRequest = IncomingMessage & {
  query?: Record<string, string | string[] | undefined>;
  body?: any;
};

export type VercelApiResponse = ServerResponse & {
  status?: (code: number) => VercelApiResponse;
  json?: (payload: any) => void;
};

export const RAZORPAY_KEY_ID_PATTERN = /^rzp_(live|test)_[a-zA-Z0-9]+$/;
export const RAZORPAY_ORDER_ID_PATTERN = /^order_[a-zA-Z0-9]+$/;
export const RAZORPAY_PLINK_ID_PATTERN = /^plink_[a-zA-Z0-9]+$/;

const SERVER_SUPER_ADMIN_EMAILS = new Set([
  'akashrajnayak@gmail.com',
  'admin@openframeitsolutions.com',
]);

let cachedFirebaseProject: { projectId: string; firestoreDatabaseId: string } | null = null;
let cachedFirebaseCerts: { certs: Record<string, string>; expiresAt: number } | null = null;
let memoryOverride: {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  mode: RazorpayMode;
  enabled: boolean;
  updatedByUid: string;
  updatedByEmail: string;
  updatedAt: string;
} | null = null;

export function inferRazorpayMode(keyId: string, fallback: RazorpayMode = 'live'): RazorpayMode {
  const trimmed = String(keyId || '').trim();
  if (trimmed.startsWith('rzp_test_')) return 'test';
  if (trimmed.startsWith('rzp_live_')) return 'live';
  return fallback;
}

export function maskSecretValue(secret: string): string {
  const s = String(secret || '').trim();
  if (!s) return '';
  if (s.length <= 4) return '••••';
  return `${'•'.repeat(Math.min(12, Math.max(6, s.length - 4)))}${s.slice(-4)}`;
}

function isSqlConfigured(): boolean {
  return Boolean(process.env.SQL_HOST && process.env.SQL_USER && process.env.SQL_DB_NAME);
}

async function runSqlQuery<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
  if (!isSqlConfigured()) return null;
  try {
    const pgMod = await import('pg');
    const PoolCtor = pgMod.default?.Pool || pgMod.Pool;
    const pool = new PoolCtor({
      host: process.env.SQL_HOST,
      port: Number(process.env.SQL_PORT || 5432),
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 2,
      connectionTimeoutMillis: 5000,
    });
    try {
      const result = await pool.query(sql, params);
      return result.rows as T[];
    } finally {
      await pool.end().catch(() => {});
    }
  } catch {
    return null;
  }
}

function resolveFromEnvironment(): ActiveRazorpayCredentials {
  const envKeyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const envKeySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const envWebhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

  if (envKeyId && envKeySecret) {
    return {
      configured: true,
      enabled: true,
      keyId: envKeyId,
      keySecret: envKeySecret,
      webhookSecret: envWebhookSecret,
      mode: inferRazorpayMode(envKeyId, 'live'),
      source: 'environment',
      updatedAt: null,
      updatedByEmail: null,
    };
  }

  return {
    configured: false,
    enabled: false,
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    mode: 'live',
    source: 'unconfigured',
    updatedAt: null,
    updatedByEmail: null,
  };
}

export async function getActiveRazorpayCredentials(): Promise<ActiveRazorpayCredentials> {
  if (isSqlConfigured()) {
    const rows = await runSqlQuery<any>(
      'SELECT key_id, key_secret, webhook_secret, mode, enabled, updated_by_email, updated_at FROM payment_gateway_settings WHERE provider = $1 LIMIT 1',
      ['razorpay']
    );
    const row = rows?.[0];
    if (row) {
      const keyId = String(row.key_id || '').trim();
      const keySecret = String(row.key_secret || '').trim();
      const webhookSecret = String(row.webhook_secret || '').trim();
      const enabled = Boolean(row.enabled);
      return {
        configured: Boolean(enabled && keyId && keySecret),
        enabled,
        keyId,
        keySecret,
        webhookSecret,
        mode: inferRazorpayMode(keyId, row.mode === 'test' ? 'test' : 'live'),
        source: enabled ? 'super_admin' : 'super_admin_disabled',
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
        updatedByEmail: row.updated_by_email ? String(row.updated_by_email) : null,
      };
    }
  }

  if (memoryOverride) {
    return {
      configured: Boolean(memoryOverride.enabled && memoryOverride.keyId && memoryOverride.keySecret),
      enabled: memoryOverride.enabled,
      keyId: memoryOverride.keyId,
      keySecret: memoryOverride.keySecret,
      webhookSecret: memoryOverride.webhookSecret,
      mode: inferRazorpayMode(memoryOverride.keyId, memoryOverride.mode),
      source: memoryOverride.enabled ? 'super_admin' : 'super_admin_disabled',
      updatedAt: memoryOverride.updatedAt,
      updatedByEmail: memoryOverride.updatedByEmail,
    };
  }

  return resolveFromEnvironment();
}

export async function saveRazorpayGatewaySettings(
  input: SaveRazorpaySettingsInput
): Promise<ActiveRazorpayCredentials> {
  const now = new Date();
  const cleanKeyId = input.keyId.trim();
  const cleanKeySecret = input.keySecret.trim();
  const cleanWebhookSecret = (input.webhookSecret || '').trim();
  const resolvedMode = inferRazorpayMode(cleanKeyId, input.mode);

  memoryOverride = {
    keyId: cleanKeyId,
    keySecret: cleanKeySecret,
    webhookSecret: cleanWebhookSecret,
    mode: resolvedMode,
    enabled: Boolean(input.enabled),
    updatedByUid: input.updatedByUid,
    updatedByEmail: input.updatedByEmail,
    updatedAt: now.toISOString(),
  };

  if (isSqlConfigured()) {
    await runSqlQuery(
      `INSERT INTO payment_gateway_settings
         (provider, key_id, key_secret, webhook_secret, mode, enabled, updated_by_uid, updated_by_email, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (provider) DO UPDATE SET
         key_id = EXCLUDED.key_id,
         key_secret = EXCLUDED.key_secret,
         webhook_secret = EXCLUDED.webhook_secret,
         mode = EXCLUDED.mode,
         enabled = EXCLUDED.enabled,
         updated_by_uid = EXCLUDED.updated_by_uid,
         updated_by_email = EXCLUDED.updated_by_email,
         updated_at = EXCLUDED.updated_at`,
      [
        'razorpay',
        cleanKeyId,
        cleanKeySecret,
        cleanWebhookSecret || null,
        resolvedMode,
        Boolean(input.enabled),
        input.updatedByUid,
        input.updatedByEmail,
        now,
      ]
    );
  }

  return {
    configured: Boolean(input.enabled && cleanKeyId && cleanKeySecret),
    enabled: Boolean(input.enabled),
    keyId: cleanKeyId,
    keySecret: cleanKeySecret,
    webhookSecret: cleanWebhookSecret,
    mode: resolvedMode,
    source: input.enabled ? 'super_admin' : 'super_admin_disabled',
    updatedAt: now.toISOString(),
    updatedByEmail: input.updatedByEmail,
  };
}

export async function clearRazorpayGatewaySettings(): Promise<ActiveRazorpayCredentials> {
  memoryOverride = null;
  if (isSqlConfigured()) {
    await runSqlQuery('DELETE FROM payment_gateway_settings WHERE provider = $1', ['razorpay']);
  }
  return getActiveRazorpayCredentials();
}

function getFirebaseProjectConfig(): { projectId: string; firestoreDatabaseId: string } {
  if (cachedFirebaseProject) return cachedFirebaseProject;
  try {
    const cfgPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    const raw = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
    cachedFirebaseProject = {
      projectId: String(raw?.projectId || process.env.FIREBASE_PROJECT_ID || '').trim(),
      firestoreDatabaseId: String(raw?.firestoreDatabaseId || '(default)').trim(),
    };
  } catch {
    cachedFirebaseProject = {
      projectId: String(process.env.FIREBASE_PROJECT_ID || '').trim(),
      firestoreDatabaseId: String(process.env.FIRESTORE_DATABASE_ID || '(default)').trim(),
    };
  }
  return cachedFirebaseProject;
}

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (cachedFirebaseCerts && Date.now() < cachedFirebaseCerts.expiresAt) {
    return cachedFirebaseCerts.certs;
  }
  const resp = await fetch(
    'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
    { signal: AbortSignal.timeout(8000) }
  );
  if (!resp.ok) {
    throw new Error('Unable to fetch Firebase verification certificates.');
  }
  const certs = (await resp.json()) as Record<string, string>;
  const cacheControl = resp.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/i);
  const ttlMs = maxAgeMatch ? Math.max(60, Number(maxAgeMatch[1])) * 1000 : 300_000;
  cachedFirebaseCerts = { certs, expiresAt: Date.now() + ttlMs };
  return certs;
}

export interface VerifiedFirebaseUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  rawToken: string;
}

export async function verifyFirebaseBearerToken(
  req: VercelApiRequest
): Promise<VerifiedFirebaseUser | null> {
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (header.alg !== 'RS256' || !header.kid) return null;

    const certs = await getFirebasePublicCerts();
    const certPem = certs[header.kid];
    if (!certPem) return null;

    const signedInput = `${parts[0]}.${parts[1]}`;
    const signature = Buffer.from(parts[2], 'base64url');
    const isValidSig = crypto.verify(
      'RSA-SHA256',
      Buffer.from(signedInput, 'utf8'),
      certPem,
      signature
    );
    if (!isValidSig) return null;

    const nowSec = Math.floor(Date.now() / 1000);
    const { projectId } = getFirebaseProjectConfig();
    if (!projectId || payload.aud !== projectId) return null;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return null;
    if (typeof payload.exp !== 'number' || payload.exp + 60 <= nowSec) return null;
    if (typeof payload.sub !== 'string' || !payload.sub) return null;

    return {
      uid: payload.sub,
      email: String(payload.email || '').toLowerCase(),
      emailVerified: Boolean(payload.email_verified),
      rawToken: token,
    };
  } catch {
    return null;
  }
}

export async function isVerifiedSuperAdmin(user: VerifiedFirebaseUser): Promise<boolean> {
  if (user.emailVerified && SERVER_SUPER_ADMIN_EMAILS.has(user.email)) {
    return true;
  }
  const { projectId, firestoreDatabaseId } = getFirebaseProjectConfig();
  if (!projectId) return false;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/admin_users/${encodeURIComponent(user.uid)}`;
  try {
    const resp = await fetch(url, {
      headers: { Authorization: `Bearer ${user.rawToken}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!resp.ok) return false;
    const doc = (await resp.json()) as any;
    const fields = doc.fields || {};
    const isActive = fields.isActive?.booleanValue === true;
    const role = fields.role?.stringValue || '';
    return isActive && role === 'Super Admin';
  } catch {
    return false;
  }
}

export function sendJson(res: VercelApiResponse, statusCode: number, payload: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

export async function readRawBody(req: VercelApiRequest): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body, 'utf8');
  if (req.body && typeof req.body === 'object') {
    return Buffer.from(JSON.stringify(req.body), 'utf8');
  }
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function readJsonBody(req: VercelApiRequest): Promise<Record<string, any>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = (await readRawBody(req)).toString('utf8').trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function sanitizeNotes(rawNotes: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawNotes)) {
    if (Object.keys(out).length >= 12) break;
    if (v === undefined || v === null) continue;
    const ck = String(k).trim().slice(0, 60);
    const cv = String(v).trim().slice(0, 200);
    if (ck && cv) out[ck] = cv;
  }
  return out;
}

export function serializeAdminPaymentSettings(creds: ActiveRazorpayCredentials) {
  return {
    configured: creds.configured,
    enabled: creds.enabled,
    keyId: creds.keyId || null,
    hasSecret: Boolean(creds.keySecret),
    secretPreview: maskSecretValue(creds.keySecret),
    hasWebhookSecret: Boolean(creds.webhookSecret),
    mode: creds.mode,
    source: creds.source,
    updatedAt: creds.updatedAt,
    updatedByEmail: creds.updatedByEmail,
  };
}
