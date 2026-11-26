import { eq } from 'drizzle-orm';
import { db, isSqlConfigured } from './index.ts';
import { paymentGatewaySettings } from './schema.ts';

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

interface CachedRecord {
  fetchedAt: number;
  value: ActiveRazorpayCredentials;
}

const CACHE_TTL_MS = 15_000;
let cachedCredentials: CachedRecord | null = null;
let memoryFallbackRecord: {
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

export function invalidateRazorpayCache(): void {
  cachedCredentials = null;
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
  if (cachedCredentials && Date.now() - cachedCredentials.fetchedAt < CACHE_TTL_MS) {
    return cachedCredentials.value;
  }

  if (isSqlConfigured()) {
    try {
      const rows = await db
        .select()
        .from(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.provider, 'razorpay'))
        .limit(1);

      const row = rows[0];
      if (row) {
        const mode = inferRazorpayMode(row.keyId, row.mode === 'test' ? 'test' : 'live');
        const result: ActiveRazorpayCredentials = {
          configured: Boolean(row.enabled && row.keyId.trim() && row.keySecret.trim()),
          enabled: Boolean(row.enabled),
          keyId: row.keyId.trim(),
          keySecret: row.keySecret.trim(),
          webhookSecret: (row.webhookSecret || '').trim(),
          mode,
          source: row.enabled ? 'super_admin' : 'super_admin_disabled',
          updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
          updatedByEmail: row.updatedByEmail || null,
        };
        cachedCredentials = { fetchedAt: Date.now(), value: result };
        return result;
      }
    } catch {
      // Fall through to memory fallback or environment variables if SQL is transiently unavailable
    }
  }

  if (memoryFallbackRecord) {
    const rec = memoryFallbackRecord;
    const result: ActiveRazorpayCredentials = {
      configured: Boolean(rec.enabled && rec.keyId && rec.keySecret),
      enabled: rec.enabled,
      keyId: rec.keyId,
      keySecret: rec.keySecret,
      webhookSecret: rec.webhookSecret,
      mode: inferRazorpayMode(rec.keyId, rec.mode),
      source: rec.enabled ? 'super_admin' : 'super_admin_disabled',
      updatedAt: rec.updatedAt,
      updatedByEmail: rec.updatedByEmail,
    };
    cachedCredentials = { fetchedAt: Date.now(), value: result };
    return result;
  }

  const envCreds = resolveFromEnvironment();
  cachedCredentials = { fetchedAt: Date.now(), value: envCreds };
  return envCreds;
}

export async function saveRazorpayGatewaySettings(
  input: SaveRazorpaySettingsInput
): Promise<ActiveRazorpayCredentials> {
  const now = new Date();
  const cleanKeyId = input.keyId.trim();
  const cleanKeySecret = input.keySecret.trim();
  const cleanWebhookSecret = (input.webhookSecret || '').trim();
  const resolvedMode = inferRazorpayMode(cleanKeyId, input.mode);

  memoryFallbackRecord = {
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
    try {
      await db
        .insert(paymentGatewaySettings)
        .values({
          provider: 'razorpay',
          keyId: cleanKeyId,
          keySecret: cleanKeySecret,
          webhookSecret: cleanWebhookSecret || null,
          mode: resolvedMode,
          enabled: Boolean(input.enabled),
          updatedByUid: input.updatedByUid,
          updatedByEmail: input.updatedByEmail,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: paymentGatewaySettings.provider,
          set: {
            keyId: cleanKeyId,
            keySecret: cleanKeySecret,
            webhookSecret: cleanWebhookSecret || null,
            mode: resolvedMode,
            enabled: Boolean(input.enabled),
            updatedByUid: input.updatedByUid,
            updatedByEmail: input.updatedByEmail,
            updatedAt: now,
          },
        });
    } catch (sqlErr: any) {
      console.warn(
        '[RazorpaySettings] Cloud SQL persistence warning (active in-memory override preserved):',
        sqlErr?.message || sqlErr
      );
    }
  }

  const saved: ActiveRazorpayCredentials = {
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
  invalidateRazorpayCache();
  cachedCredentials = { fetchedAt: Date.now(), value: saved };
  return saved;
}

export async function clearRazorpayGatewaySettings(): Promise<ActiveRazorpayCredentials> {
  memoryFallbackRecord = null;
  invalidateRazorpayCache();

  if (isSqlConfigured()) {
    try {
      await db
        .delete(paymentGatewaySettings)
        .where(eq(paymentGatewaySettings.provider, 'razorpay'));
    } catch (sqlErr: any) {
      console.warn(
        '[RazorpaySettings] Cloud SQL clear warning (in-memory override cleared):',
        sqlErr?.message || sqlErr
      );
    }
  }

  return getActiveRazorpayCredentials();
}
