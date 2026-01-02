import { useForm, useFormContext, FormProvider, FieldErrors } from 'react-hook-form';
import { Hunt } from '@hunthub/shared';
import { NavBar } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { PublishingProvider, HuntStepsProvider, useHuntStepsContext } from '@/pages/Hunt/context';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
import { HuntFormData } from '@/types/editor';
import { HuntFormResolver } from '@/validation';
import { useSnackbarStore } from '@/stores';
import { HuntHeader } from './HuntHeader';
import { HuntStepTimeline } from './HuntStepTimeline';
import { HuntForm } from './HuntForm';
import * as S from './HuntLayout.styles';

interface HuntLayoutProps {
  huntFormData: HuntFormData;
  hunt: Hunt;
}

const getUnsavedSelectedStepPosition = (steps: HuntFormData['steps'], formKey: string | null): number => {
  const selectedStep = steps.find((s) => s.formKey === formKey);
  const isUnsaved = selectedStep && !selectedStep.stepId;

  return isUnsaved ? steps.indexOf(selectedStep) : -1;
};

const findFirstStepIndexWithError = (errors: FieldErrors<{ hunt: HuntFormData }>): number => {
  const stepErrors = errors?.hunt?.steps;

  if (!Array.isArray(stepErrors)) {
    return -1;
  }

  return stepErrors.findIndex((err) => err != null);
};

const logFormErrors = (errors: FieldErrors<{ hunt: HuntFormData }>, values: { hunt: HuntFormData }) => {
  console.info(`Form validation failed: `, errors);
  console.info(`Form values`, values);
};

export const HuntLayout = ({ huntFormData, hunt }: HuntLayoutProps) => {
  const formMethods = useForm<{ hunt: HuntFormData }>({
    defaultValues: { hunt: huntFormData },
    mode: 'onBlur',
    resolver: HuntFormResolver,
  });

  return (
    <FormProvider {...formMethods}>
      <PublishingProvider hunt={hunt}>
        <HuntStepsProvider>
          <HuntLayoutContent huntFormData={huntFormData} />
        </HuntStepsProvider>
      </PublishingProvider>
    </FormProvider>
  );
};

const HuntLayoutContent = ({ huntFormData }: { huntFormData: HuntFormData }) => {
  const snackbar = useSnackbarStore();
  const { handleSubmit, reset } = useFormContext<{ hunt: HuntFormData }>();
  const { steps, selectedFormKey, setSelectedFormKey } = useHuntStepsContext();

  const saveHuntMutation = useSaveHunt();

  const onInvalid = (errors: FieldErrors<{ hunt: HuntFormData }>) => {
    logFormErrors(errors, { hunt: huntFormData });

    const errorIndex = findFirstStepIndexWithError(errors);
    const formKey = steps[errorIndex]?.formKey;

    if (formKey) {
      setSelectedFormKey(formKey);
    }
  };

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

      snackbar.success('Changes saved');
    } catch (error) {
      console.error('Failed to save hunt:', error);
      snackbar.error('Failed to save changes');
    }
  };

  const selectedStepIndex = selectedFormKey ? steps.findIndex((s) => s.formKey === selectedFormKey) : -1;
  const selectedStepType = selectedStepIndex >= 0 ? steps[selectedStepIndex]?.type : undefined;

  return (
    <S.Container>
      <NavBar />
      <HuntHeader huntName={huntFormData.name} lastUpdatedBy="You" onSave={handleSubmit(onSubmit, onInvalid)} />
      <HuntStepTimeline />
      {selectedStepIndex !== -1 && <HuntForm stepIndex={selectedStepIndex} stepType={selectedStepType} />}
    </S.Container>
  );
};
