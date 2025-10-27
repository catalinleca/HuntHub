import mongoose from 'mongoose';
import { ILocation } from '@db/types/Location';

export enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

export interface IStep extends mongoose.Document {
  huntId: mongoose.Types.ObjectId;
  type: ChallengeType;
  challenge: unknown;
  hint?: string;
  requiredLocation?: ILocation;
  timeLimit?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;  // Extensibility escape hatch
  createdAt?: Date;
  updatedAt?: Date;
}
