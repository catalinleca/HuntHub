import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName?: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
