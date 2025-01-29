import { ILocation } from './Location';

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
  creatorId: string;
  name: string;
  description: string;
  isPublished: boolean;
  currentVersion: number;
  stepOrder: string[];
  status: HuntStatus;
  visibility: HuntVisibility;
  startLocation: ILocation;
}
