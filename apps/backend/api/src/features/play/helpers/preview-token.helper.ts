import jwt from 'jsonwebtoken';
import { previewTokenSecret } from '@/config/env.config';

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

      return decoded.huntId === huntId && decoded.isPreview === true;
    } catch {
      return false;
    }
  },
};
