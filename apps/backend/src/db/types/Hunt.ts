import mongoose from 'mongoose';
import { ILocation } from './Location';
import { HuntStatus } from '@hunthub/shared';

export interface IHunt {
  id: string;
  creatorId: string; // TODO revert
  status: HuntStatus;
  name: string;
  description?: string;
  currentVersion: number;
  startLocation?: ILocation;
  stepOrder?: mongoose.Types.ObjectId[];
  createdAt?: string;
  updatedAt?: string;
}
