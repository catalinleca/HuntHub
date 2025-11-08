import { Schema, model } from 'mongoose';
import { IUser } from '../types/User';

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },
    lastName: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    displayName: {
      type: String,
      trim: true,
      maxLength: 50,
    },
    profilePicture: {
      type: String,
      ref: 'Asset',
      validate: {
        validator: function (v: string): boolean {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Profile picture must be a valid URL',
      },
    },
    bio: {
      type: String,
      maxLength: 500,
    },
  },
  {
    timestamps: true,
    collection: 'User',
  },
);

const UserModel = model('User', userSchema);

export default UserModel;
