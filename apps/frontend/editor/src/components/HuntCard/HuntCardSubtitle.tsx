import { Typography } from '@mui/material';
import { HuntCardSubtitleProps } from './types';

export const HuntCardSubtitle = ({ children }: HuntCardSubtitleProps) => {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
};