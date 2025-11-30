import mongoose from 'mongoose';

/**
 * Models that can reference assets.
 * Extensible for future models.
 */
export type AssetReferenceModel = 'Step';

/**
 * IAssetUsageReference - Describes which document references an asset
 */
export interface IAssetUsageReference {
  model: AssetReferenceModel;
  documentId: mongoose.Types.ObjectId;
}

/**
 * IAssetUsage - Database interface for AssetUsage documents
 *
 * Separate collection for tracking asset references.
 * Benefits:
 * - Easy bidirectional queries (find usage by asset OR by step)
 * - Proper indexing for both directions
 * - Clean deletion protection checks
 * - Single source of truth for asset usage
 */
export interface IAssetUsage {
  assetId: mongoose.Types.ObjectId;
  referencedBy: IAssetUsageReference;
  field: string; // e.g., 'media.content.image.assetId', 'challenge.mission.referenceAssetIds[0]'
  createdAt?: Date;
}
