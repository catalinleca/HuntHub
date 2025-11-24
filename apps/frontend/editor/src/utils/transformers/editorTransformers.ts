import { Hunt, Step } from '@hunthub/shared';
import { EditorFormData, StepFormData, HuntFormData } from '@/types/editor';

export const transformFormDataToHunt = (formData: EditorFormData, huntId: number, updatedAt?: string): Hunt => {
  const cleanedSteps = formData.steps.map(({ _id, ...step }) => step as Step);

  return {
    huntId,
    name: formData.name,
    description: formData.description,
    startLocation: formData.startLocation,
    steps: cleanedSteps,
    ...(updatedAt && { updatedAt }), // Include for optimistic locking
  } as Hunt;
};

export const transformHuntToFormData = (hunt: Hunt): EditorFormData => {
  const stepsWithId: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step,
    _id: step.stepId?.toString() || crypto.randomUUID(),
  }));

  return {
    name: hunt.name,
    description: hunt.description || '',
    startLocation: hunt.startLocation,
    steps: stepsWithId,
  };
};

/**
 * Transform Hunt to HuntFormData (for Efekta pattern)
 * Just adds _id to each step for RHF fieldArray tracking
 */
export const transformHuntToHuntFormData = (hunt: Hunt): HuntFormData => {
  const stepsWithId: StepFormData[] = (hunt.steps || []).map((step) => ({
    ...step, // Keep ALL Step fields (stepId, huntId, createdAt, etc.)
    _id: step.stepId?.toString() || crypto.randomUUID(), // Add _id for RHF
  }));

  return {
    ...hunt, // Keep ALL Hunt fields (version, updatedAt, etc.)
    steps: stepsWithId,
  };
};