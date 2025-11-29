import { ChallengeType, OptionType, MissionType } from '@hunthub/shared';
import { StepFormData, QuizFormData } from '@/types/editor';
import { LOCATION_DEFAULTS } from '@/utils/stepSettings';

const createBaseStep = (type: ChallengeType, huntId: number): StepFormData => {
  return {
    _id: crypto.randomUUID(), // RHF tracking ID
    huntId,
    type,
    challenge: {},

    requiredLocation: { ...LOCATION_DEFAULTS.disabled },
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
  const distractorIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];

  const quiz: QuizFormData = {
    title: '',
    description: '',
    type: OptionType.Choice,
    target: { id: targetId, text: '' },
    distractors: distractorIds.map((id) => ({ id, text: '' })),
    randomizeOrder: true,

    // Form-only: options[] for ArrayInput editing
    options: [
      { id: targetId, text: '', isTarget: true, _id: targetId },
      ...distractorIds.map((id) => ({ id, text: '', isTarget: false, _id: id })),
    ],
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
