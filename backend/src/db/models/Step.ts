import { Schema, model } from 'mongoose';
import { ChallengeType, IStep } from '../schemas/Step';
import { locationSchema } from '../schemas/Location';

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
  },
  { timestamps: true },
);

const Step = model('Step', stepSchema);

export default Step;
