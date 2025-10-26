import { model, Schema } from 'mongoose';
import { HuntProgressStatus, IProgress, IStepProgress, ISubmission } from '../types/Progress';

const SubmissionSchema = new Schema<ISubmission>(
  {
    timestamp: { type: Date, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false },
);

const StepProgressSchema = new Schema<IStepProgress>(
  {
    stepId: { type: Schema.Types.ObjectId, required: true, ref: 'Step' },
    attempts: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    responses: [SubmissionSchema],
    startedAt: { type: Date },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 },
  },
  { _id: false },
);

const ProgressSchema = new Schema<IProgress>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    sessionId: { type: String, required: true },
    isAnonymous: { type: Boolean, required: true, default: true },

    huntId: { type: Schema.Types.ObjectId, required: true, ref: 'Hunt' },
    version: { type: Number, default: 1 },

    status: {
      type: String,
      required: true,
      enum: Object.values(HuntProgressStatus),
      default: HuntProgressStatus.InProgress,
    },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
    duration: { type: Number, default: 0 },

    currentStepId: { type: String, required: true },
    steps: [StepProgressSchema],

    playerName: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, 'Player name cannot be empty'],
      maxlength: [50, 'Player name is too long'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot be more than 5'],
    },
  },
  {
    timestamps: true,
  },
);

ProgressSchema.index({ userId: 1, huntId: 1 });
ProgressSchema.index({ huntId: 1 });
ProgressSchema.index({ sessionId: 1 });
ProgressSchema.index({ completedAt: -1, huntId: 1 });

if (process.env.NODE_ENV === 'production') {
  ProgressSchema.index(
    { startedAt: 1 },
    {
      expireAfterSeconds: 7 * 24 * 60 * 60,
      partialFilterExpression: { isAnonymous: true },
    },
  );
}

const Progress = model('Progress', ProgressSchema);

export default Progress;
