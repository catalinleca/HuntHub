import { Components, Theme } from '@mui/material';

export const getMuiMenuItemOverrides = (): Components<Theme>['MuiMenuItem'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.sm,
      padding: theme.spacing(1, 2),
      gap: theme.spacing(2),
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    }),
  },
});
