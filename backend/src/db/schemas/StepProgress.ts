import mongoose from 'mongoose';

export interface Submission {
  timestamp: Date;
  content: any;
  isCorrect: boolean;
}

export enum StepProgressStatus {
  Locked = 'locked',
  Active = 'active',
  Completed = 'completed',
}

export interface IStepProgress {
  stepId: mongoose.Types.ObjectId;
  status: StepProgressStatus;
  attempts: number;
  submissions: Submission[];
  completedAt?: Date;
}
