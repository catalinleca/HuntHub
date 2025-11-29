import { Box, IconButton as MuiIconButton } from '@mui/material';
import styled from 'styled-components';

interface OptionRowProps {
  $isTarget: boolean;
}

export const OptionRow = styled(Box)<OptionRowProps>(({ theme, $isTarget }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.shape.md,
  border: `2px solid ${$isTarget ? theme.palette.success.main : theme.palette.divider}`,
  backgroundColor: $isTarget ? theme.palette.grey[100] : theme.palette.background.surface,
  transition: 'all 0.15s ease',

  '&:hover': {
    borderColor: $isTarget ? theme.palette.success.main : theme.palette.grey[400],
  },
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
          backgroundColor: theme.palette.success.dark || theme.palette.success.main,
        }
      : {
          borderColor: theme.palette.success.main,
          color: theme.palette.success.main,
        }),
  },
}));

export const InputWrapper = styled(Box)({
  flex: 1,
});

export const Actions = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
}));

export const ActionButton = styled(MuiIconButton)(({ theme }) => ({
  width: 28,
  height: 28,
  padding: 0,
  color: theme.palette.text.secondary,

  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },

  '&.Mui-disabled': {
    color: theme.palette.grey[300],
  },
}));
