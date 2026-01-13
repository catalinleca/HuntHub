import { Button, Typography, Paper, Stack, Alert, Box } from '@mui/material';
import { MapPinIcon, CameraIcon, MicrophoneIcon } from '@phosphor-icons/react';
import type { MissionPF, AnswerType, AnswerPayload } from '@hunthub/shared';
import { MissionType } from '@hunthub/shared';

interface MissionChallengeProps {
  mission: MissionPF;
  onValidate: (answerType: AnswerType, payload: AnswerPayload) => void;
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
}

export const MissionChallenge = ({
  mission,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: MissionChallengeProps) => {
  const getMissionIcon = () => {
    switch (mission.type) {
      case MissionType.MatchLocation:
        return <MapPinIcon size={32} weight="duotone" />;
      case MissionType.UploadMedia:
        return <CameraIcon size={32} weight="duotone" />;
      case MissionType.UploadAudio:
        return <MicrophoneIcon size={32} weight="duotone" />;
      default:
        return null;
    }
  };

  const getMissionLabel = () => {
    switch (mission.type) {
      case MissionType.MatchLocation:
        return 'Location Mission';
      case MissionType.UploadMedia:
        return 'Photo/Video Mission';
      case MissionType.UploadAudio:
        return 'Audio Mission';
      default:
        return 'Mission';
    }
  };

  const renderMissionContent = () => {
    switch (mission.type) {
      case MissionType.MatchLocation:
        return (
          <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
            <MapPinIcon size={48} weight="duotone" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Location check coming soon
            </Typography>
          </Box>
        );

      case MissionType.UploadMedia:
        return (
          <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
            <CameraIcon size={48} weight="duotone" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Photo/video upload coming soon
            </Typography>
          </Box>
        );

      case MissionType.UploadAudio:
        return (
          <Box sx={{ p: 3, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'center' }}>
            <MicrophoneIcon size={48} weight="duotone" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Audio recording coming soon
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    if (isValidating) {
      return 'Checking...';
    }
    if (isLastStep) {
      return 'Finish Hunt';
    }
    switch (mission.type) {
      case MissionType.MatchLocation:
        return 'Check Location';
      case MissionType.UploadMedia:
        return 'Upload Media';
      case MissionType.UploadAudio:
        return 'Record Audio';
      default:
        return 'Submit';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          {getMissionIcon()}
          <Typography variant="overline" color="text.secondary">
            {getMissionLabel()}
          </Typography>
        </Stack>

        {mission.title && <Typography variant="h5">{mission.title}</Typography>}

        {mission.description && (
          <Typography variant="body1" color="text.secondary">
            {mission.description}
          </Typography>
        )}

        {renderMissionContent()}

        {feedback && <Alert severity="info">{feedback}</Alert>}

        <Button variant="contained" disabled={isValidating} size="large">
          {getButtonLabel()}
        </Button>
      </Stack>
    </Paper>
  );
};
