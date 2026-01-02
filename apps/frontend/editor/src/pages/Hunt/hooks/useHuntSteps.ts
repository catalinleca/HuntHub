import { useState } from 'react';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { ChallengeType } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';

export const useHuntSteps = (formMethods: UseFormReturn<{ hunt: HuntFormData }>) => {
  const [selectedFormKey, setSelectedFormKey] = useState<string | null>(null);

  const {
    fields: steps,
    append,
    remove,
    move,
  } = useFieldArray({
    control: formMethods.control,
    name: 'hunt.steps',
  });

  const handleMoveStep = (oldIndex: number, newIndex: number) => {
    move(oldIndex, newIndex);
  };

  const effectiveSelectedKey = selectedFormKey ?? steps[0]?.formKey ?? null;

  const handleCreateStep = (type: ChallengeType) => {
    const huntId = formMethods.getValues('hunt.huntId');
    const newStep = StepFactory.create(type, huntId);
    append(newStep);
    setSelectedFormKey(newStep.formKey);
  };

  const handleDeleteStep = (formKey: string) => {
    const currentSteps = formMethods.getValues('hunt.steps');
    const index = currentSteps.findIndex((s) => s.formKey === formKey);

    if (index === -1) {
      return;
    }

    if (currentSteps.length <= 1) {
      alert('Cannot delete the last step');
      return;
    }

    remove(index);

    if (effectiveSelectedKey === formKey) {
      const nextStep = currentSteps[index + 1] ?? currentSteps[index - 1];
      setSelectedFormKey(nextStep?.formKey ?? null);
    }
  };

  return {
    steps,
    selectedFormKey: effectiveSelectedKey,
    setSelectedFormKey,
    handleCreateStep,
    handleDeleteStep,
    handleMoveStep,
  };
};
