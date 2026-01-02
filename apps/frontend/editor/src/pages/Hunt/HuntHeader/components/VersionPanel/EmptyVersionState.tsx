import { Stack, Typography } from '@mui/material';
import { ClockIcon } from '@phosphor-icons/react';

export const EmptyVersionState = () => {
  return (
    <Stack p={2} alignItems="center" gap={1}>
      <ClockIcon size={32} weight="light" />
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No published versions yet.
        <br />
        Click "Publish" to create your first version.
      </Typography>
    </Stack>
  );
};
