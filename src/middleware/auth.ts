import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from '../lib/firebase-admin.ts';

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

export async function verifyOptionalAuth(req: AuthenticatedRequest): Promise<DecodedIdToken | null> {
  const authHeader = String(req.headers.authorization || '').trim();
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    return decoded;
  } catch (err) {
    console.warn('[auth] Optional Firebase ID token verification failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = String(req.headers.authorization || '').trim();
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ ok: false, error: 'Authentication required. Please sign in to continue.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ ok: false, error: 'Missing authentication token.' });
    return;
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('[auth] Firebase ID token verification failed:', err);
    res.status(401).json({ ok: false, error: 'Invalid or expired authentication session. Please sign in again.' });
  }
}
