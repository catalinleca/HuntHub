import mongoose from 'mongoose';

export interface IPublishedHunt extends mongoose.Document {
  huntId: mongoose.Types.ObjectId;
  versionId: mongoose.Types.ObjectId;
  version: number;
  name: string;
  publishedAt: Date;
  publishedBy: string;
}
