import { useState } from 'react';
import { useFieldArray, UseFormReturn, useWatch } from 'react-hook-form';
import { ChallengeType } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';

export const useHuntSteps = (formMethods: UseFormReturn<{ hunt: HuntFormData }>) => {
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  const { fields: steps, append, remove } = useFieldArray({
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
      alert('Cannot delete the last step'); // Use snackbar later
      return;
    }

    remove(index);

    if (selectedStepIndex >= index && selectedStepIndex > 0) {
      setSelectedStepIndex(selectedStepIndex - 1);
    } else if (selectedStepIndex === steps.length - 1) {
      setSelectedStepIndex(steps.length - 2);
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
