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

export enum HuntVisibility {
  Private = 'private',
  Public = 'public',
  Unlisted = 'unlisted',
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

export interface Hunt {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  isPublished: boolean;
  currentVersion: number;
  status: HuntStatus;
  visibility?: HuntVisibility;
  startLocation?: HuntLocation;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt: string;
}

export interface User {
  firebaseUid: string;
  email: string;
  fistName?: string;
  lastName: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  createdAt: string;
  /**
   * @format date-time
   * @example "2024-02-01T10:12:45Z"
   */
  updatedAt: string;
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
