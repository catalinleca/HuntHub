import { DecodedIdToken } from 'firebase-admin/lib/auth';
import { TYPES } from '@/types';
import { IUserService } from '@/services/user.service';
import { container } from '@/config/inversify';
import { CompactUser } from '@/types/CompactUser';
import { NotFoundError } from '@/utils/errors/NotFoundError';

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
