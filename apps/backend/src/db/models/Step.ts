import { Schema, model } from 'mongoose';
import { ChallengeType, IStep } from '@db/types';
import { locationSchema } from '../schemas';

const stepSchema = new Schema<IStep>(
  {
    huntId: { type: Schema.Types.ObjectId, ref: 'Hunt', required: true },
    type: {
      type: String,
      enum: Object.values(ChallengeType),
      required: true,
    },
    challenge: { type: Schema.Types.Mixed, required: true },
    hint: String,
    requiredLocation: locationSchema,
    timeLimit: Number,
    maxAttempts: Number,
    metadata: { type: Schema.Types.Mixed },  // Flexible key-value storage
  },
  { timestamps: true },
);

stepSchema.index({ huntId: 1 });

const Step = model('Step', stepSchema);

export default Step;
