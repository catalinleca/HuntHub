/**
 * - Centralizes Firebase app initialization (prevents duplicate initialization)
 * - Exports pre-configured auth instance for use across the app
 * - Type-safe configuration with environment variables
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

/***
 * - These are PUBLIC credentials (safe to expose in frontend)
 * - Firebase security comes from Firestore/Storage rules, not hidden API keys
 * - API key restricts which domains can use your Firebase project
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

/**

 * Why export auth directly?
 * - Components import this ready-to-use instance
 * - No need to call getAuth() in every component
 * - Consistent auth instance across the app
 *
 * Usage in components:
 * import { auth } from '@/services/firebase';
 * signInWithPopup(auth, provider);
 */
export const auth: Auth = getAuth(app);

export default app;
