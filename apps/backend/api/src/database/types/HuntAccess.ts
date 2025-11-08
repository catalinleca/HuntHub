import mongoose from 'mongoose';
import { IUser } from './User';

// Hierarchy: owner > admin > view
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

export interface IHuntSharePopulated extends Omit<IHuntShare, 'sharedWithId' | 'sharedBy'> {
  sharedWithId: IUser;
  sharedBy: IUser;
}
