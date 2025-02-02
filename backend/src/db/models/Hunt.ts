import { Schema, model } from 'mongoose';
import { HuntStatus, IHunt } from '../types/Hunt';
import { locationSchema } from '../schemas';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    currentVersion: { type: Number, default: 1 },
    stepOrder: { type: [Schema.Types.ObjectId], ref: 'Step', default: [] },
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
