import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { nanoid } from 'nanoid';
import { HuntAccessMode } from '@hunthub/shared';
import { IHunt } from '../types/Hunt';
import { getNextSequence } from './Counter';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    huntId: {
      type: Number,
      required: false,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    latestVersion: {
      type: Number,
      required: true,
      default: 1,
    },
    liveVersion: {
      type: Number,
      default: null,
    },
    releasedAt: Date,
    releasedBy: String,
    playSlug: {
      type: String,
      required: true,
      default: () => nanoid(6),
    },
    accessMode: {
      type: String,
      enum: Object.values(HuntAccessMode),
      default: HuntAccessMode.Open,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'Hunt',
  },
);

huntSchema.pre('save', async function () {
  if (this.isNew && !this.huntId) {
    this.huntId = await getNextSequence('hunt');
  }
});

huntSchema.index({ huntId: 1 }, { unique: true });
huntSchema.index({ creatorId: 1 });
huntSchema.index({ liveVersion: 1 });
huntSchema.index({ creatorId: 1, isDeleted: 1 }); // For user's active hunts
huntSchema.index({ liveVersion: 1, isDeleted: 1, createdAt: -1 }); // For discover hunts query
huntSchema.index({ playSlug: 1 }, { unique: true }); // For player access by slug

interface IHuntModel extends Model<IHunt> {
  findUserHunts(userId: string): Promise<HydratedDocument<IHunt>[]>;

  findByHuntIdAndCreator(huntId: number, userId: string): Promise<HydratedDocument<IHunt> | null>;

  hasHunts(userId: string): Promise<boolean>;

  findPublished(): Promise<HydratedDocument<IHunt>[]>;

  findHuntsByIds(ids: number[]): Promise<HydratedDocument<IHunt>[]>;
}

huntSchema.statics.findUserHunts = function (userId: string) {
  return this.find({ creatorId: userId, isDeleted: false }).sort({ updatedAt: -1 }).exec();
};

huntSchema.statics.findByHuntIdAndCreator = function (huntId: number, userId: string) {
  return this.findOne({
    huntId: huntId,
    creatorId: userId,
    isDeleted: false,
  }).exec();
};

huntSchema.statics.hasHunts = async function (userId: string): Promise<boolean> {
  const count = await this.countDocuments({ creatorId: userId, isDeleted: false }).limit(1);
  return count > 0;
};

huntSchema.statics.findPublished = function () {
  return this.find({ liveVersion: { $ne: null }, isDeleted: false })
    .sort({ createdAt: -1 })
    .exec();
};

huntSchema.statics.findHuntsByIds = function (ids: number[]) {
  return this.find({ huntId: { $in: ids }, isDeleted: false }).exec();
};

const HuntModel = model<IHunt, IHuntModel>('Hunt', huntSchema);

export default HuntModel;
