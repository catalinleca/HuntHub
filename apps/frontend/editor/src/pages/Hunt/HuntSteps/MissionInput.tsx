import { Divider, Typography } from '@mui/material';
import { ChallengeType, MissionType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormSelect, getFieldPath } from '@/components/form';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';

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
    <StepCard stepIndex={stepIndex} type={ChallengeType.Mission}>
      <Typography variant="label" color="text.secondary">
        Mission Content
      </Typography>

      <FormSelect
        name={fields.type}
        label="Mission Type"
        options={MISSION_TYPE_OPTIONS}
        placeholder="Select mission type"
      />

      <FormInput name={fields.title} label="Title" placeholder="Pigeon Challenge" />

      <FormTextArea
        name={fields.description}
        label="Instructions"
        placeholder="Tell players what they need to do..."
        rows={4}
      />

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
