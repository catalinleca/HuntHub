import { HydratedDocument } from 'mongoose';
import { IAsset, IStorageLocation, IAssetUsage } from '@/database/types/Asset';

export interface AssetDTO {
  id: string;
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

export class AssetMapper {
  static toDTO(doc: HydratedDocument<IAsset>): AssetDTO {
    return {
      id: doc._id.toString(),
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

  static toDTOs(docs: HydratedDocument<IAsset>[]): AssetDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
