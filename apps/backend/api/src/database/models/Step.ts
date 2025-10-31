import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IStep } from '../types/Step';
import { locationSchema } from '@/database/schemas/location.schema';
import { ChallengeType } from '@hunthub/shared';
import { getNextSequence } from './Counter';

const stepSchema: Schema<IStep> = new Schema<IStep>(
  {
    stepId: {
      type: Number,
      required: false,
      unique: true,
      index: true,
    },
    huntId: {
      type: Number,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(ChallengeType),
      required: true,
    },
    challenge: {
      type: Schema.Types.Mixed,
      required: true,
    },
    hint: String,
    requiredLocation: locationSchema,
    timeLimit: Number, // In seconds
    maxAttempts: Number,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

stepSchema.pre('save', async function () {
  if (this.isNew && !this.stepId) {
    this.stepId = await getNextSequence('step');
  }
});

stepSchema.index({ stepId: 1 }, { unique: true });
stepSchema.index({ huntId: 1, createdAt: 1 }); // Get steps for hunt, ordered
stepSchema.index({ huntId: 1, type: 1 }); // Filter steps by type

interface IStepModel extends Model<IStep> {
  findByHunt(huntId: number): Promise<HydratedDocument<IStep>[]>;

  findByHuntAndType(
    huntId: number,
    type: ChallengeType,
  ): Promise<HydratedDocument<IStep>[]>;

  countByHunt(huntId: number): Promise<number>;

  hasSteps(huntId: number): Promise<boolean>;
}

stepSchema.statics.findByHunt = function (huntId: number) {
  return this.find({ huntId })
    .sort({ createdAt: 1 })
    .exec();
};

stepSchema.statics.findByHuntAndType = function (
  huntId: number,
  type: ChallengeType,
) {
  return this.find({ huntId, type })
    .sort({ createdAt: 1 })
    .exec();
};

stepSchema.statics.countByHunt = async function (huntId: number): Promise<number> {
  return this.countDocuments({ huntId });
};

stepSchema.statics.hasSteps = async function (huntId: number): Promise<boolean> {
  const count = await this.countDocuments({ huntId }).limit(1);
  return count > 0;
};

const StepModel = model<IStep, IStepModel>('Step', stepSchema);

export default StepModel;
