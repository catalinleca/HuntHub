import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { StepCreate } from '@hunthub/shared';
import { AssetUsageModel, StepModel } from '@/database/models';
import { AssetExtractor } from '@/utils/assetExtractor';
import { withTransaction } from '@/shared/utils/transaction';

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
 *
 * SIMPLIFIED: Hunt-level tracking with "rebuild from source" approach.
 */
export interface IAssetUsageTracker {
  /**
   * Rebuild asset usage for a hunt from source of truth (all steps)
   */
  rebuildHuntAssetUsage(huntId: number, session?: mongoose.ClientSession): Promise<void>;

  /**
   * Check if asset is used by any hunt
   */
  isAssetInUse(assetId: string): Promise<boolean>;

  /**
   * Get list of huntIds using an asset (for error messages)
   */
  getHuntsUsingAsset(assetId: string): Promise<number[]>;
}

/**
 * AssetUsageTracker - Manages asset usage tracking at hunt level
 *
 * SIMPLIFIED from step-level to hunt-level tracking.
 *
 * Key Design: "Rebuild from source of truth"
 * - Instead of incremental track/untrack, rebuild usage from all steps
 * - Always correct (source of truth = steps)
 * - No sync bugs possible
 * - Simple to understand
 * - Fast enough (hunts have ~10-50 steps max)
 *
 * Benefits:
 * - Fixes cascade delete bug (hunt delete cleans up directly)
 * - Tracks ALL versions (published and draft)
 * - No orphan records possible
 * - Simpler code (one rebuild function instead of track/untrack/update)
 */
@injectable()
export class AssetUsageTracker implements IAssetUsageTracker {
  /**
   * Rebuild asset usage for a hunt from source of truth (all steps)
   *
   * Scans ALL steps across ALL versions for this hunt and rebuilds usage records.
   *
   * @param huntId - Hunt ID (numeric)
   * @param session - MongoDB session for transaction support
   */
  async rebuildHuntAssetUsage(huntId: number, session?: mongoose.ClientSession): Promise<void> {
    if (!session) {
      await withTransaction((s) => this.rebuildHuntAssetUsage(huntId, s));
      return;
    }

    // 1. Get ALL steps across ALL versions (use session to see uncommitted changes)
    const steps = await StepModel.find({ huntId }).session(session).lean();

    // 2. Extract all unique asset IDs
    const assetIds = new Set<string>();
    for (const step of steps) {
      // Lean document shape matches StepCreate for asset extraction purposes
      const extracted = AssetExtractor.fromDTO(step as unknown as StepCreate);
      extracted.assetIds.forEach((id) => assetIds.add(id));
    }

    // 3. Replace usage records for this hunt (atomic delete + insert)
    await AssetUsageModel.deleteMany({ huntId }, { session });

    if (assetIds.size > 0) {
      const records = [...assetIds].map((id) => ({
        assetId: new mongoose.Types.ObjectId(id),
        huntId,
      }));
      await AssetUsageModel.insertMany(records, { session });
    }
  }

  /**
   * Check if asset is used by any hunt
   *
   * @param assetId - Asset ID (ObjectId string)
   * @returns True if asset is in use
   */
  async isAssetInUse(assetId: string): Promise<boolean> {
    const exists = await AssetUsageModel.exists({
      assetId: new mongoose.Types.ObjectId(assetId),
    });
    return !!exists;
  }

  /**
   * Get list of huntIds using an asset (for error messages)
   *
   * @param assetId - Asset ID (ObjectId string)
   * @returns Array of hunt IDs
   */
  async getHuntsUsingAsset(assetId: string): Promise<number[]> {
    const usages = await AssetUsageModel.find({
      assetId: new mongoose.Types.ObjectId(assetId),
    })
      .select('huntId')
      .lean();
    return usages.map((u) => u.huntId);
  }
}
