import { Hunt, Step } from '@hunthub/shared';
import { HuntFormData, StepFormData } from '@/types/editor';

const transformStepForApi = (formStep: StepFormData): Step => {
  const { _id, ...rest } = formStep;

  return rest as Step;
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
