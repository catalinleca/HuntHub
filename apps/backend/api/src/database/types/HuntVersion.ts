import { ILocation } from '../schemas/location.schema';

export interface IHuntVersion {
  huntId: number;
  version: number;

  name: string;
  description?: string;
  startLocation?: ILocation;
  stepOrder: number[];

  isPublished: boolean; // true = read-only

  publishedAt?: Date;
  publishedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
