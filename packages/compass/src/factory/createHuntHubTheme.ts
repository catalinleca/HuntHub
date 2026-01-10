import { createTheme, Theme, ThemeOptions } from '@mui/material';
import { treasureMapThemeOptions } from '../presets/treasure-map';
import { getAllOverrides } from '../overrides';

/**
 * Creates a HuntHub theme with optional customizations.
 * Base preset to use. Currently only 'treasure-map' is available.
 * */

export enum ThemePresets {
  TreasureMap = 'treasure-map',
}

export interface CreateHuntHubThemeOptions {
  preset?: ThemePresets;
  overrides?: ThemeOptions;
}

const ThemePresetsMap = {
  [ThemePresets.TreasureMap]: treasureMapThemeOptions,
};

export const createHuntHubTheme = (options: CreateHuntHubThemeOptions = {}): Theme => {
  const { overrides, preset } = options;

  const themeOptions = preset ? ThemePresetsMap[preset] : treasureMapThemeOptions;
  const componentsOverride = { components: getAllOverrides() };

  if (overrides) {
    return createTheme(themeOptions, componentsOverride, overrides);
  }

  return createTheme(themeOptions, componentsOverride);
};
