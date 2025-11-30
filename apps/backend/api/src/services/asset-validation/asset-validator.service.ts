import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { AssetModel } from '@/database/models';
import { NotFoundError, ForbiddenError, ValidationError } from '@/shared/errors';
import { ExtractedAssets } from '@/services/asset-usage';

export interface AssetValidationResult {
  assetId: string;
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
  assetExists(assetId: string): Promise<boolean>;
  userOwnsAsset(assetId: string, userId: string): Promise<boolean>;
}

@injectable()
export class AssetValidator implements IAssetValidator {
  async validateOrThrow(extracted: ExtractedAssets, userId: string): Promise<void> {
    if (extracted.sources.length === 0) return;

    for (const source of extracted.sources) {
      if (!mongoose.Types.ObjectId.isValid(source.assetId)) {
        throw new ValidationError(`Invalid asset ID format at ${source.path}: "${source.assetId}"`, [
          { field: source.path, message: `Invalid asset ID format: "${source.assetId}"` },
        ]);
      }
    }

    const objectIds = extracted.assetIds.map((id) => new mongoose.Types.ObjectId(id));
    const ownedAssets = await AssetModel.find({
      _id: { $in: objectIds },
      ownerId: userId,
    })
      .select('_id')
      .lean();

    const ownedIds = new Set(ownedAssets.map((a) => a._id.toString()));

    const unownedSources = extracted.sources.filter((s) => !ownedIds.has(s.assetId));
    if (unownedSources.length === 0) {
      return;
    }

    const unownedIds = [...new Set(unownedSources.map((s) => s.assetId))];
    const existingAssets = await AssetModel.find({
      _id: { $in: unownedIds.map((id) => new mongoose.Types.ObjectId(id)) },
    })
      .select('_id')
      .lean();

    const existingIds = new Set(existingAssets.map((a) => a._id.toString()));

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

    const validSources: typeof extracted.sources = [];
    for (const source of extracted.sources) {
      if (!mongoose.Types.ObjectId.isValid(source.assetId)) {
        results.push({
          assetId: source.assetId,
          path: source.path,
          exists: false,
          isOwned: false,
          error: 'Invalid asset ID format',
        });
        errors.push(`Invalid asset ID format at ${source.path}`);
      } else {
        validSources.push(source);
      }
    }

    if (validSources.length === 0) {
      return { valid: errors.length === 0, results, errors };
    }

    const validObjectIds = validSources.map((s) => new mongoose.Types.ObjectId(s.assetId));
    const ownedAssets = await AssetModel.find({
      _id: { $in: validObjectIds },
      ownerId: userId,
    })
      .select('_id')
      .lean();

    const ownedIds = new Set(ownedAssets.map((a) => a._id.toString()));

    const allAssets = await AssetModel.find({
      _id: { $in: validObjectIds },
    })
      .select('_id')
      .lean();

    const existingIds = new Set(allAssets.map((a) => a._id.toString()));

    for (const source of validSources) {
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

  async assetExists(assetId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return false;
    }
    const exists = await AssetModel.exists({
      _id: new mongoose.Types.ObjectId(assetId),
    });
    return !!exists;
  }

  async userOwnsAsset(assetId: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return false;
    }
    const exists = await AssetModel.exists({
      _id: new mongoose.Types.ObjectId(assetId),
      ownerId: userId,
    });
    return !!exists;
  }
}
