import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { authUser } from '@/shared/utils/auth';
import { logger } from '@/utils/logger';

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
    logger.debug('Anonymous user - no valid auth token');
  }

  next();
};
