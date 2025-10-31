import { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { injectable } from 'inversify';
import { Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import StepModel from '@/database/models/Step';
import { HuntMapper } from '@/shared/mappers';
import { NotFoundError, ForbiddenError } from '@/shared/errors';
import { ValidationError } from '@/shared/errors';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  getHuntById(huntId: number): Promise<Hunt>;
  getUserHuntById(huntId: number, userId: string): Promise<Hunt>;
  updateHunt(huntId: number, huntData: HuntUpdate, userId: string): Promise<Hunt>;
  deleteHunt(huntId: number, userId: string): Promise<void>;
  reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt>;
  verifyOwnership(huntId: number, userId: string): Promise<Hunt>;
}

@injectable()
export class HuntService implements IHuntService {
  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const docData = HuntMapper.toDocument(hunt, creatorId);
    const createdHunt = await HuntModel.create(docData);
    return HuntMapper.fromDocument(createdHunt);
  }

  async getAllHunts(): Promise<Hunt[]> {
    const hunts = await HuntModel.find().exec();
    return HuntMapper.fromDocuments(hunts);
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    const hunts = await HuntModel.findUserHunts(userId);
    return HuntMapper.fromDocuments(hunts);
  }

  async getHuntById(huntId: number): Promise<Hunt> {
    const hunt = await HuntModel.findOne({ huntId }).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocument(hunt);
  }

  async getUserHuntById(huntId: number, userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocument(hunt);
  }

  async updateHunt(huntId: number, huntData: HuntUpdate, userId: string): Promise<Hunt> {
    const existingHunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    const updateData = HuntMapper.toDocumentUpdate(huntData);
    existingHunt.set(updateData);

    await existingHunt.save();
    return HuntMapper.fromDocument(existingHunt);
  }

  async deleteHunt(huntId: number, userId: string): Promise<void> {
    const existingHunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    await StepModel.deleteMany({ huntId: huntId });

    await existingHunt.deleteOne();
  }

  async reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!hunt) {
      throw new NotFoundError();
    }

    const stepsCount = await StepModel.countDocuments({
      stepId: { $in: stepOrder },
      huntId: huntId,
    });

    if (stepsCount !== stepOrder.length) {
      throw new ValidationError('Invalid step IDs: some steps do not belong to this hunt', []);
    }

    hunt.stepOrder = stepOrder;
    await hunt.save();

    return HuntMapper.fromDocument(hunt);
  }

  async verifyOwnership(huntId: number, userId: string): Promise<Hunt> {
    const huntDoc = await HuntModel.findOne({ huntId }).exec();
    if (!huntDoc) {
      throw new NotFoundError();
    }

    if (huntDoc.creatorId.toString() !== userId) {
      throw new ForbiddenError();
    }

    return HuntMapper.fromDocument(huntDoc);
  }
}
