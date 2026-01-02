import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { Hunt } from '@hunthub/shared';
import { NavBar } from '@/components';
import { useSaveHunt, usePublishHunt, useReleaseHunt, useTakeOfflineHunt } from '@/api/Hunt';
import { useHuntSteps } from '@/pages/Hunt/hooks';
import { StepFormProvider } from '@/pages/Hunt/context';
import { prepareHuntForSave } from '@/utils/transformers/huntOutput';
import { transformHuntToFormData } from '@/utils/transformers/huntInput';
import { HuntFormData } from '@/types/editor';
import { HuntFormResolver } from '@/validation';
import { useDialogStore, DialogVariants } from '@/stores';
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

  const { handleSubmit, reset } = formMethods;
  const { confirm } = useDialogStore();

  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleDeleteStep, handleMoveStep } =
    useHuntSteps(formMethods);

  const onInvalid = (errors: FieldErrors<{ hunt: HuntFormData }>) => {
    logFormErrors(errors, formMethods.getValues());

    const errorIndex = findFirstStepIndexWithError(errors);
    const formKey = steps[errorIndex]?.formKey;

    if (formKey) {
      setSelectedFormKey(formKey);
    }
  };

  const saveHuntMutation = useSaveHunt();
  const publishMutation = usePublishHunt();
  const releaseMutation = useReleaseHunt();
  const takeOfflineMutation = useTakeOfflineHunt();

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

  const handlePublish = () => {
    confirm({
      title: 'Publish Version?',
      message: `This will create an immutable snapshot (v${hunt.latestVersion}) of your hunt. You can then release it from the version panel to make it visible to players.`,
      confirmText: 'Publish',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        await publishMutation.mutateAsync(hunt.huntId);
      },
    });
  };

  const handlePublishAndRelease = () => {
    confirm({
      title: 'Publish & Go Live?',
      message: `This will create version ${hunt.latestVersion} and immediately make it live for players.${hunt.liveVersion ? ` This will replace the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Publish & Go Live',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        const publishResult = await publishMutation.mutateAsync(hunt.huntId);
        await releaseMutation.mutateAsync({
          huntId: hunt.huntId,
          request: {
            version: publishResult.publishedVersion,
            currentLiveVersion: hunt.liveVersion ?? null,
          },
        });
      },
    });
  };

  const handleRelease = (versionToRelease: number) => {
    confirm({
      title: 'Release to Players?',
      message: `Players will be able to find and play version ${versionToRelease} of this hunt immediately.${hunt.liveVersion ? ` This will replace the currently live version (v${hunt.liveVersion}).` : ''}`,
      confirmText: 'Go Live',
      cancelText: 'Cancel',
      variant: DialogVariants.Info,
      onConfirm: async () => {
        await releaseMutation.mutateAsync({
          huntId: hunt.huntId,
          request: {
            version: versionToRelease,
            currentLiveVersion: hunt.liveVersion ?? null,
          },
        });
      },
    });
  };

  const handleTakeOffline = () => {
    confirm({
      title: 'Take Hunt Offline?',
      message: `This will remove "${hunt.name}" from player discovery. Players won't be able to find or start new sessions. Active sessions will continue, and you can release again anytime.`,
      confirmText: 'Take Offline',
      cancelText: 'Cancel',
      variant: DialogVariants.Warning,
      onConfirm: async () => {
        await takeOfflineMutation.mutateAsync({
          huntId: hunt.huntId,
          request: {
            currentLiveVersion: hunt.liveVersion ?? null,
          },
        });
      },
    });
  };

  const selectedStepIndex = selectedFormKey ? steps.findIndex((s) => s.formKey === selectedFormKey) : -1;

  const selectedStepType = selectedStepIndex >= 0 ? steps[selectedStepIndex]?.type : undefined;

  return (
    <StepFormProvider onDeleteStep={() => selectedFormKey && handleDeleteStep(selectedFormKey)}>
      <FormProvider {...formMethods}>
        <S.Container>
          <NavBar />

          <HuntHeader
            huntName={huntFormData.name}
            lastUpdatedBy="You"
            onSave={handleSubmit(onSubmit, onInvalid)}
            version={hunt.version}
            latestVersion={hunt.latestVersion}
            liveVersion={hunt.liveVersion ?? null}
            isLive={hunt.isLive ?? false}
            onPublish={handlePublish}
            onPublishAndRelease={handlePublishAndRelease}
            onRelease={handleRelease}
            onTakeOffline={handleTakeOffline}
            isPublishing={publishMutation.isPending}
            isReleasing={releaseMutation.isPending}
            isTakingOffline={takeOfflineMutation.isPending}
          />

          <HuntStepTimeline
            steps={steps}
            selectedFormKey={selectedFormKey}
            onSelectStep={setSelectedFormKey}
            onAddStep={handleCreateStep}
            onMoveStep={handleMoveStep}
          />

          {selectedStepIndex !== -1 && <HuntForm stepIndex={selectedStepIndex} stepType={selectedStepType} />}
        </S.Container>
      </FormProvider>
    </StepFormProvider>
  );
};
