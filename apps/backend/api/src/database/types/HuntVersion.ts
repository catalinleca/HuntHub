import type { Media } from '@hunthub/shared';
import { ILocation } from '../schemas/location.schema';

export interface IHuntVersion {
  huntId: number;
  version: number;

  name: string;
  description?: string | null;
  startLocation?: ILocation | null;
  stepOrder: number[];
  coverImage?: Media | null;

  isPublished: boolean; // true = read-only

  publishedAt?: Date | null;
  publishedBy?: string | null;

  createdAt?: Date | null;
  updatedAt?: Date | null;
}
