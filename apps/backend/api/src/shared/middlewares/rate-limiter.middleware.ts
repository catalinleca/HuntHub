import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';
import { ErrorCode } from '@/shared/errors/error-codes';

interface RateLimiterOptions {
  windowMs: number;
  limit: number;
  message?: string;
}

const getUserId = (req: Request): string => {
  return req.user?.id ?? req.ip ?? 'unknown';
};

export const createUserRateLimiter = (options: RateLimiterOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    keyGenerator: getUserId,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      code: ErrorCode.RATE_LIMIT_EXCEEDED,
      message: options.message ?? 'Too many requests, please try again later.',
    },
  } satisfies Partial<Options>);
};

export const aiGenerationLimiter = createUserRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'AI generation limit reached. You can generate up to 10 hunts per hour.',
});
