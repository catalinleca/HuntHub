import { auth } from 'firebase-admin';
import { IUser } from '@db/types';

/**
 * Mock Firebase Admin auth for testing
 * This allows us to bypass real Firebase token verification
 */
export const mockFirebaseAuth = (user: IUser): void => {
  // Mock verifyIdToken to return a decoded token for our test user
  jest.spyOn(auth(), 'verifyIdToken').mockResolvedValue({
    uid: user.firebaseUid,
    email: user.email,
    email_verified: true,
    aud: 'test-project',
    auth_time: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,
    iat: Date.now() / 1000,
    iss: 'https://securetoken.google.com/test-project',
    sub: user.firebaseUid,
  } as any);
};

/**
 * Create a fake auth token for testing
 * The actual value doesn't matter since we mock verifyIdToken
 */
export const createTestAuthToken = (user: IUser): string => {
  return `test-token-${user.firebaseUid}`;
};

/**
 * Clear Firebase auth mocks
 */
export const clearFirebaseAuthMocks = (): void => {
  jest.restoreAllMocks();
};
