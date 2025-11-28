import { Components, Theme, alpha } from '@mui/material';

export const getMuiDialogOverrides = (): Components<Theme>['MuiDialog'] => ({
  defaultProps: {
    transitionDuration: 200,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      '& .MuiBackdrop-root': {
        backdropFilter: 'blur(8px)',
        backgroundColor: alpha(theme.palette.common.black, 0.25),
      },
    }),
    paper: ({ theme }) => ({
      borderRadius: theme.shape.lg,
      boxShadow: theme.shadows[4],
      border: `4px solid ${theme.palette.divider}`
    }),
  },
});
