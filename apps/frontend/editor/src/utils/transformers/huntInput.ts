import { Hunt, Step, Quiz, OptionType } from '@hunthub/shared';
import { HuntFormData, StepFormData, LocationFormData, QuizFormData, QuizOptionFormData } from '@/types/editor';
import { LOCATION_DEFAULTS } from '@/utils/stepSettings';

const transformStepSettings = (
  step: Step,
): Pick<StepFormData, 'requiredLocation' | 'hint' | 'timeLimit' | 'maxAttempts'> => {
  const requiredLocation: LocationFormData = step.requiredLocation
    ? {
        lat: step.requiredLocation.lat,
        lng: step.requiredLocation.lng,
        radius: step.requiredLocation.radius,
      }
    : { ...LOCATION_DEFAULTS.disabled };

  return {
    requiredLocation,
    hint: step.hint ?? null,
    timeLimit: step.timeLimit ?? null,
    maxAttempts: step.maxAttempts ?? null,
  };
};

/**
 * For 'choice' type: merges target + distractors into options[] for ArrayInput
 * For 'input' type: returns quiz as-is (no options needed)
 */
const transformQuizToFormData = (quiz?: Quiz): QuizFormData | undefined => {
  if (!quiz) {
    return undefined;
  }

  if (quiz.type !== OptionType.Choice) {
    return quiz;
  }

  const { target, distractors = [], displayOrder = [] } = quiz;

  const allOptions: Omit<QuizOptionFormData, '_id'>[] = [
    ...(target ? [{ ...target, isTarget: true }] : []),
    ...distractors.map((d) => ({ ...d, isTarget: false })),
  ];

  const sortedOptions =
    displayOrder.length > 0
      ? displayOrder
          .map((id: string) => allOptions.find((o) => o.id === id))
          .filter((o): o is Omit<QuizOptionFormData, '_id'> => o !== undefined)
      : allOptions;

  const options: QuizOptionFormData[] = sortedOptions.map((o) => ({ ...o, _id: o.id }));

  return { ...quiz, options };
};

const transformStepChallenge = (challenge: Step['challenge']): Step['challenge'] => {
  return {
    ...challenge,
    quiz: transformQuizToFormData(challenge.quiz),
  };
};

export const transformHuntToFormData = (hunt: Hunt): HuntFormData => {
  const stepsWithId: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step,
    ...transformStepSettings(step),
    challenge: transformStepChallenge(step.challenge),
    _id: step.stepId?.toString() || crypto.randomUUID(),
  }));

  return {
    ...hunt,
    steps: stepsWithId,
  };
};
