import { createTheme, Theme, ThemeOptions } from '@mui/material';
import { treasureMapThemeOptions } from '../presets/treasure-map';
import { getAllOverrides } from '../overrides';

/**
 * Creates a HuntHub theme with optional customizations.
 * Base preset to use. Currently only 'treasure-map' is available.
 * */

export interface CreateHuntHubThemeOptions {
  preset?: 'treasure-map';
  overrides?: ThemeOptions;
}

export const createHuntHubTheme = (options: CreateHuntHubThemeOptions = {}): Theme => {
  const { overrides } = options;

  const baseOptions: ThemeOptions = {
    ...treasureMapThemeOptions,
    components: getAllOverrides(),
  };

  if (overrides) {
    return createTheme(baseOptions, overrides);
  }

  return createTheme(baseOptions);
};
