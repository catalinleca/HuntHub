import { Schema, model, Model, HydratedDocument } from 'mongoose';
import { IStep } from '../types/Step';
import { locationSchema } from '@/database/schemas/location.schema';
import { ChallengeType } from '@hunthub/shared';

const stepSchema: Schema<IStep> = new Schema<IStep>(
  {
    huntId: {
      type: Schema.Types.ObjectId,
      ref: 'Hunt',
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

stepSchema.index({ huntId: 1, createdAt: 1 }); // Get steps for hunt, ordered
stepSchema.index({ huntId: 1, type: 1 }); // Filter steps by type

interface IStepModel extends Model<IStep> {
  findByHunt(huntId: string): Promise<HydratedDocument<IStep>[]>;

  findByHuntAndType(
    huntId: string,
    type: ChallengeType,
  ): Promise<HydratedDocument<IStep>[]>;

  countByHunt(huntId: string): Promise<number>;

  hasSteps(huntId: string): Promise<boolean>;
}

stepSchema.statics.findByHunt = function (huntId: string) {
  return this.find({ huntId })
    .sort({ createdAt: 1 })
    .exec();
};

stepSchema.statics.findByHuntAndType = function (
  huntId: string,
  type: ChallengeType,
) {
  return this.find({ huntId, type })
    .sort({ createdAt: 1 })
    .exec();
};

stepSchema.statics.countByHunt = async function (huntId: string): Promise<number> {
  return this.countDocuments({ huntId });
};

stepSchema.statics.hasSteps = async function (huntId: string): Promise<boolean> {
  const count = await this.countDocuments({ huntId }).limit(1);
  return count > 0;
};

const StepModel = model<IStep, IStepModel>('Step', stepSchema);

export default StepModel;
