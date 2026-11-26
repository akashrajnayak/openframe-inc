import crypto from 'crypto';
import type { Express, Request, Response } from 'express';

interface ClaimedAdminCredential {
  username: string;
  saltHex: string;
  hashHex: string;
  createdAt: string;
}

interface AdminTokenPayload {
  sub: string;
  username: string;
  role: 'Super Admin';
  email: string;
  iat: number;
  exp: number;
  jti: string;
}

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 10;

// Ephemeral in-memory HMAC signing secret if ADMIN_SESSION_SECRET is not set in env
const SIGNING_SECRET =
  (process.env.ADMIN_SESSION_SECRET || '').trim() ||
  crypto.randomBytes(32).toString('hex');

// One-time claimed fallback credential (always overridden if ADMIN_PASSWORD env var is set)
let claimedAdmin: ClaimedAdminCredential | null = null;
const revokedTokenIds = new Set<string>();
const failedAttemptsByIp = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = failedAttemptsByIp.get(ip);
  if (!entry || now >= entry.resetAt) {
    failedAttemptsByIp.delete(ip);
    return { allowed: true };
  }
  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = failedAttemptsByIp.get(ip);
  if (!entry || now >= entry.resetAt) {
    failedAttemptsByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttemptsByIp.delete(ip);
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function hashPasswordScrypt(password: string, saltHex: string): string {
  return crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64).toString('hex');
}

function verifyPasswordScrypt(password: string, saltHex: string, expectedHashHex: string): boolean {
  const derived = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
  const expected = Buffer.from(expectedHashHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function hasEnvCredentials(): boolean {
  return Boolean((process.env.ADMIN_PASSWORD || '').trim());
}

function getEnvUsername(): string {
  return (process.env.ADMIN_USERNAME || 'openframe_admin').trim();
}

function signAdminToken(username: string): { token: string; payload: AdminTokenPayload } {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    sub: `admin_cred:${username.toLowerCase()}`,
    username,
    role: 'Super Admin',
    email: username.includes('@') ? username : `${username}@openframeitsolutions.com`,
    iat: nowSec,
    exp: nowSec + SESSION_TTL_SECONDS,
    jti: crypto.randomBytes(16).toString('hex'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(encodedPayload)
    .digest('base64url');
  return { token: `${encodedPayload}.${signature}`, payload };
}

export function verifyAdminBearerToken(authHeader?: string): AdminTokenPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const rawToken = authHeader.slice(7).trim();
  const parts = rawToken.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(encodedPayload)
    .digest('base64url');

  const bufA = Buffer.from(providedSig, 'utf8');
  const bufB = Buffer.from(expectedSig, 'utf8');
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AdminTokenPayload;
    const nowSec = Math.floor(Date.now() / 1000);
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp <= nowSec) return null;
    if (revokedTokenIds.has(parsed.jti)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function validateUsername(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length < 3 || trimmed.length > 64) return null;
  if (!/^[a-zA-Z0-9._@-]+$/.test(trimmed)) return null;
  return trimmed;
}

function validatePassword(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  if (raw.length < 10 || raw.length > 128) return null;
  return raw;
}

export function registerAdminAuthRoutes(app: Express): void {
  // 1. Check whether admin credentials are configured or awaiting first-run setup
  app.get('/api/admin/auth/status', (_req: Request, res: Response) => {
    if (hasEnvCredentials()) {
      return res.json({
        ok: true,
        configured: true,
        needsSetup: false,
        source: 'environment',
        usernameHint: getEnvUsername(),
      });
    }
    if (claimedAdmin) {
      return res.json({
        ok: true,
        configured: true,
        needsSetup: false,
        source: 'claimed',
        usernameHint: claimedAdmin.username,
      });
    }
    return res.json({
      ok: true,
      configured: false,
      needsSetup: true,
      source: 'unconfigured',
      usernameHint: 'openframe_admin',
    });
  });

  // 2. One-time atomic first-run admin credential claim (locked once claimed or when env secret exists)
  app.post('/api/admin/auth/bootstrap', (req: Request, res: Response) => {
    if (hasEnvCredentials() || claimedAdmin) {
      return res.status(409).json({
        ok: false,
        error: 'Admin credentials are already configured. Please sign in with your existing username and password.',
      });
    }

    const username = validateUsername(req.body?.username);
    const password = validatePassword(req.body?.password);

    if (!username) {
      return res.status(400).json({
        ok: false,
        error: 'Username must be 3–64 characters using letters, numbers, or . _ @ -',
      });
    }
    if (!password) {
      return res.status(400).json({
        ok: false,
        error: 'Password must be at least 10 characters long.',
      });
    }

    const saltHex = crypto.randomBytes(16).toString('hex');
    const hashHex = hashPasswordScrypt(password, saltHex);

    claimedAdmin = {
      username,
      saltHex,
      hashHex,
      createdAt: new Date().toISOString(),
    };

    const { token, payload } = signAdminToken(username);
    return res.status(201).json({
      ok: true,
      token,
      admin: {
        username: payload.username,
        email: payload.email,
        displayName: `Admin (${payload.username})`,
        role: payload.role,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      },
    });
  });

  // 3. Verify username & password on the server (env secrets always take precedence)
  app.post('/api/admin/auth/login', (req: Request, res: Response) => {
    const ip = getClientIp(req);
    const limitCheck = checkRateLimit(ip);
    if (!limitCheck.allowed) {
      return res.status(429).json({
        ok: false,
        error: `Too many failed login attempts. Please wait ${limitCheck.retryAfterSec} seconds before retrying.`,
      });
    }

    const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        error: 'Both admin username and password are required.',
      });
    }

    let valid = false;
    let resolvedUsername = username;

    if (hasEnvCredentials()) {
      const envUser = getEnvUsername();
      const envPass = (process.env.ADMIN_PASSWORD || '').trim();
      valid =
        timingSafeStringEqual(username.toLowerCase(), envUser.toLowerCase()) &&
        timingSafeStringEqual(password, envPass);
      resolvedUsername = envUser;
    } else if (claimedAdmin) {
      valid =
        timingSafeStringEqual(username.toLowerCase(), claimedAdmin.username.toLowerCase()) &&
        verifyPasswordScrypt(password, claimedAdmin.saltHex, claimedAdmin.hashHex);
      resolvedUsername = claimedAdmin.username;
    } else {
      return res.status(403).json({
        ok: false,
        needsSetup: true,
        error: 'Admin credentials have not been set up yet. Use the first-run setup form to claim your admin credentials.',
      });
    }

    if (!valid) {
      recordFailedAttempt(ip);
      return res.status(401).json({
        ok: false,
        error: 'Invalid admin username or password.',
      });
    }

    clearFailedAttempts(ip);
    const { token, payload } = signAdminToken(resolvedUsername);
    return res.json({
      ok: true,
      token,
      admin: {
        username: payload.username,
        email: payload.email,
        displayName: `Admin (${payload.username})`,
        role: payload.role,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      },
    });
  });

  // 4. Verify an active in-memory Bearer token
  app.get('/api/admin/auth/verify', (req: Request, res: Response) => {
    const payload = verifyAdminBearerToken(req.headers.authorization);
    if (!payload) {
      return res.status(401).json({ ok: false, authenticated: false });
    }
    return res.json({
      ok: true,
      authenticated: true,
      admin: {
        username: payload.username,
        email: payload.email,
        displayName: `Admin (${payload.username})`,
        role: payload.role,
        expiresAt: new Date(payload.exp * 1000).toISOString(),
      },
    });
  });

  // 5. Revoke an active Bearer token on logout
  app.post('/api/admin/auth/logout', (req: Request, res: Response) => {
    const payload = verifyAdminBearerToken(req.headers.authorization);
    if (payload) {
      revokedTokenIds.add(payload.jti);
    }
    return res.json({ ok: true });
  });
}
