import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IAssetUsage, AssetReferenceModel } from '../types/AssetUsage';

const assetUsageSchema: Schema<IAssetUsage> = new Schema<IAssetUsage>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    referencedBy: {
      model: {
        type: String,
        required: true,
        enum: ['Step'] as AssetReferenceModel[],
      },
      documentId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'referencedBy.model',
      },
    },
    field: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
    collection: 'AssetUsage',
  },
);

// Indexes for efficient queries
assetUsageSchema.index({ assetId: 1 }); // Find usage by asset
assetUsageSchema.index({ 'referencedBy.documentId': 1 }); // Find usage by step
assetUsageSchema.index({ assetId: 1, 'referencedBy.documentId': 1, field: 1 }, { unique: true }); // Prevent duplicates

interface IAssetUsageModel extends Model<IAssetUsage> {
  /**
   * Find all usage records for an asset
   */
  findByAsset(assetId: string): Promise<HydratedDocument<IAssetUsage>[]>;

  /**
   * Find all usage records for a document (e.g., Step)
   */
  findByDocument(documentId: string): Promise<HydratedDocument<IAssetUsage>[]>;

  /**
   * Count how many documents reference this asset
   */
  countUsage(assetId: string): Promise<number>;

  /**
   * Check if asset is referenced anywhere
   */
  isAssetInUse(assetId: string): Promise<boolean>;
}

assetUsageSchema.statics.findByAsset = function (assetId: string) {
  return this.find({ assetId }).exec();
};

assetUsageSchema.statics.findByDocument = function (documentId: string) {
  return this.find({ 'referencedBy.documentId': documentId }).exec();
};

assetUsageSchema.statics.countUsage = function (assetId: string) {
  return this.countDocuments({ assetId });
};

assetUsageSchema.statics.isAssetInUse = async function (assetId: string): Promise<boolean> {
  const usage = await this.findOne({ assetId }).lean();
  return !!usage;
};

const AssetUsageModel = model<IAssetUsage, IAssetUsageModel>('AssetUsage', assetUsageSchema);

export default AssetUsageModel;
