/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Field to sort assets by
 * @example "createdAt"
 */
export enum AssetSortField {
  CreatedAt = "createdAt",
  OriginalFilename = "originalFilename",
  Size = "size",
}

/**
 * Field to sort hunts by
 * @example "updatedAt"
 */
export enum HuntSortField {
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
}

/**
 * Sort order direction
 * @example "desc"
 */
export enum SortOrder {
  Asc = "asc",
  Desc = "desc",
}

/** Player's progress status through a hunt */
export enum HuntProgressStatus {
  InProgress = "in_progress",
  Completed = "completed",
  Abandoned = "abandoned",
}

/** Type of media attached to a step */
export enum MediaType {
  Image = "image",
  Audio = "audio",
  Video = "video",
  ImageAudio = "image-audio",
}

export enum MimeTypes {
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageWebp = "image/webp",
  ImageGif = "image/gif",
  VideoMp4 = "video/mp4",
  VideoWebm = "video/webm",
  AudioMpeg = "audio/mpeg",
  AudioWav = "audio/wav",
  AudioOgg = "audio/ogg",
}

export enum MissionType {
  UploadMedia = "upload-media",
  MatchLocation = "match-location",
}

export enum OptionType {
  Choice = "choice",
  Input = "input",
}

export enum ChallengeType {
  Clue = "clue",
  Quiz = "quiz",
  Mission = "mission",
  Task = "task",
}

export enum HuntAccessType {
  Creator = "creator",
  Viewer = "viewer",
  Editor = "editor",
}

/** Hunt status: draft (editable) or published (read-only) */
export enum HuntStatus {
  Draft = "draft",
  Published = "published",
}

export interface Location {
  lat: number;
  lng: number;
  radius: number;
  /** Cached address from geocoding */
  address?: string;
}

/** Snapshot of asset data (copied at selection time) */
export interface AssetSnapshot {
  /** Asset.assetId reference */
  id: number;
  /** CDN URL for preview */
  url: string;
  /** Original filename */
  name: string;
  /** File size in bytes */
  sizeBytes: number;
}

/** Image media with nested asset snapshot */
export interface ImageMedia {
  /** Snapshot of asset data (copied at selection time) */
  asset: AssetSnapshot;
  /** Display title (user-provided) */
  title?: string;
  /** Accessibility text for screen readers */
  alt?: string;
}

/** Audio media with nested asset snapshot */
export interface AudioMedia {
  /** Snapshot of asset data (copied at selection time) */
  asset: AssetSnapshot;
  /** Display title (user-provided) */
  title?: string;
  /** Text transcript for accessibility */
  transcript?: string;
}

/** Video media with nested asset snapshot */
export interface VideoMedia {
  /** Snapshot of asset data (copied at selection time) */
  asset: AssetSnapshot;
  /** Display title (user-provided) */
  title?: string;
  /** Accessibility text for screen readers */
  alt?: string;
}

/** Combined image + audio (composes ImageMedia and AudioMedia) */
export interface ImageAudioMedia {
  /** Image media with nested asset snapshot */
  image: ImageMedia;
  /** Audio media with nested asset snapshot */
  audio: AudioMedia;
  /** Overall title for the combined media */
  title?: string;
}

/** Content container for media (discriminated by parent type field) */
export interface MediaContent {
  /** Image media with nested asset snapshot */
  image?: ImageMedia;
  /** Audio media with nested asset snapshot */
  audio?: AudioMedia;
  /** Video media with nested asset snapshot */
  video?: VideoMedia;
  /** Combined image + audio (composes ImageMedia and AudioMedia) */
  imageAudio?: ImageAudioMedia;
}

/** Step media attachment (self-contained snapshot with asset data) */
export interface Media {
  /** Type of media attached to a step */
  type: MediaType;
  /** Content container for media (discriminated by parent type field) */
  content: MediaContent;
}

/** Hunt DTO (merges Hunt master + HuntVersion content for frontend) */
export interface Hunt {
  /** @example 1332 */
  huntId: number;
  creatorId: string;
  /**
   * Which version is this? (1, 2, 3, etc.)
   * @example 1
   */
  version: number;
  /**
   * Latest draft version number
   * @example 2
   */
  latestVersion: number;
  /**
   * Currently published version number (null if never published)
   * @example 1
   */
  liveVersion?: number | null;
  name: string;
  description?: string;
  /** Hunt status: draft (editable) or published (read-only) */
  status: HuntStatus;
  startLocation?: Location;
  /**
   * Ordered array of step IDs defining step sequence
   * @example [10,23,15]
   */
  stepOrder: number[];
  /** Optional: Full step details (when populated) */
  steps?: Step[];
  /**
   * Is THIS version published?
   * @example false
   */
  isPublished: boolean;
  /**
   * When this version was published (null if not published)
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  publishedAt?: string | null;
  /** User ID who published this version (null if not published) */
  publishedBy?: string | null;
  /**
   * Is this version currently live/active for players? (computed: version === liveVersion)
   * @example false
   */
  isLive?: boolean;
  /**
   * When hunt was last released/made live (null if never released)
   * @format date-time
   * @example "2024-02-01T10:30:00Z"
   */
  releasedAt?: string | null;
  /** User ID who released/made the hunt live (null if never released) */
  releasedBy?: string | null;
  /**
   * Authenticated user's permission level for this hunt (included in user-specific contexts like dashboard)
   * @example "owner"
   */
  permission?: "owner" | "admin" | "view";
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt?: string;
  /** Optional cover image for the hunt */
  coverImage?: Media | null;
}

export interface HuntCreate {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  /** @maxLength 500 */
  description?: string;
  startLocation?: Location;
  steps?: StepCreate[];
  /** Optional cover image for the hunt */
  coverImage?: Media | null;
}

/** Hunt content update (updates draft HuntVersion internally) */
export interface HuntUpdate {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name?: string;
  /** @maxLength 500 */
  description?: string;
  startLocation?: Location;
  /**
   * Timestamp for optimistic locking (optional)
   * @format date-time
   */
  updatedAt?: string;
  /** Optional cover image for the hunt */
  coverImage?: Media | null;
}

export interface Step {
  /** @example 10000 */
  stepId: number;
  /** @example 1332 */
  huntId: number;
  type: ChallengeType;
  challenge: Challenge;
  /** Optional media attachment for this step */
  media?: Media;
  requiredLocation?: Location | null;
  hint?: string | null;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  /** Flexible key-value storage for extensibility */
  metadata?: Record<string, any>;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt?: string;
}

/** Step creation (huntId comes from URL parameter) */
export interface StepCreate {
  type: ChallengeType;
  challenge: Challenge;
  /** Optional media attachment for this step */
  media?: Media;
  requiredLocation?: Location | null;
  hint?: string | null;
  timeLimit?: number | null;
  maxAttempts?: number | null;
}

/** Step update (only editable fields, no id/huntId/timestamps) */
export interface StepUpdate {
  type: ChallengeType;
  challenge: Challenge;
  /** Optional media attachment for this step */
  media?: Media;
  requiredLocation?: Location | null;
  hint?: string | null;
  timeLimit?: number | null;
  maxAttempts?: number | null;
}

export interface Challenge {
  clue?: Clue;
  quiz?: Quiz;
  mission?: Mission;
  task?: Task;
}

export interface Clue {
  title?: string;
  description?: string;
}

export interface Option {
  id: string;
  text: string;
}

/** Validation configuration for quiz answers (future feature) */
export interface QuizValidation {
  mode?: "exact" | "fuzzy" | "contains" | "numeric-range";
  caseSensitive?: boolean;
  range?: {
    min?: number;
    max?: number;
  };
  acceptableAnswers?: string[];
}

export interface Quiz {
  title?: string;
  description?: string;
  type?: OptionType;
  /** All answer options in display order (choice type) */
  options?: Option[];
  /** ID of the correct answer option (choice type) */
  targetId?: string;
  /** The correct answer text (input type) */
  expectedAnswer?: string;
  /** Whether to randomize option order when displayed to player */
  randomizeOrder?: boolean;
  /** Validation configuration for quiz answers (future feature) */
  validation?: QuizValidation;
}

export interface Mission {
  title?: string;
  description?: string;
  /** Author's reference images/media shown to player */
  referenceAssetIds?: number[];
  targetLocation?: Location;
  type?: MissionType;
  /** Instructions for AI to validate player's upload (future feature) */
  aiInstructions?: string;
  /** Which AI model to use for validation (future feature) */
  aiModel?: "gpt-4-vision" | "claude-vision" | "gemini-vision";
}

export interface Task {
  title?: string;
  /** What the player should do (shown to player) */
  instructions?: string;
  /** Instructions for AI to validate player's response */
  aiInstructions?: string;
  /** Which AI model to use for validation (future feature) */
  aiModel?: "gpt-4" | "claude" | "gemini";
}

export interface User {
  id: string;
  firebaseUid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt?: string;
}

export interface HuntAccess {
  huntId: string;
  userId: string;
  accessType: HuntAccessType;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  sharedAt: string;
}

export interface AssetUsage {
  model: string;
  field: string;
  documentId: string;
}

export interface StorageLocation {
  bucket?: string;
  path?: string;
}

export interface Asset {
  id: string;
  /** @example 5000 */
  assetId: number;
  ownerId: string;
  url: string;
  mimeType: MimeTypes;
  originalFilename?: string;
  /** File size in bytes */
  size?: number;
  thumbnailUrl?: string;
  storageLocation?: StorageLocation;
  /** Track where this asset is used */
  usage?: AssetUsage[];
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt?: string;
}

export interface AssetCreate {
  /** @minLength 1 */
  name: string;
  /** @minLength 1 */
  mime: string;
  /** @min 1 */
  sizeBytes: number;
  /** @minLength 1 */
  url: string;
  /** @minLength 1 */
  s3Key: string;
}

/** Response from publishing a hunt (minimal metadata - frontend refetches hunt data) */
export interface PublishResult {
  /**
   * Version number that was published
   * @example 1
   */
  publishedVersion: number;
  /**
   * New draft version number created
   * @example 2
   */
  newDraftVersion: number;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  publishedAt: string;
}

/** Player's submission for a step challenge */
export interface Submission {
  /** @format date-time */
  timestamp: string;
  /** Flexible submission content (answer text, asset ID, coordinates, etc.) */
  content: any;
  isCorrect: boolean;
  /** Quality/confidence score (0-1 or 0-10) */
  score?: number;
  /** Player guidance message from AI or system */
  feedback?: string;
  /** Extensibility (e.g., branchTaken, AI model used) */
  metadata?: Record<string, any>;
}

/** Progress for a single step */
export interface StepProgress {
  /** @example 10000 */
  stepId: number;
  /** @default 0 */
  attempts?: number;
  /** @default false */
  completed?: boolean;
  responses?: Submission[];
  /** @format date-time */
  startedAt?: string;
  /** @format date-time */
  completedAt?: string;
  /** Time spent on step in seconds */
  duration?: number;
}

/** Player's progress through a hunt (supports anonymous players) */
export interface Progress {
  id: string;
  /** Optional - only for authenticated players */
  userId?: string;
  /** UUID for localStorage-based sessions */
  sessionId: string;
  isAnonymous: boolean;
  /** @example 1332 */
  huntId: number;
  /**
   * Which published hunt version player is playing
   * @example 1
   */
  version: number;
  /** Player's progress status through a hunt */
  status: HuntProgressStatus;
  /** @format date-time */
  startedAt: string;
  /** @format date-time */
  completedAt?: string;
  /** Total time in seconds */
  duration?: number;
  /**
   * Current step player is on
   * @example 10000
   */
  currentStepId: number;
  steps?: StepProgress[];
  /**
   * @minLength 1
   * @maxLength 50
   */
  playerName: string;
  /**
   * Player's rating of the hunt (0-5 stars)
   * @min 0
   * @max 5
   */
  rating?: number;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

/** Runtime operational state for published hunts (tracks which version is live + metrics) */
export interface LiveHunt {
  /**
   * FK to Hunt (unique - one live version per hunt)
   * @example 1332
   */
  huntId: number;
  /**
   * Which hunt version is currently live (FK to HuntVersion)
   * @example 1
   */
  huntVersion: number;
  /**
   * Number of players currently playing this hunt
   * @default 0
   */
  activePlayerCount: number;
  /**
   * When someone last played this hunt
   * @format date-time
   */
  lastPlayedAt?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

/** Lightweight response for hunt release operations */
export interface ReleaseResult {
  /** @example 1332 */
  huntId: number;
  /**
   * Version that is now live
   * @example 2
   */
  liveVersion: number;
  /**
   * Version that was live before (null if first release)
   * @example 1
   */
  previousLiveVersion: number | null;
  /**
   * When the version was released
   * @format date-time
   */
  releasedAt: string;
  /** User ID who released the version */
  releasedBy: string;
}

/** Lightweight response for taking hunt offline */
export interface TakeOfflineResult {
  /** @example 1332 */
  huntId: number;
  /**
   * Version that was live before taking offline
   * @example 2
   */
  previousLiveVersion: number;
  /**
   * When the hunt was taken offline
   * @format date-time
   */
  takenOfflineAt: string;
}

/** Represents a user who has access to a hunt (for GET /hunts/:huntId/access endpoint) */
export interface Collaborator {
  /** User's ID */
  userId: string;
  /** User's display name */
  displayName: string;
  /**
   * User's email address
   * @format email
   */
  email?: string;
  /** User's profile picture URL */
  profilePicture?: string;
  /** User's permission level (owner is not listed as collaborator) */
  permission: "admin" | "view";
  /**
   * When access was granted
   * @format date-time
   * @example "2024-02-01T10:30:00Z"
   */
  sharedAt: string;
  /** Display name of user who granted access */
  sharedBy?: string;
}

/** Response from sharing a hunt with another user */
export interface ShareResult {
  /**
   * ID of the hunt that was shared
   * @example 1332
   */
  huntId: number;
  /** User ID of the person the hunt was shared with */
  sharedWithId: string;
  /** Permission level granted */
  permission: "admin" | "view";
  /**
   * When the hunt was shared
   * @format date-time
   * @example "2024-02-01T10:30:00Z"
   */
  sharedAt: string;
  /** User ID who granted the access */
  sharedBy: string;
}

/** Request body for releasing a hunt version (optimistic locking) */
export interface ReleaseHuntRequest {
  /**
   * Version number to release (optional - auto-detects latest published if not provided)
   * @example 1
   */
  version?: number;
  /**
   * Current live version number for optimistic locking (null if never released)
   * @example 1
   */
  currentLiveVersion?: number | null;
}

/** Request body for taking a hunt offline (optimistic locking) */
export interface TakeOfflineRequest {
  /**
   * Current live version number for optimistic locking
   * @example 2
   */
  currentLiveVersion: number | null;
}

/** Request body for sharing a hunt with another user */
export interface ShareHuntRequest {
  /**
   * Email of the user to share with
   * @format email
   */
  email: string;
  /** Permission level to grant */
  permission: "admin" | "view";
}

/** Request body for updating a collaborator's permission level */
export interface UpdatePermissionRequest {
  /** New permission level */
  permission: "admin" | "view";
}

/** Standard pagination query parameters */
export interface PaginationQueryParams {
  /**
   * Page number (1-indexed)
   * @min 1
   * @default 1
   * @example 1
   */
  page?: number;
  /**
   * Number of items per page (max 100)
   * @min 1
   * @max 100
   * @default 10
   * @example 10
   */
  limit?: number;
  /** Sort order direction */
  sortOrder?: SortOrder;
}

export type HuntQueryParams = PaginationQueryParams & {
  /** Field to sort hunts by */
  sortBy?: HuntSortField;
};

export type AssetQueryParams = PaginationQueryParams & {
  /** Field to sort assets by */
  sortBy?: AssetSortField;
  /** Optional filter by MIME type */
  mimeType?: MimeTypes;
};

/** Pagination metadata in response */
export interface PaginationMeta {
  /**
   * Total number of items across all pages
   * @example 47
   */
  total: number;
  /**
   * Current page number (1-indexed)
   * @min 1
   * @example 1
   */
  page: number;
  /**
   * Number of items per page
   * @min 1
   * @example 10
   */
  limit: number;
  /**
   * Total number of pages
   * @min 0
   * @example 5
   */
  totalPages: number;
  /**
   * Whether there is a next page
   * @example true
   */
  hasNext: boolean;
  /**
   * Whether there is a previous page
   * @example false
   */
  hasPrev: boolean;
}

/** Paginated response for hunts list */
export interface PaginatedHuntsResponse {
  data: Hunt[];
  /** Pagination metadata in response */
  pagination: PaginationMeta;
}

/** Paginated response for assets list */
export interface PaginatedAssetsResponse {
  data: Asset[];
  /** Pagination metadata in response */
  pagination: PaginationMeta;
}
