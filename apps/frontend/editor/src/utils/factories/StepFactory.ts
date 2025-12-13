import { ChallengeType, OptionType, MissionType } from '@hunthub/shared';
import { StepFormData, QuizFormData } from '@/types/editor';

const createBaseStep = (type: ChallengeType, huntId: number): StepFormData => {
  return {
    _id: crypto.randomUUID(), // RHF tracking ID
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
  const targetId = crypto.randomUUID();
  const option2Id = crypto.randomUUID();

  const quiz: QuizFormData = {
    title: '',
    description: '',
    type: OptionType.Choice,
    randomizeOrder: true,

    // Form-only: options[] for ArrayInput, targetId for correct answer
    options: [
      { id: targetId, text: '', _id: targetId },
      { id: option2Id, text: '', _id: option2Id },
    ],
    targetId,
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
