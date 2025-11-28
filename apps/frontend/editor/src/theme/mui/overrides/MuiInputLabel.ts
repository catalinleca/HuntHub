import { Components, Theme } from '@mui/material';

export const getMuiInputLabelOverrides = (): Components<Theme>['MuiInputLabel'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      position: 'static',
      transform: 'none',
      marginBottom: theme.spacing(1),
      ...theme.typography.smMedium,
      color: theme.palette.text.primary,

      '&.Mui-focused': {
        color: theme.palette.text.primary,
      },

      '&.Mui-error': {
        color: theme.palette.error.main,
      },

      '.MuiInputLabel-asterisk': {
        color: theme.palette.error.main,
      },
    }),
  },
});
