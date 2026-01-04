# Player Application - Implementation Checklist

**Status:** Ready for Implementation
**Plan File:** `/Users/catalinleca/.claude/plans/drifting-napping-porcupine.md`

---

## Phase 1: Foundation (packages/ui)

### 1.1 Create Package Structure

```bash
# From project root
mkdir -p packages/ui/src/{tokens,mixins,selectors,utils}
```

**Files to create:**

- [ ] `packages/ui/package.json`
- [ ] `packages/ui/tsconfig.json`
- [ ] `packages/ui/src/index.ts`
- [ ] `packages/ui/src/createTheme.ts`
- [ ] `packages/ui/src/tokens/spacing.ts`
- [ ] `packages/ui/src/tokens/typography.ts`
- [ ] `packages/ui/src/tokens/shadows.ts`
- [ ] `packages/ui/src/tokens/breakpoints.ts`
- [ ] `packages/ui/src/tokens/index.ts`
- [ ] `packages/ui/src/mixins/field.ts`
- [ ] `packages/ui/src/mixins/animation.ts`
- [ ] `packages/ui/src/mixins/index.ts`
- [ ] `packages/ui/src/selectors/mui.ts`
- [ ] `packages/ui/src/selectors/index.ts`
- [ ] `packages/ui/src/utils/color.ts`
- [ ] `packages/ui/src/utils/index.ts`

### 1.2 Package Configuration

```json
// packages/ui/package.json
{
  "name": "@hunthub/ui",
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
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 1.3 Theme Factory

```typescript
// packages/ui/src/createTheme.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { merge } from 'lodash-es';
import { baseTokens } from './tokens';

export interface ThemePreset {
  palette: {
    primary: { main: string; light?: string; dark?: string };
    secondary: { main: string };
    mode?: 'light' | 'dark';
  };
}

export const createHuntHubTheme = (
  preset: ThemePreset,
  overrides?: ThemeOptions
) => createTheme(merge({}, baseTokens, { palette: preset.palette }, overrides));
```

### 1.4 Migrate Editor Theme

**Files to modify:**

- [ ] `apps/frontend/editor/src/theme/index.ts` - Import from @hunthub/ui
- [ ] `apps/frontend/editor/vite.config.ts` - Add resolve.dedupe
- [ ] `apps/frontend/editor/package.json` - Add @hunthub/ui dependency

**Vite config addition:**

```typescript
// apps/frontend/editor/vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom', '@mui/material', 'styled-components'],
  },
  // ... existing config
});
```

### 1.5 Verification

- [ ] Run `npm run build:ui` successfully
- [ ] Run `npm run dev:editor` - editor still works
- [ ] No duplicate React/MUI warnings in console

---

## Phase 2: Player SDK (packages/player-sdk)

### 2.1 Create Package Structure

```bash
mkdir -p packages/player-sdk/src/{components/steps,hooks,context,types}
```

**Files to create:**

- [ ] `packages/player-sdk/package.json`
- [ ] `packages/player-sdk/tsconfig.json`
- [ ] `packages/player-sdk/src/index.ts`

### 2.2 Context

- [ ] `packages/player-sdk/src/context/PlayerContext.tsx`
- [ ] `packages/player-sdk/src/context/index.ts`

```typescript
// PlayerContext.tsx - Key types
export type PlayerMode = 'preview' | 'production';

export interface PlayerConfig {
  mode: PlayerMode;
  showAnswers?: boolean;
  skipValidation?: boolean;
  freeNavigation?: boolean;
  mockLocation?: { lat: number; lng: number };
}

export interface PlayerContextValue {
  mode: PlayerMode;
  config: PlayerConfig;
  shouldValidate: boolean;
  canNavigateFreely: boolean;
  showCorrectAnswers: boolean;
  hintsEnabled: boolean;
  actionsEnabled: boolean;
}
```

### 2.3 Components

- [ ] `packages/player-sdk/src/components/PlayerShell.tsx`
- [ ] `packages/player-sdk/src/components/StepView.tsx`
- [ ] `packages/player-sdk/src/components/ProgressIndicator.tsx`
- [ ] `packages/player-sdk/src/components/HintButton.tsx`
- [ ] `packages/player-sdk/src/components/index.ts`

### 2.4 Step Type Components

- [ ] `packages/player-sdk/src/components/steps/LocationStep.tsx`
- [ ] `packages/player-sdk/src/components/steps/QuizStep.tsx`
- [ ] `packages/player-sdk/src/components/steps/PhotoStep.tsx`
- [ ] `packages/player-sdk/src/components/steps/TaskStep.tsx`
- [ ] `packages/player-sdk/src/components/steps/index.ts`

### 2.5 Hooks

- [ ] `packages/player-sdk/src/hooks/useGeolocation.ts`
- [ ] `packages/player-sdk/src/hooks/useCamera.ts`
- [ ] `packages/player-sdk/src/hooks/usePlayerState.ts`
- [ ] `packages/player-sdk/src/hooks/index.ts`

### 2.6 Types

- [ ] `packages/player-sdk/src/types/player.types.ts`
- [ ] `packages/player-sdk/src/types/index.ts`

### 2.7 Verification

- [ ] Run `npm run build:player-sdk` successfully
- [ ] Components render with mock data in isolation

---

## Phase 3: Preview Integration (Editor)

### 3.1 Create PreviewPanel

**Files to create:**

- [ ] `apps/frontend/editor/src/pages/Hunt/components/PreviewPanel/PreviewPanel.tsx`
- [ ] `apps/frontend/editor/src/pages/Hunt/components/PreviewPanel/PreviewPanel.styles.ts`
- [ ] `apps/frontend/editor/src/pages/Hunt/components/PreviewPanel/index.ts`

### 3.2 Create usePreviewData Hook

- [ ] `apps/frontend/editor/src/pages/Hunt/hooks/usePreviewData.ts`

```typescript
// Key interface
interface PreviewData {
  hunt: PreviewHunt;
  currentStep: PreviewStep | null;
  totalSteps: number;
  currentStepIndex: number;
}
```

### 3.3 Create useDebounce Hook (if not exists)

- [ ] `apps/frontend/editor/src/hooks/useDebounce.ts`

```typescript
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

### 3.4 Modify HuntLayout

- [ ] `apps/frontend/editor/src/pages/Hunt/HuntLayout.tsx` - Add left-right split
- [ ] `apps/frontend/editor/src/pages/Hunt/HuntLayout.styles.ts` - Add split styles

```tsx
// Layout structure
<S.EditorContainer>
  <S.FormPanel>
    {/* Existing form content */}
  </S.FormPanel>
  <S.PreviewPanel>
    <PreviewPanel />
  </S.PreviewPanel>
</S.EditorContainer>
```

### 3.5 Verification

- [ ] Preview updates when form changes (after 300ms)
- [ ] No performance lag when typing
- [ ] Step selection syncs with preview
- [ ] Empty state shows when no steps

---

## Phase 4: Player App Skeleton

### 4.1 Create App Structure

```bash
mkdir -p apps/frontend/player/src/{pages,api,theme/palettes,components}
```

**Files to create:**

- [ ] `apps/frontend/player/package.json`
- [ ] `apps/frontend/player/vite.config.ts`
- [ ] `apps/frontend/player/tsconfig.json`
- [ ] `apps/frontend/player/index.html`
- [ ] `apps/frontend/player/src/main.tsx`
- [ ] `apps/frontend/player/src/App.tsx`

### 4.2 Theme

- [ ] `apps/frontend/player/src/theme/palettes/adventure.ts`
- [ ] `apps/frontend/player/src/theme/index.ts`

```typescript
// Adventure palette (player-specific)
export const adventurePalette: ThemePreset = {
  palette: {
    primary: { main: '#6BCF7F', light: '#8FE09D', dark: '#4CAF60' },
    secondary: { main: '#FFB74D' },
    mode: 'light',
  },
};
```

### 4.3 Routes

- [ ] `apps/frontend/player/src/pages/HuntPage.tsx`
- [ ] `apps/frontend/player/src/pages/CompletePage.tsx`
- [ ] `apps/frontend/player/src/pages/NotFoundPage.tsx`

### 4.4 Root Config Updates

- [ ] `package.json` (root) - Add workspace entry
- [ ] Add npm scripts: `dev:player`, `build:player`

### 4.5 Verification

- [ ] Player app runs at localhost:5174
- [ ] Shows "Hello Player" placeholder
- [ ] Uses adventure theme colors

---

## Phase 5: Backend Player API

### 5.1 Models

- [ ] `apps/backend/api/src/database/models/PlaySession.ts`

```typescript
interface IPlaySession {
  sessionId: number;
  huntId: number;
  huntVersion: number;
  visitorId?: string;
  userId?: string;
  currentStepIndex: number;
  startedAt: Date;
  completedAt?: Date;
  hintsUsed: Record<number, number>; // stepId -> count
  answers: Array<{
    stepId: number;
    submittedAt: Date;
    correct: boolean;
    attempts: number;
  }>;
}
```

### 5.2 Services

- [ ] `apps/backend/api/src/modules/player/PlayerService.ts`
- [ ] `apps/backend/api/src/modules/player/validators/LocationValidator.ts`
- [ ] `apps/backend/api/src/modules/player/validators/QuizValidator.ts`
- [ ] `apps/backend/api/src/modules/player/validators/PhotoValidator.ts`
- [ ] `apps/backend/api/src/modules/player/validators/TaskValidator.ts`

### 5.3 Controllers

- [ ] `apps/backend/api/src/controllers/PlayerController.ts`

### 5.4 Routes

- [ ] `apps/backend/api/src/routes/player.routes.ts`

**Endpoints:**

```
POST /api/play/:huntId/start        → Start session
GET  /api/play/sessions/:id/resume  → Resume session
POST /api/play/sessions/:id/submit  → Submit answer
POST /api/play/sessions/:id/hint    → Request hint
GET  /api/play/sessions/:id/complete → Get completion stats
```

### 5.5 Verification

- [ ] All endpoints return expected responses
- [ ] Session persists across requests
- [ ] Challenge validation works per type

---

## Phase 6: Integration & PWA

### 6.1 Connect Player to API

- [ ] `apps/frontend/player/src/api/player/startHunt.ts`
- [ ] `apps/frontend/player/src/api/player/submitAnswer.ts`
- [ ] `apps/frontend/player/src/api/player/requestHint.ts`
- [ ] `apps/frontend/player/src/api/player/index.ts`
- [ ] `apps/frontend/player/src/hooks/usePlaySession.ts`

### 6.2 Completion Screen

- [ ] `apps/frontend/player/src/pages/CompletePage.tsx` - Full implementation
- [ ] Stats display (time, hints used, steps completed)
- [ ] Celebration animation

### 6.3 PWA Configuration

- [ ] `apps/frontend/player/public/manifest.json`
- [ ] `apps/frontend/player/src/sw.ts` (Service Worker)
- [ ] `apps/frontend/player/vite.config.ts` - Add vite-plugin-pwa

```json
// manifest.json
{
  "name": "HuntHub Player",
  "short_name": "HuntHub",
  "start_url": "/play",
  "display": "standalone",
  "theme_color": "#6BCF7F",
  "background_color": "#ffffff",
  "icons": [...]
}
```

### 6.4 Verification

- [ ] Can play entire hunt start to finish
- [ ] Session persists on refresh (localStorage)
- [ ] PWA installable on mobile
- [ ] Offline indicator shows when disconnected

---

## Build Order Summary

```bash
# 1. Shared packages (dependencies first)
npm run build:shared
npm run build:ui
npm run build:player-sdk

# 2. Apps
npm run build:editor
npm run build:player
npm run build:api

# 3. Development (parallel)
npm run dev:editor    # localhost:5173
npm run dev:player    # localhost:5174
npm run dev:api       # localhost:3000
```

---

## Testing Milestones

| Phase | Milestone | How to Test |
|-------|-----------|-------------|
| 1 | Theme factory works | Editor renders with new theme |
| 2 | SDK components render | Import and render with mock data |
| 3 | Preview syncs | Edit step → see update in preview |
| 4 | Player app runs | Navigate to localhost:5174 |
| 5 | API works | Postman/curl test all endpoints |
| 6 | End-to-end | Play hunt from QR code to completion |

---

## File Count Summary

| Package/App | New Files | Modified Files |
|-------------|-----------|----------------|
| packages/ui | ~15 | 0 |
| packages/player-sdk | ~20 | 0 |
| apps/frontend/editor | ~5 | ~3 |
| apps/frontend/player | ~15 | 0 |
| apps/backend/api | ~10 | ~2 |
| Root config | 0 | ~2 |
| **Total** | **~65** | **~7** |

---

## Quick Start for New Session

```
I'm working on the HuntHub player application.
Read .claude/player/README.md for context.
Continue with Phase [N] from the implementation checklist.
```

Replace `[N]` with current phase number (1-6).
