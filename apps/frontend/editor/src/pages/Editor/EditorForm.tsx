import { useForm, FormProvider } from 'react-hook-form';
import { useMemo } from 'react';
import { Typography, Button, Chip } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { Eye, ShareNetwork, Upload } from '@phosphor-icons/react';
import { NavBar, UserMenu } from '@/components';
import { useSaveHunt } from '@/api/Hunt';
import { useEditorSteps } from './hooks/useEditorSteps';
import { transformHuntToFormData, transformFormDataToHunt } from '@/utils/transformers/editorTransformers';
import { EditorFormData, Hunt } from '@/types/editor';
import { StepIcon, AddStepIcon, ClueForm } from './components';
import * as S from './EditorForm.styles';

interface EditorFormProps {
  hunt: Hunt;
}

export const EditorForm = ({ hunt }: EditorFormProps) => {
  const formMethods = useForm<EditorFormData>({
    values: transformHuntToFormData(hunt),
    resetOptions: { keepDirtyValues: true },
    mode: 'onChange',
  });

  const { handleSubmit, formState: { isDirty, isSubmitting } } = formMethods;

  const {
    steps,
    selectedStepIndex,
    setSelectedStepIndex,
    handleCreateStep,
    handleDeleteStep,
  } = useEditorSteps(formMethods);

  const selectedStepType = useMemo(
    () => steps[selectedStepIndex]?.type,
    [steps, selectedStepIndex]
  );

  const saveHuntMutation = useSaveHunt();

  const onSubmit = async (formData: EditorFormData) => {
    const huntData = transformFormDataToHunt(formData, hunt.huntId);
    await saveHuntMutation.mutateAsync(huntData);
  };

  const renderStepForm = () => {
    if (selectedStepIndex === -1) return null;

    switch (selectedStepType) {
      case ChallengeType.Clue:
        return <ClueForm stepIndex={selectedStepIndex} />;
      case ChallengeType.Quiz:
        return <Typography p={3}>Quiz form (coming soon)</Typography>;
      case ChallengeType.Mission:
        return <Typography p={3}>Mission form (coming soon)</Typography>;
      case ChallengeType.Task:
        return <Typography p={3}>Task form (coming soon)</Typography>;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...formMethods}>
      <S.Container>
        <NavBar />

        <S.EditorNavBarContainer>
          <S.HuntTitle>
            <Typography variant="h6" fontWeight={600}>
              {hunt.name}
            </Typography>
            {isDirty && (
              <Chip label="Unsaved changes" size="small" color="warning" variant="outlined" />
            )}
          </S.HuntTitle>

          <S.Actions>
            <Button variant="outlined" size="small" disabled={!isDirty || isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outlined" size="small" startIcon={<Eye size={18} />}>
              Hide
            </Button>
            <Button variant="outlined" size="small" startIcon={<ShareNetwork size={18} />}>
              Share
            </Button>
            <Button variant="contained" size="small" startIcon={<Upload size={18} />}>
              Publish
            </Button>
            <UserMenu />
          </S.Actions>
        </S.EditorNavBarContainer>

        <S.StepStrip>
          {steps.map((step, index) => (
            <StepIcon
              key={step._id}
              stepNumber={index + 1}
              type={step.type}
              isSelected={selectedStepIndex === index}
              onClick={() => setSelectedStepIndex(index)}
            />
          ))}
          <AddStepIcon onAddStep={handleCreateStep} />
        </S.StepStrip>

        <S.FormArea>
          <S.FormCard>
            {renderStepForm()}
          </S.FormCard>
        </S.FormArea>
      </S.Container>
    </FormProvider>
  );
};