import { Stack, Typography } from '@mui/material';
import { HuntCardTitleProps } from './types';

export const HuntCardTitle = ({ icon, count, children }: HuntCardTitleProps) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      {icon && (
        <Stack sx={{ color: 'primary.main' }} alignItems="center">
          {icon}
        </Stack>
      )}
      <Typography variant="h6" textStyle="display">{children}</Typography>
      {count !== undefined && (
        <Typography variant="h6" color="text.secondary" fontWeight="regular" textStyle="display">
          ({count})
        </Typography>
      )}
    </Stack>
  );
};
