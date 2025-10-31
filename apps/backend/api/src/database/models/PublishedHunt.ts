import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IPublishedHunt } from '../types/PublishedHunt';

const publishedHuntSchema: Schema<IPublishedHunt> = new Schema<IPublishedHunt>(
  {
    huntId: {
      type: Schema.Types.ObjectId,
      ref: 'Hunt',
      required: true,
      index: true,
    },
    versionId: {
      type: Schema.Types.ObjectId,
      ref: 'Hunt',
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    publishedBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

publishedHuntSchema.index({ huntId: 1, version: 1 }, { unique: true }); // Unique version per hunt
publishedHuntSchema.index({ huntId: 1, publishedAt: -1 }); // Recent versions first
publishedHuntSchema.index({ versionId: 1 }, { unique: true }); // Unique version ID

interface IPublishedHuntModel extends Model<IPublishedHunt> {
  findLatestVersion(huntId: string): Promise<HydratedDocument<IPublishedHunt> | null>;

  findVersion(huntId: string, version: number): Promise<HydratedDocument<IPublishedHunt> | null>;

  findAllVersions(huntId: string): Promise<HydratedDocument<IPublishedHunt>[]>;

  getNextVersionNumber(huntId: string): Promise<number>;

  hasPublishedVersions(huntId: string): Promise<boolean>;
}

publishedHuntSchema.statics.findLatestVersion = function (huntId: string) {
  return this.findOne({ huntId }).sort({ publishedAt: -1 }).exec();
};

publishedHuntSchema.statics.findVersion = function (huntId: string, version: number) {
  return this.findOne({ huntId, version }).exec();
};

publishedHuntSchema.statics.findAllVersions = function (huntId: string) {
  return this.find({ huntId }).sort({ publishedAt: -1 }).exec();
};

publishedHuntSchema.statics.getNextVersionNumber = async function (huntId: string): Promise<number> {
  const latest = await this.findOne({ huntId }).sort({ version: -1 }).exec();
  return latest ? latest.version + 1 : 1;
};

publishedHuntSchema.statics.hasPublishedVersions = async function (huntId: string): Promise<boolean> {
  const count = await this.countDocuments({ huntId }).limit(1);
  return count > 0;
};

const PublishedHuntModel = model<IPublishedHunt, IPublishedHuntModel>('PublishedHunt', publishedHuntSchema);

export default PublishedHuntModel;
