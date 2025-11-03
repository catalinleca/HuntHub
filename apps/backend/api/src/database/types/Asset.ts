import mongoose from 'mongoose';
import { MimeTypes } from '@hunthub/shared';

export { MimeTypes };

export interface IStorageLocation {
  bucket?: string;
  path?: string;
}

export interface IAssetUsage {
  model: string;
  field: string; // 'challenge.mission.referenceAssetIds', 'profilePicture'
  documentId: mongoose.Types.ObjectId;
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
  usage?: IAssetUsage[];
  createdAt?: string;
  updatedAt?: string;
}
