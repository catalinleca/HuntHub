import { Components, Theme } from '@mui/material';

export const getMuiButtonOverrides = (): Components<Theme>['MuiButton'] => ({
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.borderRadius,
      height: 40,
      padding: '0 24px',
    }),
  },
});
