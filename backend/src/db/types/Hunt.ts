import { ILocation } from '../schemas/Location';
import mongoose from 'mongoose';

export enum HuntStatus {
  Draft = 'draft',
  Published = 'published',
  Archived = 'archived',
}

export enum HuntVisibility {
  Private = 'private',
  Public = 'public',
  Unlisted = 'unlisted',
}

export interface IHunt {
  id: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  isPublished: boolean;
  currentVersion: number;
  stepOrder: mongoose.Types.ObjectId[];
  status: HuntStatus;
  visibility: HuntVisibility;
  startLocation: ILocation;
}
