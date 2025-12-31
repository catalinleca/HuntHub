import { HydratedDocument } from 'mongoose';
import { User } from '@hunthub/shared';
import { IUser } from '@/database/types/User';
import { SignUpCredentials, OAuthUserData } from '@/modules/auth/auth.types';

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

  static toOAuthDocument(dto: OAuthUserData): Partial<IUser> {
    return {
      firebaseUid: dto.firebaseUid,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      displayName: dto.displayName,
      profilePicture: dto.profilePicture,
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
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<IUser>[]): User[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
