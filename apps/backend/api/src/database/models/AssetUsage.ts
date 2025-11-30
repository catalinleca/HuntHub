import { Schema, model } from 'mongoose';
import { IAssetUsage } from '@/database/types';

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
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'AssetUsage',
  },
);

assetUsageSchema.index({ assetId: 1 });
assetUsageSchema.index({ huntId: 1 });
assetUsageSchema.index({ assetId: 1, huntId: 1 }, { unique: true });

const AssetUsageModel = model<IAssetUsage>('AssetUsage', assetUsageSchema);

export default AssetUsageModel;
