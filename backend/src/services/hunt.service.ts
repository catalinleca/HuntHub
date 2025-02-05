import { Hunt, HuntCreate } from '@/openapi/HuntHubTypes';
import { inject, injectable } from 'inversify';
import { HuntModel } from '@db/models';
import { HuntSerializer } from '@db/serializers/hunt.serializer';
import { TYPES } from '@/types';
import { IHunt } from '@db/types/Hunt';
import { NotFoundError } from '@/utils/errors/NotFoundError';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getHuntById(id: string): Promise<Hunt>;
  getUserHuntById(id: string, userId: string): Promise<Hunt>;
}

@injectable()
export class HuntService implements IHuntService {
  constructor(@inject(TYPES.HuntSerializer) private readonly huntSerializer: HuntSerializer) {}

  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const createdHunt = await HuntModel.create({
      creatorId,
      ...hunt,
    });

    return this.huntSerializer.toDTO(createdHunt);
  }

  async getAllHunts(): Promise<Hunt[]> {
    const hunts = await HuntModel.find().lean<IHunt[]>().exec();

    const huntsDTOs = hunts.map((hunt) => this.huntSerializer.toDTO(hunt));

    return huntsDTOs;
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    const hunts = await HuntModel.find({
      creatorId: userId,
    })
      .lean<IHunt[]>()
      .exec();

    const huntsDTOs = hunts.map((hunt) => this.huntSerializer.toDTO(hunt));

    return huntsDTOs;
  }

  async getHuntById(id: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).lean<IHunt>().exec();
    if (!hunt) {
      throw new NotFoundError();
    }
    return this.huntSerializer.toDTO(hunt);
  }

  async getUserHuntById(id: string, userId: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).where('creatorId').equals(userId).lean<IHunt>().exec();
    if (!hunt) {
      throw new NotFoundError();
    }
    return this.huntSerializer.toDTO(hunt);
  }
}
