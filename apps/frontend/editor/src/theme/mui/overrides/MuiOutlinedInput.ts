import { Components, Theme } from '@mui/material';
import { getMuiInputOverrideStyles } from '../../selectors';

export const getMuiOutlinedInputOverrides = (): Components<Theme>['MuiOutlinedInput'] => ({
  styleOverrides: {
    root: ({ theme }) => getMuiInputOverrideStyles(theme),
  },
});