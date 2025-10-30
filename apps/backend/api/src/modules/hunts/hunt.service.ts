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
  getHuntById(id: string): Promise<Hunt>;
  getUserHuntById(id: string, userId: string): Promise<Hunt>;
  updateHunt(id: string, huntData: HuntUpdate, userId: string): Promise<Hunt>;
  deleteHunt(id: string, userId: string): Promise<void>;
  reorderSteps(huntId: string, stepOrder: string[], userId: string): Promise<Hunt>;
  verifyOwnership(huntId: string, userId: string): Promise<Hunt>;
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

  async getHuntById(id: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocument(hunt);
  }

  async getUserHuntById(id: string, userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findByIdAndCreator(id, userId)
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocument(hunt);
  }

  async updateHunt(id: string, huntData: HuntUpdate, userId: string): Promise<Hunt> {
    const existingHunt = await HuntModel.findByIdAndCreator(id, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    const updateData = HuntMapper.toDocumentUpdate(huntData);
    existingHunt.set(updateData);

    await existingHunt.save();
    return HuntMapper.fromDocument(existingHunt);
  }

  async deleteHunt(id: string, userId: string): Promise<void> {
    const existingHunt = await HuntModel.findByIdAndCreator(id, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    await StepModel.deleteMany({ huntId: id });

    await existingHunt.deleteOne();
  }

  async reorderSteps(huntId: string, stepOrder: string[], userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findByIdAndCreator(huntId, userId);
    if (!hunt) {
      throw new NotFoundError();
    }

    const stepObjectIds = stepOrder.map((id) => new Types.ObjectId(id));
    const stepsCount = await StepModel.countDocuments({
      _id: { $in: stepObjectIds },
      huntId: hunt._id,
    });

    if (stepsCount !== stepOrder.length) {
      throw new ValidationError('Invalid step IDs: some steps do not belong to this hunt', []);
    }

    hunt.stepOrder = stepObjectIds;
    await hunt.save();

    return HuntMapper.fromDocument(hunt);
  }

  async verifyOwnership(huntId: string, userId: string): Promise<Hunt> {
    const huntDoc = await HuntModel.findById(huntId);
    if (!huntDoc) {
      throw new NotFoundError();
    }

    if (huntDoc.creatorId.toString() !== userId) {
      throw new ForbiddenError();
    }

    return HuntMapper.fromDocument(huntDoc);
  }
}
