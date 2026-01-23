import { Request, Response, NextFunction } from 'express';
import { isProduction } from '@/config/env.config';

const BLOCKED_HOST_PATTERNS = ['.fly.dev'];

export const hostGuard = (req: Request, res: Response, next: NextFunction) => {
  if (!isProduction) {
    return next();
  }

  const host = req.headers.host || '';
  const isBlockedHost = BLOCKED_HOST_PATTERNS.some((pattern) => host.includes(pattern));

  if (isBlockedHost) {
    return res.status(421).json({
      error: 'Misdirected Request',
      message: 'Use api.hedgehunt.app',
    });
  }

  return next();
};
