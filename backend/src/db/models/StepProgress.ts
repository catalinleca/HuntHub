import { Schema, model } from 'mongoose';
import { IStepProgress, ISubmission } from '../schemas/StepProgress';

export const submissionSchema = new Schema<ISubmission>(
  {
    timestamp: { type: Date, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

export const stepProgressSchema: Schema = new Schema<IStepProgress>(
  {
    progressId: { type: Schema.Types.ObjectId, required: true, ref: 'UserProgress' },
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    stepId: { type: Schema.Types.ObjectId, required: true, ref: 'Step' },
    attempt: { type: Number, required: true },
    submissions: { type: [submissionSchema], required: true },
    isCorrect: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  },
);

stepProgressSchema.index({ userId: 1, stepId: 1 });
stepProgressSchema.index({ stepId: 1, attempt: 1 });

stepProgressSchema.index({ progressId: 1, stepId: 1 }, { unique: true });
stepProgressSchema.index({ userId: 1, createdAt: -1 });
stepProgressSchema.index({ stepId: 1, isCorrect: 1 });

const StepProgress = model('StepProgress', stepProgressSchema);

export default StepProgress;
