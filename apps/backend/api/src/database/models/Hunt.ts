import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IHunt } from '../types/Hunt';
import { locationSchema } from '@/database/schemas/location.schema';
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

// Static methods (Active Record pattern)
interface IHuntModel extends Model<IHunt> {
  findUserHunts(userId: string): Promise<HydratedDocument<IHunt>[]>;
}

huntSchema.statics.findUserHunts = function(userId: string) {
  return this.find({ creatorId: userId }).exec();
};

const HuntModel = model<IHunt, IHuntModel>('Hunt', huntSchema);

export default HuntModel;
