import crypto from 'crypto';
import { previewTokenSecret } from '@/config/env.config';
import { logger } from '@/utils/logger';

const TOKEN_EXPIRATION_SECONDS = 15 * 60; // 15 minutes

export interface PreviewTokenPayload {
  huntId: number;
  userId: string;
  exp: number;
  nonce: string;
}

export type VerifyTokenResult =
  | { valid: true; payload: PreviewTokenPayload }
  | { valid: false; reason: 'expired' | 'invalid' | 'malformed' };

const getSecret = (): string => {
  if (!previewTokenSecret) {
    throw new Error('PREVIEW_TOKEN_SECRET is not configured');
  }
  return previewTokenSecret;
};

const base64UrlEncode = (data: string): string => {
  return Buffer.from(data).toString('base64url');
};

const base64UrlDecode = (data: string): string => {
  return Buffer.from(data, 'base64url').toString('utf8');
};

const createSignature = (payload: string, secret: string): string => {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
};

export const createPreviewToken = (huntId: number, userId: string): string => {
  const secret = getSecret();

  const payload: PreviewTokenPayload = {
    huntId,
    userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION_SECONDS,
    nonce: crypto.randomBytes(8).toString('hex'),
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);
  const signature = createSignature(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
};

export const verifyPreviewToken = (token: string): VerifyTokenResult => {
  const secret = getSecret();

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'malformed' };
  }

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = createSignature(encodedPayload, secret);

  if (providedSignature.length !== expectedSignature.length) {
    logger.warn('Preview token signature mismatch - possible tampering');

    return { valid: false, reason: 'invalid' };
  }

  if (!crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) {
    logger.warn('Preview token signature verification failed - possible tampering');

    return { valid: false, reason: 'invalid' };
  }

  let payload: PreviewTokenPayload;
  try {
    const payloadString = base64UrlDecode(encodedPayload);
    payload = JSON.parse(payloadString);
  } catch {
    return { valid: false, reason: 'malformed' };
  }

  if (typeof payload.huntId !== 'number' || typeof payload.userId !== 'string') {
    return { valid: false, reason: 'malformed' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    logger.info({ huntId: payload.huntId, expiredSecondsAgo: now - payload.exp }, 'Preview token expired');

    return { valid: false, reason: 'expired' };
  }

  return { valid: true, payload };
};
