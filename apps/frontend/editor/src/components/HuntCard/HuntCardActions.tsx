import { Stack } from '@mui/material';
import { HuntCardActionsProps } from './types';

export const HuntCardActions = ({ children }: HuntCardActionsProps) => {
  return (
    <Stack direction="row" spacing={2} sx={{ p: 3, pt: 2 }}>
      {children}
    </Stack>
  );
};