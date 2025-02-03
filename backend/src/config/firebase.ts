import dotenv from 'dotenv';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { cert, initializeApp as initializeAdminApp, ServiceAccount } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import serviceAccount from '../firebaseService.json';
import {
  firebaseAPIKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId,
} from '@/config';

const adminApp = initializeAdminApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const firebaseConfig = {
  apiKey: firebaseAPIKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const app = initializeApp(firebaseConfig);

console.log('===Firebase initialized===');

export const auth = getAuth(app);
export const adminAuth = getAdminAuth(adminApp);
