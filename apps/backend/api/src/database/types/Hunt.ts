import mongoose from 'mongoose';

export interface IHunt {
  huntId: number;
  creatorId: mongoose.Types.ObjectId;

  // Version pointers
  latestVersion: number; // Current draft version (e.g., 3)
  liveVersion: number | null; // Live version (e.g., 2), null if never published

  // Release metadata
  releasedAt?: Date;
  releasedBy?: string;

  isDeleted: boolean;
  deletedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
