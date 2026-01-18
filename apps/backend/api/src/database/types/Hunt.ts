import mongoose from 'mongoose';
import { HuntAccessMode } from '@hunthub/shared';

export interface IHunt {
  huntId: number;
  creatorId: mongoose.Types.ObjectId;

  // Version pointers
  latestVersion: number; // Current draft version (e.g., 3)
  liveVersion: number | null; // Live version (e.g., 2), null if never published

  // Release metadata
  releasedAt?: Date;
  releasedBy?: string;

  // Player access
  playSlug: string; // Short URL slug for player access (e.g., "xK9mR3")
  accessMode: HuntAccessMode; // open or invite_only

  isDeleted: boolean;
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
