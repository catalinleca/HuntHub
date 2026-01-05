import { createTheme, Theme, ThemeOptions } from '@mui/material';
import { treasureMapThemeOptions } from '../presets/treasure-map';
import { getAllOverrides } from '../overrides';

export interface CreateHuntHubThemeOptions {
  /** Base preset to use. Currently only 'treasure-map' is available. */
  preset?: 'treasure-map';
  /** Override any theme options. Will be deep merged with the preset. */
  overrides?: ThemeOptions;
}

/**
 * Creates a HuntHub theme with optional customizations.
 *
 * @example
 * // Use default treasure-map theme
 * const theme = createHuntHubTheme();
 *
 * @example
 * // Customize primary color
 * const theme = createHuntHubTheme({
 *   overrides: {
 *     palette: {
 *       primary: { main: '#1976d2' }
 *     }
 *   }
 * });
 */
export const createHuntHubTheme = (options: CreateHuntHubThemeOptions = {}): Theme => {
  const { overrides } = options;

  // Base theme options from preset
  const baseOptions: ThemeOptions = {
    ...treasureMapThemeOptions,
    components: getAllOverrides(),
  };

  // MUI's createTheme handles deep merging when given multiple theme options
  if (overrides) {
    return createTheme(baseOptions, overrides);
  }

  return createTheme(baseOptions);
};
