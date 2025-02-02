import mongoose from 'mongoose';

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePicture?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserFullProfile extends mongoose.Document {
  firebaseUid: string;
  email: string;
  displayName: string;
  profilePicture?: string;
  bio: string;
  createdAt?: Date;
  updatedAt?: Date;
}
