import mongoose from 'mongoose';

export interface IPublishedHunt {
  _id: mongoose.Types.ObjectId;
  huntId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  version: number;
  name: string;
  publishedAt: Date;
  publishedBy: string;
}
