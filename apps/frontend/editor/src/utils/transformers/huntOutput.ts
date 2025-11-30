import { Hunt, Step, Quiz, OptionType } from '@hunthub/shared';
import { HuntFormData, StepFormData, QuizFormData } from '@/types/editor';

/**
 * For 'input' type: strips options, keeps target
 * For 'choice' type: splits options[] back to target + distractors + displayOrder
 */
const transformQuizForApi = (quizForm?: QuizFormData): Quiz | undefined => {
  if (!quizForm) {
    return undefined;
  }

  const { options, targetId, ...rest } = quizForm;

  if (quizForm.type === OptionType.Input) {
    return rest;
  }

  if (!options?.length) {
    return rest;
  }

  const targetOption = options.find((o) => o.id === targetId);

  if (!targetOption && quizForm.type === OptionType.Choice) {
    throw new Error('Target option must be selected for choice-type quiz');
  }

  const distractorOptions = options.filter((o) => o.id !== targetId);

  return {
    ...rest,
    target: targetOption ? { id: targetOption.id, text: targetOption.text } : undefined,
    distractors: distractorOptions.map((d) => ({ id: d.id, text: d.text })),
    displayOrder: options.map((o) => o.id),
  };
};

const transformChallengeForApi = (challenge: StepFormData['challenge']): Step['challenge'] => {
  return {
    ...challenge,
    quiz: transformQuizForApi(challenge.quiz as QuizFormData),
  };
};

const transformStepForApi = (formStep: StepFormData): Step => {
  const { _id, challenge, ...rest } = formStep;

  return {
    ...rest,
    challenge: transformChallengeForApi(challenge),
  } as Step;
};

export const prepareHuntForSave = (huntFormData: HuntFormData): Hunt => {
  const {
    steps: formSteps,
    createdAt: _createdAt,
    isLive: _isLive,
    releasedAt: _releasedAt,
    ...huntData
  } = huntFormData;

  const steps = formSteps.map(transformStepForApi);

  return { ...huntData, steps } as Hunt;
};
