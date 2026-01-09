import { Components, Theme } from '@mui/material';

export const getMuiToggleButtonGroupOverrides = (): Components<Theme>['MuiToggleButtonGroup'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      backgroundColor: theme.palette.grey[100],
      borderRadius: theme.shape.md,
      padding: theme.spacing(1),
      gap: theme.spacing(1),
    }),
    grouped: {
      border: 'none',
      '&:not(:first-of-type)': {
        marginLeft: 0,
      },
    },
  },
});
