import { z } from 'zod';
import { StartSessionRequest, ValidateAnswerRequest, AssetCreate } from '@hunthub/shared/schemas';

export const startSessionSchema = StartSessionRequest;
export const validateAnswerSchema = ValidateAnswerRequest;
export const createAssetSchema = AssetCreate;

export const discoverQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const navigateSchema = z.object({
  stepId: z.number().int().positive(),
});

export const startPreviewSessionSchema = z.object({
  previewToken: z.string().min(1),
});
