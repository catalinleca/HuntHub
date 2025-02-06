import { injectable } from 'inversify';
import { User } from '@/openapi/HuntHubTypes';
import { UserModel } from '@db/models';
import { SignUpCredentials } from '@/types/Auth';

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

    return user.toObject<User>();
  }

  async createUser(userData: Required<SignUpCredentials>): Promise<User> {
    const user = await UserModel.create(userData);

    return user.toObject<User>();
  }
}
