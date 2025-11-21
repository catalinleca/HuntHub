import { Components, Theme } from '@mui/material';

export const getMuiDialogActionsOverrides = (): Components<Theme>['MuiDialogActions'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `${theme.spacing(4)} ${theme.spacing(5)} ${theme.spacing(5)}`,
      gap: theme.spacing(3),
      justifyContent: 'center',
    }),
  },
});
