import { injectable } from 'inversify';
import { AssetModel } from '@/database/models';
import { NotFoundError, ForbiddenError } from '@/shared/errors';
import { ExtractedAssets } from '@/services/asset-usage';

export interface AssetValidationResult {
  assetId: number;
  path: string;
  exists: boolean;
  isOwned: boolean;
  error?: string;
}

export interface BulkValidationResult {
  valid: boolean;
  results: AssetValidationResult[];
  errors: string[];
}

export interface IAssetValidator {
  validateOrThrow(extracted: ExtractedAssets, userId: string): Promise<void>;
  validateBulk(extracted: ExtractedAssets, userId: string): Promise<BulkValidationResult>;
  assetExists(assetId: number): Promise<boolean>;
  userOwnsAsset(assetId: number, userId: string): Promise<boolean>;
}

@injectable()
export class AssetValidator implements IAssetValidator {
  async validateOrThrow(extracted: ExtractedAssets, userId: string): Promise<void> {
    if (extracted.sources.length === 0) return;

    const ownedAssets = await AssetModel.find({
      assetId: { $in: extracted.assetIds },
      ownerId: userId,
    })
      .select('assetId')
      .lean();

    const ownedIds = new Set(ownedAssets.map((a) => a.assetId));

    const unownedSources = extracted.sources.filter((s) => !ownedIds.has(s.assetId));
    if (unownedSources.length === 0) {
      return;
    }

    const unownedIds = [...new Set(unownedSources.map((s) => s.assetId))];
    const existingAssets = await AssetModel.find({
      assetId: { $in: unownedIds },
    })
      .select('assetId')
      .lean();

    const existingIds = new Set(existingAssets.map((a) => a.assetId));

    for (const source of unownedSources) {
      if (!existingIds.has(source.assetId)) {
        throw new NotFoundError(`Asset not found at ${source.path}: "${source.assetId}"`);
      }
      throw new ForbiddenError(`You don't own the asset at ${source.path}: "${source.assetId}"`);
    }
  }

  async validateBulk(extracted: ExtractedAssets, userId: string): Promise<BulkValidationResult> {
    const results: AssetValidationResult[] = [];
    const errors: string[] = [];

    if (extracted.sources.length === 0) {
      return { valid: true, results, errors };
    }

    const ownedAssets = await AssetModel.find({
      assetId: { $in: extracted.assetIds },
      ownerId: userId,
    })
      .select('assetId')
      .lean();

    const ownedIds = new Set(ownedAssets.map((a) => a.assetId));

    const allAssets = await AssetModel.find({
      assetId: { $in: extracted.assetIds },
    })
      .select('assetId')
      .lean();

    const existingIds = new Set(allAssets.map((a) => a.assetId));

    for (const source of extracted.sources) {
      const exists = existingIds.has(source.assetId);
      const isOwned = ownedIds.has(source.assetId);

      let error: string | undefined;
      if (!exists) {
        error = 'Asset not found';
        errors.push(`Asset not found at ${source.path}`);
      } else if (!isOwned) {
        error = 'Asset not owned by user';
        errors.push(`Asset not owned by user at ${source.path}`);
      }

      results.push({
        assetId: source.assetId,
        path: source.path,
        exists,
        isOwned,
        error,
      });
    }

    return { valid: errors.length === 0, results, errors };
  }

  async assetExists(assetId: number): Promise<boolean> {
    const exists = await AssetModel.exists({ assetId });
    return !!exists;
  }

  async userOwnsAsset(assetId: number, userId: string): Promise<boolean> {
    const exists = await AssetModel.exists({ assetId, ownerId: userId });
    return !!exists;
  }
}
