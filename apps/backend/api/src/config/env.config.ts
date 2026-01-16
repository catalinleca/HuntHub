function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Check .env.local or .env file\n` +
        `See .env.example for template`,
    );
  }
  return value;
}

export const databaseUrl = getRequiredEnv('MONGODB_URI');

export const firebaseAPIKey = getRequiredEnv('FIREBASE_API_KEY');
export const firebaseAuthDomain = getRequiredEnv('FIREBASE_AUTH_DOMAIN');
export const firebaseProjectId = getRequiredEnv('FIREBASE_PROJECT_ID');
export const firebaseStorageBucket = getRequiredEnv('FIREBASE_STORAGE_BUCKET');
export const firebaseMessagingSenderId = getRequiredEnv('FIREBASE_MESSAGING_SENDER_ID');
export const firebaseAppId = getRequiredEnv('FIREBASE_APP_ID');

export const awsRegion = process.env.AWS_REGION || 'eu-west-1';
export const awsS3Bucket = process.env.AWS_S3_BUCKET || 'hunthub-assets-dev';
export const awsCloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
export const awsCloudFrontUrl = process.env.AWS_CLOUDFRONT_URL;

export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID;
export const awsProfile = process.env.AWS_PROFILE;

export const s3UseAcceleration = process.env.S3_USE_ACCELERATION === 'true';

export const openaiApiKey = process.env.OPENAI_API_KEY;
export const groqApiKey = process.env.GROQ_API_KEY;
export const geminiApiKey = process.env.GEMINI_API_KEY;

export const isDev = process.env.NODE_ENV !== 'production';
