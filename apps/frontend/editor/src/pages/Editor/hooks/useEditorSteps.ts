import { useFieldArray, UseFormReturn } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { ChallengeType } from '@hunthub/shared';
import { EditorFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';

export const useEditorSteps = (formMethods: UseFormReturn<EditorFormData>) => {
  const { control } = formMethods;
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'steps',
    keyName: '_id',
  });

  useEffect(() => {
    if (fields.length > 0 && selectedStepIndex === -1) {
      setSelectedStepIndex(0);
    }
  }, [fields.length, selectedStepIndex]);

  const handleCreateStep = (type: ChallengeType) => {
    const newStep = StepFactory.create(type);
    append(newStep);
    setSelectedStepIndex(fields.length);
  };

  const handleDeleteStep = (index: number) => {
    if (fields.length === 1) {
      return;
    }

    remove(index);

    const newSelectedIndex = index === 0 ? 0 : index - 1;
    setSelectedStepIndex(Math.min(newSelectedIndex, fields.length - 2));
  };

  const handleReorderSteps = (fromIndex: number, toIndex: number) => {
    move(fromIndex, toIndex);
    setSelectedStepIndex(toIndex);
  };

  return {
    steps: fields,
    selectedStepIndex,
    setSelectedStepIndex,
    handleCreateStep,
    handleDeleteStep,
    handleReorderSteps,
  };
};