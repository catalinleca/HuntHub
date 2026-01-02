import { Components, Theme } from '@mui/material';

export const getMuiMenuOverrides = (): Components<Theme>['MuiMenu'] => ({
  styleOverrides: {
    paper: ({ theme }) => ({
      borderRadius: theme.shape.md,
      boxShadow: theme.shadows[4],
      marginTop: theme.spacing(1),
    }),
    list: ({ theme }) => ({
      padding: theme.spacing(1),
    }),
  },
});
