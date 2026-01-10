import { Components, Theme } from '@mui/material';

export const getMuiDialogTitleOverrides = (): Components<Theme>['MuiDialogTitle'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `${theme.spacing(5)} ${theme.spacing(5)} ${theme.spacing(3)}`,
      fontWeight: theme.typography.fontWeightBold,
      fontSize: theme.typography.h5.fontSize,
      color: theme.palette.text.primary,
      textAlign: 'center',
    }),
  },
});
