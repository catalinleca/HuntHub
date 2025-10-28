import mongoose from 'mongoose';

export enum MimeTypes {
  // Images
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  GIF = 'image/gif',
  WEBP = 'image/webp',

  // Video
  MP4 = 'video/mp4',
  WEBM = 'video/webm',

  // Audio
  MP3 = 'audio/mp3',
  WAV = 'audio/wav',
  OGG = 'audio/ogg',

  // Documents
  PDF = 'application/pdf',
}

export interface IStorageLocation {
  bucket?: string;
  path?: string;
}

export interface IAssetUsage {
  model: string; // e.g., 'Step', 'Hunt', 'User'
  field: string; // e.g., 'challenge.mission.referenceAssetIds', 'profilePicture'
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
