import { Schema, model } from 'mongoose';
import { IUser } from '@db/types/User';

const userSchema = new Schema<IUser>(
  {
    firebaseId: {
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.static('findByFirebaseId', function (firebaseId: string) {
  return this.findOne({ firebaseId });
});

const User = model<IUser>('User', userSchema);

export default User;
