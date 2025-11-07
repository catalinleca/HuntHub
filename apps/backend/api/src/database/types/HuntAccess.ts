import mongoose from 'mongoose';

// TODO Hierarchy: owner > admin > view

export type HuntPermission = 'view' | 'admin';

export interface IHuntShare {
  huntId: number;
  ownerId: mongoose.Types.ObjectId;
  sharedWithId: mongoose.Types.ObjectId;
  permission: HuntPermission;
  sharedAt: Date;
  sharedBy: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}
