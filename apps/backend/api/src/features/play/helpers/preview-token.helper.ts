import jwt from 'jsonwebtoken';
import { previewTokenSecret } from '@/config/env.config';
import { logger } from '@/utils/logger';

const PREVIEW_EXPIRY_SECONDS = 3600;

interface PreviewPayload {
  huntId: number;
  isPreview: true;
}

export const PreviewTokenHelper = {
  generate(huntId: number): { token: string; expiresIn: number } {
    const token = jwt.sign({ huntId, isPreview: true }, previewTokenSecret, {
      expiresIn: PREVIEW_EXPIRY_SECONDS,
    });

    return { token, expiresIn: PREVIEW_EXPIRY_SECONDS };
  },

  validate(token: string, huntId: number): boolean {
    try {
      const decoded = jwt.verify(token, previewTokenSecret) as PreviewPayload;
      const isValid = decoded.huntId === huntId && decoded.isPreview === true;

      if (!isValid) {
        logger.debug(
          { tokenHuntId: decoded.huntId, expectedHuntId: huntId, isPreview: decoded.isPreview },
          'Preview token validation failed - huntId mismatch',
        );
      }

      return isValid;
    } catch (error) {
      logger.debug({ error: (error as Error).message }, 'Preview token validation failed - JWT error');
      return false;
    }
  },
};
