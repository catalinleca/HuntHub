import { Components, Theme } from '@mui/material';

export const getMuiDialogTitleOverrides = (): Components<Theme>['MuiDialogTitle'] => ({
  styleOverrides: {
    root: ({ theme }) => ({
      padding: `${theme.spacing(5)} ${theme.spacing(5)} ${theme.spacing(3)}`, // 24px top/sides, 12px bottom
      fontWeight: theme.typography.fontWeightBold, // 600
      fontSize: theme.typography.h5.fontSize, // 20px
      color: theme.palette.text.primary, // #2C1810 (dark brown)
      textAlign: 'center', // Centered
    }),
  },
});
