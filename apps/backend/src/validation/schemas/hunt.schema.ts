/**
 * Hunt Validation Schemas
 *
 * Import base Zod schemas from @hunthub/shared/schemas and extend as needed
 * for backend-specific hunt validation.
 */

import {
  HuntCreate,
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
export const updateHuntSchema = HuntCreate.partial();