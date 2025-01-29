import mongoose, { Schema, Document } from 'mongoose';
import { IStepProgress, stepProgressSchema } from './StepProgress';

enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
  ToDo = 'to_do',
}

interface IHuntProgress {
  huntId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  currentStepId: mongoose.Types.ObjectId;
  status: HuntProgressStatus;
  startedAt: Date;
  completedAt?: Date;
  stepProgresses: IStepProgress[];
}

const huntProgressSchema: Schema<IHuntProgress> = new Schema<IHuntProgress>(
  {
    huntId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Hunt' },
    playerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Player' },
    currentStepId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Step' },
    status: { type: String, enum: Object.values(HuntProgressStatus), required: true, default: HuntProgressStatus.ToDo },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    stepProgresses: [stepProgressSchema],
  },
  {
    timestamps: true,
  },
);

const HuntProgress = mongoose.model('HuntProgress', huntProgressSchema);

export default HuntProgress;
