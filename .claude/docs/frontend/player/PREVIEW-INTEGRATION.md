# Player Preview Architecture

**Status:** Implemented
**Date:** 2026-01-12
**Based on:** Wrapper pattern for race-condition-free mode separation

---

## TL;DR

- **Player App is self-contained** - All player code lives in `apps/frontend/player/`
- **Two routes** - `/play/:huntId` (production) and `/preview` (embedded or standalone)
- **Wrapper pattern** - `PreviewPage` decides mode once, renders appropriate component
- **No race conditions** - Each sub-component has exactly one data source
- **Shared rendering** - `PreviewContent` handles UI, sub-components handle data

---

## Mental Model

The `/preview` route uses the **wrapper pattern** to eliminate race conditions:

```
PreviewPage (mode decider)
    │
    ├── EmbeddedPreview   → ONLY postMessage (waits for Editor)
    │
    └── StandalonePreview → ONLY mock data (loads immediately)
```

**Key insight:** `window.parent !== window` tells us the mode **synchronously** at mount. No need to "wait and see".

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ Editor App                                                   │
│                                                              │
│  ┌────────────────────┐    ┌────────────────────────────┐    │
│  │ Form               │    │ PreviewPanel               │    │
│  │                    │    │                            │    │
│  │ hunt data ─────────┼────┼──> postMessage ──┐         │    │
│  │                    │    │                  │         │    │
│  │ selected step ─────┼────┼──> postMessage ──┤         │    │
│  │                    │    │                  ▼         │    │
│  │                    │    │  ┌──────────────────────┐  │    │
│  │                    │    │  │ iframe /preview      │  │    │
│  │                    │    │  │ (EmbeddedPreview)    │  │    │
│  │                    │    │  └──────────────────────┘  │    │
│  └────────────────────┘    └────────────────────────────┘    │
│                                                              │
│  Uses: @hunthub/player-sdk (postMessage only)                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Player App /preview Route                                    │
│                                                              │
│  PreviewPage.tsx (12 lines - mode decider)                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  isEmbedded = window.parent !== window                  │ │
│  │                                                         │ │
│  │  return isEmbedded                                      │ │
│  │    ? <EmbeddedPreview />                                │ │
│  │    : <StandalonePreview />                              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                    │                    │                    │
│                    ▼                    ▼                    │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ EmbeddedPreview     │  │ StandalonePreview   │           │
│  │                     │  │                     │           │
│  │ Data: postMessage   │  │ Data: mock loader   │           │
│  │ Toolbar: hidden     │  │ Toolbar: visible    │           │
│  │ Validation → Editor │  │ Validation → next   │           │
│  │                     │  │                     │           │
│  │   ┌─────────────┐   │  │   ┌─────────────┐   │           │
│  │   │ Preview     │   │  │   │ Preview     │   │           │
│  │   │ Content     │   │  │   │ Content     │   │           │
│  │   │ (shared)    │   │  │   │ (shared)    │   │           │
│  │   └─────────────┘   │  │   └─────────────┘   │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                              │
│  Shared: usePreviewCore (state), PreviewContent (rendering)  │
└──────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
apps/frontend/player/src/
├── pages/
│   ├── PlayPage/              # Production: /play/:huntId
│   └── PreviewPage/
│       ├── PreviewPage.tsx    # Mode decider (12 lines)
│       ├── PreviewPage.styles.ts
│       └── components/
│           ├── EmbeddedPreview.tsx    # postMessage only
│           ├── StandalonePreview.tsx  # Mock data only
│           ├── PreviewContent.tsx     # Shared rendering
│           └── PreviewToolbar.tsx     # Step navigation
├── hooks/
│   └── preview/
│       ├── usePreviewCore.ts  # Shared state management
│       └── types.ts           # Message types & factories
├── context/
│   └── Validation/
│       ├── MockValidationProvider.tsx  # Client-side validation
│       └── ApiValidationProvider.tsx   # Server-side validation
└── api/
    └── preview/
        └── mockPreviewData.ts  # Standalone mock hunt
```

---

## Key Components

### PreviewPage (Mode Decider)

```tsx
// 12 lines - just decides which component to render
const isRunningInIframe = (): boolean => window.parent !== window;

export const PreviewPage = () => {
  const isEmbedded = isRunningInIframe();
  return isEmbedded ? <EmbeddedPreview /> : <StandalonePreview />;
};
```

### EmbeddedPreview

- **Data source:** postMessage from Editor
- **On mount:** Sends `PREVIEW_READY` to Editor
- **On validation:** Sends result back to Editor (no auto-advance)
- **Toolbar:** Hidden (Editor controls navigation)

### StandalonePreview

- **Data source:** Mock hunt data (loads immediately)
- **On mount:** Loads mock hunt
- **On validation:** Auto-advances to next step
- **Toolbar:** Visible (user can navigate freely)

### PreviewContent (Shared)

Handles all rendering:
- Loading state
- Error state
- Empty state ("waiting for Editor" vs "loading mock")
- Hunt display with `StepRenderer`
- `MockValidationProvider` for client-side validation

---

## Why Wrapper Pattern?

### Problem: Race Condition

Old approach had both data sources active simultaneously:

```
Old: usePreviewMode()
├── useEmbeddedPreview() → listens for postMessage
└── useStandalonePreview() → waits 500ms, then loads mock

Race: Mock loading starts → Editor sends real data → Mock finishes → overwrites real data
```

### Solution: Mode Separation

New approach decides mode once, renders single-source component:

```
New: PreviewPage
├── isEmbedded = true  → EmbeddedPreview (ONLY postMessage)
└── isEmbedded = false → StandalonePreview (ONLY mock)

No race: Each component has exactly one data source
```

**The iframe check is synchronous.** We know the mode instantly at mount.

---

## Message Protocol

### Editor → Player

```typescript
const EDITOR_MESSAGES = {
  RENDER_HUNT: 'RENDER_HUNT',      // Send hunt data
  JUMP_TO_STEP: 'JUMP_TO_STEP',    // Navigate to step
} as const;
```

### Player → Editor

```typescript
const PLAYER_MESSAGES = {
  PREVIEW_READY: 'PREVIEW_READY',      // Player ready for data
  STEP_VALIDATED: 'STEP_VALIDATED',    // Validation result
} as const;
```

---

## Validation Flow

### Embedded (Editor controls)

```
User submits answer
    → MockValidationProvider checks answer
    → onValidated callback fires
    → EmbeddedPreview sends STEP_VALIDATED to Editor
    → Editor decides what to do (show feedback, advance, etc.)
```

### Standalone (Auto-advance)

```
User submits answer
    → MockValidationProvider checks answer
    → onValidated callback fires
    → StandalonePreview auto-advances if correct
```

---

## State Management

### usePreviewCore

Shared state hook used by both sub-components:

```typescript
interface PreviewCoreState {
  hunt: Hunt | null;
  stepIndex: number;
  isLoading: boolean;
  error: string | null;
}

// Returns:
// - State: hunt, currentStep, stepIndex, totalSteps, isFirstStep, isLastStep
// - Actions: goToStep, goToNextStep, goToPrevStep, setHunt, setLoading, setError
```

### clampStepIndex

Pure function for navigation bounds:

```typescript
const clampStepIndex = (state: PreviewCoreState, requestedIndex: number): number => {
  const steps = state.hunt?.steps ?? [];
  const maxIndex = Math.max(0, steps.length - 1);
  return Math.max(0, Math.min(maxIndex, requestedIndex));
};
```

No stale closures - reads bounds from state directly.

---

## Security TODOs

```typescript
// types.ts - sendToEditor
// TODO: Replace '*' with specific editor origin for production

// EmbeddedPreview.tsx - handleMessage
// TODO: Add origin validation (event.origin === VITE_EDITOR_ORIGIN)
```

---

## Testing Modes

| Mode | URL | Data Source | Use Case |
|------|-----|-------------|----------|
| Standalone | `localhost:5173/preview` | Mock data | Test preview UI independently |
| Embedded | Editor iframe | postMessage | Test Editor ↔ Player integration |
| Production | `localhost:5173/play/:id` | API | Test real play flow |
