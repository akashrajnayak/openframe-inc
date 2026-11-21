import { initializeApp, getApps, getApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

const projectId = firebaseConfig?.projectId || process.env.GOOGLE_CLOUD_PROJECT || undefined;

let adminApp: App;
if (getApps().length === 0) {
  adminApp = initializeApp(projectId ? { projectId } : undefined);
} else {
  adminApp = getApp();
}

export const adminAuth = getAuth(adminApp);
export { adminApp };
