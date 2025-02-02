import mongoose from 'mongoose';
import { ILocation } from './Location';

export enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export interface IHunt extends mongoose.Document {
  creatorId: string; // TODO revert
  status: HuntStatus;
  name: string;
  description?: string;
  currentVersion: number;
  startLocation?: ILocation;
  stepOrder?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
