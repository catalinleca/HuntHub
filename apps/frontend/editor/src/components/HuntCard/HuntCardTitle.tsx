import { Stack, Typography } from '@mui/material';
import { HuntCardTitleProps } from './types';

export const HuntCardTitle = ({ icon, count, children }: HuntCardTitleProps) => {
  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
      {icon && (
        <Stack sx={{ color: 'primary.main' }} alignItems="center">
          {icon}
        </Stack>
      )}
      <Typography variant="displayH4">{children}</Typography>
      {count !== undefined && (
        <Typography
          variant="h4"
          color="text.secondary"
          fontWeight="regular"
          sx={{ fontFamily: (theme) => theme.typography.displayFontFamily }}
        >
          ({count})
        </Typography>
      )}
    </Stack>
  );
};
