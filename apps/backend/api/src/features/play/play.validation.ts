import { z } from 'zod';
import { StartSessionRequest, ValidateAnswerRequest } from '@hunthub/shared/schemas';

export const startSessionSchema = StartSessionRequest;
export const validateAnswerSchema = ValidateAnswerRequest;

export const discoverQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
