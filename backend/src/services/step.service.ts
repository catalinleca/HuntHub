import { inject, injectable } from 'inversify';
import { HuntModel, StepModel } from '@db/models';
import { NotFoundError } from '@/utils/errors/NotFoundError';
import { Step, StepCreate } from '@/openapi/HuntHubTypes';
import { stepCreateSchema } from '@/utils/validation/zodies';
import { HuntService } from '@/services/hunt.service';
import { TYPES } from '@/types';
import { executeTransaction } from '@db/withTransaction';
import { IHunt } from '@db/types/Hunt';
import { Types } from 'mongoose';
import { IStep } from '@db/types/Step';

export interface IStepService {
  createStep(step: StepCreate, creatorId: string): Promise<Step>;
  getAllSteps(): Promise<Step[]>;
  getStepById(id: string): Promise<Step>;
  getUserStepById(id: string, userId: string): Promise<Step>;
}

@injectable()
export class StepService implements IStepService {
  constructor(@inject(TYPES.HuntService) private huntService: HuntService) {}

  async createStep(step: StepCreate): Promise<Step> {
    return executeTransaction(async (session) => {
      const hunt = await HuntModel.findById<IHunt>(step.huntId).session(session).exec();
      if (!hunt) {
        throw new NotFoundError('Hunt not found');
      }

      const [createdStep] = await StepModel.create([step], { session });

      hunt.stepOrder.push(new Types.ObjectId(createdStep.id)); // TODO get this kind of logic outside service

      await hunt.save({ session });
      return createdStep.toObject<Step>();
    });
  }

  async getAllSteps(): Promise<Step[]> {
    const steps = await StepModel.find().exec();

    return steps.map((step) => step.toObject<Step>());
  }

  async getUserSteps(userId: string): Promise<Step[]> {
    const steps = await StepModel.find({
      creatorId: userId,
    }).exec();

    return steps.map((step) => step.toObject<Step>());
  }

  async getStepById(id: string): Promise<Step> {
    const step = await StepModel.findById(id).exec();
    if (!step) {
      throw new NotFoundError();
    }

    return step.toObject<Step>();
  }

  async getUserStepById(id: string, userId: string): Promise<Step> {
    const step = await StepModel.findById(id).where('creatorId').equals(userId).exec();
    if (!step) {
      throw new NotFoundError();
    }

    return step.toObject<Step>();
  }
}
