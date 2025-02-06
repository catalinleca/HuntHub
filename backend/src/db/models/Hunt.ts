import { Schema, model } from 'mongoose';
import { HuntStatus, IHunt } from '../types/Hunt';
import { locationSchema } from '../schemas';
import { Step } from '@/openapi/HuntHubTypes';
import { IStep } from '@db/types/Step';

const huntSchema = new Schema<IHunt>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // TODO revert
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
    toObject: {
      transform: function (doc, ret) {
        // TODO: no bueno
        if (doc.populated('stepOrder')) {
          ret.stepOrder = (doc.stepOrder as any[]).map((step) => step.toObject());
        }
        return ret;
      },
    },
  },
);

huntSchema.index({ creatorId: 1 });
huntSchema.index({ isPublished: 1, visibility: 1 });

const Hunt = model('Hunt', huntSchema);

export default Hunt;
