/**
 * Step Validation Schemas
 *
 * Import base Zod schemas from @hunthub/shared/schemas and extend as needed
 * for backend-specific step validation.
 */

import { Step, StepCreate, StepUpdate } from '@hunthub/shared/schemas';

// Re-export base schemas
export { Step };

// Step CRUD schemas
export const createStepSchema = StepCreate;
export const updateStepSchema = StepUpdate;
