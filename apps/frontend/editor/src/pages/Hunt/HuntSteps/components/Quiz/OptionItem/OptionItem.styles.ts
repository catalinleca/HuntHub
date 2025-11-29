import { Box, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import styled from 'styled-components';

interface OptionRowProps {
  $isTarget: boolean;
}

export const OptionRow = styled(Stack)<OptionRowProps>(({ theme, $isTarget }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1),
  borderRadius: theme.shape.sm,
  backgroundColor: $isTarget ? alpha(theme.palette.success.main, 0.1) : 'transparent',
  transition: 'background-color 0.15s ease',
}));

interface TargetCircleProps {
  $isTarget: boolean;
}

export const TargetCircle = styled(Box)<TargetCircleProps>(({ theme, $isTarget }) => ({
  width: 28,
  height: 28,
  minWidth: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontWeight: 600,
  fontSize: 14,

  ...($isTarget
    ? {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
        border: 'none',
      }
    : {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.text.secondary,
        border: `2px solid ${theme.palette.divider}`,
      }),

  '&:hover': {
    ...($isTarget
      ? {
          backgroundColor: theme.palette.success.dark,
        }
      : {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        }),
  },
}));
