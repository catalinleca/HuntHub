import type { DecodedIdToken } from 'firebase-admin/auth';
import { TYPES } from '@/shared/types';
import { IUserService } from '@/modules/users/user.service';
import { container } from '@/config/inversify';
import { CompactUser } from '@/shared/types/CompactUser';
import { NotFoundError } from '@/shared/errors';

export const authUser = async (token: DecodedIdToken): Promise<CompactUser> => {
  const userService = container.get<IUserService>(TYPES.UserService);

  const user = await userService.getUserByFirebaseUid(token.uid);
  if (!user) {
    throw new NotFoundError();
  }

  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
  };
};
