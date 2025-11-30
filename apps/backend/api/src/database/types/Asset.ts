import mongoose from 'mongoose';
import { MimeTypes } from '@hunthub/shared';

export { MimeTypes };

export interface IStorageLocation {
  bucket?: string;
  path?: string;
}

// Note: IAssetUsage is now defined in AssetUsage.ts for the separate collection approach
// The inline usage tracking in IAsset.usage is deprecated in favor of the AssetUsage collection

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
  // Note: usage is now tracked in the separate AssetUsage collection
  createdAt?: string;
  updatedAt?: string;
}
