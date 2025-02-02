import { Schema, model, Document, Model, Types } from 'mongoose';
import { IUser, IUserFullProfile } from '@db/types/User';

interface UserStatics {
  findByFirebaseUid(firebaseUid: string): Promise<IUser | null>;
}

interface UserVirtuals {
  fullProfile: IUserFullProfile;
}

type UserDocument = Document<Types.ObjectId, {}, IUser> & IUser & UserVirtuals;

type UserModel = Model<UserDocument, {}, UserVirtuals> & UserStatics;

const userSchema = new Schema<IUser, UserModel, UserVirtuals>(
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
    displayName: {
      type: String,
      trim: true,
      maxLength: 100,
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

userSchema.static('findByFirebaseUid', function (firebaseUid: string) {
  return this.findOne({ firebaseUid });
});

userSchema.virtual('fullProfile').get(function (this: UserDocument) {
  return {
    id: this._id.toString(),
    firebaseUid: this.firebaseUid,
    email: this.email,
    displayName: this.displayName || this.email.split('@')[0],
    profilePicture: this.profilePicture,
    bio: this.bio ?? '',
  };
});

const User = model<IUser, UserModel>('User', userSchema);

export default User;
