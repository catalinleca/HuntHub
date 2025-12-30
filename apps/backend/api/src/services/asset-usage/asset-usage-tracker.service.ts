import { injectable } from 'inversify';
import { ClientSession } from 'mongoose';
import { StepCreate } from '@hunthub/shared';
import { AssetUsageModel, StepModel } from '@/database/models';
import { AssetExtractor } from '@/utils/assetExtractor';
import { withTransaction } from '@/shared/utils/transaction';

export interface AssetSource {
  assetId: number;
  path: string;
}

export interface ExtractedAssets {
  assetIds: number[];
  sources: AssetSource[];
}

export interface IAssetUsageTracker {
  rebuildHuntAssetUsage(huntId: number, session?: ClientSession): Promise<void>;
  isAssetInUse(assetId: number): Promise<boolean>;
  getHuntsUsingAsset(assetId: number): Promise<number[]>;
}

@injectable()
export class AssetUsageTracker implements IAssetUsageTracker {
  async rebuildHuntAssetUsage(huntId: number, session?: ClientSession): Promise<void> {
    if (!session) {
      await withTransaction((s) => this.rebuildHuntAssetUsage(huntId, s));
      return;
    }

    const steps = await StepModel.find({ huntId }).session(session).lean();

    const assetIds = new Set<number>();
    for (const step of steps) {
      const extracted = AssetExtractor.fromDTO(step as unknown as StepCreate);
      extracted.assetIds.forEach((id) => assetIds.add(id));
    }

    await AssetUsageModel.deleteMany({ huntId }, { session });

    if (assetIds.size > 0) {
      const records = [...assetIds].map((assetId) => ({ assetId, huntId }));
      await AssetUsageModel.insertMany(records, { session });
    }
  }

  async isAssetInUse(assetId: number): Promise<boolean> {
    const exists = await AssetUsageModel.exists({ assetId });
    return !!exists;
  }

  async getHuntsUsingAsset(assetId: number): Promise<number[]> {
    const usages = await AssetUsageModel.find({ assetId }).select('huntId').lean();
    return usages.map((u) => u.huntId);
  }
}
