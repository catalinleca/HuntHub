import { useState } from 'react';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { ChallengeType } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';

export const useHuntSteps = (formMethods: UseFormReturn<{ hunt: HuntFormData }>) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const {
    fields: steps,
    append,
    remove,
  } = useFieldArray({
    control: formMethods.control,
    name: 'hunt.steps',
  });

  const huntId = useWatch({ control: formMethods.control, name: 'hunt.huntId' });

  const handleCreateStep = (type: ChallengeType) => {
    const newStep = StepFactory.create(type, huntId);
    append(newStep);
    setSelectedStepIndex(steps.length);
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) {
      alert('Cannot delete the last step');
      return;
    }

    remove(index);

    const newLength = steps.length - 1;

    if (selectedStepIndex > index) {
      setSelectedStepIndex(selectedStepIndex - 1);
    } else if (selectedStepIndex === index && index >= newLength) {
      setSelectedStepIndex(newLength - 1);
    }
  };

  return {
    steps,
    selectedStepIndex,
    setSelectedStepIndex,
    handleCreateStep,
    handleDeleteStep,
  };
};
