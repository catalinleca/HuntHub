import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IAssetUsage } from '../types/AssetUsage';

const assetUsageSchema: Schema<IAssetUsage> = new Schema<IAssetUsage>(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    huntId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
    collection: 'AssetUsage',
  },
);

// Indexes for efficient queries
assetUsageSchema.index({ assetId: 1 }); // Check if asset is in use
assetUsageSchema.index({ huntId: 1 }); // Delete all usage for a hunt
assetUsageSchema.index({ assetId: 1, huntId: 1 }, { unique: true }); // Prevent duplicates

interface IAssetUsageModel extends Model<IAssetUsage> {
  /**
   * Check if asset is referenced by any hunt
   */
  isAssetInUse(assetId: string): Promise<boolean>;

  /**
   * Get list of huntIds using an asset
   */
  getHuntsUsingAsset(assetId: string): Promise<number[]>;
}

assetUsageSchema.statics.isAssetInUse = async function (assetId: string): Promise<boolean> {
  const usage = await this.findOne({ assetId }).lean();
  return !!usage;
};

assetUsageSchema.statics.getHuntsUsingAsset = async function (assetId: string): Promise<number[]> {
  const usages = await this.find({ assetId }).select('huntId').lean();
  return usages.map((u: { huntId: number }) => u.huntId);
};

const AssetUsageModel = model<IAssetUsage, IAssetUsageModel>('AssetUsage', assetUsageSchema);

export default AssetUsageModel;
