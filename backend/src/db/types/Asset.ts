import { Types } from 'mongoose';

export enum MimeTypes {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  MP4 = 'video/mp4',
}

export interface IAsset {
  originalFilename?: string;
  size?: number;
  thumbnailUrl?: string;
  url: string;
  mimeType: MimeTypes;
  storageLocation?: {
    bucket?: string;
    path?: string;
  };
  huntId: Types.ObjectId;
  ownerId: Types.ObjectId;
  usage?: {
    model: string;
    field: string;
    documentId: Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
