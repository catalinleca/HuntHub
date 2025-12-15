import { Hunt, Step, Quiz, OptionType, Location } from '@hunthub/shared';
import {
  HuntFormData,
  HuntDialogFormData,
  StepFormData,
  LocationFormData,
  QuizFormData,
  QuizOptionFormData,
} from '@/types/editor';
import { createInitialQuizOptions } from '@/pages/Hunt/HuntSteps/components/Quiz';
import { hasValidCoordinates } from '@/utils';

/**
 * Transform API Location to form LocationFormData
 * Handles undefined → all nulls (disabled state)
 */
const transformLocationToFormData = (location?: Location): LocationFormData => {
  if (!location) {
    return { lat: null, lng: null, radius: null, address: null };
  }
  return {
    lat: location.lat,
    lng: location.lng,
    radius: location.radius,
    address: location.address ?? null,
  };
};

const transformStepSettings = (
  step: Step,
): Pick<StepFormData, 'requiredLocation' | 'hint' | 'timeLimit' | 'maxAttempts'> => {
  const requiredLocation: LocationFormData | null = hasValidCoordinates(step.requiredLocation)
    ? {
        lat: step.requiredLocation.lat,
        lng: step.requiredLocation.lng,
        radius: step.requiredLocation.radius,
        address: step.requiredLocation.address ?? null,
      }
    : null;

  return {
    requiredLocation,
    hint: step.hint ?? null,
    timeLimit: step.timeLimit ?? null,
    maxAttempts: step.maxAttempts ?? null,
  };
};

const transformQuizToFormData = (quiz?: Quiz): QuizFormData | undefined => {
  if (!quiz) {
    return undefined;
  }

  if (quiz.type === OptionType.Choice && quiz.target) {
    const { target, distractors = [], displayOrder = [] } = quiz;

    const allOptions: Omit<QuizOptionFormData, '_id'>[] = [
      { id: target.id, text: target.text },
      ...distractors.map((d) => ({ id: d.id, text: d.text })),
    ];

    const sortedOptions =
      displayOrder.length > 0
        ? displayOrder
            .map((id: string) => allOptions.find((o) => o.id === id))
            .filter((o): o is Omit<QuizOptionFormData, '_id'> => o !== undefined)
        : allOptions;

    const options: QuizOptionFormData[] = sortedOptions.map((o) => ({ ...o, _id: o.id }));

    return {
      ...quiz,
      options,
      targetId: target.id,
    };
  }

  const { options, targetId } = createInitialQuizOptions();

  return {
    ...quiz,
    options,
    targetId,
  };
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

/**
 * Transform Hunt to HuntDialogFormData (for create/edit dialog)
 * Only includes basic metadata fields, no steps
 * Returns defaults when hunt is undefined (create mode)
 */
export const transformHuntToDialogFormData = (hunt?: Hunt): HuntDialogFormData => ({
  name: hunt?.name ?? '',
  description: hunt?.description ?? '',
  startLocation: transformLocationToFormData(hunt?.startLocation),
});
