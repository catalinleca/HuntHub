import { Hunt, Step } from '@hunthub/shared';
import { HuntFormData, StepFormData, LocationFormData } from '@/types/editor';
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

export const transformHuntToFormData = (hunt: Hunt): HuntFormData => {
  const stepsWithId: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step,
    ...transformStepSettings(step),
    _id: step.stepId?.toString() || crypto.randomUUID(),
  }));

  return {
    ...hunt,
    steps: stepsWithId,
  };
};
