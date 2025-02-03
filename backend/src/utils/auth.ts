import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { TYPES } from '@/types';
import { IUserService } from '@/services/user.service';
import { container } from '@/config/inversify';
import { CompactUser } from '@/types/CompactUser';

export const authUser = async (token: DecodedIdToken): Promise<CompactUser> => {
  const userService = container.get<IUserService>(TYPES.UserService);

  try {
    const user = await userService.getUserByFirebaseId(token.uid);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      firebaseId: user.firebaseId,
      email: user.email,
    };
  } catch (err) {
    console.error(err);
    throw new Error('Failed to authenticate user');
  }
};
