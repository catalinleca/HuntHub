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

// Type assertion helpers for extending generated schemas
const StepSchema = Step as unknown as ZodObject<ZodRawShape>;
const HuntSchema = Hunt as unknown as ZodObject<ZodRawShape>;
const LocationSchema = Location as unknown as ZodObject<ZodRawShape>;

// Location for save - allow empty object (all fields optional)
const LocationSave = LocationSchema.partial();

// Step for save - stepId optional (new steps don't have one)
const StepSave = StepSchema.extend({
  stepId: z.number().int().optional(),
  requiredLocation: LocationSave.optional(),
});

// Save schema - accepts full Hunt with flexible steps array
export const saveHuntSchema = HuntSchema.extend({
  steps: z.array(StepSave).optional(),
});

export const reorderStepsSchema = z.object({
  stepOrder: z.array(z.number().int()).min(1, 'Step order array cannot be empty'),
});
