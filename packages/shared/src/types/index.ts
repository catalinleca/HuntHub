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

export enum MissionType {
  UploadMedia = 'upload-media',
  MatchLocation = 'match-location',
}

export enum OptionType {
  Choice = 'choice',
  Input = 'input',
}

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export enum HuntAccessType {
  Creator = 'creator',
  Viewer = 'viewer',
  Editor = 'editor',
}

export enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface Location {
  lat: number;
  lng: number;
  radius: number;
}

export interface Hunt {
  /** @example 1332 */
  huntId: number;
  creatorId: string;
  name: string;
  description?: string;
  currentVersion: number;
  status: HuntStatus;
  startLocation?: Location;
  /**
   * Ordered array of step IDs defining step sequence
   * @example [10,23,15]
   */
  stepOrder?: number[];
  steps?: Step[];
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

/** Hunt metadata update (steps managed via separate endpoints) */
export interface HuntUpdate {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
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
  mode?: 'exact' | 'fuzzy' | 'contains' | 'numeric-range';
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
  aiModel?: 'gpt-4-vision' | 'claude-vision' | 'gemini-vision';
}

export interface Task {
  title?: string;
  /** What the player should do (shown to player) */
  instructions?: string;
  /** Instructions for AI to validate player's response */
  aiInstructions?: string;
  /** Which AI model to use for validation (future feature) */
  aiModel?: 'gpt-4' | 'claude' | 'gemini';
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
