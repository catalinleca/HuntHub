import { Types } from 'mongoose';

export interface ISubmission {
  timestamp: Date;
  content: unknown;
  isCorrect: boolean;
}

export interface IStepProgress {
  progressId: Types.ObjectId;
  userId: Types.ObjectId;
  stepId: Types.ObjectId;
  attempt: number;
  submissions: ISubmission[]; // Adjust the type as needed
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}
