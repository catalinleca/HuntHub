import { Step, StepCreate, StepUpdate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import StepModel from '@/database/models/Step';
import HuntModel from '@/database/models/Hunt';
import { StepMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { NotFoundError } from '@/shared/errors';

export interface IStepService {
  createStep(stepData: StepCreate, huntId: string, userId: string): Promise<Step>;
  updateStep(stepId: string, huntId: string, stepData: StepUpdate, userId: string): Promise<Step>;
  deleteStep(stepId: string, huntId: string, userId: string): Promise<void>;
}

@injectable()
export class StepService implements IStepService {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async createStep(stepData: StepCreate, huntId: string, userId: string): Promise<Step> {
    await this.huntService.verifyOwnership(huntId, userId);

    const docData = StepMapper.toDocument(stepData, huntId);
    const createdStep = await StepModel.create(docData);

    await HuntModel.findByIdAndUpdate(huntId, {
      $push: { stepOrder: createdStep._id },
    });

    return StepMapper.fromDocument(createdStep);
  }

  async updateStep(
    stepId: string,
    huntId: string,
    stepData: StepUpdate,
    userId: string,
  ): Promise<Step> {
    await this.huntService.verifyOwnership(huntId, userId);

    const step = await StepModel.findById(stepId);
    if (!step) {
      throw new NotFoundError();
    }

    if (step.huntId.toString() !== huntId) {
      throw new NotFoundError();
    }

    const updateData = StepMapper.toDocumentUpdate(stepData);
    step.set(updateData);
    await step.save();

    return StepMapper.fromDocument(step);
  }

  async deleteStep(stepId: string, huntId: string, userId: string): Promise<void> {
    await this.huntService.verifyOwnership(huntId, userId);

    const step = await StepModel.findById(stepId);
    if (!step) {
      throw new NotFoundError();
    }

    if (step.huntId.toString() !== huntId) {
      throw new NotFoundError();
    }

    await HuntModel.findByIdAndUpdate(huntId, {
      $pull: { stepOrder: step._id },
    });

    await step.deleteOne();
  }
}
