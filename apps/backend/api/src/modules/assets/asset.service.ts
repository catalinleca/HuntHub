import { inject, injectable } from 'inversify';
import { IStorageService } from '@/services/storage/storage.service';
import { IAssetUsageTracker } from '@/services/asset-usage';
import { NotFoundError, ValidationError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { MimeTypes } from '@/database/types';
import { AssetCreate, AssetDTO, AssetMapper } from '@/shared/mappers/asset.mapper';
import { AssetModel } from '@/database/models';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from '@/shared/utils/mimeTypes';
import { TYPES } from '@/shared/types';
import {
  PaginationParams,
  PaginatedResponse,
  buildPaginationMeta,
  calculateSkip,
  buildSortObject,
} from '@/shared/utils/pagination';

export interface IAssetService {
  requestUpload(userId: string, extension: string): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }>;
  createAsset(userId: string, assetData: AssetCreate): Promise<AssetDTO>;
  getUserAssets(
    userId: string,
    pagination: PaginationParams & { mimeType?: MimeTypes },
  ): Promise<PaginatedResponse<AssetDTO>>;
  getAssetById(assetId: number, userId: string): Promise<AssetDTO>;
  deleteAsset(assetId: number, userId: string): Promise<void>;
}

@injectable()
export class AssetService implements IAssetService {
  private maxSizeBytes = 10 * 1024 * 1024;

  constructor(
    @inject(TYPES.StorageService) private storageService: IStorageService,
    @inject(TYPES.AssetUsageTracker) private usageTracker: IAssetUsageTracker,
  ) {}

  async requestUpload(
    userId: string,
    extension: string,
  ): Promise<{ signedUrl: string; publicUrl: string; s3Key: string }> {
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

  async getUserAssets(
    userId: string,
    pagination: PaginationParams & { mimeType?: MimeTypes },
  ): Promise<PaginatedResponse<AssetDTO>> {
    const { page, limit, sortBy, sortOrder, mimeType } = pagination;

    const filter = {
      ownerId: userId,
      ...(mimeType && { mimeType }),
    };

    const total = await AssetModel.countDocuments(filter);
    const skip = calculateSkip(page, limit);
    const sortObject = buildSortObject(sortBy, sortOrder);

    const assets = await AssetModel.find(filter).sort(sortObject).skip(skip).limit(limit).exec();

    const assetDTOs = AssetMapper.fromDocuments(assets);
    const paginationMeta = buildPaginationMeta(total, page, limit);

    return {
      data: assetDTOs,
      pagination: paginationMeta,
    };
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

    // Check if asset is in use
    const isInUse = await this.usageTracker.isAssetInUse(asset._id.toString());
    if (isInUse) {
      const usageCount = await this.usageTracker.getUsageCount(asset._id.toString());
      throw new ConflictError(`Cannot delete asset: it is referenced by ${usageCount} step(s). Remove references first.`);
    }

    // TODO: Add S3 deletion when StorageService.deleteFile is implemented
    // if (asset.storageLocation?.path) {
    //   await this.storageService.deleteFile(asset.storageLocation.path);
    // }

    await asset.deleteOne();
  }
}
