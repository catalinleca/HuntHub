import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { authUser } from '@/utils/auth';
import { UnauthorizedError } from '@/utils/errors/UnauthorizedError';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return next(new UnauthorizedError());
    }

    const decodedToken = await auth().verifyIdToken(token);
    if (decodedToken) {
      req.user = await authUser(decodedToken);
    }
    next();
  } catch (err) {
    console.error(err);
    next(new UnauthorizedError());
  }
};
