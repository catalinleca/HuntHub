/**
 * Zod Validation Schemas
 *
 * Re-export schemas from auto-generated file (gen/index.ts).
 * This file is NOT auto-generated, so it's safe to edit.
 *
 * Direct re-exports from gen preserve proper TypeScript types.
 */

// Re-export all schemas directly (preserves proper Zod types)
export {
  // Enums
  HuntStatus,
  HuntAccessType,
  ChallengeType,
  OptionType,
  MissionType,
  ValidationMode,
  MimeTypes,
  MediaType,

  // Common types
  Location,
  Option,

  // Media types (Step-level media attachment)
  ImageMedia,
  AudioMedia,
  VideoMedia,
  ImageAudioMedia,
  MediaContent,
  Media,

  // Challenge types
  Clue,
  QuizValidation,
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

  // Answer Validation (for edge + server)
  AnswerType,
  ClueAnswerPayload,
  QuizChoicePayload,
  QuizInputPayload,
  MissionLocationPayload,
  MissionMediaPayload,
  TaskAnswerPayload,
  AnswerPayload,
  ValidateAnswerRequest,
  ValidateAnswerResponse,

  // Play Session (Player API)
  StartSessionRequest,
  SessionResponse,
  HintResponse,

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
  schemas,
} from './gen';
