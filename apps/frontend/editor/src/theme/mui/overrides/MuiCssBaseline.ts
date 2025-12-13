import { Components, Theme } from '@mui/material';
import { getColor } from '@/utils';

export const getMuiCssBaselineOverrides = (): Components<Theme>['MuiCssBaseline'] => ({
  styleOverrides: {
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor: `${getColor('grey.400')} transparent`,
    },

    '*::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '*::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: getColor('grey.400'),
      borderRadius: 4,
      border: '2px solid transparent',
      backgroundClip: 'content-box',
    },
    '*::-webkit-scrollbar-thumb:hover': {
      backgroundColor: getColor('grey.500'),
    },
  },
});
