import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { AssetUsageModel } from '@/database/models';
import { AssetReferenceModel } from '@/database/types/AssetUsage';

/**
 * Extracted asset reference info
 */
export interface AssetSource {
  assetId: string;
  path: string;
}

/**
 * Result of asset extraction from a document
 */
export interface ExtractedAssets {
  assetIds: string[];
  sources: AssetSource[];
}

/**
 * Service interface for asset usage tracking
 */
export interface IAssetUsageTracker {
  trackUsage(
    extracted: ExtractedAssets,
    documentId: mongoose.Types.ObjectId,
    model?: AssetReferenceModel,
    session?: mongoose.ClientSession,
  ): Promise<void>;

  untrackUsage(documentId: mongoose.Types.ObjectId, session?: mongoose.ClientSession): Promise<void>;

  updateUsage(
    newExtracted: ExtractedAssets,
    documentId: mongoose.Types.ObjectId,
    model?: AssetReferenceModel,
    session?: mongoose.ClientSession,
  ): Promise<void>;

  getUsageCount(assetId: string): Promise<number>;

  isAssetInUse(assetId: string): Promise<boolean>;

  getUsageByAsset(
    assetId: string,
  ): Promise<Array<{ model: AssetReferenceModel; documentId: string; field: string }>>;
}

/**
 * AssetUsageTracker - Manages asset usage tracking in a separate collection
 *
 * Responsibilities:
 * - Track which documents reference which assets
 * - Support efficient queries in both directions (by asset, by document)
 * - Enable deletion protection checks
 * - Maintain data integrity during document lifecycle
 */
@injectable()
export class AssetUsageTracker implements IAssetUsageTracker {
  /**
   * Track asset usage for a document
   *
   * @param extracted - Extracted asset references from document
   * @param documentId - ID of the document referencing the assets
   * @param model - Model type (default: 'Step')
   * @param session - MongoDB session for transaction support
   */
  async trackUsage(
    extracted: ExtractedAssets,
    documentId: mongoose.Types.ObjectId,
    model: AssetReferenceModel = 'Step',
    session?: mongoose.ClientSession,
  ): Promise<void> {
    if (extracted.sources.length === 0) return;

    const usageRecords = extracted.sources.map((source) => ({
      assetId: new mongoose.Types.ObjectId(source.assetId),
      referencedBy: {
        model,
        documentId,
      },
      field: source.path,
    }));

    await AssetUsageModel.insertMany(usageRecords, { session });
  }

  /**
   * Remove all usage tracking for a document
   *
   * @param documentId - ID of the document being deleted
   * @param session - MongoDB session for transaction support
   */
  async untrackUsage(documentId: mongoose.Types.ObjectId, session?: mongoose.ClientSession): Promise<void> {
    await AssetUsageModel.deleteMany({ 'referencedBy.documentId': documentId }, { session });
  }

  /**
   * Update usage tracking for a document (remove old, add new)
   *
   * @param newExtracted - New extracted asset references
   * @param documentId - ID of the document
   * @param model - Model type (default: 'Step')
   * @param session - MongoDB session for transaction support
   */
  async updateUsage(
    newExtracted: ExtractedAssets,
    documentId: mongoose.Types.ObjectId,
    model: AssetReferenceModel = 'Step',
    session?: mongoose.ClientSession,
  ): Promise<void> {
    // Simple approach: remove all, add new
    // More efficient than diffing for most cases
    await this.untrackUsage(documentId, session);
    await this.trackUsage(newExtracted, documentId, model, session);
  }

  /**
   * Get count of documents referencing an asset
   *
   * @param assetId - Asset ID (string or ObjectId)
   * @returns Number of references
   */
  async getUsageCount(assetId: string): Promise<number> {
    return AssetUsageModel.countDocuments({
      assetId: new mongoose.Types.ObjectId(assetId),
    });
  }

  /**
   * Check if asset is referenced by any document
   *
   * @param assetId - Asset ID (string or ObjectId)
   * @returns True if asset is in use
   */
  async isAssetInUse(assetId: string): Promise<boolean> {
    const usage = await AssetUsageModel.findOne({
      assetId: new mongoose.Types.ObjectId(assetId),
    }).lean();
    return !!usage;
  }

  /**
   * Get all documents referencing an asset
   *
   * @param assetId - Asset ID (string or ObjectId)
   * @returns Array of usage records
   */
  async getUsageByAsset(
    assetId: string,
  ): Promise<Array<{ model: AssetReferenceModel; documentId: string; field: string }>> {
    const usages = await AssetUsageModel.find({
      assetId: new mongoose.Types.ObjectId(assetId),
    }).lean();

    return usages.map((u) => ({
      model: u.referencedBy.model,
      documentId: u.referencedBy.documentId.toString(),
      field: u.field,
    }));
  }
}
