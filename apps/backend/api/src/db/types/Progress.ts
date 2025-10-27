import mongoose from 'mongoose';

export enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export interface ISubmission {
  timestamp: Date;
  content: unknown;  // Flexible: string, asset ID, array, coordinates, etc.
  isCorrect: boolean;

  // Extended fields for richer validation (AI features, feedback)
  score?: number;               // Quality/confidence score (0-1 or 0-10)
  feedback?: string;            // Player guidance message from AI or system
  metadata?: Record<string, any>;  // Extensibility escape hatch
}

export interface IStepProgress {
  stepId: mongoose.Types.ObjectId;
  attempts?: number;
  completed?: boolean;
  responses?: ISubmission[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

export interface IProgress extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  isAnonymous: boolean;

  huntId: mongoose.Types.ObjectId;
  version: number;

  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  status: HuntProgressStatus;

  currentStepId: string;
  steps?: IStepProgress[];

  playerName: string;
  rating?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
