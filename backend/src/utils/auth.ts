import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { User } from '@/openapi/HuntHubTypes';
import { TYPES } from '@/types';
import { IUserService } from '@/services/user.service';
import { container } from '@/config/inversify';

export const authUser = async (token: DecodedIdToken): Promise<User> => {
  const userService = container.get<IUserService>(TYPES.UserService);

  try {
    const user = await userService.getUserByFirebaseId(token.uid);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to authenticate user');
  }
};
