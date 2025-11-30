import { injectable } from 'inversify';
import mongoose from 'mongoose';
import { StepCreate } from '@hunthub/shared';
import { AssetUsageModel, StepModel } from '@/database/models';
import { AssetExtractor, toObjectId, toObjectIds } from '@/utils';
import { withTransaction } from '@/shared/utils/transaction';

export interface AssetSource {
  assetId: string;
  path: string;
}

export interface ExtractedAssets {
  assetIds: string[];
  sources: AssetSource[];
}

export interface IAssetUsageTracker {
  rebuildHuntAssetUsage(huntId: number, session?: mongoose.ClientSession): Promise<void>;
  isAssetInUse(assetId: string): Promise<boolean>;
  getHuntsUsingAsset(assetId: string): Promise<number[]>;
}

@injectable()
export class AssetUsageTracker implements IAssetUsageTracker {
  async rebuildHuntAssetUsage(huntId: number, session?: mongoose.ClientSession): Promise<void> {
    if (!session) {
      await withTransaction((s) => this.rebuildHuntAssetUsage(huntId, s));
      return;
    }

    const steps = await StepModel.find({ huntId }).session(session).lean();

    const assetIds = new Set<string>();
    for (const step of steps) {
      const extracted = AssetExtractor.fromDTO(step as unknown as StepCreate);
      extracted.assetIds.forEach((id) => assetIds.add(id));
    }

    await AssetUsageModel.deleteMany({ huntId }, { session });

    const objectIds = toObjectIds([...assetIds], { warnContext: `rebuildHuntAssetUsage(${huntId})` });

    if (objectIds.length > 0) {
      const records = objectIds.map((assetId) => ({ assetId, huntId }));
      await AssetUsageModel.insertMany(records, { session });
    }
  }

  async isAssetInUse(assetId: string): Promise<boolean> {
    const objectId = toObjectId(assetId);
    if (!objectId) {
      return false;
    }
    const exists = await AssetUsageModel.exists({ assetId: objectId });
    return !!exists;
  }

  async getHuntsUsingAsset(assetId: string): Promise<number[]> {
    const objectId = toObjectId(assetId);
    if (!objectId) {
      return [];
    }
    const usages = await AssetUsageModel.find({ assetId: objectId }).select('huntId').lean();
    return usages.map((u) => u.huntId);
  }
}
