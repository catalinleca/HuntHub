import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { ILiveHunt } from '../types/LiveHunt';

const liveHuntSchema: Schema<ILiveHunt> = new Schema<ILiveHunt>(
  {
    versionId: {
      type: Schema.Types.ObjectId,
      ref: 'Hunt',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

liveHuntSchema.index({ versionId: 1 }, { unique: true }); // Ensure only one live version

interface ILiveHuntModel extends Model<ILiveHunt> {
  findByHunt(huntId: string): Promise<HydratedDocument<ILiveHunt> | null>;

  setLiveVersion(versionId: string): Promise<HydratedDocument<ILiveHunt>>;

  isLive(versionId: string): Promise<boolean>;
}

liveHuntSchema.statics.findByHunt = function (huntId: string) {
  return this.findOne({ huntId }).exec();
};

liveHuntSchema.statics.setLiveVersion = async function (versionId: string) {
  return this.findOneAndUpdate(
    {}, // Match any (since there's only one per hunt)
    { versionId },
    { upsert: true, new: true },
  ).exec();
};

liveHuntSchema.statics.isLive = async function (versionId: string): Promise<boolean> {
  const count = await this.countDocuments({ versionId }).limit(1);
  return count > 0;
};

const LiveHuntModel = model<ILiveHunt, ILiveHuntModel>('LiveHunt', liveHuntSchema);

export default LiveHuntModel;
