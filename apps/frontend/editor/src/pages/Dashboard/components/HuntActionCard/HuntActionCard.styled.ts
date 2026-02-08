import styled from 'styled-components';
import { Box } from '@mui/material';

export const IconTextRow = styled(Box)<{ $color?: string }>(({ theme, $color }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  color: $color || theme.palette.text.secondary,
  '& > svg': {
    flexShrink: 0,
    paddingTop: '3px',
  },
}));
