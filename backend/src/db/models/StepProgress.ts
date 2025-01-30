import { Schema, model } from 'mongoose';
import { IStepProgress, StepProgressStatus, Submission } from '../schemas/StepProgress';

export const submissionSchema = new Schema<Submission>({
  timestamp: { type: Date, required: true },
  content: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, required: true },
});

export const stepProgressSchema: Schema<IStepProgress> = new Schema<IStepProgress>(
  {
    huntId: { type: Schema.Types.ObjectId, required: true, ref: 'Hunt' },
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Player' }, // Add this for better querying
    stepId: { type: Schema.Types.ObjectId, required: true, ref: 'Step' },
    status: { type: String, enum: Object.values(StepProgressStatus), required: true },
    attempts: { type: Number, required: true, default: 0 },
    submissions: { type: [submissionSchema], required: true },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

stepProgressSchema.index({ huntId: 1, playerId: 1, stepId: 1 }, { unique: true });
stepProgressSchema.index({ playerId: 1, status: 1 });

const StepProgress = model('StepProgress', stepProgressSchema);

export default StepProgress;
