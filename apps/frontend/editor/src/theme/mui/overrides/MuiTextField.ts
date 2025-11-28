import { Components, Theme } from '@mui/material';

export const getMuiTextFieldOverrides = (): Components<Theme>['MuiTextField'] => ({
  defaultProps: {
    variant: 'outlined',
  },
  // Input styling handled by MuiOutlinedInput override
});
