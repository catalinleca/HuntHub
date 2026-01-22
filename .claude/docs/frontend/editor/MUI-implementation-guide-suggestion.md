# HuntHub UI Implementation Guide

## Installation

```bash
# Core dependencies
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material

# Optional but recommended
npm install @mui/lab  # For fancy components like Timeline, Masonry
```

---

## Project Structure

```
src/
├── theme/
│   ├── index.js                 # Main theme export
│   ├── baseTheme.js            # Base MUI theme config
│   ├── presets.js              # Color/font presets
│   └── componentOverrides.js   # MUI component overrides
│
├── components/
│   ├── styled/                 # Your styled-components library
│   │   ├── index.js
│   │   ├── Cards.jsx           # StyledCard, GameCard, etc.
│   │   ├── Buttons.jsx         # GradientButton, ActionButton, etc.
│   │   ├── Layout.jsx          # PlayerContainer, EditorLayout, etc.
│   │   └── Badges.jsx          # StatusChip, ProgressBadge, etc.
│   │
│   ├── editor/                 # Editor-specific components
│   │   ├── HuntDashboard.jsx
│   │   ├── HuntEditor.jsx
│   │   ├── StepList.jsx
│   │   └── PublishDialog.jsx
│   │
│   └── player/                 # Player-specific components
│       ├── PlayerStep.jsx
│       ├── CompletionScreen.jsx
│       ├── LocationChecker.jsx
│       └── PhotoUpload.jsx
│
├── pages/
│   ├── EditorApp.jsx
│   └── PlayerApp.jsx
│
└── App.jsx                     # Root with ThemeProvider
```

---

## Step 1: Theme Setup

### `src/theme/baseTheme.js`
```javascript
import { createTheme } from '@mui/material/styles';

export const createBaseTheme = (customization = {}) => {
  const { primaryColor, secondaryColor, fontFamily } = customization;

  return createTheme({
    palette: {
      primary: {
        main: primaryColor || '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
      },
      secondary: {
        main: secondaryColor || '#ec4899',
      },
      grey: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        500: '#6b7280',
        700: '#374151',
        900: '#111827',
      },
    },
    typography: {
      fontFamily: fontFamily || '"Inter", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });
};
```

### `src/theme/componentOverrides.js`
```javascript
export const getComponentOverrides = (theme) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '10px 24px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        border: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
});
```

### `src/theme/presets.js`
```javascript
export const themePresets = {
  default: {
    primaryColor: '#6366f1',
    secondaryColor: '#ec4899',
    fontFamily: '"Inter", sans-serif',
  },
  ocean: {
    primaryColor: '#0ea5e9',
    secondaryColor: '#06b6d4',
    fontFamily: '"Inter", sans-serif',
  },
  forest: {
    primaryColor: '#10b981',
    secondaryColor: '#84cc16',
    fontFamily: '"Inter", sans-serif',
  },
};
```

### `src/theme/index.js`
```javascript
import { createBaseTheme } from './baseTheme';
import { getComponentOverrides } from './componentOverrides';
import { themePresets } from './presets';

export const createHuntHubTheme = (presetName = 'default') => {
  const preset = themePresets[presetName];
  const baseTheme = createBaseTheme(preset);
  
  return {
    ...baseTheme,
    components: getComponentOverrides(baseTheme),
  };
};

export { themePresets };
```

---

## Step 2: Styled Components Library

### `src/components/styled/Cards.jsx`
```javascript
import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    transform: 'translateY(-2px)',
  },
}));

export const GameCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  overflow: 'hidden',
}));
```

### `src/components/styled/Buttons.jsx`
```javascript
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

export const GradientButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
    transform: 'translateY(-1px)',
  },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  fontSize: '1rem',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));
```

### `src/components/styled/Layout.jsx`
```javascript
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PlayerContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  padding: theme.spacing(2),
}));

export const EditorLayout = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
}));
```

### `src/components/styled/index.js`
```javascript
export * from './Cards';
export * from './Buttons';
export * from './Layout';
```

---

## Step 3: Root App Setup

### `src/App.jsx`
```javascript
import React, { useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createHuntHubTheme } from './theme';
import EditorApp from './pages/EditorApp';
import PlayerApp from './pages/PlayerApp';

function App() {
  const [userThemePreset, setUserThemePreset] = useState('default');
  const theme = createHuntHubTheme(userThemePreset);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your routing here */}
      <EditorApp />
    </ThemeProvider>
  );
}

export default App;
```

---

## Step 4: Using It in Components

### Editor Component Example
```javascript
import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { StyledCard, GradientButton } from '@/components/styled';
import AddIcon from '@mui/icons-material/Add';

export const HuntDashboard = () => {
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Your Hunts
        </Typography>
        <GradientButton startIcon={<AddIcon />}>
          Create Hunt
        </GradientButton>
      </Stack>

      {/* Clean semantic JSX - no className mess */}
      <StyledCard>
        <Typography variant="h6">Hunt Name</Typography>
      </StyledCard>
    </Box>
  );
};
```

### Player Component Example
```javascript
import React from 'react';
import { Typography, CardContent } from '@mui/material';
import { PlayerContainer, GameCard, ActionButton } from '@/components/styled';

export const PlayerStep = () => {
  return (
    <PlayerContainer>
      <GameCard>
        <CardContent>
          <Typography variant="h5">Find the Clue</Typography>
          <ActionButton variant="contained" fullWidth>
            Check Location
          </ActionButton>
        </CardContent>
      </GameCard>
    </PlayerContainer>
  );
};
```

---

## Step 5: User Theme Customization (Future)

### Theme Picker Component
```javascript
import React from 'react';
import { Select, MenuItem } from '@mui/material';
import { themePresets } from '@/theme';

export const ThemePicker = ({ value, onChange }) => {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.keys(themePresets).map((preset) => (
        <MenuItem key={preset} value={preset}>
          {preset}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

## Benefits Summary

✅ **Semantic JSX**: Components like `<StyledCard>`, not divs  
✅ **Fast Development**: MUI behavior out of the box  
✅ **Easy Theming**: User picks preset → entire app updates  
✅ **Type-Safe**: Full TypeScript support  
✅ **Maintainable**: Styled components in one place  
✅ **Portfolio-Ready**: Shows professional patterns  

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# 2. Create folder structure
mkdir -p src/theme src/components/styled

# 3. Copy theme files from examples above

# 4. Start building components

# 5. Import and use
import { StyledCard, GradientButton } from '@/components/styled';
```

---

## When to Use What

**Use base MUI components when:**
- Standard behavior is fine (Button, TextField, Typography)
- No custom styling needed

**Create styled component when:**
- Repeated custom styles (GradientButton)
- Unique design pattern (GameCard)
- Hover effects, animations, gradients

**Override theme when:**
- Global changes (all Buttons get rounded)
- Color palette (user theme preferences)
- Typography (font family, weights)

---

## Final Thoughts

This approach gives you:
1. **Speed** - don't write CSS for basic stuff
2. **Control** - styled-components for custom designs
3. **Semantic** - no className spam
4. **Theming** - user preferences = easy

Perfect for your portfolio: professional, maintainable, scalable.
