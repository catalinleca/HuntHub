# Theme System

A 5-layer architecture for scalable, maintainable styling in MUI v6.

## Why This Architecture?

**Problem:** Styling MUI components often leads to:

- Hardcoded CSS values scattered everywhere
- Duplicate styles across components
- Ugly CSS class selectors in JSX
- Styles that can't be reused for non-MUI components (CodeMirror, ProseMirror, etc.)

**Solution:** Separate concerns into layers, where each layer has a single responsibility.

## The 5 Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 5: Components (MUI overrides)                        │
│  └── Uses selectors to style MUI components                 │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Selectors                                         │
│  └── Wraps mixins with CSS selectors (native or MUI)        │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Mixins                                            │
│  └── Raw CSS objects, NO selectors (reusable anywhere)      │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Tokens                                            │
│  └── Semantic values derived from palette (focus, hover...) │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Palettes                                          │
│  └── Colors, typography, shadows, shape                     │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1: Palettes (`palettes/`)

Raw design values - colors, typography, shadows.

```typescript
// treasure-map.ts
palette: {
  primary: { main: '#6BCF7F', ... },
  error: { main: '#FF6B6B', ... },
}
```

### Layer 2: Tokens (`tokens/`)

Semantic tokens derived from palette. Maps design intent to values.

```typescript
// field.ts
export const getFieldTokens = (theme) => ({
  focus: {
    border: theme.palette.primary.main,
    shadow: theme.shadows[9], // Focus ring shadow
  },
  error: {
    border: theme.palette.error.main,
    shadow: theme.shadows[10], // Error ring shadow
  },
});
```

### Layer 3: Mixins (`mixins/`)

**Key insight:** Raw CSS objects with NO selectors.

This is what makes the system flexible. Mixins can be wrapped with ANY selector - native HTML, MUI classes, CodeMirror, ProseMirror, etc.

```typescript
// field.ts
export const fieldMixins = {
  focus: (theme) => ({
    borderColor: tokens.focus.border,
    boxShadow: tokens.focus.shadow,
  }),
  // No selectors! Just CSS properties.
};
```

### Layer 4: Selectors (`selectors/`)

Wraps mixins with appropriate CSS selectors.

**Native selectors** - for `<input>`, `<textarea>`, styled-components:

```typescript
// native.ts
'&:focus': fieldMixins.focus(theme),
'&:hover:not(:focus)': fieldMixins.hover(theme),
```

**MUI selectors** - for MUI components, using type-safe class constants:

```typescript
// mui.ts
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

[`&.${outlinedInputClasses.focused}`]: {
  boxShadow: tokens.focus.shadow,
}
```

### Layer 5: Components (`mui/overrides/`)

MUI theme component overrides. Uses selectors from Layer 4.

```typescript
// MuiOutlinedInput.ts
styleOverrides: {
  root: ({ theme }) => getMuiInputOverrideStyles(theme),
}
```

## File Structure

```
theme/
├── index.ts                 # Main exports
├── README.md                # This file
├── palettes/
│   ├── index.ts
│   └── treasure-map.ts      # Color palette, typography, shadows
├── tokens/
│   ├── index.ts
│   └── field.ts             # Semantic field tokens
├── mixins/
│   ├── index.ts
│   └── field.ts             # Raw CSS mixins (no selectors)
├── selectors/
│   ├── index.ts
│   ├── native.ts            # Native HTML selectors (:hover, :focus)
│   └── mui.ts               # MUI type-safe selectors
└── mui/
    ├── index.ts             # Theme assembly
    └── overrides/           # MUI component overrides
        ├── MuiOutlinedInput.ts  # Single source for input styling
        ├── MuiTextField.ts
        ├── MuiSelect.ts
        └── ...
```

## Usage

### Basic - Just use the theme

```typescript
import { theme } from '@/theme';

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

### Custom styled-component with field styles

```typescript
import { getNativeFieldStyles } from '@/theme/selectors';
import styled from 'styled-components';

const CustomInput = styled.input`
  ${({ theme }) => getNativeFieldStyles(theme)}
`;
```

### Custom component with specific mixins

```typescript
import { fieldMixins } from '@/theme/mixins';
import styled from 'styled-components';

// For CodeMirror, ProseMirror, or any custom component
const EditorWrapper = styled.div`
  ${({ theme }) => fieldMixins.base(theme)}

  &.cm-focused {
    ${({ theme }) => fieldMixins.focus(theme)}
  }
`;
```

## Type-Safe MUI Selectors

We use MUI's exported class constants instead of hardcoded strings:

```typescript
// Bad - hardcoded, can break silently
'&.Mui-focused': { ... }
'& .MuiOutlinedInput-notchedOutline': { ... }

// Good - type-safe, IDE autocomplete, refactor-safe
import { outlinedInputClasses } from '@mui/material/OutlinedInput';

[`&.${outlinedInputClasses.focused}`]: { ... }
[`& .${outlinedInputClasses.notchedOutline}`]: { ... }
```

## Key Decisions

### Why MuiOutlinedInput instead of MuiTextField?

TextField contains OutlinedInput. By styling OutlinedInput directly:

- TextField gets the styles automatically
- Select gets the styles automatically
- Autocomplete gets the styles automatically
- Any component using OutlinedInput gets consistent styling
- No descendant selectors needed

### Why separate mixins from selectors?

Mixins are pure CSS properties. Selectors are CSS selectors.
This separation allows mixins to be reused with ANY selector system:

- Native HTML (`:hover`, `:focus`)
- MUI classes (`.Mui-focused`)
- CodeMirror (`.cm-focused`)
- ProseMirror (`.ProseMirror-focused`)

### Why tokens?

Tokens provide semantic meaning. Instead of:

```typescript
borderColor: theme.palette.primary.main; // What does this mean?
```

We have:

```typescript
borderColor: tokens.focus.border; // Clear: this is the focus state border
```

## Adding New Styles

1. **New color/value?** Add to `palettes/treasure-map.ts`
2. **New semantic meaning?** Add to `tokens/field.ts`
3. **New CSS properties?** Add to `mixins/field.ts`
4. **Need it in MUI?** Add selector in `selectors/mui.ts`
5. **Need it in native HTML?** Add selector in `selectors/native.ts`
