import { Schema, model } from 'mongoose';
import { ILiveHunt } from '../interfaces/LiveHunt';

const liveHuntSchema = new Schema<ILiveHunt>({
  versionId: {
    type: Schema.Types.ObjectId,
    ref: 'Hunt',
    required: true,
    unique: true,
  },
});

const LiveHunt = model('LiveHunt', liveHuntSchema);

export default LiveHunt;
