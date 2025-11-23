import { Components, Theme } from '@mui/material';

export const getMuiChipOverrides = (): Components<Theme>['MuiChip'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      fontWeight: 600,
      fontSize: 14,
      border: `2px solid ${theme.palette.primary.main}`,
      borderRadius: theme.shape.sm,
      padding: theme.spacing(2),
      backgroundColor: theme.palette.accent.main,
    }),
  },
});
