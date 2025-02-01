import { Schema, model, Types } from 'mongoose';
import { IPublishedHunt } from '../types/PublishedHunt';

const publishedHuntSchema = new Schema<IPublishedHunt>(
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
    timestamps: true,
  },
);

publishedHuntSchema.index({ huntId: 1, version: 1 }, { unique: true }); // make huntId + version uniqeu
publishedHuntSchema.index({ huntId: 1, publishedAt: -1 });
publishedHuntSchema.index({ versionId: 1 }, { unique: true });

publishedHuntSchema.statics.findLatestVersion = (huntId: Types.ObjectId) => {
  return this.findOne({ huntId }).sort({ publishedAt: -1 }).exec();
};

publishedHuntSchema.statics.findVersion = (huntId: Types.ObjectId, version: number) => {
  return this.findOne({ huntId, version }).exec();
};

const PublishedHunt = model('PublishedHunt', publishedHuntSchema);

export default PublishedHunt;
