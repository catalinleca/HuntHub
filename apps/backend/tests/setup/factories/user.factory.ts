import { faker } from '@faker-js/faker';
import { UserModel } from '@db/models';
import { IUser } from '@db/types';

export interface CreateUserOptions {
  firebaseUid?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
}

/**
 * Create a test user in the database
 */
export const createTestUser = async (options: CreateUserOptions = {}): Promise<IUser> => {
  const userData = {
    firebaseUid: options.firebaseUid || faker.string.uuid(),
    email: options.email || faker.internet.email().toLowerCase(),
    firstName: options.firstName || faker.person.firstName(),
    lastName: options.lastName || faker.person.lastName(),
    displayName: options.displayName || faker.internet.username(),
    bio: options.bio || faker.lorem.sentence(),
  };

  const user = await UserModel.create(userData);
  return user.toJSON() as IUser;
};

/**
 * Create multiple test users
 */
export const createTestUsers = async (count: number, options: CreateUserOptions = {}): Promise<IUser[]> => {
  const users: IUser[] = [];

  for (let i = 0; i < count; i++) {
    const user = await createTestUser(options);
    users.push(user);
  }

  return users;
};

/**
 * Generate user data without saving to database
 */
export const generateUserData = (options: CreateUserOptions = {}): CreateUserOptions => {
  return {
    firebaseUid: options.firebaseUid || faker.string.uuid(),
    email: options.email || faker.internet.email().toLowerCase(),
    firstName: options.firstName || faker.person.firstName(),
    lastName: options.lastName || faker.person.lastName(),
    displayName: options.displayName || faker.internet.username(),
    bio: options.bio || faker.lorem.sentence(),
  };
};