import { Schema, model, Model, HydratedDocument, ClientSession } from 'mongoose';
import { IStep } from '../types/Step';
import { locationSchema } from '@/database/schemas/location.schema';
import { ChallengeType } from '@hunthub/shared';
import { getNextSequence } from './Counter';

const stepSchema: Schema<IStep> = new Schema<IStep>(
  {
    stepId: {
      type: Number,
      required: false,
    },
    huntId: {
      type: Number,
      required: true,
    },
    huntVersion: {
      type: Number,
      required: true,
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
    media: {
      type: Schema.Types.Mixed,
      required: false,
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
    collection: 'Step',
  },
);

stepSchema.pre('save', async function () {
  if (this.isNew && !this.stepId) {
    this.stepId = await getNextSequence('step');
  }
});

// Compound unique index: same stepId can exist across versions
stepSchema.index({ stepId: 1, huntId: 1, huntVersion: 1 }, { unique: true });
stepSchema.index({ huntId: 1, huntVersion: 1 }); // Query steps for a specific version

interface IStepModel extends Model<IStep> {
  findByHuntVersion(huntId: number, version: number): Promise<HydratedDocument<IStep>[]>;

  findByHuntVersionAndType(huntId: number, version: number, type: ChallengeType): Promise<HydratedDocument<IStep>[]>;

  findOrdered(
    huntId: number,
    huntVersion: number,
    stepOrder: number[],
    session?: ClientSession,
  ): Promise<HydratedDocument<IStep>[]>;

  countByHuntVersion(huntId: number, version: number): Promise<number>;

  hasSteps(huntId: number, version: number): Promise<boolean>;
}

stepSchema.statics.findByHuntVersion = function (huntId: number, version: number) {
  return this.find({ huntId, huntVersion: version }).sort({ createdAt: 1 }).exec();
};

stepSchema.statics.findByHuntVersionAndType = function (huntId: number, version: number, type: ChallengeType) {
  return this.find({ huntId, huntVersion: version, type }).sort({ createdAt: 1 }).exec();
};

stepSchema.statics.findOrdered = async function (
  huntId: number,
  huntVersion: number,
  stepOrder: number[],
  session?: ClientSession,
): Promise<HydratedDocument<IStep>[]> {
  const docs = await this.find({ huntId, huntVersion })
    .session(session ?? null)
    .exec();
  const stepMap = new Map(docs.map((doc: HydratedDocument<IStep>) => [doc.stepId, doc]));

  return stepOrder.map((stepId) => stepMap.get(stepId)).filter((doc): doc is HydratedDocument<IStep> => doc != null);
};

stepSchema.statics.countByHuntVersion = async function (huntId: number, version: number): Promise<number> {
  return this.countDocuments({ huntId, huntVersion: version });
};

stepSchema.statics.hasSteps = async function (huntId: number, version: number): Promise<boolean> {
  const count = await this.countDocuments({ huntId, huntVersion: version }).limit(1);
  return count > 0;
};

const StepModel = model<IStep, IStepModel>('Step', stepSchema);

export default StepModel;
