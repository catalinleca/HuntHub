import { Step, StepCreate, StepUpdate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import StepModel from '@/database/models/Step';
import { StepMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { NotFoundError } from '@/shared/errors';

export interface IStepService {
  createStep(stepData: StepCreate, huntId: number, userId: string): Promise<Step>;
  updateStep(stepId: number, huntId: number, stepData: StepUpdate, userId: string): Promise<Step>;
  deleteStep(stepId: number, huntId: number, userId: string): Promise<void>;
}

@injectable()
export class StepService implements IStepService {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async createStep(stepData: StepCreate, huntId: number, userId: string): Promise<Step> {
    const huntDoc = await this.huntService.verifyOwnership(huntId, userId);
    const huntVersion = huntDoc.latestVersion;

    const docData = StepMapper.toDocument(stepData, huntId, huntVersion);
    const createdStep = await StepModel.create(docData);

    // Update stepOrder in HuntVersion through HuntService
    await this.huntService.addStepToVersion(huntId, huntVersion, createdStep.stepId);

    return StepMapper.fromDocument(createdStep);
  }

  async updateStep(stepId: number, huntId: number, stepData: StepUpdate, userId: string): Promise<Step> {
    // Verify ownership and get Hunt master document
    const huntDoc = await this.huntService.verifyOwnership(huntId, userId);
    const huntVersion = huntDoc.latestVersion;

    // Find Step by stepId, huntId, and huntVersion (draft only)
    const step = await StepModel.findOne({ stepId, huntId, huntVersion }).exec();
    if (!step) {
      throw new NotFoundError();
    }

    // Update Step
    const updateData = StepMapper.toDocumentUpdate(stepData);
    step.set(updateData);
    await step.save();

    return StepMapper.fromDocument(step);
  }

  async deleteStep(stepId: number, huntId: number, userId: string): Promise<void> {
    // Verify ownership and get Hunt master document
    const huntDoc = await this.huntService.verifyOwnership(huntId, userId);
    const huntVersion = huntDoc.latestVersion;

    // Find Step by stepId, huntId, and huntVersion (draft only)
    const step = await StepModel.findOne({ stepId, huntId, huntVersion }).exec();
    if (!step) {
      throw new NotFoundError();
    }

    // Remove from HuntVersion stepOrder through HuntService
    await this.huntService.removeStepFromVersion(huntId, huntVersion, stepId);

    await step.deleteOne();
  }
}
