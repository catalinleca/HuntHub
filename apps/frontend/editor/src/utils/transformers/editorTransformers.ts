import { Hunt, Step } from '@hunthub/shared';
import { EditorFormData, StepFormData } from '@/types/editor';

export const transformFormDataToHunt = (formData: EditorFormData, huntId: number): Hunt => {
  const cleanedSteps = formData.steps.map(({ _id, ...step }) => step as Step);

  return {
    huntId,
    name: formData.name,
    description: formData.description,
    startLocation: formData.startLocation,
    steps: cleanedSteps,
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