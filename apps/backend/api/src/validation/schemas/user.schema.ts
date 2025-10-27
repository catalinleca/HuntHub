/**
 * User Validation Schemas
 *
 * Import base Zod schemas from @hunthub/shared/schemas and extend as needed
 * for backend-specific user validation.
 */

import { User } from '@hunthub/shared/schemas';

// Re-export base schema
export { User };

// User schema alias for consistency
export const userSchema = User;