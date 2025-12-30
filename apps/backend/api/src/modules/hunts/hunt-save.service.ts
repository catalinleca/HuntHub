import { Hunt, Step, StepCreate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import { ClientSession } from 'mongoose';
import StepModel from '@/database/models/Step';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IStep } from '@/database/types/Step';
import { HuntMapper, StepMapper } from '@/shared/mappers';
import { NotFoundError, ValidationError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { IAssetUsageTracker, AssetSource } from '@/services/asset-usage';
import { IAssetValidator } from '@/services/asset-validation';
import { AssetExtractor } from '@/utils';
import { withTransaction } from '@/shared/utils/transaction';

export interface IHuntSaveService {
  saveHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt>;
}

interface StepDiff {
  toCreate: StepCreate[];
  toUpdate: Array<{ stepId: number; data: Step }>;
  toDelete: number[];
}

@injectable()
export class HuntSaveService implements IHuntSaveService {
  constructor(
    @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
    @inject(TYPES.AssetUsageTracker) private usageTracker: IAssetUsageTracker,
    @inject(TYPES.AssetValidator) private assetValidator: IAssetValidator,
  ) {}

  async saveHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt> {
    // 1. Authorization
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    // 2. Validate all assets upfront (fail fast before transaction)
    await this.validateAllAssets(huntData, userId);

    // 3. Execute transaction
    return withTransaction(async (session) => {
      // 3a. Query existing steps inside transaction to avoid TOCTOU race
      const existingSteps = await StepModel.find({ huntId, huntVersion }).session(session).lean();
      const diff = this.calculateStepDiff(huntData.steps || [], existingSteps);

      // 3b. Update hunt version metadata
      const huntUpdateData = HuntMapper.toVersionUpdate(huntData);
      const updatedVersion = await HuntVersionModel.findOneAndUpdate(
        {
          huntId,
          version: huntVersion,
          isPublished: false,
          ...(huntData.updatedAt && { updatedAt: new Date(huntData.updatedAt) }),
        },
        huntUpdateData,
        { new: true, session },
      ).exec();

      if (!updatedVersion) {
        await this.handleUpdateFailure(huntId, huntVersion, huntData.updatedAt, session);
      }

      // 3c. Delete removed steps
      if (diff.toDelete.length > 0) {
        await StepModel.deleteMany({ stepId: { $in: diff.toDelete }, huntId, huntVersion }, { session });
      }

      // 3d. Update existing steps
      for (const { stepId, data } of diff.toUpdate) {
        const updateData = StepMapper.toDocumentUpdate(data);
        const result = await StepModel.findOneAndUpdate(
          {
            stepId,
            huntId,
            huntVersion,
            ...(data.updatedAt && { updatedAt: new Date(data.updatedAt) }),
          },
          updateData,
          { new: true, session },
        ).exec();

        if (!result && data.updatedAt) {
          throw new ConflictError(`Step ${stepId} was modified by another user. Please refresh and try again.`);
        }
      }

      // 3e. Create new steps sequentially to guarantee order and trigger pre-save hooks
      const createdStepIds: number[] = [];
      for (const step of diff.toCreate) {
        const doc = StepMapper.toDocument(step, huntId, huntVersion);
        const [created] = await StepModel.create([doc], { session });
        createdStepIds.push(created.stepId);
      }

      // 3f. Update stepOrder (preserve incoming order, map new steps to their generated IDs)
      const newStepOrder = this.buildStepOrder(huntData.steps || [], createdStepIds);
      await HuntVersionModel.findOneAndUpdate(
        { huntId, version: huntVersion },
        { stepOrder: newStepOrder },
        { session },
      ).exec();

      // 3g. Rebuild asset usage
      await this.usageTracker.rebuildHuntAssetUsage(huntId, session);

      // 4. Fetch and return updated hunt with steps
      return this.fetchHuntWithSteps(huntId, huntVersion, session);
    });
  }

  private async validateAllAssets(huntData: Hunt, userId: string): Promise<void> {
    const sources: AssetSource[] = [];

    // Extract from coverImage
    if (huntData.coverImage) {
      AssetExtractor.extractFromMedia(huntData.coverImage, 'coverImage', sources);
    }

    // Extract from all steps
    for (const step of huntData.steps || []) {
      const extracted = AssetExtractor.fromDTO(step);
      sources.push(...extracted.sources);
    }

    // Dedupe and validate
    const uniqueAssetIds = [...new Set(sources.map((s) => s.assetId))];
    if (uniqueAssetIds.length > 0) {
      await this.assetValidator.validateOrThrow({ assetIds: uniqueAssetIds, sources }, userId);
    }
  }

  private calculateStepDiff(incoming: Step[], existing: IStep[]): StepDiff {
    const existingMap = new Map(existing.map((s) => [s.stepId, s]));
    const incomingWithIds = incoming.filter((s) => s.stepId != null);
    const incomingIds = new Set(incomingWithIds.map((s) => s.stepId));

    const toUpdate: StepDiff['toUpdate'] = [];
    for (const step of incomingWithIds) {
      const existingStep = existingMap.get(step.stepId!);
      if (existingStep && this.hasStepChanged(step, existingStep)) {
        toUpdate.push({ stepId: step.stepId!, data: step });
      }
    }

    return {
      toCreate: incoming.filter((s) => s.stepId == null) as StepCreate[],
      toUpdate,
      toDelete: [...existingMap.keys()].filter((id) => !incomingIds.has(id)),
    };
  }

  private hasStepChanged(incoming: Step, existing: IStep): boolean {
    const incomingData = StepMapper.toDocumentUpdate(incoming);
    const existingData = StepMapper.toComparableData(existing);
    return JSON.stringify(incomingData) !== JSON.stringify(existingData);
  }

  private buildStepOrder(steps: Step[], createdIds: number[]): number[] {
    let createIndex = 0;
    return steps.map((step) => {
      if (step.stepId != null) {
        return step.stepId;
      }

      return createdIds[createIndex++];
    });
  }

  private async handleUpdateFailure(
    huntId: number,
    huntVersion: number,
    updatedAt: string | undefined,
    session: ClientSession,
  ): Promise<never> {
    const versionDoc = await HuntVersionModel.findOne({
      huntId,
      version: huntVersion,
    }).session(session);

    if (!versionDoc) {
      throw new NotFoundError('Hunt version not found');
    }

    if (versionDoc.isPublished) {
      throw new ValidationError('Cannot edit published version. Please create a new version or unpublish first.', []);
    }

    if (updatedAt) {
      throw new ConflictError('Hunt was modified by another user. Please refresh and try again.');
    }

    throw new Error('Update failed for unknown reason');
  }

  private async fetchHuntWithSteps(huntId: number, huntVersion: number, session: ClientSession): Promise<Hunt> {
    const huntDoc = await HuntModel.findOne({ huntId }).session(session).exec();
    if (!huntDoc) {
      throw new NotFoundError('Hunt not found');
    }

    const versionDoc = await HuntVersionModel.findOne({ huntId, version: huntVersion }).session(session).exec();
    if (!versionDoc) {
      throw new NotFoundError('Hunt version not found');
    }

    const stepDocs = await StepModel.find({ huntId, huntVersion }).sort({ stepId: 1 }).session(session).exec();

    const hunt = HuntMapper.fromDocuments(huntDoc, versionDoc);
    return {
      ...hunt,
      steps: StepMapper.fromDocuments(stepDocs),
    };
  }
}
