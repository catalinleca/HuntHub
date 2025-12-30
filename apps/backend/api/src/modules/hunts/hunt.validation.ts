/**
 * Hunt Validation Schemas
 *
 * Import base Zod schemas from @hunthub/shared/schemas and extend as needed
 * for backend-specific hunt validation.
 */

import { z, type ZodObject, type ZodRawShape } from 'zod';
import {
  HuntCreate,
  HuntUpdate,
  Location,
  HuntStatus,
  HuntAccessType,
  Hunt,
  HuntAccess,
  Step,
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

// Type assertion for extending generated schemas
const StepSchema = Step as unknown as ZodObject<ZodRawShape>;
const HuntSchema = Hunt as unknown as ZodObject<ZodRawShape>;

// Save schema - extends Hunt to allow creating new steps (without stepId)
const StepSave = StepSchema.extend({
  stepId: z.number().int().optional(),
});

export const saveHuntSchema = HuntSchema.extend({
  steps: z.array(StepSave).optional(),
});

export const reorderStepsSchema = z.object({
  stepOrder: z.array(z.number().int()).min(1, 'Step order array cannot be empty'),
});
