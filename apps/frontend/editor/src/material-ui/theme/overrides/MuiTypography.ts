import { Components, Theme } from '@mui/material';

export const getMuiTypographyOverrides = (): Components<Theme>['MuiTypography'] => ({
  variants: [
    {
      props: { textStyle: 'display' },
      style: ({ theme }) => ({
        fontFamily: theme.typography.displayFontFamily,
      }),
    },
    {
      props: { textStyle: 'ui' },
      style: ({ theme }) => ({
        fontFamily: theme.typography.fontFamily,
      }),
    },
  ],
  defaultProps: {
    textStyle: 'ui',
  },
});