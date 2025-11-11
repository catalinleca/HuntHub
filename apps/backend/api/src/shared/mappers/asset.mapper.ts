import { HydratedDocument, Types } from 'mongoose';
import { IAsset, MimeTypes } from '@/database/types/Asset';
import { awsS3Bucket } from '@/config/env.config';

export interface AssetDTO {
  id: string;
  assetId: number;
  ownerId: string;
  url: string;
  mimeType: string;
  originalFilename?: string;
  size?: number;
  thumbnailUrl?: string;
  storageLocation?: {
    bucket?: string;
    path?: string;
  };
  usage?: Array<{
    model: string;
    field: string;
    documentId: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetCreate {
  name: string;
  mime: string;
  sizeBytes: number;
  url: string;
  s3Key: string;
}

export class AssetMapper {
  static fromDocument(doc: HydratedDocument<IAsset>): AssetDTO {
    return {
      id: doc._id.toString(),
      assetId: doc.assetId,
      ownerId: doc.ownerId.toString(),
      url: doc.url,
      mimeType: doc.mimeType,
      originalFilename: doc.originalFilename,
      size: doc.size,
      thumbnailUrl: doc.thumbnailUrl,
      storageLocation: doc.storageLocation
        ? {
            bucket: doc.storageLocation.bucket,
            path: doc.storageLocation.path,
          }
        : undefined,
      usage: doc.usage?.map((u) => ({
        model: u.model,
        field: u.field,
        documentId: u.documentId.toString(),
      })),
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDocument(dto: AssetCreate, userId: string): Partial<IAsset> {
    return {
      ownerId: new Types.ObjectId(userId),
      url: dto.url,
      mimeType: dto.mime as MimeTypes,
      originalFilename: dto.name,
      size: dto.sizeBytes,
      storageLocation: {
        bucket: awsS3Bucket,
        path: dto.s3Key,
      },
    };
  }

  static fromDocuments(docs: HydratedDocument<IAsset>[]): AssetDTO[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
