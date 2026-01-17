import mongoose from 'mongoose';
import { HuntPermission } from '@hunthub/shared';
import { IUser } from './User';

// Only 'view' and 'admin' are stored - 'owner' is determined by Hunt.creatorId
export type StoredPermission = Exclude<HuntPermission, HuntPermission.Owner>;

export interface IHuntShare {
  huntId: number;
  ownerId: mongoose.Types.ObjectId;
  sharedWithId: mongoose.Types.ObjectId;
  permission: StoredPermission;
  sharedAt: Date;
  sharedBy: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHuntSharePopulated extends Omit<IHuntShare, 'sharedWithId' | 'sharedBy'> {
  sharedWithId: IUser;
  sharedBy: IUser;
}
