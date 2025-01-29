import mongoose from 'mongoose';
import { IStepProgress } from './StepProgress';

export enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
  ToDo = 'to_do',
}

export interface IHuntProgress {
  huntId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  currentStepId: mongoose.Types.ObjectId;
  status: HuntProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  stepProgresses: IStepProgress[];
}
