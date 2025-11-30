import { Step, StepCreate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import StepModel from '@/database/models/Step';
import { StepMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { NotFoundError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { IAssetUsageTracker } from '@/services/asset-usage';
import { IAssetValidator } from '@/services/asset-validation';
import { AssetExtractor } from '@/utils';
import { withTransaction } from '@/shared/utils/transaction';

export interface IStepService {
  createStep(stepData: StepCreate, huntId: number, userId: string): Promise<Step>;
  updateStep(stepId: number, huntId: number, stepData: Step, userId: string): Promise<Step>;
  deleteStep(stepId: number, huntId: number, userId: string): Promise<void>;
}

@injectable()
export class StepService implements IStepService {
  constructor(
    @inject(TYPES.HuntService) private huntService: IHuntService,
    @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
    @inject(TYPES.AssetUsageTracker) private usageTracker: IAssetUsageTracker,
    @inject(TYPES.AssetValidator) private assetValidator: IAssetValidator,
  ) {}

  async createStep(stepData: StepCreate, huntId: number, userId: string): Promise<Step> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    // Extract and validate asset references before transaction
    const extracted = AssetExtractor.fromDTO(stepData);
    await this.assetValidator.validateOrThrow(extracted, userId);

    return withTransaction(async (session) => {
      const docData = StepMapper.toDocument(stepData, huntId, huntVersion);
      const [createdStep] = await StepModel.create([docData], { session });

      // Track asset usage
      await this.usageTracker.trackUsage(extracted, createdStep._id, 'Step', session);

      await this.huntService.addStepToVersion(huntId, huntVersion, createdStep.stepId, session);

      return StepMapper.fromDocument(createdStep);
    });
  }

  async updateStep(stepId: number, huntId: number, stepData: Step, userId: string): Promise<Step> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;
    const stepUpdateData = StepMapper.toDocumentUpdate(stepData);

    // Extract and validate asset references before transaction
    const extracted = AssetExtractor.fromDTO(stepData);
    await this.assetValidator.validateOrThrow(extracted, userId);

    return withTransaction(async (session) => {
      const updatedStep = await StepModel.findOneAndUpdate(
        {
          stepId,
          huntId,
          huntVersion,
          ...(stepData.updatedAt && { updatedAt: new Date(stepData.updatedAt) }),
        },
        stepUpdateData,
        { new: true, session },
      ).exec();

      if (!updatedStep) {
        const step = await StepModel.findOne({
          stepId,
          huntId,
          huntVersion,
        }).session(session);

        if (!step) {
          throw new NotFoundError('Step not found');
        }

        if (stepData.updatedAt) {
          throw new ConflictError('Step was modified by another user. Please refresh and try again.');
        }

        throw new Error('Update failed for unknown reason');
      }

      // Update asset usage tracking (remove old, add new)
      await this.usageTracker.updateUsage(extracted, updatedStep._id, 'Step', session);

      return StepMapper.fromDocument(updatedStep);
    });
  }

  async deleteStep(stepId: number, huntId: number, userId: string): Promise<void> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    await withTransaction(async (session) => {
      const step = await StepModel.findOne({ stepId, huntId, huntVersion }).session(session);
      if (!step) {
        throw new NotFoundError('Step not found');
      }

      // Untrack asset usage before deleting step
      await this.usageTracker.untrackUsage(step._id, session);

      await this.huntService.removeStepFromVersion(huntId, huntVersion, stepId, session);

      await step.deleteOne({ session });
    });
  }
}
