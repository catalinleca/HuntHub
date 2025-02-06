import mongoose from 'mongoose';

export interface ILiveHunt extends mongoose.Document {
  versionId: mongoose.Types.ObjectId;
}
