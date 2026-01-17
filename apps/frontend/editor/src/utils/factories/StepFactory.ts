import { ChallengeType, OptionType, MissionType, ValidationMode, Quiz } from '@hunthub/shared';
import { StepFormData } from '@/types/editor';

const createBaseStep = (type: ChallengeType, huntId: number): StepFormData => {
  return {
    formKey: crypto.randomUUID(),
    huntId,
    type,
    challenge: {},

    requiredLocation: null,
    hint: null,
    timeLimit: null,
    maxAttempts: null,
  };
};

const createClue = (huntId: number): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Clue, huntId),
    challenge: {
      clue: {
        title: '',
        description: '',
      },
    },
  };
};

const createQuiz = (huntId: number): StepFormData => {
  const option1Id = crypto.randomUUID();
  const option2Id = crypto.randomUUID();

  const quiz: Quiz = {
    title: '',
    description: '',
    type: OptionType.Choice,
    randomizeOrder: true,
    options: [
      { id: option1Id, text: '' },
      { id: option2Id, text: '' },
    ],
    targetId: option1Id,
    validation: {
      mode: ValidationMode.Exact,
      caseSensitive: false,
      fuzzyThreshold: 80,
      numericTolerance: 0,
      acceptableAnswers: [],
    },
  };

  return {
    ...createBaseStep(ChallengeType.Quiz, huntId),
    challenge: { quiz },
  };
};

const createMission = (huntId: number): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Mission, huntId),
    challenge: {
      mission: {
        title: '',
        description: '',
        type: MissionType.UploadMedia,
        referenceAssetIds: [],
      },
    },
  };
};

const createTask = (huntId: number): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Task, huntId),
    challenge: {
      task: {
        title: '',
        instructions: '',
      },
    },
  };
};

export const StepFactory = {
  create: (type: ChallengeType, huntId: number): StepFormData => {
    switch (type) {
      case ChallengeType.Clue:
        return createClue(huntId);
      case ChallengeType.Quiz:
        return createQuiz(huntId);
      case ChallengeType.Mission:
        return createMission(huntId);
      case ChallengeType.Task:
        return createTask(huntId);
      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  },
  createClue,
  createQuiz,
  createMission,
  createTask,
};
