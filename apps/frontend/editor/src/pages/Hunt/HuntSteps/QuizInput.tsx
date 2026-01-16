import { useEffect } from 'react';
import { Divider, Grid2, Stack, Typography } from '@mui/material';
import { useFormContext, useWatch } from 'react-hook-form';
import { ChallengeType, OptionType, ValidationMode } from '@hunthub/shared';
import {
  FormInput,
  FormNumberInput,
  FormTextArea,
  FormToggleButtonGroup,
  FormMediaInput,
  FormSelect,
  getFieldPath,
} from '@/components/form';
import { WithTransition } from '@/components/common';
import { Section, SectionTitle, StepCard } from './components';
import { StepSettings } from './StepSettings';
import { MultipleChoiceEditor } from './components/Quiz';
import { STEP_TYPE_CONFIG } from '@/pages/Hunt/HuntSteps/stepTypeConfig';
import { ListBulletsIcon, TextTIcon } from '@phosphor-icons/react';

interface QuizInputProps {
  stepIndex: number;
}

const getQuizFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.description),
  type: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.type),
  expectedAnswer: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.expectedAnswer),
  options: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.options),
  targetId: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.targetId),
  media: getFieldPath((h) => h.hunt.steps[stepIndex].media),
  validationMode: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.validation.mode),
  fuzzyThreshold: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.validation.fuzzyThreshold),
  numericTolerance: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.validation.numericTolerance),
});

const QUIZ_TYPE_OPTIONS = [
  { value: OptionType.Choice, label: 'Multiple Choice', icon: <ListBulletsIcon size={16} weight="bold" /> },
  { value: OptionType.Input, label: 'Text Input', icon: <TextTIcon size={16} weight="bold" /> },
];

const VALIDATION_MODE_OPTIONS = [
  { value: ValidationMode.Exact, label: 'Exact Match' },
  { value: ValidationMode.Fuzzy, label: 'Fuzzy (typo-tolerant)' },
  { value: ValidationMode.NumericRange, label: 'Numeric Range' },
];

export const QuizInput = ({ stepIndex }: QuizInputProps) => {
  const fields = getQuizFieldNames(stepIndex);
  const { color } = STEP_TYPE_CONFIG[ChallengeType.Quiz];
  const { setValue } = useFormContext();

  const quizType = useWatch({ name: fields.type });
  const validationMode = useWatch({ name: fields.validationMode });

  useEffect(() => {
    if (!validationMode) {
      setValue(fields.validationMode, ValidationMode.Exact);
    }
  }, [validationMode, fields.validationMode, setValue]);

  const isMultipleChoice = quizType === OptionType.Choice;
  const showFuzzyThreshold = validationMode === ValidationMode.Fuzzy;
  const showNumericTolerance = validationMode === ValidationMode.NumericRange;

  const text = isMultipleChoice ? 'Answer Options (click ✓ to mark correct)' : 'Expected Answer';

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Quiz}>
      <Typography variant="label" color="text.secondary">
        Quiz Content
      </Typography>

      <FormToggleButtonGroup name={fields.type} label="Answer Type" options={QUIZ_TYPE_OPTIONS} color={color} />

      <FormInput name={fields.title} label="Question" placeholder="When was this library built?" />

      <FormTextArea name={fields.description} label="Details" placeholder="Markdown placeholder" rows={2} />

      <Section $color={color}>
        <WithTransition transitionKey={quizType} variant="fade-slide-down">
          <Stack gap={2}>
            <SectionTitle $color={color}>{text}</SectionTitle>

            {isMultipleChoice ? (
              <MultipleChoiceEditor stepIndex={stepIndex} />
            ) : (
              <Stack gap={2}>
                <FormInput
                  name={fields.expectedAnswer}
                  label="Correct Answer"
                  placeholder="1892"
                  helperText="The answer players need to provide"
                />

                <Grid2 container spacing={2} alignItems="flex-start">
                  <Grid2 size={6}>
                    <FormSelect
                      name={fields.validationMode}
                      label="Validation Mode"
                      options={VALIDATION_MODE_OPTIONS}
                    />
                  </Grid2>

                  {showFuzzyThreshold && (
                    <Grid2 size={6}>
                      <FormNumberInput
                        name={fields.fuzzyThreshold}
                        label="Similarity Threshold"
                        placeholder="80"
                        helperText="1-100% similarity required"
                        min={1}
                        max={100}
                        step={1}
                        slotProps={{
                          input: { endAdornment: '%' },
                        }}
                      />
                    </Grid2>
                  )}

                  {showNumericTolerance && (
                    <Grid2 size={6}>
                      <FormNumberInput
                        name={fields.numericTolerance}
                        label="Tolerance (±)"
                        placeholder="5"
                        helperText="Answer ± this value"
                        min={0}
                        step={1}
                      />
                    </Grid2>
                  )}
                </Grid2>
              </Stack>
            )}
          </Stack>
        </WithTransition>
      </Section>

      <Divider sx={{ my: 2 }} />

      <FormMediaInput name={fields.media} label="Media" description="Optional image, audio, or video for this quiz" />

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
