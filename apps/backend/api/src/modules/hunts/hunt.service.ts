import { Hunt, HuntCreate } from '@hunthub/shared';
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
}

@injectable()
export class HuntService implements IHuntService {
  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const createdHunt = await HuntModel.create({
      creatorId,
      ...hunt,
    });

    return HuntMapper.toDTO(createdHunt);
  }

  async getAllHunts(): Promise<Hunt[]> {
    const hunts = await HuntModel.find().exec();
    return HuntMapper.toDTOArray(hunts);
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    // Using static method from Active Record pattern
    const hunts = await HuntModel.findUserHunts(userId);
    return HuntMapper.toDTOArray(hunts);
  }

  async getHuntById(id: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.toDTO(hunt);
  }

  async getUserHuntById(id: string, userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return HuntMapper.toDTO(hunt);
  }
}
