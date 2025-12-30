import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { StepFormProvider } from '@/pages/Hunt/context';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { HuntFormData, StepFormData } from '@/types/editor';
import { HuntHeader } from './HuntHeader';
import { HuntStepTimeline } from './HuntStepTimeline';
import { HuntForm } from './HuntForm';
import * as S from './HuntLayout.styles';

interface HuntLayoutProps {
  huntFormData: HuntFormData;
}

interface PendingSelection {
  position: number;
  expectedStepId: number;
}

const getUnsavedSelectedStepPosition = (steps: HuntFormData['steps'], formKey: string | null): number => {
  const selectedStep = steps.find((s) => s.formKey === formKey);
  const isUnsaved = selectedStep && !selectedStep.stepId;

  return isUnsaved ? steps.indexOf(selectedStep) : -1;
};

const getExpectedStepId = (savedSteps: Array<{ stepId?: number }> | undefined, position: number): number | null => {
  return savedSteps?.[position]?.stepId ?? null;
};

const shouldUpdateSelection = (
  steps: StepFormData[],
  pending: PendingSelection | null,
): string | null => {
  if (!pending) {
    return null;
  }

  const step = steps[pending.position];
  if (step?.stepId === pending.expectedStepId) {
    return step.formKey;
  }

  return null;
};

export const HuntLayout = ({ huntFormData }: HuntLayoutProps) => {
  const formMethods = useForm<{ hunt: HuntFormData }>({
    values: { hunt: huntFormData },
    resetOptions: { keepDirtyValues: true },
    mode: 'onBlur',
  });

  const { handleSubmit } = formMethods;

  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleDeleteStep } = useHuntSteps(formMethods);

  const saveHuntMutation = useSaveHunt();

  const [pendingSelection, setPendingSelection] = useState<PendingSelection | null>(null);

  useEffect(() => {
    const newFormKey = shouldUpdateSelection(steps, pendingSelection);
    if (newFormKey) {
      setSelectedFormKey(newFormKey);
      setPendingSelection(null);
    }
  }, [steps, pendingSelection, setSelectedFormKey]);

  const onSubmit = async (data: { hunt: HuntFormData }) => {
    const unsavedSelectedStepPosition = getUnsavedSelectedStepPosition(data.hunt.steps, selectedFormKey);

    const savedHunt = await saveHuntMutation.mutateAsync(prepareHuntForSave(data.hunt));

    const expectedStepId = getExpectedStepId(savedHunt.steps, unsavedSelectedStepPosition);
    if (unsavedSelectedStepPosition >= 0 && expectedStepId) {
      setPendingSelection({ position: unsavedSelectedStepPosition, expectedStepId });
    }
  };

  const selectedStepIndex = pendingSelection
    ? pendingSelection.position
    : selectedFormKey
      ? steps.findIndex((s) => s.formKey === selectedFormKey)
      : -1;

  const selectedStepType = selectedStepIndex >= 0 ? steps[selectedStepIndex]?.type : undefined;

  return (
    <StepFormProvider onDeleteStep={() => selectedFormKey && handleDeleteStep(selectedFormKey)}>
      <FormProvider {...formMethods}>
        <S.Container>
          <NavBar />

          <HuntHeader huntName={huntFormData.name} lastUpdatedBy="You" onSave={handleSubmit(onSubmit)} />

          <HuntStepTimeline
            steps={steps}
            selectedFormKey={selectedFormKey}
            onSelectStep={setSelectedFormKey}
            onAddStep={handleCreateStep}
          />

          {selectedStepIndex !== -1 && <HuntForm stepIndex={selectedStepIndex} stepType={selectedStepType} />}
        </S.Container>
      </FormProvider>
    </StepFormProvider>
  );
};
