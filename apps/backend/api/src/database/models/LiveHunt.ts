import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { ILiveHunt } from '../types/LiveHunt';

const liveHuntSchema: Schema<ILiveHunt> = new Schema<ILiveHunt>(
  {
    huntId: {
      type: Number,
      required: true,
    },
    huntVersion: {
      type: Number,
      required: true,
    },
    activePlayerCount: {
      type: Number,
      default: 0,
    },
    lastPlayedAt: Date,
  },
  {
    timestamps: true,
  },
);

liveHuntSchema.index({ huntId: 1 }, { unique: true }); // Ensure only one live version per hunt
liveHuntSchema.index({ huntId: 1, huntVersion: 1 }); // FK to HuntVersion

interface ILiveHuntModel extends Model<ILiveHunt> {
  findByHunt(huntId: number): Promise<HydratedDocument<ILiveHunt> | null>;

  setLiveVersion(huntId: number, version: number): Promise<HydratedDocument<ILiveHunt>>;

  isLive(huntId: number): Promise<boolean>;
}

liveHuntSchema.statics.findByHunt = function (huntId: number) {
  return this.findOne({ huntId }).exec();
};

liveHuntSchema.statics.setLiveVersion = async function (huntId: number, version: number) {
  return this.findOneAndUpdate(
    { huntId },
    { huntId, huntVersion: version, activePlayerCount: 0, lastPlayedAt: new Date() },
    { upsert: true, new: true },
  ).exec();
};

liveHuntSchema.statics.isLive = async function (huntId: number): Promise<boolean> {
  const count = await this.countDocuments({ huntId }).limit(1);
  return count > 0;
};

const LiveHuntModel = model<ILiveHunt, ILiveHuntModel>('LiveHunt', liveHuntSchema);

export default LiveHuntModel;
