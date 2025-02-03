import { injectable } from 'inversify';
import { User } from '@/openapi/HuntHubTypes';
import { UserModel } from '@db/models';

export interface IUserService {
  getUserByFirebaseId(firebaseId: string): Promise<User | null>;
  createOrUpdateUser(userData: { firebaseId: string; email: string; displayName?: string }): Promise<User>;
}

@injectable()
export class UserService implements IUserService {
  async getUserByFirebaseId(firebaseId: string): Promise<User | null> {
    try {
      const user = await UserModel.findOne({
        firebaseId,
      }).lean({ virtuals: true });

      if (!user) {
        return null;
      }

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get user');
    }
  }

  async createOrUpdateUser(userData: { firebaseId: string; email: string; displayName?: string }): Promise<User> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { firebaseId: userData.firebaseId },
        {
          $set: {
            email: userData.email,
            displayName: userData.displayName,
          },
        },
        {
          new: true,
          upsert: true,
          lean: { virtuals: true },
        },
      );

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      } as User;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create/update user');
    }
  }
}
