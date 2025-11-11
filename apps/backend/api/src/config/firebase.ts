import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { cert, initializeApp as initializeAdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import {
  firebaseAPIKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} from './env.config';

function initializeFirebaseAdmin() {
  // Test environment - use dummy credentials
  if (process.env.NODE_ENV === 'test') {
    return initializeAdminApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
    });
  }

  // Try env var first (CI/Production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      return initializeAdminApp({
        credential: cert(serviceAccount as ServiceAccount),
      });
    } catch {
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON');
    }
  }

  // Fallback to local file (Local dev)
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require('../firebaseService.json');
    return initializeAdminApp({
      credential: cert(serviceAccount as ServiceAccount),
    });
  } catch {
    throw new Error(
      'Firebase not configured. Either:\n' +
        '1. Add firebaseService.json file (local dev)\n' +
        '2. Set FIREBASE_SERVICE_ACCOUNT env var (CI/prod)',
    );
  }
}

const adminApp = initializeFirebaseAdmin();

const firebaseConfig = {
  apiKey: firebaseAPIKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const app = initializeApp(firebaseConfig);

console.log('Firebase initialized');
export const auth = getAuth(app);
export const adminAuth = getAdminAuth(adminApp);
