import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { AssetModel } from '@/database/models';
import { NotFoundError, ForbiddenError, ValidationError } from '@/shared/errors';
import { ExtractedAssets } from '@/services/asset-usage';

/**
 * Asset validation result for a single asset
 */
export interface AssetValidationResult {
  assetId: string;
  path: string;
  exists: boolean;
  isOwned: boolean;
  error?: string;
}

/**
 * Bulk validation result
 */
export interface BulkValidationResult {
  valid: boolean;
  results: AssetValidationResult[];
  errors: string[];
}

/**
 * Service interface for asset validation
 */
export interface IAssetValidator {
  validateOrThrow(extracted: ExtractedAssets, userId: string): Promise<void>;
  validateBulk(extracted: ExtractedAssets, userId: string): Promise<BulkValidationResult>;
  assetExists(assetId: string): Promise<boolean>;
  userOwnsAsset(assetId: string, userId: string): Promise<boolean>;
}

/**
 * AssetValidator - Validates asset references in step data
 *
 * Responsibilities:
 * - Validate asset ID format
 * - Check asset existence
 * - Verify asset ownership
 * - Provide detailed error messages with field paths
 */
@injectable()
export class AssetValidator implements IAssetValidator {
  /**
   * Validate asset references and throw on first error
   *
   * @param extracted - Extracted asset references
   * @param userId - ID of user who must own the assets
   * @throws ValidationError - If asset ID format is invalid
   * @throws NotFoundError - If asset doesn't exist
   * @throws ForbiddenError - If user doesn't own the asset
   */
  async validateOrThrow(extracted: ExtractedAssets, userId: string): Promise<void> {
    if (extracted.sources.length === 0) return;

    // 1. Validate ObjectId format
    for (const source of extracted.sources) {
      if (!mongoose.Types.ObjectId.isValid(source.assetId)) {
        throw new ValidationError(`Invalid asset ID format at ${source.path}: "${source.assetId}"`, [
          { field: source.path, message: `Invalid asset ID format: "${source.assetId}"` },
        ]);
      }
    }

    // 2. Bulk fetch owned assets (efficient single query)
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

  /**
   * Validate all asset references and return detailed results
   *
   * @param extracted - Extracted asset references
   * @param userId - ID of user who must own the assets
   * @returns Validation results for each asset reference
   */
  async validateBulk(extracted: ExtractedAssets, userId: string): Promise<BulkValidationResult> {
    const results: AssetValidationResult[] = [];
    const errors: string[] = [];

    if (extracted.sources.length === 0) {
      return { valid: true, results, errors };
    }

    // Separate valid and invalid ObjectIds
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

    // Fetch all assets (owned by user)
    const validObjectIds = validSources.map((s) => new mongoose.Types.ObjectId(s.assetId));
    const ownedAssets = await AssetModel.find({
      _id: { $in: validObjectIds },
      ownerId: userId,
    })
      .select('_id')
      .lean();

    const ownedIds = new Set(ownedAssets.map((a) => a._id.toString()));

    // Fetch all assets (any owner) to check existence
    const allAssets = await AssetModel.find({
      _id: { $in: validObjectIds },
    })
      .select('_id')
      .lean();

    const existingIds = new Set(allAssets.map((a) => a._id.toString()));

    // Check each valid source
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

  /**
   * Check if asset exists
   *
   * @param assetId - Asset ID to check
   * @returns True if asset exists
   */
  async assetExists(assetId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(assetId)) {
      return false;
    }
    const exists = await AssetModel.exists({
      _id: new mongoose.Types.ObjectId(assetId),
    });
    return !!exists;
  }

  /**
   * Check if user owns an asset
   *
   * @param assetId - Asset ID to check
   * @param userId - User ID to check ownership
   * @returns True if user owns the asset
   */
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
