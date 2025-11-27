import { Components, Theme } from '@mui/material';
import { getInputOverrideStyles } from '../mixins/inputStyles';

export const getMuiTextFieldOverrides = (): Components<Theme>['MuiTextField'] => ({
  defaultProps: {
    variant: 'outlined',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiOutlinedInput-root': getInputOverrideStyles(theme),
    }),
  },
});
