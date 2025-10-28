import { faker } from '@faker-js/faker';
import { HuntModel } from '@/database/models';
import { IHunt, ILocation } from '@/database/types';
import { HuntStatus } from '@hunthub/shared';

export interface CreateHuntOptions {
  creatorId?: string;
  status?: HuntStatus;
  name?: string;
  description?: string;
  currentVersion?: number;
  startLocation?: ILocation;
}

/**
 * Create a test hunt in the database
 */
export const createTestHunt = async (options: CreateHuntOptions = {}): Promise<IHunt> => {
  const huntData = {
    creatorId: options.creatorId || faker.string.uuid(),
    status: options.status || HuntStatus.Draft,
    name: options.name || faker.location.city() + ' Hunt',
    description: options.description || faker.lorem.paragraph(),
    currentVersion: options.currentVersion || 1,
    startLocation: options.startLocation || {
      lat: faker.location.latitude(),
      lng: faker.location.longitude(),
      radius: 50,
    },
  };

  const hunt = await HuntModel.create(huntData);
  return hunt.toJSON() as IHunt;
};

/**
 * Create multiple test hunts
 */
export const createTestHunts = async (count: number, options: CreateHuntOptions = {}): Promise<IHunt[]> => {
  const hunts: IHunt[] = [];

  for (let i = 0; i < count; i++) {
    const hunt = await createTestHunt(options);
    hunts.push(hunt);
  }

  return hunts;
};

/**
 * Generate hunt data without saving to database
 */
export const generateHuntData = (options: CreateHuntOptions = {}): Partial<IHunt> => {
  return {
    name: options.name || faker.location.city() + ' Hunt',
    description: options.description || faker.lorem.paragraph(),
    startLocation: options.startLocation || {
      lat: faker.location.latitude(),
      lng: faker.location.longitude(),
      radius: 50,
    },
  };
};
