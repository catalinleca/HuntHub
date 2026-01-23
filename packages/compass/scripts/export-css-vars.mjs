import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { treasureMapPaletteConfig, treasureMapThemeOptions } from '../dist/presets/treasure-map/palette.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../../../apps/frontend/landing/src/styles/tokens.css');

const flattenToCssVars = (obj, prefix = '--hh') => {
  const vars = [];

  const flatten = (value, path) => {
    if (value == null) {
      return;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, val] of Object.entries(value)) {
        flatten(val, `${path}-${key}`);
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      vars.push(`  ${path}: ${value};`);
    }
  };

  flatten(obj, prefix);
  return vars;
};

const paletteVars = flattenToCssVars(treasureMapPaletteConfig);
const shadows = treasureMapThemeOptions.shadows;

const css = `/* Auto-generated from @hunthub/compass - DO NOT EDIT */

:root {
${paletteVars.join('\n')}

  --hh-shadow-none: ${shadows[0]};
  --hh-shadow-sm: ${shadows[1]};
  --hh-shadow-md: ${shadows[2]};
  --hh-shadow-lg: ${shadows[3]};
  --hh-shadow-xl: ${shadows[4]};

  --hh-font-display: Georgia, "Times New Roman", serif;
  --hh-font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --hh-radius-sm: 4px;
  --hh-radius-md: 8px;
  --hh-radius-lg: 12px;
  --hh-radius-xl: 16px;
  --hh-radius-2xl: 24px;
}
`;

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, css);

console.log(`Exported ${paletteVars.length} palette + 5 shadow variables to tokens.css`);