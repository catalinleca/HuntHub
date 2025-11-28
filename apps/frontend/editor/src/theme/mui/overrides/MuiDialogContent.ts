import { Components, Theme } from '@mui/material';

export const getMuiDialogContentOverrides = (): Components<Theme>['MuiDialogContent'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `0 ${theme.spacing(5)} ${theme.spacing(4)}`,
      color: theme.palette.text.secondary,
      textAlign: 'center',
    }),
  },
});
