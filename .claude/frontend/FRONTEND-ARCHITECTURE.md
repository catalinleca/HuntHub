# Frontend Architecture — Mandatory Patterns

> ⚠️ **These patterns are non-negotiable for code quality and consistency. Review carefully and refer back as needed.**

# Frontend Architecture Overview

> 🎯 **CONTEXT:** High-level frontend architecture and technical decisions for HuntHub Editor.  
> **Related docs:** `UI-DECISION.md` (styling rationale), `DESIGN-DECISIONS.md` (layout/UX reasoning), `COMPONENT-SPECS.md` (implementation details)

**Status:** Architecture defined, ready for implementation  
**Scope:** Editor app only (Player app will be addressed separately)

---

## Tech Stack ✅ DECIDED

### Core Technologies
- **React 19** - UI library (stable, latest features)
- **TypeScript** - Type safety across frontend
- **Vite** - Build tool (fast HMR, modern ESM bundling)
- **React Router v6** - Client-side routing

### UI & Styling
- **Material-UI (MUI) v6** - Base component library
- **styled-components** - Custom component styling and extensions
- **Emotion** - MUI's CSS-in-JS engine (comes bundled with MUI)
- **Phosphor Icons** - Icon library (primary, replaces @mui/icons-material)

**Pattern:**
- MUI provides semantic components (`<Card>`, `<Button>`, `<TextField>`)
- styled-components for custom overrides and unique designs
- Theme overrides for global MUI customization
- User-selectable theme presets (Good Vibes, Dark, Hunt, Ocean, Forest)
- Phosphor Icons for all iconography (6 weights: thin, light, regular, bold, fill, duotone)

### State Management
- **Zustand** - Lightweight global state store (~1kb)
  - UI state: theme selection, unsaved changes flag
  - Non-server state that needs global access
- **React Query (TanStack Query)** - Server state management
  - All API requests and caching
  - Automatic retry, refetch, invalidation
  - Replaces Redux for server data

**Why Zustand over Redux Toolkit:**
- Minimal boilerplate (5-10 lines per store)
- No provider wrapping needed
- Perfect for simple UI state
- React Query already handles server state
- Fast and modern

### Form Management
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation (shared with backend)
- **@hookform/resolvers** - Bridge between RHF and Zod

**Pattern: Atomic → Bridge Components**
```
Atomic Components (MUI TextField, Select)
         ↓
Bridge Components (RHFTextField, RHFSelect)
         ↓  (integrated with React Hook Form)
Form Components (StepEditor, HuntSettings)
```

### Data Fetching
- **React Query v5** - All API calls
- **Axios** - HTTP client
- **Custom hooks pattern:** `useHunts()`, `useHunt(id)`, `useUpdateHunt()`

### Validation
- **Zod** - Schema validation inside activities/steps
- Schemas ideally shared between frontend and backend
- Used with React Hook Form via `zodResolver`

---

## Application Routes

```
/                    → Landing/marketing page (future)
/dashboard           → Hunt library (list of user's hunts)
/editor/:id          → Hunt editor (main workspace)
/editor/new          → Create new hunt
/preview/:id         → Preview hunt (future)
/settings            → User settings (future)
```

---

## Key Architecture Decisions

### 1. Theme System

**User-Selectable Presets:**
- Good Vibes (warm, friendly colors)
- Dark (dark mode)
- Hunt (adventure-themed)
- Ocean (blue tones)
- Forest (green tones)

**Implementation:**
```typescript
// theme/presets.ts
export const themePresets = {
  'good-vibes': { primaryColor: '#FF6B6B', secondaryColor: '#4ECDC4' },
  'dark': { primaryColor: '#6366f1', mode: 'dark' },
  // ...
};

// store/themeStore.ts (Zustand)
export const useThemeStore = create((set) => ({
  selectedTheme: 'good-vibes',
  setTheme: (theme) => set({ selectedTheme: theme }),
}));

// App.tsx
const { selectedTheme } = useThemeStore();
const theme = createHuntHubTheme(selectedTheme);

<ThemeProvider theme={theme}>
  <App />
</ThemeProvider>
```

**Future Enhancement:** User-created custom themes (color picker, save to backend)

---

### 2. Form Management Pattern

**Atomic → Bridge → Form** approach keeps forms clean and reusable.

Bridge components wrap MUI components with React Hook Form integration:
- Handle field registration
- Display validation errors
- Maintain controlled component behavior

**Syncing External Data (NO useEffect):**

Use the `values` prop to sync form with external data. Do NOT use useEffect + reset.

```tsx
// ✅ CORRECT - values prop auto-syncs with external data
const methods = useForm<FormData>({
  resolver: zodResolver(schema),
  values: hunt ? { name: hunt.name, description: hunt.description ?? '' } : undefined,
  defaultValues: { name: '', description: '' },
});

// ❌ WRONG - useEffect is unnecessary
useEffect(() => {
  if (hunt) {
    reset({ name: hunt.name, description: hunt.description ?? '' });
  }
}, [hunt, reset]);
```

See: [React Hook Form - useForm values prop](https://react-hook-form.com/docs/useform)

---

### 3. Data Fetching Pattern

**Custom hooks for all server operations:**
- `useHunts()` - List all hunts
- `useHunt(id)` - Single hunt details
- `useCreateHunt()` - Create mutation
- `useUpdateHunt()` - Update mutation
- `useDeleteHunt()` - Delete mutation

React Query handles caching, refetching, and synchronization automatically.

---

### 4. Unsaved Changes Warning

**Implementation:**
- Zustand store tracks `hasUnsavedChanges` flag
- React Hook Form's `formState.isDirty` updates the flag
- Browser `beforeunload` event prevents accidental navigation
- Custom route guard (React Router) for in-app navigation

---

### 5. Error Handling Strategy

**Multi-Layer Approach:**

1. **Error Boundaries** - Catch React rendering errors
   - Top-level: Entire app
   - Section-level: Editor, Dashboard
   - Feature-level: Complex components

2. **React Query** - Handles API errors with built-in retry logic

3. **Axios Interceptors** - Global HTTP error handling
   - Auth token injection
   - 401 redirect to login
   - Error logging in production

4. **try/catch** - Async operations in useEffect and event handlers

---

### 6. Validation with Zod

Zod schemas define validation rules for all forms:
- Type-safe schema definitions
- Shared between frontend and backend (ideally)
- Integrated with React Hook Form via `zodResolver`
- Automatic error messages

---

### 7. Phosphor Icons Usage

**Icon weights for different contexts:**

```tsx
import { MapTrifold, Camera, Trophy, Pencil } from '@phosphor-icons/react';

// Step type indicators - duotone for premium look
<StepCard type="location">
  <MapTrifold size={48} weight="duotone" color="#6BCF7F" />
</StepCard>

// Active/selected states - fill
<IconButton selected>
  <Camera size={24} weight="fill" />
</IconButton>

// Primary actions - bold
<Button startIcon={<Trophy size={20} weight="bold" />}>
  Publish Hunt
</Button>

// Secondary actions - light/regular
<IconButton>
  <Pencil size={20} weight="light" />
</IconButton>
```

**Integration with MUI:**
Phosphor icons work seamlessly alongside MUI components:
```tsx
<Button startIcon={<MapTrifold size={20} />}>
  View Map
</Button>

<IconButton>
  <Camera size={24} weight="duotone" />
</IconButton>
```

---

### 8. React 19 Benefits

**Key improvements leveraged in HuntHub:**

1. **No more `forwardRef`** - Simpler component code
   ```tsx
   // React 19 - ref is just a prop
   const CustomInput = ({ ref, ...props }) => (
     <input ref={ref} {...props} />
   );
   ```

2. **Form Actions** - Built-in form handling with pending states
   ```tsx
   const [state, submitAction, isPending] = useActionState(saveHunt);
   
   <button onClick={submitAction} disabled={isPending}>
     {isPending ? 'Saving...' : 'Save Hunt'}
   </button>
   ```

3. **Better performance** - Improved rendering and hydration
4. **Cleaner APIs** - Less boilerplate throughout the codebase

---

## Component Design Principles

### 1. Semantic JSX (No className Spam)
```tsx
// ✅ Good - MUI components + Phosphor icons
import { MapTrifoldIcon, TrophyIcon } from '@phosphor-icons/react';

<StyledCard>
  <Typography variant="h5">
    <MapTrifoldIcon size={24} weight="duotone" />
    Hunt Name
  </Typography>
  <GradientButton>Edit</GradientButton>
</StyledCard>

// ❌ Avoid
<div className="card rounded-lg shadow-md p-4">
  <h2 className="text-xl font-bold">Hunt Name</h2>
</div>
```

### 2. Phosphor Icons
**IMPORTANT: All Phosphor icons use the `Icon` suffix.**
```tsx
// ✅ Correct
import { MapTrifoldIcon, CameraIcon, TrophyIcon } from '@phosphor-icons/react';

// ❌ Wrong
import { MapTrifold, Camera, Trophy } from '@phosphor-icons/react';
```

**Weights for visual hierarchy:**
- **thin/light** - Secondary actions, subtle indicators
- **regular** - Default UI elements
- **bold** - Primary actions, emphasis
- **fill** - Active/selected states
- **duotone** - Feature highlights, step type indicators (premium look)

### 3. Composition Over Props
Use component composition instead of complex prop drilling.

### 4. Colocation
Keep related files together (component, styles, tests).

---

## Code Patterns (MANDATORY)

### NO Inline CSS in Components

**⚠️ CRITICAL - READ THIS EVERY TIME:**

**Only allowed `sx` props:** `p`, `m`, `pt`, `pb`, `mt`, `mb`, `px`, `py`, `mx`, `my`, `gap`

```tsx
// ✅ OK - only spacing
<Stack sx={{ gap: 2, p: 1, mt: 2 }}>

// ❌ NEVER - any other style property inline
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<Box sx={{ backgroundColor: 'primary.main' }}>
<Box sx={{ textAlign: 'left' }}>
<DialogContent sx={{ textAlign: 'left' }}>
```

### Stack vs Box

**USE STACK, NOT BOX** for layout:

```tsx
// ✅ ALWAYS - Stack handles flex layout
<Stack direction="row" justifyContent="space-between" alignItems="center">

// ❌ NEVER - Box with flex styles
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
```

**Box is only for:**
- Wrapping a single element with spacing
- `component="form"` or `component="section"` semantic wrappers
- When you genuinely need a non-flex container

```javascript
// ❌ NEVER - do not write inline styled-components like this
export const Header = styled(Box)`
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: ${({ theme }) => theme.spacing(2)};
`;

// ✅ OK - just use Stack MUI component with native props
<Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
```

**For anything beyond trivial spacing → create a styled component or use Stack props.**

---

### Styled Components Pattern

**Import pattern:**
```tsx
import * as S from './Component.styles';

// Use as
<S.Container>
  <S.Title>Hello</S.Title>
</S.Container>
```

**Wrapping MUI components:**
```tsx
// In Component.styles.ts
import styled from 'styled-components';
import { Button as MuiButton } from '@mui/material';

export const Button = styled(MuiButton)`
  // custom styles
`;
```

**Using MUI class selectors (type-safe):**
```tsx
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { stateSelector } from '@/theme/selectors';

export const ToggleButton = styled(MuiToggleButton)<{ $color?: string }>(
  ({ $color, theme }) => ({
    color: $color || theme.palette.text.secondary,

    [stateSelector(toggleButtonClasses.selected)]: {
      color: $color || theme.palette.text.secondary,
    },
  })
);
```

---

### File Structure

**Component with styles → folder with barrel export:**
```
components/
└── ToggleButton/
    ├── index.ts              # barrel export
    ├── ToggleButton.tsx      # component + types
    └── ToggleButton.styles.ts
```

**Main page component → styles file alongside:**
```
pages/
└── Hunt/
    ├── HuntLayout.tsx
    └── HuntLayout.styles.ts
```

**Component props/types → same file as component (.tsx)**

---

### Theme Usage

**Always use theme system** - see `apps/frontend/editor/src/theme/README.md`

```tsx
// ✅ Use theme values
background: ${({ theme }) => theme.palette.primary.main};
border-radius: ${({ theme }) => theme.shape.md}px;

// ✅ Use getColor utility for static values
import { getColor } from '@/utils';
const color = getColor('primary.main');

// ❌ Never hardcode
background: #B6591B;
```

**General styles → MUI theme overrides** in `theme/mui/overrides/`

---

### React Patterns

**Predictable render flow:**
- No crazy optimization patterns that break reconciliation
- Use React by the book - consistent and predictable
- Avoid premature memoization unless there's a real perf issue

**Keep it simple:**
```tsx
// ✅ Simple, predictable
const Component = ({ items }) => (
  <S.List>
    {items.map(item => <S.Item key={item.id}>{item.name}</S.Item>)}
  </S.List>
);

// ❌ Over-engineered
const Component = memo(({ items }) => {
  const memoizedItems = useMemo(() => items.map(...), [items]);
  const handleClick = useCallback(() => {}, []);
  // ...
});
```

---

## Development Workflow

### Installation
```bash
npm create vite@latest hunthub-frontend -- --template react-ts
cd hunthub-frontend

# Core dependencies
npm install react@19 react-dom@19
npm install @mui/material @emotion/react @emotion/styled
npm install @phosphor-icons/react styled-components
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod axios
```

### Scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## Current Status & Next Steps

### ✅ Decided
- [x] Tech stack finalized
- [x] UI approach (MUI + styled-components)
- [x] State management (Zustand + React Query)
- [x] Form management (RHF + Zod)
- [x] Theme system (presets)
- [x] Error handling strategy
- [x] Component patterns

### 🚧 To Implement
- [ ] Project setup with Vite
- [ ] Theme system implementation
- [ ] Zustand stores (theme, editor state)
- [ ] React Query setup + custom hooks
- [ ] Bridge components (RHF integration)
- [ ] Core editor components
- [ ] Error boundaries
- [ ] Route structure

### 🔮 Future Enhancements (Skipped for Now)
- Authentication implementation (JWT in localStorage)
- Notifications/Toasts (notistack, react-hot-toast)
- Absolute imports (`@/components`)
- Prettier/ESLint configuration
- Type sharing with backend (monorepo/shared package)
- Error monitoring service (Sentry, LogRocket)
- User-created custom themes
- Auto-save drafts
- System dark mode detection

---

## 📝 Additional Context (For Claude CLI)

**When implementing, ask Claude to fill in:**

This section will be populated by Claude CLI with deeper context about:
- Specific component implementations
- Detailed file structure and organization patterns
- Code examples for bridge components
- React Query configuration details
- Zustand store implementations
- Error boundary setup
- Theme configuration specifics
- Any implementation challenges or patterns discovered during development

**To populate this section in CLI, provide:**
- Current implementation status
- Specific questions about patterns
- Code examples that worked well
- Issues encountered and solutions
- Performance optimizations applied
