import { Components, Theme, alpha } from '@mui/material';

export const getMuiButtonOverrides = (): Components<Theme>['MuiButton'] => ({
  defaultProps: {
    disableElevation: true,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius: theme.shape.md,
      height: 40,
      padding: `0 ${theme.spacing(6)}`,
      textTransform: 'none',
      fontWeight: theme.typography.fontWeightBold,
      transition: 'all 0.3s ease',
    }),
  },
  variants: [
    {
      props: { variant: 'contained' },
      style: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: theme.shadows[2],
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
        },
      }),
    },
    {
      props: { variant: 'contained', color: 'secondary' },
      style: ({ theme }) => ({
        backgroundColor: theme.palette.text.secondary,
        color: theme.palette.common.white,
        boxShadow: theme.shadows[2],
        '&:hover': {
          backgroundColor: theme.palette.grey[700],
          transform: 'scale(1.02)',
          boxShadow: theme.shadows[4],
        },
      }),
    },
    {
      props: { variant: 'outlined' },
      style: ({ theme }) => ({
        borderWidth: 2,
        borderColor: theme.palette.text.secondary,
        color: theme.palette.text.secondary,
        backgroundColor: 'transparent',
        '&:hover': {
          backgroundColor: alpha(theme.palette.text.secondary, 0.08),
          borderColor: theme.palette.text.secondary,
        },
      }),
    },
  ],
});
