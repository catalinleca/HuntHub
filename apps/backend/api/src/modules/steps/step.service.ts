import { Step, StepCreate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import mongoose from 'mongoose';
import StepModel from '@/database/models/Step';
import { StepMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { NotFoundError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { IAuthorizationService } from '@/services/authorization/authorization.service';

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
  ) {}

  async createStep(stepData: StepCreate, huntId: number, userId: string): Promise<Step> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const docData = StepMapper.toDocument(stepData, huntId, huntVersion);
      const [createdStep] = await StepModel.create([docData], { session });

      await this.huntService.addStepToVersion(huntId, huntVersion, createdStep.stepId, session);

      await session.commitTransaction();
      return StepMapper.fromDocument(createdStep);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async updateStep(stepId: number, huntId: number, stepData: Step, userId: string): Promise<Step> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;
    const stepUpdateData = StepMapper.toDocumentUpdate(stepData);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
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

      await session.commitTransaction();
      return StepMapper.fromDocument(updatedStep);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async deleteStep(stepId: number, huntId: number, userId: string): Promise<void> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntVersion = huntDoc.latestVersion;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const step = await StepModel.findOne({ stepId, huntId, huntVersion }).session(session);
      if (!step) {
        throw new NotFoundError('Step not found');
      }

      await this.huntService.removeStepFromVersion(huntId, huntVersion, stepId, session);

      await step.deleteOne({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
