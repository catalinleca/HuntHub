import mongoose from 'mongoose';
import { ILocation } from '@db/types/Location';

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export interface IStep {
  huntId: mongoose.Types.ObjectId;
  type: ChallengeType;
  challenge: unknown;
  hint?: string;
  requiredLocation?: ILocation;
  timeLimit?: number;
  maxAttempts?: number;
}
