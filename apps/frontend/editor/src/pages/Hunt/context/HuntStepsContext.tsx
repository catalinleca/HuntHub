import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { ChallengeType } from '@hunthub/shared';
import { HuntFormData, StepFormData } from '@/types/editor';
import { StepFactory } from '@/utils/factories/StepFactory';
import { useSnackbarStore } from '@/stores';

interface HuntStepsContextValue {
  steps: StepFormData[];
  selectedFormKey: string | null;
  setSelectedFormKey: (key: string | null) => void;
  handleCreateStep: (type: ChallengeType) => void;
  handleDeleteStep: (formKey: string) => void;
  handleMoveStep: (oldIndex: number, newIndex: number) => void;
}

const HuntStepsContext = createContext<HuntStepsContextValue | null>(null);

export const useHuntStepsContext = () => {
  const context = useContext(HuntStepsContext);
  if (!context) {
    throw new Error('useHuntStepsContext must be used within HuntStepsProvider');
  }
  return context;
};

interface HuntStepsProviderProps {
  children: ReactNode;
}

export const HuntStepsProvider = ({ children }: HuntStepsProviderProps) => {
  const formMethods = useFormContext<{ hunt: HuntFormData }>();
  const snackbar = useSnackbarStore();
  const [selectedFormKey, setSelectedFormKey] = useState<string | null>(null);

  const { fields, append, remove, move } = useFieldArray({
    control: formMethods.control,
    name: 'hunt.steps',
  });

  const steps = fields as unknown as StepFormData[];

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
      snackbar.warning('Cannot delete the last step');
      return;
    }

    remove(index);

    if (effectiveSelectedKey === formKey) {
      const nextStep = currentSteps[index + 1] ?? currentSteps[index - 1];
      setSelectedFormKey(nextStep?.formKey ?? null);
    }
  };

  const handleMoveStep = (oldIndex: number, newIndex: number) => {
    move(oldIndex, newIndex);
  };

  const value = useMemo(
    () => ({
      steps,
      selectedFormKey: effectiveSelectedKey,
      setSelectedFormKey,
      handleCreateStep,
      handleDeleteStep,
      handleMoveStep,
    }),
    [steps, effectiveSelectedKey],
  );

  return <HuntStepsContext.Provider value={value}>{children}</HuntStepsContext.Provider>;
};
