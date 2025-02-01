import { Types } from 'mongoose';

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePicture?: Types.ObjectId;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
