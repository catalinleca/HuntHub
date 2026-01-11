# Player Session Handoff

**Date:** 2026-01-11
**Branch:** `player/setup`
**Status:** Clean foundation complete, ready for feature implementation

---

## What's Done

### 1. Project Setup (Clean, following Editor patterns)

```
apps/frontend/player/
├── package.json              # Dependencies matching Editor
├── tsconfig.json             # Same as Editor
├── vite.config.ts            # Port 5175, @ alias
├── index.html                # Mobile meta tags
├── .eslintrc.cjs             # Extends shared /eslint/react.cjs
└── src/
    ├── main.tsx              # Entry point
    ├── App.tsx               # Providers (Query, Theme, Router)
    ├── vite-env.d.ts
    ├── mui-theme.d.ts        # One-liner: import '@hunthub/compass/theme-types'
    ├── router/
    │   ├── index.ts
    │   ├── Router.tsx        # createBrowserRouter
    │   ├── routes.tsx        # /play/:huntId, /preview, *
    │   ├── RootLayout.tsx
    │   └── RootLayout.styles.ts
    └── pages/
        ├── index.ts
        ├── PlayPage/         # Stub - needs implementation
        ├── PreviewPage/      # Stub - needs implementation
        └── NotFoundPage/     # Done
```

### 2. Shared Config (No Duplication)

**Theme types:** Exported from `@hunthub/compass/theme-types`
- Both Editor and Player use one-liner import
- Defined once in `packages/compass/src/mui-theme.d.ts`

**ESLint:** Shared React config at `/eslint/react.cjs`
- Editor and Player each have 5-line `.eslintrc.cjs` extending it

### 3. Root Scripts Added

```json
"dev:player": "npm run dev --workspace=@hunthub/player"
```

---

## What's NOT Done (Previous Mess - Discarded)

The branches `player-setup-and-poc`, `player-sdk-and-iframe`, `player-editor-integration` contain:
- ❌ Duplicate types (created fake types instead of using @hunthub/shared)
- ❌ Inline sx styling everywhere
- ❌ Messy component structure
- ❌ Wrong patterns

**Do NOT merge those branches.** Start fresh from `player/setup`.

---

## What's Next (In Order)

### Phase 1: PlayPage Implementation
1. Create `src/types/player.ts` - ONLY player-specific types (behaviors)
2. Use `@hunthub/shared` for Hunt, Step, Challenge, etc.
3. Implement PlayPage:
   - Fetch hunt from API using huntId param
   - Track current step state
   - Render challenge based on step.type

### Phase 2: Challenge Components
```
src/components/challenges/
├── ClueChallenge.tsx
├── QuizChallenge.tsx
├── MissionChallenge.tsx
└── TaskChallenge.tsx
```
Each follows Editor's styled-components pattern.

### Phase 3: PreviewPage + SDK
1. PreviewPage receives postMessage from Editor
2. Player SDK exists at `packages/player-sdk/` (may need cleanup)
3. Wire up Editor → Player communication

### Phase 4: Editor Integration
1. Create PreviewPanel in Editor
2. Embed Player iframe
3. Sync step selection

---

## Key Patterns to Follow

### Styling (styled-components, NOT inline sx)
```tsx
// ✅ Correct
import * as S from './Component.styles';
<S.Container>...</S.Container>

// ❌ Wrong
<Box sx={{ display: 'flex', ... }}>
```

### Types (use @hunthub/shared)
```tsx
// ✅ Correct
import { Hunt, Step, Challenge, ChallengeType } from '@hunthub/shared';

// ❌ Wrong - don't create duplicate types
interface Step { ... } // NO
```

### File Structure
```
ComponentName/
├── index.ts              # Barrel export
├── ComponentName.tsx     # Component + types
└── ComponentName.styles.ts
```

---

## Architecture Reference

See `.claude/player/ARCHITECTURE.md` for:
- Catalyst pattern (iframe + thin SDK)
- Behavior injection pattern
- Route-based mode separation (/play vs /preview)
- Smart dev mode (admin controls in DEV)

---

## Commands

```bash
npm run dev:player          # Start on port 5175
npm run type-check:player   # Type check (script may need adding to root)
```

---

## Quick Start for New Session

1. Read this file first
2. Read `.claude/player/ARCHITECTURE.md` for the big picture
3. Check current state: `ls apps/frontend/player/src/`
4. Continue from "What's Next" above
