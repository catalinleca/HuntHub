import { Components, Theme } from '@mui/material';

export const getMuiChipOverrides = (): Components<Theme>['MuiChip'] => ({
  styleOverrides: {
    root: {
      fontWeight: 600,
      borderRadius: 100,
    },
    label: ({ ownerState }) => ({
      ...(ownerState.size === 'small' && {
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase' as const,
        padding: '0 2px',
      }),
      ...(ownerState.size === 'medium' && {
        fontSize: 14,
      }),
    }),
    icon: ({ ownerState }) => ({
      ...(ownerState.size === 'small' && {
        fontSize: 14,
        marginLeft: 0,
        marginRight: 2,
      }),
    }),
    outlined: {
      borderWidth: 1,
    },
  },
  variants: [
    {
      props: { size: 'small' },
      style: {
        height: 'auto',
        padding: '2px 6px',
      },
    },
    {
      props: { size: 'medium' },
      style: ({ theme }) => ({
        padding: theme.spacing(2),
        borderRadius: theme.shape.sm,
      }),
    },
  ],
});
