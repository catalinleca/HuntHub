import mongoose from 'mongoose';

export enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
  ToDo = 'to_do',
}

export interface IUserProgress {
  userId: mongoose.Types.ObjectId;
  huntId: mongoose.Types.ObjectId;
  status: HuntProgressStatus;
  currentStepId: mongoose.Types.ObjectId;
  completedSteps: mongoose.Types.ObjectId[]; // does it make sense to store this here?
  startedAt: Date;
  completedAt?: Date;
}
