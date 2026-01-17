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
import { logger } from '@/utils/logger';

function initializeFirebaseAdmin() {
  if (process.env.NODE_ENV === 'test') {
    return initializeAdminApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
    });
  }

  const base64Credentials = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!base64Credentials) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var is required (base64 encoded JSON)');
  }

  try {
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decoded);

    return initializeAdminApp({
      credential: cert(serviceAccount as ServiceAccount),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Invalid FIREBASE_SERVICE_ACCOUNT - must be base64 encoded JSON: ${message}`);
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

logger.info('Firebase initialized');
export const auth = getAuth(app);
export const adminAuth = getAdminAuth(adminApp);
