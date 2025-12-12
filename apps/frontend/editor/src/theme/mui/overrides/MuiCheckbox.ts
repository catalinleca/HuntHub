import { Components, Theme } from '@mui/material';

export const getMuiCheckboxOverrides = (): Components<Theme>['MuiCheckbox'] => ({
  defaultProps: {
    size: 'medium',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      padding: 0,
      paddingRight: theme.spacing(1),
    }),
  },
});
