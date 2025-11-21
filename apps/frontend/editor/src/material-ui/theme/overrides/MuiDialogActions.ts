import { Components, Theme } from '@mui/material';

export const getMuiDialogActionsOverrides = (): Components<Theme>['MuiDialogActions'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `${theme.spacing(4)} ${theme.spacing(5)} ${theme.spacing(5)}`, // 16px top, 24px sides, 24px bottom
      gap: theme.spacing(3), // 12px between buttons
      justifyContent: 'center', // Center buttons
    }),
  },
});
