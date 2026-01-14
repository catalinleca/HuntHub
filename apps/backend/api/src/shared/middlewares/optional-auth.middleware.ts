import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { authUser } from '@/shared/utils/auth';

/**
 * Optional authentication middleware for Play API.
 *
 * - If valid Firebase token provided: attaches req.user (authenticated player)
 * - If no token or invalid token: continues without req.user (anonymous player)
 * - Never throws - allows both authenticated and anonymous access
 */
export const optionalAuthMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decodedToken = await auth().verifyIdToken(token);
      if (decodedToken) {
        req.user = await authUser(decodedToken);
      }
    }
  } catch {
    console.log('Anonymous user');
  }

  next();
};
