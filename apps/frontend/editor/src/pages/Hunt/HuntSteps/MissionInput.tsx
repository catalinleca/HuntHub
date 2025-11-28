import { Stack, Divider, Typography } from '@mui/material';
import { FormInput, FormTextArea, FormSelect, getFieldPath } from '@/components/form';
import { MissionType } from '@hunthub/shared';
import { StepHeader, LocationFields, HintField } from './components';

interface MissionInputProps {
  stepIndex: number;
}

const getMissionFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.mission.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.mission.description),
  type: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.mission.type),
  aiInstructions: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.mission.aiInstructions),
});

const MISSION_TYPE_OPTIONS = [
  { value: MissionType.UploadMedia, label: 'Upload Photo/Video' },
  { value: MissionType.MatchLocation, label: 'Match Location' },
];

export const MissionInput = ({ stepIndex }: MissionInputProps) => {
  const fields = getMissionFieldNames(stepIndex);

  return (
    <Stack spacing={3}>
      <StepHeader stepIndex={stepIndex} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        MISSION DETAILS
      </Typography>

      <FormInput name={fields.title} label="Mission Title" placeholder="Take a photo with the statue" required />

      <FormTextArea
        name={fields.description}
        label="Mission Description"
        placeholder="Find the bronze statue in the center of the park and take a selfie..."
        rows={4}
      />

      <FormSelect
        name={fields.type}
        label="Mission Type"
        options={MISSION_TYPE_OPTIONS}
        placeholder="Select mission type"
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        AI VALIDATION (OPTIONAL)
      </Typography>

      <FormTextArea
        name={fields.aiInstructions}
        label="AI Instructions"
        placeholder="Check that the photo contains a bronze statue and a person..."
        rows={3}
        helperText="Instructions for AI to validate player submissions (future feature)"
      />

      <Divider sx={{ my: 2 }} />

      <LocationFields stepIndex={stepIndex} />

      <Divider sx={{ my: 2 }} />

      <HintField stepIndex={stepIndex} />
    </Stack>
  );
};
