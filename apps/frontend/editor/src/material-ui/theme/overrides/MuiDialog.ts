import { Components, Theme } from '@mui/material';

export const getMuiDialogOverrides = (): Components<Theme>['MuiDialog'] => ({
  defaultProps: {
    transitionDuration: 200,
  },
  styleOverrides: {
    root: {
      '& .MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(44, 24, 16, 0.25)', // Warm brown overlay
      },
    },
    paper: ({ theme }) => ({
      borderRadius: theme.shape.lg, // 16px
      boxShadow: '0 12px 24px rgba(44, 24, 16, 0.12)', // Soft warm shadow
      backgroundImage: 'none', // Remove MUI default gradient
      border: `1px solid ${theme.palette.divider}`, // Subtle border matching Card
    }),
  },
});
