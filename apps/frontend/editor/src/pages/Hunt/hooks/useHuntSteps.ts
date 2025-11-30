import { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ChallengeType } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';

export const useHuntSteps = (formMethods: UseFormReturn<{ hunt: HuntFormData }>) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const {
    fields: steps,
    append,
    remove,
  } = useFieldArray({
    control: formMethods.control,
    name: 'hunt.steps',
  });

  const effectiveSelectedId = selectedStepId ?? steps[0]?._id ?? null;

  const handleCreateStep = (type: ChallengeType) => {
    const huntId = formMethods.getValues('hunt.huntId');
    const newStep = StepFactory.create(type, huntId);
    append(newStep);
    setSelectedStepId(newStep._id);
  };

  const handleDeleteStep = (stepId: string) => {
    const index = steps.findIndex((s) => s._id === stepId);
    if (index === -1) {
      return;
    }

    if (steps.length <= 1) {
      alert('Cannot delete the last step');
      return;
    }

    remove(index);

    // steps array still has OLD values here (remove is async)
    // So steps[index + 1] correctly refers to the step after deleted one
    if (effectiveSelectedId === stepId) {
      const nextStep = steps[index + 1] ?? steps[index - 1];
      setSelectedStepId(nextStep?._id ?? null);
    }
  };

  return {
    steps,
    selectedStepId: effectiveSelectedId,
    setSelectedStepId,
    handleCreateStep,
    handleDeleteStep,
  };
};
