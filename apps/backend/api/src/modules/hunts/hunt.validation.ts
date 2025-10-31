/**
 * Hunt Validation Schemas
 *
 * Import base Zod schemas from @hunthub/shared/schemas and extend as needed
 * for backend-specific hunt validation.
 */

import { z } from 'zod';
import {
  HuntCreate,
  HuntUpdate,
  Location,
  HuntStatus,
  HuntAccessType,
  Hunt,
  HuntAccess,
} from '@hunthub/shared/schemas';

// Re-export base schemas
export { Location, Hunt, HuntAccess };

// Enum schemas
export const huntStatusSchema = HuntStatus;
export const huntAccessTypeSchema = HuntAccessType;
export const huntLocationSchema = Location;

// Hunt CRUD schemas
export const createHuntSchema = HuntCreate;
export const updateHuntSchema = HuntUpdate;

export const reorderStepsSchema = z.object({
  stepOrder: z.array(z.number().int()).min(1, 'Step order array cannot be empty'),
});
