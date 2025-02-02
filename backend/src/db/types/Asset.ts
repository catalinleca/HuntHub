import mongoose from 'mongoose';

export enum MimeTypes {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  MP4 = 'video/mp4',
}

export interface IAsset extends mongoose.Document {
  originalFilename?: string;
  size?: number;
  thumbnailUrl?: string;
  url: string;
  mimeType: MimeTypes;
  storageLocation?: {
    bucket?: string;
    path?: string;
  };
  huntId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  usage?: {
    model: string;
    field: string;
    documentId: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
