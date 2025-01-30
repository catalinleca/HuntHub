import { Schema, model } from 'mongoose';
import { HuntProgressStatus, IHuntProgress } from '../schemas/HuntProgress';

const huntProgressSchema: Schema<IHuntProgress> = new Schema<IHuntProgress>(
  {
    huntId: { type: Schema.Types.ObjectId, required: true, ref: 'Hunt' },
    playerId: { type: Schema.Types.ObjectId, required: true, ref: 'Player' },
    currentStepId: { type: Schema.Types.ObjectId, required: true, ref: 'Step' },
    status: { type: String, enum: Object.values(HuntProgressStatus), required: true, default: HuntProgressStatus.ToDo },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

huntProgressSchema.index({ huntId: 1, playerId: 1 }, { unique: true });
huntProgressSchema.index({ playerId: 1, status: 1 });

const HuntProgress = model('HuntProgress', huntProgressSchema);

export default HuntProgress;
