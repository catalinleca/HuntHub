import { faker } from '@faker-js/faker';
import { HuntModel } from '@/database/models';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt, ILocation } from '@/database/types';
import { HuntMapper } from '@/shared/mappers';

export interface CreateHuntOptions {
  creatorId?: string;
  name?: string;
  description?: string;
  startLocation?: ILocation;
  version?: number;
  isPublished?: boolean;
}

/**
 * Create a test hunt in the database (creates Hunt + HuntVersion)
 */
export const createTestHunt = async (options: CreateHuntOptions = {}): Promise<IHunt> => {
  const creatorId = options.creatorId || faker.string.uuid();
  const version = options.version || 1;

  // Create Hunt master record
  const huntData = HuntMapper.toHuntDocument(creatorId);
  const hunt = await HuntModel.create(huntData);

  // Create HuntVersion
  const versionData = HuntMapper.toVersionDocument(
    {
      name: options.name || faker.location.city() + ' Hunt',
      description: options.description || faker.lorem.paragraph(),
      startLocation: options.startLocation || {
        lat: faker.location.latitude(),
        lng: faker.location.longitude(),
        radius: 50,
      },
    },
    hunt.huntId,
    version,
  );

  // Override isPublished if specified
  if (options.isPublished !== undefined) {
    versionData.isPublished = options.isPublished;
  }

  await HuntVersionModel.create(versionData);

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
 * Generate hunt data for API requests (HuntCreate DTO)
 */
export const generateHuntData = (options: CreateHuntOptions = {}): any => {
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
