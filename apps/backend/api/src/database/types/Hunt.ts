import mongoose from 'mongoose';
import { ILocation } from '@/database/schemas/location.schema';
import { HuntStatus } from '@hunthub/shared';

export interface IHunt {
  id: string;
  creatorId: mongoose.Types.ObjectId;
  status: HuntStatus;
  name: string;
  description?: string;
  currentVersion: number;
  startLocation?: ILocation;
  stepOrder?: mongoose.Types.ObjectId[];
  createdAt?: string;
  updatedAt?: string;
}
