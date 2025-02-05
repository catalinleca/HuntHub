import { Schema, Document, model, Types, Model } from 'mongoose';
import { IPublishedHunt } from '../types/PublishedHunt';

interface PublishedHuntStatics {
  findLatestVersion(huntId: Types.ObjectId): Promise<IPublishedHunt | null>;
  findVersion(huntId: Types.ObjectId, version: number): Promise<IPublishedHunt | null>;
}

type PublishedHuntDocument = IPublishedHunt & Document<Types.ObjectId>;

type PublishedHuntModel = Model<PublishedHuntDocument, {}, PublishedHuntStatics>;

const publishedHuntSchema = new Schema<PublishedHuntDocument, PublishedHuntModel, PublishedHuntStatics>(
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
    version: { type: Number, required: true },
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
    timestamps: false,
  },
);

publishedHuntSchema.index({ huntId: 1, version: 1 }, { unique: true });
publishedHuntSchema.index({ huntId: 1, publishedAt: -1 });
publishedHuntSchema.index({ versionId: 1 }, { unique: true });

publishedHuntSchema.statics.findLatestVersion = function (huntId: Types.ObjectId) {
  return this.findOne({ huntId }).sort({ publishedAt: -1 }).exec();
};

publishedHuntSchema.statics.findVersion = function (huntId: Types.ObjectId, version: number) {
  return this.findOne({ huntId, version }).exec();
};

const PublishedHunt = model<PublishedHuntDocument, PublishedHuntModel>('PublishedHunt', publishedHuntSchema);

export default PublishedHunt;
