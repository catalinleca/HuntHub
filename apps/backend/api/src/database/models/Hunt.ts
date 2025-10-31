import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IHunt } from '../types/Hunt';
import { locationSchema } from '@/database/schemas/location.schema';
import { HuntStatus } from '@hunthub/shared';
import { getNextSequence } from './Counter';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    huntId: {
      type: Number,
      required: false,
      unique: true,
      index: true,
    },
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
    name: {
      type: String,
      required: true,
      minLength: [1, 'Hunt name cannot be empty'],
      maxLength: [100, 'Hunt name cannot exceed 100 characters'],
      trim: true,
    },
    description: {
      type: String,
      maxLength: [500, 'Hunt description cannot exceed 500 characters'],
    },
    currentVersion: { type: Number, default: 1 },
    stepOrder: { type: [Number], default: [] },
    startLocation: locationSchema,
  },
  {
    timestamps: true,
  },
);

huntSchema.pre('save', async function () {
  if (this.isNew && !this.huntId) {
    this.huntId = await getNextSequence('hunt');
  }
});

huntSchema.index({ huntId: 1 }, { unique: true });
huntSchema.index({ creatorId: 1 });
huntSchema.index({ status: 1 });
huntSchema.index({ creatorId: 1, status: 1 });

interface IHuntModel extends Model<IHunt> {
  findUserHunts(userId: string): Promise<HydratedDocument<IHunt>[]>;

  findByHuntIdAndCreator(huntId: number, userId: string): Promise<HydratedDocument<IHunt> | null>;

  hasHunts(userId: string): Promise<boolean>;

  findPublished(): Promise<HydratedDocument<IHunt>[]>;
}

huntSchema.statics.findUserHunts = function (userId: string) {
  return this.find({ creatorId: userId }).sort({ updatedAt: -1 }).exec();
};

huntSchema.statics.findByHuntIdAndCreator = function (huntId: number, userId: string) {
  return this.findOne({
    huntId: huntId,
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
