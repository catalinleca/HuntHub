import mongoose from 'mongoose';
import { MimeTypes } from '@hunthub/shared';

export { MimeTypes };

export interface IStorageLocation {
  bucket?: string;
  path?: string;
}

/**
 * IAsset - Database interface for Asset documents
 *
 * Assets are user-uploaded files (images, videos, audio)
 * Used for:
 * - Mission challenge reference images
 * - Player submitted photos/videos
 * - User profile pictures
 * - Hunt thumbnails
 */
export interface IAsset {
  id: string;
  assetId: number;
  ownerId: mongoose.Types.ObjectId;
  url: string;
  mimeType: MimeTypes;
  originalFilename?: string;
  size?: number;
  thumbnailUrl?: string;
  storageLocation?: IStorageLocation;
  // Mongoose provides Date objects; mappers convert to ISO strings for API
  createdAt?: Date;
  updatedAt?: Date;
}
