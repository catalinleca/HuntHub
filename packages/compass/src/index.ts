// Pre-built themes
export { treasureMapTheme, createTreasureMapTheme } from './presets/treasure-map';
export { treasureMapPaletteConfig, treasureMapThemeOptions } from './presets/treasure-map';

// Factory
export { createHuntHubTheme } from './factory';
export type { CreateHuntHubThemeOptions } from './factory';

// Re-export all layers for convenience
export * from './tokens';
export * from './mixins';
export * from './selectors';
export * from './utils';
export * from './overrides';
