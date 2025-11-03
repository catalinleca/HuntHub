import { inject, injectable } from 'inversify';
import { IStorageService } from '@/services/storage/storage.service';
import { NotFoundError, ValidationError } from '@/shared/errors';
import { MimeTypes } from '@/database/types';
import { AssetCreate, AssetDTO, AssetMapper } from '@/shared/mappers/asset.mapper';
import { AssetModel } from '@/database/models';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from '@/shared/utils/mimeTypes';
import { awsS3Bucket } from '@/config/env.config';
import { TYPES } from '@/shared/types';

export interface IAssetService {
  requestUpload(userId: string, extension: string): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }>;
  createAsset(userId: string, assetData: AssetCreate): Promise<AssetDTO>;
  getUserAssets(userId: string, mimeType?: MimeTypes): Promise<AssetDTO[]>;
  getAssetById(assetId: number, userId: string): Promise<AssetDTO>;
  deleteAsset(assetId: number, userId: string): Promise<void>;
}

@injectable()
export class AssetService implements IAssetService {
  private maxSizeBytes = 10 * 1024 * 1024;

  constructor(@inject(TYPES.StorageService) private storageService: IStorageService) {}

  async requestUpload(userId: string, extension: string): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }> {
    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      throw new ValidationError(`Extension '${extension}' not allowed`, []);
    }

    const { signedUrl, publicUrl, s3Key } = await this.storageService.generateUploadUrls(userId, extension);

    return {
      signedUrl,
      publicUrl,
      s3Key,
    };
  }

  async createAsset(userId: string, assetCreate: AssetCreate): Promise<AssetDTO> {
    if (!ALLOWED_MIME_TYPES.includes(assetCreate.mime as MimeTypes)) {
      throw new ValidationError(`MIME type '${assetCreate.mime}' not allowed`, []);
    }

    if (assetCreate.sizeBytes > this.maxSizeBytes) {
      throw new ValidationError(`File size exceeds ${this.maxSizeBytes} bytes`, []);
    }

    const assetData = AssetMapper.toDocument(assetCreate, userId);
    const asset = await AssetModel.create(assetData);

    return AssetMapper.fromDocument(asset);
  }

  async getUserAssets(userId: string, mimeType?: MimeTypes): Promise<AssetDTO[]> {
    const assets = mimeType
      ? await AssetModel.findByOwnerAndType(userId, mimeType)
      : await AssetModel.findByOwner(userId);

    return AssetMapper.fromDocuments(assets);
  }

  async getAssetById(assetId: number, userId: string): Promise<AssetDTO> {
    const asset = await AssetModel.findOne({ assetId, ownerId: userId });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    return AssetMapper.fromDocument(asset);
  }

  async deleteAsset(assetId: number, userId: string): Promise<void> {
    const asset = await AssetModel.findOne({ assetId, ownerId: userId });

    if (!asset) {
      throw new NotFoundError('Asset not found');
    }

    await asset.deleteOne();
  }
}
