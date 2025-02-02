import mongoose from 'mongoose';

export interface IPublishedHunt {
  _id: mongoose.Types.ObjectId;
  huntId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  name: string;
  publishedAt: Date;
  publishedBy: string;
}
