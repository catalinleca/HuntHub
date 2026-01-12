import { Typography, Paper, Stack } from '@mui/material';
import type { TaskPF } from '@hunthub/shared';

interface TaskChallengeProps {
  task: TaskPF;
}

export const TaskChallenge = ({ task }: TaskChallengeProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography variant="h5">{task.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {task.instructions}
        </Typography>
        <Typography color="warning.main">Work in progress</Typography>
      </Stack>
    </Paper>
  );
};
