import { Components, Theme } from '@mui/material';

export const getMuiCardOverrides = (): Components<Theme>['MuiCard'] => ({
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius * 2,
      border: `2px solid ${theme.palette.divider}`,
    }),
  },
});