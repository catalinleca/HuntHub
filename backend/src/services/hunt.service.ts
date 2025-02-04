import { Hunt, HuntCreate } from '@/openapi/HuntHubTypes';
import { inject, injectable } from 'inversify';
import { HuntModel } from '@db/models';
import { HuntSerializer } from '@db/serializers/hunt.serializer';
import { TYPES } from '@/types';
import { IHunt } from '@db/types/Hunt';
import { AppError } from '@/utils/errors/AppError';

export interface IHuntService {
  createHunt(hunt: HuntCreate): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getHuntById(id: string): Promise<Hunt>;
}

@injectable()
export class HuntService implements IHuntService {
  constructor(@inject(TYPES.HuntSerializer) private readonly huntSerializer: HuntSerializer) {}

  async createHunt(hunt: HuntCreate): Promise<Hunt> {
    try {
      const huntPayload = {
        creatorId: '123',
        ...hunt,
      };

      const createdHunt = await HuntModel.create(huntPayload);
      return this.huntSerializer.toDTO(createdHunt);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to create hunt');
    }
  }

  async getAllHunts(): Promise<Hunt[]> {
    try {
      const hunts = await HuntModel.find().lean<IHunt[]>().exec();

      console.log('===return huntModel: ', hunts);

      const huntsDTOs = hunts.map((hunt) => this.huntSerializer.toDTO(hunt));
      console.log('===return huntDTOs: ', huntsDTOs);

      return huntsDTOs;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get hunts');
    }
  }

  async getHuntById(id: string): Promise<Hunt> {
    try {
      const hunt = await HuntModel.findById(id).lean<IHunt>().exec();
      if (!hunt) {
        throw new AppError('Not found', 404);
      }
      return this.huntSerializer.toDTO(hunt);
    } catch (err) {
      console.error(err);
      throw new Error('Failed to get hunt');
    }
  }
}
