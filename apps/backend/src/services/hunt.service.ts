import { Hunt, HuntCreate } from '@hunthub/shared';
import { injectable } from 'inversify';
import { HuntModel } from '@db/models';
import { NotFoundError } from '@/utils/errors/NotFoundError';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
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

    return createdHunt.toJSON() as Hunt;
  }

  async getAllHunts(): Promise<Hunt[]> {
    const hunts = await HuntModel.find().exec();

    return hunts.map((hunt) => hunt.toJSON()) as Hunt[];
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    const hunts = await HuntModel.find({
      creatorId: userId,
    }).exec();

    return hunts.map((hunt) => hunt.toJSON()) as Hunt[];
  }

  async getHuntById(id: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return hunt.toJSON() as Hunt;
  }

  async getUserHuntById(id: string, userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).exec();
    if (!hunt) {
      throw new NotFoundError();
    }

    return hunt.toJSON() as Hunt;
  }
}
