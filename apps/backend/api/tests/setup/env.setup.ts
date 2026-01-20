/**
 * Setup test environment variables before any modules load
 * This prevents Firebase initialization errors in tests
 */

// Set dummy Firebase credentials for testing
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_STORAGE_BUCKET = 'test.appspot.com';
process.env.FIREBASE_MESSAGING_SENDER_ID = '123456789';
process.env.FIREBASE_APP_ID = 'test-app-id';
process.env.FIREBASE_MEASUREMENT_ID = 'test-measurement-id';

// Set dummy MongoDB URI (tests use in-memory MongoDB)
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

// Set dummy AWS credentials for testing
process.env.AWS_REGION = 'eu-west-1';
process.env.AWS_S3_BUCKET = 'test-bucket';

// Set other test environment variables
process.env.NODE_ENV = 'test';
process.env.PREVIEW_TOKEN_SECRET = 'test-preview-token-secret';
