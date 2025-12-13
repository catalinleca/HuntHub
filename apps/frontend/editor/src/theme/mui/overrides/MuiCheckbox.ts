import { Components, Theme } from '@mui/material';

export const getMuiCheckboxOverrides = (): Components<Theme>['MuiCheckbox'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      paddingRight: theme.spacing(1),
    }),
  },
});
