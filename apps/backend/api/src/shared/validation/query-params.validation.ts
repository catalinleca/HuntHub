import { z } from 'zod';
import { MimeTypes } from '@/database/types/Asset';

export const HuntQueryParamsValidation = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(10)
    .transform((val) => Math.min(val, 100)),
  sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const AssetQueryParamsValidation = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(10)
    .transform((val) => Math.min(val, 100)),
  sortBy: z.enum(['createdAt', 'originalFilename', 'size']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  mimeType: z.nativeEnum(MimeTypes).optional(),
});

export type ValidatedHuntQuery = z.infer<typeof HuntQueryParamsValidation>;
export type ValidatedAssetQuery = z.infer<typeof AssetQueryParamsValidation>;
