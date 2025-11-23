import { ChallengeType, OptionType, MissionType } from '@hunthub/shared';
import { StepFormData } from '@/types/editor';

const createBaseStep = (type: ChallengeType): StepFormData => {
  return {
    _id: crypto.randomUUID(),
    type,
    challenge: {},
  };
};

const createClue = (): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Clue),
    challenge: {
      clue: {
        title: '',
        description: '',
      },
    },
  };
};

const createQuiz = (): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Quiz),
    challenge: {
      quiz: {
        title: '',
        description: '',
        type: OptionType.Choice,
        target: { id: crypto.randomUUID(), text: '' },
        distractors: [
          { id: crypto.randomUUID(), text: '' },
          { id: crypto.randomUUID(), text: '' },
          { id: crypto.randomUUID(), text: '' },
        ],
      },
    },
  };
};

const createMission = (): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Mission),
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

const createTask = (): StepFormData => {
  return {
    ...createBaseStep(ChallengeType.Task),
    challenge: {
      task: {
        title: '',
        instructions: '',
      },
    },
  };
};

export const StepFactory = {
  create: (type: ChallengeType): StepFormData => {
    switch (type) {
      case ChallengeType.Clue:
        return createClue();
      case ChallengeType.Quiz:
        return createQuiz();
      case ChallengeType.Mission:
        return createMission();
      case ChallengeType.Task:
        return createTask();
      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  },
  createClue,
  createQuiz,
  createMission,
  createTask,
};
