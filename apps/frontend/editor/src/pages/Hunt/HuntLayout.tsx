import { useForm, FormProvider } from 'react-hook-form';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { Hunt } from '@hunthub/shared';
import { HuntFormData } from '@/types/editor';
import { HuntHeader } from './HuntHeader';
import { HuntStepTimeline } from './HuntStepTimeline';
import { HuntForm } from './HuntForm';
import * as S from './HuntLayout.styles';

interface HuntLayoutProps {
  hunt: Hunt;
}

export const HuntLayout = ({ hunt }: HuntLayoutProps) => {
  const formMethods = useForm<{ hunt: HuntFormData }>({
    values: { hunt: transformHuntToFormData(hunt) },
    resetOptions: { keepDirtyValues: true },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    formState: { isDirty, isSubmitting },
    reset,
  } = formMethods;

  const { steps, selectedStepIndex, setSelectedStepIndex, handleCreateStep } = useHuntSteps(formMethods);

  const saveHuntMutation = useSaveHunt();

  const onSubmit = async (data: { hunt: HuntFormData }) => {
    const huntData = prepareHuntForSave(data.hunt);
    const savedHunt = await saveHuntMutation.mutateAsync(huntData);

    reset({ hunt: transformHuntToFormData(savedHunt) }, { keepDirty: false });
  };

  return (
    <FormProvider {...formMethods}>
      <S.Container>
        <NavBar />

        <HuntHeader
          huntName={hunt.name}
          lastUpdatedBy="You"
          hasUnsavedChanges={isDirty}
          isSaving={isSubmitting}
          onSave={handleSubmit(onSubmit)}
        />

        <HuntStepTimeline
          steps={steps}
          selectedIndex={selectedStepIndex}
          onSelectStep={setSelectedStepIndex}
          onAddStep={handleCreateStep}
        />

        {selectedStepIndex !== -1 && (
          <HuntForm stepIndex={selectedStepIndex} stepType={steps[selectedStepIndex]?.type} />
        )}
      </S.Container>
    </FormProvider>
  );
};
