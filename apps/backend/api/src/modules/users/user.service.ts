import { injectable } from 'inversify';
import { User } from '@hunthub/shared';
import UserModel from '@/database/models/User';
import { UserMapper } from '@/shared/mappers';
import { SignUpCredentials } from '@/modules/auth/auth.types';

export interface IUserService {
  getUserByFirebaseUid(firebaseUid: string): Promise<User | null>;
  createUser(userData: Required<SignUpCredentials>): Promise<User>;
}

@injectable()
export class UserService implements IUserService {
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const user = await UserModel.findOne({
      firebaseUid,
    }).exec();

    if (!user) {
      return null;
    }

    return UserMapper.toDTO(user);
  }

  async createUser(userData: Required<SignUpCredentials>): Promise<User> {
    const user = await UserModel.create(userData);

    return UserMapper.toDTO(user);
  }
}
