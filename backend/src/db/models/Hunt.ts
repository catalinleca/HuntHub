import { Schema, model } from 'mongoose';
import { HuntStatus, HuntVisibility, IHunt } from '../types/Hunt';
import { locationSchema } from '../schemas';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },

    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },

    stepOrder: { type: [Schema.Types.ObjectId], ref: 'Step', default: [] },
    name: { type: String, required: true },
    description: { type: String, required: true },

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

huntSchema.index({ creatorId: 1 });
huntSchema.index({ isPublished: 1, visibility: 1 });

const Hunt = model('Hunt', huntSchema);

export default Hunt;
