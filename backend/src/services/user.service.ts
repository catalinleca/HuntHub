import { injectable } from 'inversify';
import { User } from '@/openapi/HuntHubTypes';
import { UserModel } from '@db/models';

export interface IUserService {
  getUserByFirebaseId(firebaseId: string): Promise<User | null>;
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
        firstName: user.firstName || '',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get user');
    }
  }
}
