import { Components, Theme } from '@mui/material';

export const getMuiChipOverrides = (): Components<Theme>['MuiChip'] => ({
  styleOverrides: {
    root: {
      fontWeight: 600,
      borderRadius: 100,
    },
    sizeSmall: {
      height: 'auto',
      padding: '2px 6px',
    },
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(2),
      borderRadius: theme.shape.sm,
    }),
    labelSmall: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      padding: '0 2px',
    },
    labelMedium: ({ theme }) => ({
      fontSize: 14,
      padding: theme.spacing(0, 1),
    }),
    iconSmall: {
      fontSize: 14,
      marginLeft: 0,
      marginRight: 2,
    },
    outlined: {
      borderWidth: 1,
    },
  },
});
