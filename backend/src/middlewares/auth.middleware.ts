import { Request, Response, NextFunction } from 'express';
import { auth } from 'firebase-admin';
import { authUser } from '@/utils/auth';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Unauthorized');
    }

    const decodedToken = await auth().verifyIdToken(token);
    if (decodedToken) {
      console.log('===decodedToken===', decodedToken);
      req.user = await authUser(decodedToken);
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
