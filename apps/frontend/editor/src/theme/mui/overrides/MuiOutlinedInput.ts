import { Components, Theme } from '@mui/material';
import { getMuiInputOverrideStyles, getFieldTokens } from '@/theme';

export const getMuiOutlinedInputOverrides = (): Components<Theme>['MuiOutlinedInput'] => ({
  styleOverrides: {
    root: ({ theme }) => getMuiInputOverrideStyles(theme),

    multiline: ({ theme }) => ({
      padding: theme.spacing(1, 0),
      minHeight: 'auto',
    }),
  },
});
