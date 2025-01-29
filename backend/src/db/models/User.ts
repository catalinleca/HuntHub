import { Schema, Types, model } from 'mongoose';

interface IUser {
  firebaseUid: string;
  email: string;
  displayName?: string;
  profilePicture?: Types.ObjectId;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    displayName: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    profilePicture: {
      type: String,
      ref: 'Asset',
      validate: {
        validator: (v) => {
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
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

userSchema.pre('save', (next) => {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.post('save', (error, doc, next) => {
  if (error?.name === 'MongoError' && error?.code === 11000) {
    next(new Error('Email or Firebase UID already exists'));
  } else {
    next(error);
  }
});

userSchema.statics.findByFirebaseUid = (firebaseUid) => {
  return this.findOne({ firebaseUid });
};

userSchema.virtual('fullProfile').get(() => {
  return {
    id: this._id,
    firebaseUid: this.firebaseUid,
    email: this.email,
    displayName: this.displayName || this.email.split('@')[0],
    profilePicture: this.profilePicture,
    bio: this.bio,
  };
});

const User = model('User', userSchema);

module.exports = User;
