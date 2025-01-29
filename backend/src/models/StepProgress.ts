import mongoose, { Schema, Document } from 'mongoose';

interface Submission {
  timestamp: Date;
  content: any;
  isCorrect: boolean;
}

enum StepProgressStatus {
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

const submissionSchema = new Schema<Submission>({
  timestamp: { type: Date, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
});

export const stepProgressSchema: Schema<IStepProgress> = new Schema<IStepProgress>(
  {
    stepId: { type: String, required: true, ref: 'Step' },
    status: { type: String, enum: Object.values(StepProgressStatus), required: true },
    attempts: { type: Number, required: true, default: 0 },
    submissions: { type: [submissionSchema], required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const StepProgress = mongoose.model('StepProgress', stepProgressSchema);

export default StepProgress;
