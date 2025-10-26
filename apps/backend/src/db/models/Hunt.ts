import { Schema, model } from 'mongoose';
import { IHunt } from '@db/types';
import { locationSchema } from '../schemas';
import { HuntStatus } from '@hunthub/shared';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: String, required: true }, // TODO revert
    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },
    name: { type: String, required: true },
    description: { type: String },
    currentVersion: { type: Number, default: 1 },
    stepOrder: { type: [Schema.Types.ObjectId], ref: 'Step', default: [] },
    startLocation: locationSchema,
  },
  {
    timestamps: true,
  },
);

huntSchema.index({ creatorId: 1 });
// huntSchema.index({ isPublished: 1, visibility: 1 });

const Hunt = model('Hunt', huntSchema);

export default Hunt;
