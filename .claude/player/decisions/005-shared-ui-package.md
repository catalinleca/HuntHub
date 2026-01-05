# ADR-005: Shared UI Package Architecture

**Status:** Proposed
**Date:** 2026-01-04
**Deciders:** Development Team

---

## Context

We have two frontend applications that need styling:

1. **Editor** - Professional, treasure-map theme (brown/gold)
2. **Player** - Playful, adventure theme (vibrant colors)

Both use MUI + styled-components. We need to decide what to share vs keep separate.

---

## Decision

**Create two new packages:**

1. **`@hunthub/ui`** - Shared theme infrastructure (tokens, factory, utilities)
2. **`@hunthub/player-sdk`** - Player-specific components (StepView, etc.)

### Package Structure

```
packages/
├── shared/           # Existing - types, schemas, constants
├── ui/               # NEW - theme infrastructure
│   └── src/
│       ├── tokens/
│       │   ├── spacing.ts
│       │   ├── typography.ts
│       │   └── shadows.ts
│       ├── mixins/
│       │   └── field.ts
│       ├── selectors/
│       │   └── mui.ts
│       ├── utils/
│       │   └── color.ts
│       └── createTheme.ts
└── player-sdk/       # NEW - player components
    └── src/
        ├── components/
        ├── hooks/
        └── context/
```

---

## Rationale

### What to SHARE in @hunthub/ui

| Item | Why Share |
|------|-----------|
| Spacing tokens | Consistent 8px grid system |
| Typography scale | Same font sizes, weights |
| Shadow definitions | Same elevation system |
| MUI selectors | Type-safe styling helpers |
| Color utilities | createFocusRing(), etc. |
| Theme factory | Common theme creation logic |

### What to keep APP-SPECIFIC

| Item | Why Separate |
|------|--------------|
| Color palettes | Editor is professional, Player is playful |
| Component overrides | Different look for same MUI components |
| Layouts | Different page structures |
| Animations | Player has more celebrations |

---

## Theme Factory Pattern

```typescript
// packages/ui/src/createTheme.ts

import { createTheme, ThemeOptions } from '@mui/material';
import { baseTokens } from './tokens';

export const createHuntHubTheme = (
  palette: PaletteConfig,
  overrides?: ThemeOptions
) => {
  return createTheme({
    ...baseTokens,          // Shared spacing, typography, shadows
    palette,                // App-specific colors
    components: overrides,  // App-specific component styles
  });
};
```

### Usage in Editor

```typescript
// apps/frontend/editor/src/theme/index.ts

import { createHuntHubTheme } from '@hunthub/ui';
import { treasureMapPalette } from './palettes/treasure-map';
import { editorOverrides } from './overrides';

export const editorTheme = createHuntHubTheme(
  treasureMapPalette,
  editorOverrides
);
```

### Usage in Player

```typescript
// apps/frontend/player/src/theme/index.ts

import { createHuntHubTheme } from '@hunthub/ui';
import { adventurePalette } from './palettes/adventure';
import { playerOverrides } from './overrides';

export const playerTheme = createHuntHubTheme(
  adventurePalette,
  playerOverrides
);
```

---

## Consequences

### Positive
- **Consistency** - Same spacing, typography across apps
- **DRY** - Theme factory code not duplicated
- **Type safety** - Shared type definitions
- **Flexibility** - Apps can customize palettes/overrides

### Negative
- **Build complexity** - Must build packages before apps
- **Dependency management** - Peer dependencies for MUI/React
- **Monorepo issues** - Must prevent duplicate React/MUI instances

### Mitigation

```json
// packages/ui/package.json
{
  "peerDependencies": {
    "@mui/material": "^6.0.0",
    "styled-components": "^6.0.0",
    "react": "^19.0.0"
  }
}
```

```typescript
// Both apps vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', '@mui/material', 'styled-components'],
  },
});
```

---

## Design Token Details

### Spacing (8px Grid)

```typescript
// packages/ui/src/tokens/spacing.ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
};
```

### Typography Scale

```typescript
// packages/ui/src/tokens/typography.ts
export const typography = {
  fontFamily: '"Inter", sans-serif',
  h1: { fontSize: '2.5rem', fontWeight: 700 },
  h2: { fontSize: '2rem', fontWeight: 700 },
  h3: { fontSize: '1.5rem', fontWeight: 600 },
  body1: { fontSize: '1rem', fontWeight: 400 },
  button: { textTransform: 'none', fontWeight: 600 },
};
```

### Shadows

```typescript
// packages/ui/src/tokens/shadows.ts
export const shadows = [
  'none',
  '0 1px 2px rgba(0,0,0,0.05)',  // sm
  '0 4px 6px rgba(0,0,0,0.1)',   // md
  '0 10px 15px rgba(0,0,0,0.1)', // lg
  '0 25px 50px rgba(0,0,0,0.25)', // xl
  // ... MUI expects 25 shadow levels
];
```

---

## Alternative: Keep Everything in Editor

**Rejected because:**
- Player would have to re-implement tokens
- Risk of drift between apps
- More maintenance burden

## Alternative: Single Mega-Package

**Rejected because:**
- Player doesn't need Editor components
- Bundle size concerns
- Harder to understand boundaries

---

## Migration Steps

1. Create `packages/ui/` with tokens and factory
2. Extract Editor's tokens to `@hunthub/ui`
3. Update Editor's theme to use factory
4. Create Player's theme using same factory
5. Verify no regressions in Editor

---

## References

- [MUI Theme Customization](https://mui.com/material-ui/customization/theming/)
- [Monorepo Shared UI Patterns](https://medium.com/@amitjha167/integrating-material-ui-with-monorepo-in-a-next-js-application-4a4dbc7faf9c)
- [Design Tokens Specification](https://tr.designtokens.org/format/)