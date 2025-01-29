import { Schema, model } from 'mongoose';
import { HuntStatus, HuntVisibility, IHunt } from '../schemas/Hunt';
import { locationSchema } from '../schemas/Location';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    isPublished: { type: Boolean, default: false },
    currentVersion: { type: Number, default: 1 },
    stepOrder: { type: [String], default: [] },
    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },
    visibility: {
      type: String,
      enum: Object.values(HuntVisibility),
      default: HuntVisibility.Private,
    },
    startLocation: locationSchema,
  },
  {
    timestamps: true,
  },
);

const Hunt = model('Hunt', huntSchema);

export default Hunt;
