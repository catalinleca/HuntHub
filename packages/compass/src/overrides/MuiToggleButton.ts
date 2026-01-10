import { Components, Theme, alpha } from '@mui/material';

export const getMuiToggleButtonOverrides = (): Components<Theme>['MuiToggleButton'] => ({
  defaultProps: {
    disableRipple: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      height: 36,
      padding: theme.spacing(1, 4),
      border: 'none',
      borderRadius: `${theme.shape.sm}px !important`,
      textTransform: 'none',
      fontWeight: theme.typography.fontWeightMedium,
      fontSize: 14,
      gap: theme.spacing(2),
      backgroundColor: 'transparent',
      transition: theme.transitions.create(['background-color', 'box-shadow'], {
        duration: theme.transitions.duration.short,
      }),

      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.4),
      },

      '&.Mui-selected': {
        backgroundColor: theme.palette.common.white,
        boxShadow: theme.shadows[1],

        '&:hover': {
          backgroundColor: theme.palette.common.white,
        },
      },

      '&.Mui-disabled': {
        backgroundColor: 'transparent',
        opacity: 0.5,
      },
    }),
  },
});

