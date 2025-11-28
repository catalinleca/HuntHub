import { Components, Theme } from '@mui/material';

export const getMuiSelectOverrides = (): Components<Theme>['MuiSelect'] => ({
  defaultProps: {
    variant: 'outlined',
  },
  // Input styling handled by MuiOutlinedInput override
});
