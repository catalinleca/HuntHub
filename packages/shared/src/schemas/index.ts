/**
 * Zod Validation Schemas
 *
 * Re-export schemas from auto-generated file (gen/index.ts).
 * This file is NOT auto-generated, so it's safe to edit.
 *
 * When you add new schemas to OpenAPI, add them here for clean imports.
 */

import { schemas } from './gen';

// Individual named exports for clean imports
export const {
  // Enums
  HuntStatus,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,

  // Common types
  Location,
  Option,

  // Challenge types
  Clue,
  Quiz,
  Mission,
  Task,
  Challenge,

  // Hunt
  Hunt,
  HuntCreate,

  // Step
  Step,
  StepCreate,

  // User
  User,

  // Access
  HuntAccess,
} = schemas;

// Also export the schemas object for bulk imports if needed
export { schemas };