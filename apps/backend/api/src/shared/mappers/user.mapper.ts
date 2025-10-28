import { HydratedDocument } from 'mongoose';
import { User } from '@hunthub/shared';
import { IUser } from '@/database/types/User';
import { SignUpCredentials } from '@/modules/auth/auth.types';

export class UserMapper {
  static toDocument(dto: SignUpCredentials): Partial<IUser> {
    return {
      firebaseUid: dto.firebaseUid!,
      email: dto.email,
      firstName: dto.firstName,
      displayName: dto.displayName,
      // Mongoose provides defaults for: lastName, profilePicture, bio
    };
  }

  static fromDocument(doc: HydratedDocument<IUser>): User {
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

  static fromDocuments(docs: HydratedDocument<IUser>[]): User[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
