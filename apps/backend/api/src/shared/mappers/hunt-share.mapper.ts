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
    // FIX: Extract _id from populated user document and convert to string
    // REASON: shareDoc.sharedWithId is populated with full user document,
    // calling .toString() on document returns entire object as string.
    // We need userDoc._id.toString() to get the actual ID string.
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
}