import { model, Schema, Model, HydratedDocument } from 'mongoose';
import { HuntProgressStatus, IProgress, IStepProgress, ISubmission } from '@/database/types';

const SubmissionSchema = new Schema<ISubmission>(
  {
    timestamp: { type: Date, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, required: true },
    score: Number,
    feedback: String,
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const StepProgressSchema = new Schema<IStepProgress>(
  {
    stepId: { type: Number, required: true },
    attempts: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    responses: [SubmissionSchema],
    startedAt: Date,
    completedAt: Date,
    duration: { type: Number, default: 0 },
  },
  { _id: false },
);

const progressSchema: Schema<IProgress> = new Schema<IProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      // Optional: anonymous players don't have userId
    },
    sessionId: { type: String, required: true },
    isAnonymous: { type: Boolean, required: true, default: true },

    huntId: { type: Number, required: true },
    version: { type: Number, default: 1 },

    status: {
      type: String,
      required: true,
      enum: Object.values(HuntProgressStatus),
      default: HuntProgressStatus.InProgress,
    },

    startedAt: { type: Date, required: true },
    completedAt: Date,
    duration: { type: Number, default: 0 },

    currentStepId: { type: Number, required: true },
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

progressSchema.index({ userId: 1, huntId: 1 }); // User's progress per hunt
progressSchema.index({ huntId: 1, status: 1 }); // Hunt analytics (completed vs in-progress)
progressSchema.index({ sessionId: 1 }, { unique: true }); // Session lookup
progressSchema.index({ completedAt: -1, huntId: 1 }); // Recent completions per hunt

if (process.env.NODE_ENV === 'production') {
  progressSchema.index(
    { startedAt: 1 },
    {
      expireAfterSeconds: 7 * 24 * 60 * 60,
      partialFilterExpression: { isAnonymous: true },
    },
  );
}

interface IProgressModel extends Model<IProgress> {
  findBySession(sessionId: string): Promise<HydratedDocument<IProgress> | null>;

  findByUser(userId: string): Promise<HydratedDocument<IProgress>[]>;

  findByHunt(huntId: number): Promise<HydratedDocument<IProgress>[]>;

  findCompletedByHunt(huntId: number): Promise<HydratedDocument<IProgress>[]>;

  countActiveByHunt(huntId: number): Promise<number>;
}

progressSchema.statics.findBySession = function (sessionId: string) {
  return this.findOne({ sessionId }).exec();
};

progressSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ startedAt: -1 }).exec();
};

progressSchema.statics.findByHunt = function (huntId: number) {
  return this.find({ huntId }).sort({ startedAt: -1 }).exec();
};

progressSchema.statics.findCompletedByHunt = function (huntId: number) {
  return this.find({ huntId, status: HuntProgressStatus.Completed }).sort({ completedAt: -1 }).exec();
};

progressSchema.statics.countActiveByHunt = async function (huntId: number): Promise<number> {
  return this.countDocuments({
    huntId,
    status: HuntProgressStatus.InProgress,
  });
};

const ProgressModel = model<IProgress, IProgressModel>('Progress', progressSchema);

export default ProgressModel;
