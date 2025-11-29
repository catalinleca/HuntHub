import { Box, Stack, TextField, outlinedInputClasses } from '@mui/material';
import styled from 'styled-components';
import { descendant } from '@/theme/selectors';

export const DragHandle = styled(Box)(({ theme }) => ({
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.text.secondary,
}));

export const OptionRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  borderRadius: theme.shape.sm,
  transition: 'background-color 0.15s ease',
}));

interface OptionInputProps {
  $isTarget?: boolean;
}

export const OptionInput = styled(TextField)<OptionInputProps>(({ theme, $isTarget }) => ({
  flex: 1,
  ...($isTarget && {
    [descendant(outlinedInputClasses.notchedOutline)]: {
      borderColor: `${theme.palette.success.main} !important`,
      borderWidth: '2px !important',
    },

    [descendant(outlinedInputClasses.focused)]: {
      boxShadow: `${theme.shadows[11]}`,
    },

    '&:hover': {
      borderRadius: theme.shape.sm,
      boxShadow: `${theme.shadows[11]}`,
    },
  }),
}));

interface TargetCircleProps {
  $isTarget: boolean;
}

export const TargetCircle = styled(Box)<TargetCircleProps>(({ theme, $isTarget }) => ({
  width: 26,
  height: 26,
  minWidth: 26,
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
