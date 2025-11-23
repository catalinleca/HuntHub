import styled from 'styled-components';
import { Box } from '@mui/material';

export const IconTextRow = styled(Box)<{ $color?: string }>(({ theme, $color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: $color || theme.palette.text.secondary,
}));
