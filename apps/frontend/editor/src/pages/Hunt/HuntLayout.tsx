import { useForm, FormProvider } from 'react-hook-form';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { StepFormProvider } from '@/pages/Hunt/context';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { HuntFormData } from '@/types/editor';
import { HuntHeader } from './HuntHeader';
import { HuntStepTimeline } from './HuntStepTimeline';
import { HuntForm } from './HuntForm';
import * as S from './HuntLayout.styles';

interface HuntLayoutProps {
  huntFormData: HuntFormData;
}

export const HuntLayout = ({ huntFormData }: HuntLayoutProps) => {
  const formMethods = useForm<{ hunt: HuntFormData }>({
    values: { hunt: huntFormData },
    resetOptions: { keepDirtyValues: true },
    mode: 'onBlur',
  });

  const { handleSubmit } = formMethods;

  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleDeleteStep } = useHuntSteps(formMethods);

  const saveHuntMutation = useSaveHunt();

  const onSubmit = async (data: { hunt: HuntFormData }) => {
    const unsavedSelectedStepPosition = getUnsavedSelectedStepPosition(data.hunt.steps, selectedFormKey);

    const savedHunt = await saveHuntMutation.mutateAsync(prepareHuntForSave(data.hunt));

    syncSelectionAfterSave(savedHunt.steps, unsavedSelectedStepPosition, setSelectedFormKey);
  };

  const getUnsavedSelectedStepPosition = (steps: HuntFormData['steps'], formKey: string | null): number => {
    const selectedStep = steps.find((s) => s.formKey === formKey);
    const isUnsaved = selectedStep && !selectedStep.stepId;

    return isUnsaved ? steps.indexOf(selectedStep) : -1;
  };

  const syncSelectionAfterSave = (
    savedSteps: Array<{ stepId?: number }> | undefined,
    position: number,
    setFormKey: (key: string | null) => void,
  ): void => {
    if (position < 0 || !savedSteps?.[position]) {
      return;
    }

    const newFormKey = savedSteps[position].stepId?.toString() ?? null;
    setFormKey(newFormKey);
  };

  const selectedStepIndex = selectedFormKey ? steps.findIndex((s) => s.formKey === selectedFormKey) : -1;

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
