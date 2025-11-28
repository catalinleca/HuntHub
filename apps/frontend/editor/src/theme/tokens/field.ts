import { Theme } from '@mui/material';

export const FOCUS_RING_SHADOW = {
  primary: 9,
  error: 10,
} as const;

export const getFieldTokens = (theme: Theme) => ({
  base: {
    background: theme.palette.common.white,
    border: theme.palette.divider,
    text: theme.palette.text.primary,
  },

  hover: {
    border: theme.palette.primary.dark,
  },

  focus: {
    border: theme.palette.primary.main,
    shadow: theme.shadows[FOCUS_RING_SHADOW.primary],
  },

  error: {
    border: theme.palette.error.main,
    shadow: theme.shadows[FOCUS_RING_SHADOW.error],
  },

  disabled: {
    background: theme.palette.grey[50],
    border: theme.palette.grey[300],
    text: theme.palette.text.disabled,
  },

  height: 40,
  padding: theme.spacing(2, 3),
  borderRadius: theme.shape.borderRadius,
  borderWidth: {
    base: 1,
    focus: 2,
  },

  transition: theme.transitions.create(['border-color', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),

  typography: theme.typography.smRegular,
});

export type FieldTokens = ReturnType<typeof getFieldTokens>;
