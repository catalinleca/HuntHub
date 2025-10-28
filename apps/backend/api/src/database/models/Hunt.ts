import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IHunt } from '../types/Hunt';
import { locationSchema } from '@/database/schemas/location.schema';
import { HuntStatus } from '@hunthub/shared';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
huntSchema.index({ status: 1 });
huntSchema.index({ creatorId: 1, status: 1 });

interface IHuntModel extends Model<IHunt> {
  findUserHunts(userId: string): Promise<HydratedDocument<IHunt>[]>;

  findByIdAndCreator(huntId: string, userId: string): Promise<HydratedDocument<IHunt> | null>;

  hasHunts(userId: string): Promise<boolean>;

  findPublished(): Promise<HydratedDocument<IHunt>[]>;
}

huntSchema.statics.findUserHunts = function (userId: string) {
  return this.find({ creatorId: userId }).sort({ updatedAt: -1 }).exec();
};

huntSchema.statics.findByIdAndCreator = function (huntId: string, userId: string) {
  return this.findOne({
    _id: huntId,
    creatorId: userId,
  }).exec();
};

huntSchema.statics.hasHunts = async function (userId: string): Promise<boolean> {
  const count = await this.countDocuments({ creatorId: userId }).limit(1);
  return count > 0;
};

huntSchema.statics.findPublished = function () {
  return this.find({ status: HuntStatus.Published }).sort({ createdAt: -1 }).exec();
};

const HuntModel = model<IHunt, IHuntModel>('Hunt', huntSchema);

export default HuntModel;
