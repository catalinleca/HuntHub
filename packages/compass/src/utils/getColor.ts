import { treasureMapPaletteConfig } from '../presets/treasure-map';
import { hexToRgba } from './colorUtils';
import type { PaletteColor } from './types';

interface ColorOptions {
  opacity?: number;
}

const getByPath = (obj: object, path: string, fallback = '#000000'): string => {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return typeof value === 'string' ? value : fallback;
};

export const getColor = (path: PaletteColor, options: ColorOptions = {}): string => {
  const hex = getByPath(treasureMapPaletteConfig, path);

  if (typeof options.opacity === 'number' && hex.startsWith('#')) {
    return hexToRgba(hex, options.opacity);
  }

  return hex;
};
