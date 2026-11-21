import { db, isSqlConfigured } from './index.ts';
import { users, type UserRecord } from './schema.ts';

export async function getOrCreateUser(profile: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoUrl?: string | null;
  role?: string | null;
}): Promise<UserRecord | null> {
  if (!isSqlConfigured()) {
    return null;
  }

  const safeEmail = (profile.email || `${profile.uid}@openframe.local`).trim().slice(0, 320);
  const safeName = profile.displayName ? profile.displayName.trim().slice(0, 160) : null;
  const safePhoto = profile.photoUrl ? profile.photoUrl.trim().slice(0, 512) : null;
  const safeRole = (profile.role || 'student').trim().slice(0, 40);

  try {
    const [row] = await db
      .insert(users)
      .values({
        uid: profile.uid,
        email: safeEmail,
        displayName: safeName,
        photoUrl: safePhoto,
        role: safeRole,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: safeEmail,
          displayName: safeName,
          photoUrl: safePhoto,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row || null;
  } catch (err) {
    console.error('[db/users] Failed to upsert user profile:', err);
    throw new Error('Unable to sync user account record.');
  }
}
