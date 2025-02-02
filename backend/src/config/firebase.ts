import * as admin from 'firebase-admin';

const serviceAccount = require('../../serviceAccountKey.json');

// TODO: Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const firestore = admin.firestore();
