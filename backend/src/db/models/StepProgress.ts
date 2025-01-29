import { Schema, model } from 'mongoose';
import { IStepProgress, StepProgressStatus, Submission } from '../schemas/StepProgress';

export const submissionSchema = new Schema<Submission>({
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

const StepProgress = model('StepProgress', stepProgressSchema);

export default StepProgress;
