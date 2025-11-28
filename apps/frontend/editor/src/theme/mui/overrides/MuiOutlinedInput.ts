import { Components, Theme } from '@mui/material';
import { getMuiInputOverrideStyles } from '@/theme';

export const getMuiOutlinedInputOverrides = (): Components<Theme>['MuiOutlinedInput'] => ({
  styleOverrides: {
    root: ({ theme }) => getMuiInputOverrideStyles(theme),
  },
});
