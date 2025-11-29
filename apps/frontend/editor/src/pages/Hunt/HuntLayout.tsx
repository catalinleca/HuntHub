import { useForm, FormProvider } from 'react-hook-form';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { StepFormProvider } from '@/pages/Hunt/context';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
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

  const { handleSubmit, reset } = formMethods;

  const { steps, selectedStepId, setSelectedStepId, handleCreateStep, handleDeleteStep } = useHuntSteps(formMethods);

  const saveHuntMutation = useSaveHunt();

  const onSubmit = async (data: { hunt: HuntFormData }) => {
    const huntData = prepareHuntForSave(data.hunt);
    const savedHunt = await saveHuntMutation.mutateAsync(huntData);

    reset({ hunt: transformHuntToFormData(savedHunt) }, { keepDirty: false });
  };

  const selectedStepIndex = selectedStepId ? steps.findIndex((s) => s._id === selectedStepId) : -1;

  const selectedStepType = selectedStepIndex >= 0 ? steps[selectedStepIndex]?.type : undefined;

  return (
    <StepFormProvider onDeleteStep={() => selectedStepId && handleDeleteStep(selectedStepId)}>
      <FormProvider {...formMethods}>
        <S.Container>
          <NavBar />

          <HuntHeader huntName={huntFormData.name} lastUpdatedBy="You" onSave={handleSubmit(onSubmit)} />

          <HuntStepTimeline
            steps={steps}
            selectedStepId={selectedStepId}
            onSelectStep={setSelectedStepId}
            onAddStep={handleCreateStep}
          />

          {selectedStepIndex !== -1 && <HuntForm stepIndex={selectedStepIndex} stepType={selectedStepType} />}
        </S.Container>
      </FormProvider>
    </StepFormProvider>
  );
};
