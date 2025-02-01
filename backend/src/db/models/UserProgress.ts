import mongoose, { Schema } from 'mongoose';
import { HuntProgressStatus, IUserProgress } from '../interfaces/UserProgress';

const userProgressSchema: Schema<IUserProgress> = new Schema<IUserProgress>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    huntId: { type: Schema.Types.ObjectId, required: true, ref: 'Hunt' },
    status: { type: String, enum: Object.values(HuntProgressStatus), required: true },
    currentStepId: { type: Schema.Types.ObjectId, required: true, ref: 'Step' },
    completedSteps: {
      type: [Schema.Types.ObjectId],
      ref: 'Step',
      default: [],
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

userProgressSchema.index({ userId: 1, huntId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1, startedAt: -1 });
userProgressSchema.index({ huntId: 1, status: 1, completedAt: 1 });
userProgressSchema.index({ status: 1, completedAt: -1 });
userProgressSchema.index({ currentStepId: 1, status: 1 });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
