import mongoose from 'mongoose';

export enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export interface ISubmission {
  timestamp: Date;
  content: unknown;
  isCorrect: boolean;
}

export interface IStepProgress {
  stepId: string;
  attempts?: number;
  completed?: boolean;
  responses?: ISubmission[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

export interface IProgress {
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
}
