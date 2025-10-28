import { HydratedDocument } from 'mongoose';
import { IUser } from '@/database/types/User';
import { User } from '@hunthub/shared';

export class UserMapper {
  static toDTO(doc: HydratedDocument<IUser>): User {
    return {
      id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      email: doc.email,
      firstName: doc.firstName,
      lastName: doc.lastName,
      displayName: doc.displayName,
      profilePicture: doc.profilePicture,
      bio: doc.bio,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOArray(docs: HydratedDocument<IUser>[]): User[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
