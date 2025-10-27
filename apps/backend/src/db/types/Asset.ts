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

export interface IAsset extends mongoose.Document {
  // Owner (user who uploaded this asset)
  ownerId: mongoose.Types.ObjectId;

  // File details
  url: string;
  mimeType: MimeTypes;
  originalFilename?: string;
  size?: number;
  thumbnailUrl?: string;

  // Storage details
  storageLocation?: {
    bucket?: string;
    path?: string;
  };

  // Track where this asset is used (optional)
  usage?: {
    model: string; // e.g., 'Step', 'Hunt', 'User'
    field: string; // e.g., 'challenge.mission.targetAssetId', 'profilePicture'
    documentId: mongoose.Types.ObjectId;
  }[];

  createdAt: Date;
  updatedAt: Date;
}
