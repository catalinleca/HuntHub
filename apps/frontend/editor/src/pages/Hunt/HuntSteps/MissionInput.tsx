import { Divider, Typography } from '@mui/material';
import { ChallengeType, MissionType } from '@hunthub/shared';
import { FormInput, FormTextArea, getFieldPath, FormToggleButtonGroup } from '@/components/form';
import { LocationSection, StepCard } from './components';
import { StepSettings } from './StepSettings';
import { STEP_TYPE_CONFIG } from '@/pages/Hunt/HuntSteps/stepTypeConfig';
import { GpsIcon, UploadSimpleIcon } from '@phosphor-icons/react';
import { useWatch } from 'react-hook-form';
import { WithTransition } from '@/components/common';

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
  { value: MissionType.UploadMedia, label: 'Upload Photo/Video', icon: <UploadSimpleIcon size={16} weight="bold" /> },
  { value: MissionType.MatchLocation, label: 'Match Location', icon: <GpsIcon size={16} weight="bold" /> },
];

export const MissionInput = ({ stepIndex }: MissionInputProps) => {
  const fields = getMissionFieldNames(stepIndex);
  const { color } = STEP_TYPE_CONFIG[ChallengeType.Mission];

  const missionType = useWatch({ name: fields.type });
  const isMatchLocation = missionType === MissionType.MatchLocation;

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Mission}>
      <Typography variant="label" color="text.secondary">
        Mission Content
      </Typography>

      <FormToggleButtonGroup name={fields.type} label="Answer Type" options={MISSION_TYPE_OPTIONS} color={color} />

      <FormInput name={fields.title} label="Title" placeholder="Pigeon Challenge" />

      <FormTextArea
        name={fields.description}
        label="Instructions"
        placeholder="Tell players what they need to do..."
        rows={4}
      />

      <WithTransition transitionKey={missionType} variant="fade-slide-down">
        {isMatchLocation && (
          <LocationSection title="Target Location (Where players must go)" buttonLabel="Pick on map" color={color} />
        )}
      </WithTransition>

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
