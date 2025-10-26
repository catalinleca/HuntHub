import { Schema, model } from 'mongoose';
import { ILiveHunt } from '@db/types';

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
