/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface HuntLocation {
  lat: number;
  lng: number;
  radius: number;
}

export enum HuntAccessType {
  Creator = 'creator',
  Viewer = 'viewer',
  Editor = 'editor',
}

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export enum OptionType {
  Choice = 'choice',
  Input = 'input',
}

export enum MissionType {
  UploadMedia = 'upload-media',
  MatchLocation = 'match-location',
}

export interface Hunt {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  currentVersion: number;
  status: HuntStatus;
  startLocation?: HuntLocation;
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

export interface Step {
  id?: string;
  huntId?: string;
  type?: ChallengeType;
  challenge?: Challenge;
  requiredLocation?: HuntLocation;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
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
  required?: any;
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

export interface Quiz {
  title?: string;
  description?: string;
  target?: Option;
  type?: OptionType;
  distractors?: Option[];
}

export interface Mission {
  title?: string;
  description?: string;
  targetAsset?: string;
  targetLocation?: HuntLocation;
  type?: MissionType;
}

export interface Task {
  title?: string;
  description?: string;
  target?: string;
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
