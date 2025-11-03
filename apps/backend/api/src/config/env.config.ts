import dotenv from 'dotenv';

export const databaseUrl = process.env.MONGODB_URI;

export const firebaseAPIKey = process.env.FIREBASE_API_KEY;
export const firebaseAuthDomain = process.env.FIREBASE_AUTH_DOMAIN;
export const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
export const firebaseStorageBucket = process.env.FIREBASE_STORAGE_BUCKET;
export const firebaseMessagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;
export const firebaseAppId = process.env.FIREBASE_APP_ID;

export const awsRegion = process.env.AWS_REGION || 'eu-west-1';
export const awsS3Bucket = process.env.AWS_S3_BUCKET || 'hunthub-assets-dev';
export const awsCloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
export const awsCloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;

export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const awsProfile = process.env.AWS_PROFILE;

export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
export const s3UseAcceleration = process.env.S3_USE_ACCELERATION === 'true';
