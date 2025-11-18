import { createTheme, Theme, ThemeOptions } from '@mui/material';
import treasureMapPalette from '../palettes/treasure-map';
import {
  getMuiButtonOverrides,
  getMuiCardOverrides,
  getMuiTextFieldOverrides,
} from './overrides';

export const createAppTheme = (): Theme => {
  const options: ThemeOptions = {
    ...treasureMapPalette,
    components: {
      MuiButton: getMuiButtonOverrides(),
      MuiCard: getMuiCardOverrides(),
      MuiTextField: getMuiTextFieldOverrides(),
    },
  };

  return createTheme(options);
};

export const theme = createAppTheme();