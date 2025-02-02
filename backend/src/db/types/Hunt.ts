import mongoose from 'mongoose';
import { ILocation } from './Location';

export enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface IHunt extends mongoose.Document {
  creatorId: mongoose.Types.ObjectId;
  status: HuntStatus;
  name: string;
  description?: string;
  currentVersion: number;
  stepOrder?: mongoose.Types.ObjectId[];
  startLocation?: ILocation;
  createdAt?: Date;
  updatedAt?: Date;
}
