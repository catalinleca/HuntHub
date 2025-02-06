import mongoose from 'mongoose';
import { ILocation } from '@db/types/Location';

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export interface IStep extends mongoose.Document {
  id: string; // TODO this should not be here
  huntId: mongoose.Types.ObjectId; // TODO change to mongoose.Types.ObjectId
  type: ChallengeType;
  challenge: unknown;
  hint?: string;
  requiredLocation?: ILocation;
  timeLimit?: number;
  maxAttempts?: number;
  createdAt?: string;
  updatedAt?: string;
}
