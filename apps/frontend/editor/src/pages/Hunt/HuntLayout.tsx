import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { StepFormProvider } from '@/pages/Hunt/context';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
import { HuntFormData } from '@/types/editor';
import { HuntFormResolver } from '@/validation';
import { HuntHeader } from './HuntHeader';
import { HuntStepTimeline } from './HuntStepTimeline';
import { HuntForm } from './HuntForm';
import * as S from './HuntLayout.styles';

interface HuntLayoutProps {
  huntFormData: HuntFormData;
}

const getUnsavedSelectedStepPosition = (steps: HuntFormData['steps'], formKey: string | null): number => {
  const selectedStep = steps.find((s) => s.formKey === formKey);
  const isUnsaved = selectedStep && !selectedStep.stepId;

  return isUnsaved ? steps.indexOf(selectedStep) : -1;
};

const findFirstStepIndexWithError = (errors: FieldErrors<{ hunt: HuntFormData }>): number => {
  const stepErrors = errors?.hunt?.steps || [];

  return (stepErrors as unknown[]).findIndex((err) => !!err);
};

const logFormErrors = (errors: FieldErrors<{ hunt: HuntFormData }>) => {
  console.info(`Form validation failed: `, errors);
};

export const HuntLayout = ({ huntFormData }: HuntLayoutProps) => {
  const formMethods = useForm<{ hunt: HuntFormData }>({
    defaultValues: { hunt: huntFormData },
    mode: 'onBlur',
    resolver: HuntFormResolver,
  });

  const { handleSubmit, reset } = formMethods;

  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleDeleteStep } = useHuntSteps(formMethods);

  const onInvalid = (errors: FieldErrors<{ hunt: HuntFormData }>) => {
    logFormErrors(errors);

    const errorIndex = findFirstStepIndexWithError(errors);
    const formKey = steps[errorIndex]?.formKey;

    if (formKey) {
      setSelectedFormKey(formKey);
    }
  };

  const saveHuntMutation = useSaveHunt();

  const onSubmit = async (data: { hunt: HuntFormData }) => {
    const unsavedSelectedStepPosition = getUnsavedSelectedStepPosition(data.hunt.steps, selectedFormKey);

    try {
      const savedHunt = await saveHuntMutation.mutateAsync(prepareHuntForSave(data.hunt));

      const newFormData = transformHuntToFormData(savedHunt);
      reset({ hunt: newFormData });

      if (unsavedSelectedStepPosition >= 0) {
        const newFormKey = newFormData.steps[unsavedSelectedStepPosition]?.formKey;
        if (newFormKey) {
          setSelectedFormKey(newFormKey);
        }
      }
    } catch (error) {
      console.error('Failed to save hunt:', error);
    }
  };

  const selectedStepIndex = selectedFormKey ? steps.findIndex((s) => s.formKey === selectedFormKey) : -1;

  const selectedStepType = selectedStepIndex >= 0 ? steps[selectedStepIndex]?.type : undefined;

  return (
    <StepFormProvider onDeleteStep={() => selectedFormKey && handleDeleteStep(selectedFormKey)}>
      <FormProvider {...formMethods}>
        <S.Container>
          <NavBar />

          <HuntHeader huntName={huntFormData.name} lastUpdatedBy="You" onSave={handleSubmit(onSubmit, onInvalid)} />

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
