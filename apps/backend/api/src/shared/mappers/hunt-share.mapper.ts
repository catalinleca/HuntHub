import { ShareResult, Collaborator } from '@hunthub/shared';
import { IHuntShare, IHuntSharePopulated } from '@/database/types/HuntAccess';
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
      userId: userDoc._id.toString(),
      displayName: userDoc.displayName || userDoc.email,
      email: userDoc.email,
      profilePicture: userDoc.profilePicture,
      permission: shareDoc.permission,
      sharedAt: shareDoc.sharedAt.toISOString(),
      sharedBy: sharedByUser?.displayName || sharedByUser?.email,
    };
  }

  static toCollaboratorFromPopulated(shareDoc: HydratedDocument<IHuntSharePopulated>): Collaborator {
    const sharedWithUser = shareDoc.sharedWithId as unknown as HydratedDocument<IUser>;
    const sharedByUser = shareDoc.sharedBy as unknown as HydratedDocument<IUser>;

    return {
      userId: sharedWithUser._id.toString(),
      displayName: sharedWithUser.displayName || sharedWithUser.email,
      email: sharedWithUser.email,
      profilePicture: sharedWithUser.profilePicture,
      permission: shareDoc.permission,
      sharedAt: shareDoc.sharedAt.toISOString(),
      sharedBy: sharedByUser.displayName || sharedByUser.email,
    };
  }
}
