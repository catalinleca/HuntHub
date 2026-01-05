import { createTheme, Theme } from '@mui/material';
import { treasureMapThemeOptions } from './palette';
import { getAllOverrides } from '../../overrides';

export const createTreasureMapTheme = (): Theme => {
  return createTheme({
    ...treasureMapThemeOptions,
    components: getAllOverrides(),
  });
};

export const treasureMapTheme = createTreasureMapTheme();
