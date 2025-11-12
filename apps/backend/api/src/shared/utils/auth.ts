import type { DecodedIdToken } from 'firebase-admin/auth';
import { TYPES } from '@/shared/types';
import { IUserService } from '@/modules/users/user.service';
import { container } from '@/config/inversify';
import { CompactUser } from '@/shared/types/CompactUser';

const parseFullName = (fullName?: string): { firstName: string; lastName?: string } => {
  if (!fullName) return { firstName: '' };

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    return { firstName: parts[0] };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

export const authUser = async (token: DecodedIdToken): Promise<CompactUser> => {
  const userService = container.get<IUserService>(TYPES.UserService);

  let user = await userService.getUserByFirebaseUid(token.uid);

  if (!user) {
    console.log(`User with firebaseUid ${token.uid} not found. Creating OAuth user`);

    const { firstName, lastName } = parseFullName(token.name);

    user = await userService.createOAuthUser({
      firebaseUid: token.uid,
      email: token.email!,
      firstName: firstName || token.email!.split('@')[0],
      lastName,
      displayName: token.name || token.email!,
      profilePicture: token.picture,
    });
  }

  return {
    id: user.id,
    firebaseUid: user.firebaseUid,
    email: user.email,
  };
};
