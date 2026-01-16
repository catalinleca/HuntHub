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
import { isDev } from '@/config/env.config';

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
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    await this.validateAllAssets(huntData, userId);

    return withTransaction(async (session) => {
      const diff = await this.computeStepChanges(huntId, huntVersion, huntData.steps || [], session);

      await this.updateHuntMetadata(huntId, huntVersion, huntData, session);

      const createdStepIds = await this.applyStepChanges(diff, huntId, huntVersion, session);
      await this.updateStepOrder(huntId, huntVersion, huntData.steps || [], createdStepIds, session);

      await this.usageTracker.rebuildHuntAssetUsage(huntId, session);

      if (isDev) {
        await HuntModel.findOneAndUpdate({ huntId }, { liveVersion: huntVersion }, { session });
      }

      return this.fetchHuntWithSteps(huntId, huntVersion, session);
    });
  }

  private async computeStepChanges(
    huntId: number,
    huntVersion: number,
    incomingSteps: Step[],
    session: ClientSession,
  ): Promise<StepDiff> {
    const existingSteps = await StepModel.find({ huntId, huntVersion }).session(session).lean();
    return this.calculateStepDiff(incomingSteps, existingSteps);
  }

  private async updateHuntMetadata(
    huntId: number,
    huntVersion: number,
    huntData: Hunt,
    session: ClientSession,
  ): Promise<void> {
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
  }

  private async applyStepChanges(
    diff: StepDiff,
    huntId: number,
    huntVersion: number,
    session: ClientSession,
  ): Promise<number[]> {
    await this.deleteRemovedSteps(diff.toDelete, huntId, huntVersion, session);
    await this.updateModifiedSteps(diff.toUpdate, huntId, huntVersion, session);
    return this.createNewSteps(diff.toCreate, huntId, huntVersion, session);
  }

  private async deleteRemovedSteps(
    stepIds: number[],
    huntId: number,
    huntVersion: number,
    session: ClientSession,
  ): Promise<void> {
    if (stepIds.length > 0) {
      await StepModel.deleteMany({ stepId: { $in: stepIds }, huntId, huntVersion }, { session });
    }
  }

  private async updateModifiedSteps(
    steps: StepDiff['toUpdate'],
    huntId: number,
    huntVersion: number,
    session: ClientSession,
  ): Promise<void> {
    for (const { stepId, data } of steps) {
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

      if (!result) {
        if (data.updatedAt) {
          throw new ConflictError(`Step ${stepId} was modified by another user. Please refresh and try again.`);
        }
        throw new Error(`Failed to update step ${stepId}: step not found within transaction`);
      }
    }
  }

  private async createNewSteps(
    steps: StepCreate[],
    huntId: number,
    huntVersion: number,
    session: ClientSession,
  ): Promise<number[]> {
    const createdStepIds: number[] = [];

    for (const step of steps) {
      const doc = StepMapper.toDocument(step, huntId, huntVersion);
      const [created] = await StepModel.create([doc], { session });
      createdStepIds.push(created.stepId);
    }

    return createdStepIds;
  }

  private async updateStepOrder(
    huntId: number,
    huntVersion: number,
    steps: Step[],
    createdStepIds: number[],
    session: ClientSession,
  ): Promise<void> {
    const newStepOrder = this.buildStepOrder(steps, createdStepIds);
    await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion },
      { stepOrder: newStepOrder },
      { session },
    ).exec();
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

    const orderedSteps = await StepModel.findOrdered(huntId, huntVersion, versionDoc.stepOrder || [], session);

    const hunt = HuntMapper.fromDocuments(huntDoc, versionDoc);
    return {
      ...hunt,
      steps: StepMapper.fromDocuments(orderedSteps),
    };
  }
}
