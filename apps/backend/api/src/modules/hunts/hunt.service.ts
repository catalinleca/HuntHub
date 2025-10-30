import { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { injectable } from 'inversify';
import HuntModel from '@/database/models/Hunt';
import { HuntMapper } from '@/shared/mappers';
import { NotFoundError } from '@/shared/errors';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  getHuntById(id: string): Promise<Hunt>;
  getUserHuntById(id: string, userId: string): Promise<Hunt>;
  updateHunt(id: string, huntData: HuntUpdate, userId: string): Promise<Hunt>;
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
    const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).exec();
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
}
