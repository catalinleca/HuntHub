import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IHuntVersion } from '../types/HuntVersion';
import { locationSchema } from '@/database/schemas/location.schema';

const huntVersionSchema: Schema<IHuntVersion> = new Schema<IHuntVersion>(
  {
    huntId: {
      type: Number,
      required: true,
    },
    version: {
      type: Number,
      required: true,
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
    startLocation: locationSchema,
    stepOrder: {
      type: [Number],
      default: [],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    publishedBy: String,
  },
  {
    timestamps: true,
  },
);

// Compound unique index on huntId + version
huntVersionSchema.index({ huntId: 1, version: 1 }, { unique: true });
huntVersionSchema.index({ huntId: 1, isPublished: 1 });

interface IHuntVersionModel extends Model<IHuntVersion> {
  findByHuntAndVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion> | null>;

  findDraftByVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion> | null>;

  findPublishedVersions(huntId: number): Promise<HydratedDocument<IHuntVersion>[]>;
}

huntVersionSchema.statics.findByHuntAndVersion = function (huntId: number, version: number) {
  return this.findOne({ huntId, version }).exec();
};

huntVersionSchema.statics.findDraftByVersion = function (huntId: number, version: number) {
  return this.findOne({ huntId, version, isPublished: false }).exec();
};

huntVersionSchema.statics.findPublishedVersions = function (huntId: number) {
  return this.find({ huntId, isPublished: true }).sort({ version: -1 }).exec();
};

const HuntVersionModel = model<IHuntVersion, IHuntVersionModel>('HuntVersion', huntVersionSchema);

export default HuntVersionModel;
