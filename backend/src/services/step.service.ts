import { injectable } from 'inversify';
import { StepModel } from '@db/models';
import { NotFoundError } from '@/utils/errors/NotFoundError';
import { Step, StepCreate } from '@/openapi/HuntHubTypes';

export interface IStepService {
  createStep(step: StepCreate, creatorId: string): Promise<Step>;
  getAllSteps(): Promise<Step[]>;
  getStepById(id: string): Promise<Step>;
  getUserStepById(id: string, userId: string): Promise<Step>;
}

@injectable()
export class StepService implements IStepService {
  async createStep(step: StepCreate, creatorId: string): Promise<Step> {
    const createdStep = await StepModel.create({
      creatorId,
      ...step,
    });

    return createdStep.toJSON() as Step;
  }

  async getAllSteps(): Promise<Step[]> {
    const steps = await StepModel.find().exec();

    return steps.map((step) => step.toJSON()) as Step[];
  }

  async getUserSteps(userId: string): Promise<Step[]> {
    const steps = await StepModel.find({
      creatorId: userId,
    }).exec();

    return steps.map((step) => step.toJSON()) as Step[];
  }

  async getStepById(id: string): Promise<Step> {
    const step = await StepModel.findById(id).exec();
    if (!step) {
      throw new NotFoundError();
    }

    return step.toJSON() as Step;
  }

  async getUserStepById(id: string, userId: string): Promise<Step> {
    const step = await StepModel.findById(id).where('creatorId').equals(userId).exec();
    if (!step) {
      throw new NotFoundError();
    }

    return step.toJSON() as Step;
  }
}
