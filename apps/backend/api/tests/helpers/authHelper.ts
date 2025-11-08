import { auth } from 'firebase-admin';
import { IUser } from '@/database/types';

/**
 * Map of tokens to users for multi-user testing
 * Store multiple users so each token can resolve to its correct user
 */
const tokenToUserMap = new Map<string, IUser>();

/**
 * Mock Firebase Admin auth for testing
 * This allows us to bypass real Firebase token verification
 * Supports multiple users in the same test.
 * Each user gets a unique token, and verifyIdToken looks up the correct user.
 */
export const mockFirebaseAuth = (user: IUser): void => {
  const token = `test-token-${user.firebaseUid}`;
  tokenToUserMap.set(token, user);

  // Mock verifyIdToken to look up user by token
  jest.spyOn(auth(), 'verifyIdToken').mockImplementation(async (tokenString: string) => {
    const matchedUser = tokenToUserMap.get(tokenString);
    if (!matchedUser) {
      throw new Error(`No user mocked for token: ${tokenString}`);
    }

    return {
      uid: matchedUser.firebaseUid,
      email: matchedUser.email,
      email_verified: true,
      aud: 'test-project',
      auth_time: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
      iat: Date.now() / 1000,
      iss: 'https://securetoken.google.com/test-project',
      sub: matchedUser.firebaseUid,
    } as any;
  });
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
  tokenToUserMap.clear();
  jest.restoreAllMocks();
};
