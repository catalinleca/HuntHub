import { Hunt, HuntCreate } from '@/openapi/HuntHubTypes';
import { inject, injectable } from 'inversify';
import { HuntModel } from '@db/models';
import { HuntSerializer } from '@db/serializers/hunt.serializer';
import { TYPES } from '@/types';

export interface IHuntService {
  createHunt(hunt: HuntCreate): Promise<Hunt>;
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
}
