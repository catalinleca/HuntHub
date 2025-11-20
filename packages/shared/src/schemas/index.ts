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
  MimeTypes,

  // Common types
  Location,
  Option,

  // Challenge types
  Clue,
  Quiz,
  Mission,
  Task,
  Challenge,

  // Hunt (DTO for frontend - merges Hunt + HuntVersion internally)
  Hunt,
  HuntCreate,
  HuntUpdate,

  // Step
  Step,
  StepCreate,
  StepUpdate,

  // User
  User,

  // Access
  HuntAccess,

  // Asset
  AssetUsage,
  StorageLocation,
  Asset,
  AssetCreate,

  // Publishing & Release
  PublishResult,
  ReleaseResult,
  TakeOfflineResult,
  ReleaseHuntRequest,
  TakeOfflineRequest,

  // Sharing
  Collaborator,
  ShareResult,
  ShareHuntRequest,
  UpdatePermissionRequest,

  // Pagination
  SortOrder,
  HuntSortField,
  AssetSortField,
  PaginationQueryParams,
  HuntQueryParams,
  AssetQueryParams,
  PaginationMeta,
  PaginatedHuntsResponse,
  PaginatedAssetsResponse,
} = schemas;

// Also export the schemas object for bulk imports if needed
export { schemas };
