import { Typography, Paper, Stack } from '@mui/material';
import type { MissionPF } from '@hunthub/shared';

interface MissionChallengeProps {
  mission: MissionPF;
}

export const MissionChallenge = ({ mission }: MissionChallengeProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography variant="h5">{mission.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {mission.description}
        </Typography>
        <Typography color="warning.main">Work in progress</Typography>
      </Stack>
    </Paper>
  );
};
