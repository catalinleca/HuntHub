# @hunthub/compass - Shared UI Library

**Status:** Planned
**Purpose:** Shared design system for all HuntHub frontend apps

---

## What It Is

A shared library containing:
- Design tokens (spacing, typography, shadows)
- MUI component overrides
- Theme presets (ready-to-use themes)
- Theme factory (for customization)

**Not a component library** (yet). Focused on theming and styling infrastructure.

---

## Why

- **No duplication** - Editor's theme code moves here, Player uses the same
- **Consistency** - Both apps share the same buttons, colors, spacing
- **Single source of truth** - Change once, updates everywhere

---

## Structure

```
packages/compass/
├── src/
│   ├── tokens/
│   │   ├── spacing.ts       # 8px grid system
│   │   ├── typography.ts    # Font sizes, weights
│   │   ├── shadows.ts       # Elevation system
│   │   └── index.ts
│   │
│   ├── overrides/           # MUI component customizations
│   │   ├── Button.ts
│   │   ├── Card.ts
│   │   ├── TextField.ts
│   │   └── index.ts
│   │
│   ├── presets/
│   │   └── treasure-map.ts  # Main theme (used by both apps)
│   │
│   ├── mixins/              # Reusable style patterns
│   ├── selectors/           # MUI class selectors for styled-components
│   ├── utils/               # Helper functions (getColor, etc.)
│   │
│   ├── createTheme.ts       # Theme factory function
│   └── index.ts             # Barrel export
│
├── package.json
└── tsconfig.json
```

---

## How It Works

### The library calls `createTheme`

The library exports ready-to-use themes. Apps just import and use.

```typescript
// @hunthub/compass/src/presets/treasure-map.ts
import { createTheme } from '@mui/material';
import { tokens } from '../tokens';
import { overrides } from '../overrides';

export const treasureMapTheme = createTheme({
  ...tokens,
  palette: {
    primary: { main: '#B6591B' },
    secondary: { main: '#D4A574' },
    // ...
  },
  components: overrides,
});
```

### Apps just import

```typescript
// In Editor
import { treasureMapTheme } from '@hunthub/compass';

<ThemeProvider theme={treasureMapTheme}>
  <App />
</ThemeProvider>
```

```typescript
// In Player (same theme for now)
import { treasureMapTheme } from '@hunthub/compass';

<ThemeProvider theme={treasureMapTheme}>
  <App />
</ThemeProvider>
```

### Factory for customization (optional)

If an app needs a custom theme, use the factory:

```typescript
import { createHuntHubTheme } from '@hunthub/compass';

const customTheme = createHuntHubTheme({
  palette: { primary: { main: '#custom' } }
});
```

---

## Exports

```typescript
// @hunthub/compass

// Ready-to-use theme
export { treasureMapTheme } from './presets/treasure-map';

// Factory for custom themes
export { createHuntHubTheme } from './createTheme';

// Individual pieces (if needed)
export { tokens } from './tokens';
export { overrides } from './overrides';
export * from './selectors';
export * from './mixins';
export * from './utils';
```

---

## Migration from Editor

Current Editor theme folder moves to compass:

| From (Editor) | To (Compass) |
|---------------|--------------|
| `src/theme/tokens/` | `src/tokens/` |
| `src/theme/overrides/` | `src/overrides/` |
| `src/theme/palettes/` | `src/presets/` |
| `src/theme/mixins/` | `src/mixins/` |
| `src/theme/selectors/` | `src/selectors/` |
| `src/theme/utils/` | `src/utils/` |

After migration, Editor's theme becomes:

```typescript
// apps/frontend/editor/src/theme/index.ts
export { treasureMapTheme as theme } from '@hunthub/compass';
```

---

## Future: Multiple Themes

When Player needs its own look:

```
presets/
├── treasure-map.ts    # Editor uses
└── adventure.ts       # Player uses (added later)
```

For now, both apps use `treasure-map`. Diverge later if needed.

---

## Future: Components

The library can grow to include shared components:

```
src/
├── components/        # Future
│   ├── GradientButton.tsx
│   ├── StyledCard.tsx
│   └── ...
```

Not needed yet. Add when there's duplication to eliminate.

---

## Package Configuration

```json
{
  "name": "@hunthub/compass",
  "version": "0.0.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "@mui/material": "^6.0.0",
    "styled-components": "^6.0.0",
    "react": "^19.0.0"
  }
}
```

---

## Vite Configuration (Apps)

To prevent duplicate React/MUI instances:

```typescript
// apps/frontend/editor/vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', '@mui/material', 'styled-components'],
  },
});
```

---

## Build Order

```bash
# 1. Build compass first
npm run build -w @hunthub/compass

# 2. Then apps can use it
npm run dev -w @hunthub/editor
npm run dev -w @hunthub/player
```
