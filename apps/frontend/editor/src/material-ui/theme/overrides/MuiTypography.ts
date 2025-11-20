import { Components, Theme } from '@mui/material';

export const getMuiTypographyOverrides = (): Components<Theme>['MuiTypography'] => {
  return {
    defaultProps: {
      textStyle: 'ui',
    },
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
  };
};
