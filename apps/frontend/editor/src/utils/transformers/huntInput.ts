import { Hunt, Step, Location } from '@hunthub/shared';
import { HuntFormData, HuntDialogFormData, StepFormData, LocationFormData } from '@/types/editor';
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

/**
 * Transform API Hunt to form HuntFormData
 * formKey is deterministic: stepId-based for saved steps, UUID for new steps
 */
export const transformHuntToFormData = (hunt: Hunt): HuntFormData => {
  const steps: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step,
    ...transformStepSettings(step),
    formKey: step.stepId?.toString() ?? crypto.randomUUID(),
  }));

  return {
    ...hunt,
    steps,
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
  coverImage: hunt?.coverImage ?? null,
});
