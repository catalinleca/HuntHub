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

/** Player's progress status through a hunt */
export enum HuntProgressStatus {
  InProgress = "in_progress",
  Completed = "completed",
  Abandoned = "abandoned",
}

export enum MimeTypes {
  ImageJpeg = "image/jpeg",
  ImagePng = "image/png",
  ImageWebp = "image/webp",
  ImageGif = "image/gif",
  VideoMp4 = "video/mp4",
  VideoWebm = "video/webm",
  AudioMp3 = "audio/mp3",
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
   * When this version was published
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  publishedAt?: string;
  /** User ID who published this version */
  publishedBy?: string;
  /**
   * Is this version currently live/active for players? (computed: version === liveVersion)
   * @example false
   */
  isLive?: boolean;
  /**
   * When hunt was last released/made live
   * @format date-time
   * @example "2024-02-01T10:30:00Z"
   */
  releasedAt?: string;
  /** User ID who released/made the hunt live */
  releasedBy?: string;
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
}

export interface Step {
  /** @example 10000 */
  stepId: number;
  /** @example 1332 */
  huntId: number;
  type: ChallengeType;
  challenge: Challenge;
  requiredLocation?: Location;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
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
  requiredLocation?: Location;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
}

/** Step update (only editable fields, no id/huntId/timestamps) */
export interface StepUpdate {
  type: ChallengeType;
  challenge: Challenge;
  requiredLocation?: Location;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
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
  target?: Option;
  type?: OptionType;
  distractors?: Option[];
  /** Optional validation rules (future feature) */
  validation?: QuizValidation;
}

export interface Mission {
  title?: string;
  description?: string;
  /** Author's reference images/media shown to player */
  referenceAssetIds?: string[];
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

/** Response from publishing a hunt */
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
  /** Full hunt data with published version content */
  hunt: Hunt;
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
