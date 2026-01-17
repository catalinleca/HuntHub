import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { HuntPermission } from '@hunthub/shared';
import { StoredPermission, IHuntShare, IHuntSharePopulated } from '@/database/types';

const huntShareSchema: Schema<IHuntShare> = new Schema<IHuntShare>(
  {
    huntId: {
      type: Number,
      required: true,
      ref: 'Hunt',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
    },
    sharedWithId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    permission: {
      type: String,
      enum: [HuntPermission.View, HuntPermission.Admin],
      default: HuntPermission.View,
      required: true,
    },
    sharedAt: {
      type: Date,
      default: () => new Date(),
    },
    sharedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'HuntAccess',
  },
);

// Unique constraint: Cannot share same hunt with same user twice
huntShareSchema.index({ huntId: 1, sharedWithId: 1 }, { unique: true });

// Performance: Find all hunts shared with a user (dashboard query)
huntShareSchema.index({ sharedWithId: 1 });

// Performance: Find all collaborators for a hunt
huntShareSchema.index({ huntId: 1, permission: 1 });

// Performance: Find all shares by owner (audit)
huntShareSchema.index({ ownerId: 1 });

huntShareSchema.methods.canEdit = function (): boolean {
  return this.permission === HuntPermission.Admin;
};

huntShareSchema.methods.canShare = function (): boolean {
  return this.permission === HuntPermission.Admin;
};

huntShareSchema.methods.canView = function (): boolean {
  return true;
};

interface IHuntShareModel extends Model<IHuntShare> {
  findSharedWithUser(userId: string): Promise<HydratedDocument<IHuntShare>[]>;
  findHuntCollaborators(huntId: number): Promise<HydratedDocument<IHuntSharePopulated>[]>;
  hasAccess(huntId: number, userId: string): Promise<boolean>;
  getPermission(huntId: number, userId: string): Promise<StoredPermission | null>;
  shareHunt(
    huntId: number,
    ownerId: string,
    sharedWithId: string,
    sharedBy: string,
    permission: StoredPermission,
  ): Promise<HydratedDocument<IHuntShare>>;
  updatePermission(
    huntId: number,
    sharedWithId: string,
    permission: StoredPermission,
  ): Promise<HydratedDocument<IHuntShare> | null>;
  revokeAccess(huntId: number, userId: string): Promise<boolean>;
}

huntShareSchema.statics.findSharedWithUser = function (userId: string) {
  return this.find({ sharedWithId: userId })
    .populate('ownerId', 'displayName email profilePicture')
    .sort({ sharedAt: -1 })
    .exec();
};

huntShareSchema.statics.findHuntCollaborators = function (huntId: number) {
  return this.find({ huntId })
    .populate('sharedWithId', 'displayName email profilePicture')
    .populate('sharedBy', 'displayName')
    .sort({ sharedAt: -1 })
    .exec();
};

huntShareSchema.statics.hasAccess = async function (huntId: number, userId: string): Promise<boolean> {
  const count = await this.countDocuments({ huntId, sharedWithId: userId }).limit(1);
  return count > 0;
};

huntShareSchema.statics.getPermission = async function (
  huntId: number,
  userId: string,
): Promise<StoredPermission | null> {
  const share = await this.findOne({ huntId, sharedWithId: userId }).select('permission').lean().exec();
  return share ? share.permission : null;
};

huntShareSchema.statics.shareHunt = function (
  huntId: number,
  ownerId: string,
  sharedWithId: string,
  sharedBy: string,
  permission: StoredPermission = HuntPermission.View,
) {
  return this.findOneAndUpdate(
    { huntId, sharedWithId },
    {
      huntId,
      ownerId,
      sharedWithId,
      sharedBy,
      permission,
      sharedAt: new Date(),
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  ).exec();
};

huntShareSchema.statics.updatePermission = function (
  huntId: number,
  sharedWithId: string,
  permission: StoredPermission,
) {
  return this.findOneAndUpdate({ huntId, sharedWithId }, { permission }, { new: true, runValidators: true }).exec();
};

huntShareSchema.statics.revokeAccess = async function (huntId: number, userId: string): Promise<boolean> {
  const result = await this.deleteOne({ huntId, sharedWithId: userId }).exec();
  return result.deletedCount > 0;
};

const HuntAccessModel = model<IHuntShare, IHuntShareModel>('HuntAccess', huntShareSchema);

export default HuntAccessModel;
