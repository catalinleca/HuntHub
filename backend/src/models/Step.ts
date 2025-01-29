import mongoose, { Schema, model, Document } from 'mongoose';

enum ChallengeType {
  Clue = 'clue',
  Quiz = 'quiz',
  Mission = 'mission',
  Task = 'task',
}

interface IBaseStep {
  huntId: mongoose.Types.ObjectId;
  type: ChallengeType;
  title: string;
  text: string;
  hint?: string;
  requiredLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
  timeLimit?: number;
  maxAttempts?: number;
}

interface IClueStep extends IBaseStep {
  type: ChallengeType.Clue;
  // no additional fields
}

interface IQuizStep extends IBaseStep {
  type: ChallengeType.Quiz;
  target: {
    content: string;
  };
  quizType: 'choice' | 'input';
  distractors?: { content: string }[];
}

interface IMissionStep extends IBaseStep {
  type: ChallengeType.Mission;
  missionType: 'upload-media' | 'match-location';
  targetAsset?: string;
  targetLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

interface ITaskStep extends IBaseStep {
  type: ChallengeType.Task;
  target?: {
    content: string;
  };
}

const baseStepSchema = new Schema<IBaseStep>(
  {
    huntId: { type: Schema.Types.ObjectId, required: true },
    type: {
      type: String,
      enum: Object.values(ChallengeType),
      required: true,
    },
    title: { type: String, required: true },
    text: { type: String, required: true },
    hint: String,
    requiredLocation: {
      lat: Number,
      lng: Number,
      radius: Number,
    },
    timeLimit: Number,
    maxAttempts: Number,
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  },
);

const Step = mongoose.model('Step', baseStepSchema);

const ClueStep = Step.discriminator(
  'clue',
  new Schema<IClueStep>({
    // no additional fields
  }),
);

const QuizStep = Step.discriminator(
  'quiz',
  new Schema<IQuizStep>({
    target: {
      content: String,
    },
    quizType: {
      type: String,
      enum: ['choice', 'input'],
    },
    distractors: [
      {
        content: String,
      },
    ],
  }),
);

const MissionStep = Step.discriminator(
  'mission',
  new Schema<IMissionStep>({
    missionType: {
      type: String,
      enum: ['upload-media', 'match-location'],
    },
    targetAsset: String,
    targetLocation: {
      lat: Number,
      lng: Number,
      radius: Number,
    },
  }),
);

const TaskStep = Step.discriminator(
  'task',
  new Schema<ITaskStep>({
    target: {
      content: String,
    },
  }),
);

export {
  Step,
  ClueStep,
  QuizStep,
  MissionStep,
  TaskStep,
  ChallengeType,
  IBaseStep,
  IClueStep,
  IQuizStep,
  IMissionStep,
  ITaskStep,
};
