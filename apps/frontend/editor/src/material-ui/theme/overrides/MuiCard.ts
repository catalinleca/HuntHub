import { Components, Theme } from '@mui/material';

export const getMuiCardOverrides = (): Components<Theme>['MuiCard'] => ({
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.lg,
      border: `2px solid ${theme.palette.grey[600]}`,
    }),
  },
});
