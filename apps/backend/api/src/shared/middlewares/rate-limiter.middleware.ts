import rateLimit, { Options, ipKeyGenerator } from 'express-rate-limit';
import { Request } from 'express';
import { ErrorCode } from '@/shared/errors/error-codes';
import { logger } from '@/utils/logger';

const IPV6_SUBNET = 64;

interface RateLimiterOptions {
  windowMs: number;
  limit: number;
  message?: string;
}

const getRateLimitKey = (req: Request): string => {
  if (req.user?.id) {
    return req.user.id;
  }

  if (req.ip) {
    return ipKeyGenerator(req.ip, IPV6_SUBNET);
  }

  logger.warn({ method: req.method, path: req.path }, 'Rate limiter: no identifiable key, using fallback');
  return `unknown-${Date.now()}`;
};

export const createUserRateLimiter = (options: RateLimiterOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    keyGenerator: getRateLimitKey,
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
