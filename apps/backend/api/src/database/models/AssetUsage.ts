import { Schema, model } from 'mongoose';
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

const AssetUsageModel = model<IAssetUsage>('AssetUsage', assetUsageSchema);

export default AssetUsageModel;
