import { Hunt } from '@hunthub/shared';
import { HuntFormData, StepFormData } from '@/types/editor';

/**
 * API → FORM
 * Transform Hunt from API to HuntFormData for React Hook Form
 * Adds _id to each step for RHF useFieldArray tracking
 * Keeps all other fields unchanged
 */
export const transformHuntToFormData = (hunt: Hunt): HuntFormData => {
  const stepsWithId: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step,
    _id: step.stepId?.toString() || crypto.randomUUID(),
  }));

  return {
    ...hunt,
    steps: stepsWithId,
  };
};
