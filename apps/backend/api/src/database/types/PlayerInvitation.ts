import mongoose from 'mongoose';

export interface IPlayerInvitation {
  huntId: number;
  email: string;
  invitedBy: mongoose.Types.ObjectId;
  invitedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
