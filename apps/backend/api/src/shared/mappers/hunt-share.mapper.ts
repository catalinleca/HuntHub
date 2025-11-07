import { ShareResult, Collaborator } from '@hunthub/shared';
import { IHuntShare } from '@/database/types/HuntAccess';
import { IUser } from '@/database/types/User';
import { HydratedDocument } from 'mongoose';

export class HuntShareMapper {
  static toShareResult(shareDoc: HydratedDocument<IHuntShare>): ShareResult {
    return {
      huntId: shareDoc.huntId,
      sharedWithId: shareDoc.sharedWithId.toString(),
      permission: shareDoc.permission,
      sharedAt: shareDoc.sharedAt.toISOString(),
      sharedBy: shareDoc.sharedBy.toString(),
    };
  }

  static toCollaborator(
    shareDoc: HydratedDocument<IHuntShare>,
    userDoc: HydratedDocument<IUser>,
    sharedByUser?: HydratedDocument<IUser>,
  ): Collaborator {
    return {
      userId: shareDoc.sharedWithId.toString(),
      displayName: userDoc.displayName || userDoc.email,
      email: userDoc.email,
      profilePicture: userDoc.profilePicture,
      permission: shareDoc.permission,
      sharedAt: shareDoc.sharedAt.toISOString(),
      sharedBy: sharedByUser?.displayName || sharedByUser?.email,
    };
  }
}