import { Components, Theme } from '@mui/material';

export const getMuiDialogContentOverrides = (): Components<Theme>['MuiDialogContent'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `0 ${theme.spacing(5)} ${theme.spacing(4)}`, // 0 top, 24px sides, 16px bottom
      color: theme.palette.text.secondary, // #5D4E37 (medium brown)
      textAlign: 'center', // Centered
    }),
  },
});
