# Player Architecture (Catalyst Pattern)

**Status:** Approved
**Date:** 2026-01-10
**Based on:** Efecta/Catalyst production patterns

---

## TL;DR

- **Player App is self-contained** - All player code lives in `apps/frontend/player/`
- **Two routes, same UI** - `/play/:huntId` (production) and `/preview` (embedded in editor)
- **Behavior injection** - Same `<PlayerUI />` component, different validators/handlers passed as props
- **SDK is thin** - Just postMessage wrapper (~50 lines) for iframe communication
- **Admin controls in preview route** - Not in Editor, not in SDK

---

## Mental Model

The Player is one component (`<PlayerUI />`) that renders the same UI everywhere. What changes is the **behavior** passed to it:

| Route | GPS | Validation | Progress | Navigation |
|-------|-----|------------|----------|------------|
| `/play/:huntId` | Real Geolocation API | Real validation | Saves to backend | Sequential only |
| `/preview` | Mock (always returns target) | Mock (always passes) | No persistence | Jump to any step |

**The component doesn't know which mode it's in.** It just calls whatever functions it receives. This is dependency injection - same UI, different implementations.

```tsx
// Production: real everything
<PlayerUI validateLocation={realGPS} saveProgress={api.save} />

// Preview: mocked everything
<PlayerUI validateLocation={mockAlwaysPass} saveProgress={noop} />
```

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
│  │                    │    │  └──────────────────────┘  │    │
│  └────────────────────┘    └────────────────────────────┘    │
│                                                              │
│  Uses: @hunthub/player-sdk (postMessage only)                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Player App (Self-Contained)                                  │
│                                                              │
│  /play/:huntId                      /preview                 │
│  ┌─────────────────────┐           ┌─────────────────────┐   │
│  │                     │           │ ┌─────────────────┐ │   │
│  │    <PlayerUI />     │           │ │  <PlayerUI />   │ │   │
│  │                     │           │ │                 │ │   │
│  │  Real validators    │           │ │ Mock validators │ │   │
│  │  Real GPS           │           │ │ Mock GPS        │ │   │
│  │  Saves progress     │           │ └─────────────────┘ │   │
│  │  Sequential nav     │           │                     │   │
│  │                     │           │  Admin Controls:    │   │
│  │                     │           │  - Step picker      │   │
│  │                     │           │  - Toggle validation│   │
│  │                     │           │  - Debug panel      │   │
│  └─────────────────────┘           └─────────────────────┘   │
│                                                              │
│  Shared: <PlayerUI /> with injected behaviors                │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ packages/player-sdk (~50 lines)                              │
│                                                              │
│  - Message types (TypeScript)                                │
│  - PlayerSDK class (postMessage wrapper)                     │
│  - NO UI, NO logic                                           │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Self-Contained Player App

All player code lives in one place: `apps/frontend/player/`

```
apps/frontend/player/
├── pages/
│   ├── PlayPage.tsx        # Production: /play/:huntId
│   └── preview/
│       └── PreviewPage.tsx # Preview: /preview
├── components/
│   ├── PlayerUI.tsx        # Core (shared by both routes)
│   ├── challenges/         # Challenge type renderers
│   └── preview/            # Preview-only admin controls
├── hooks/
├── lib/
│   ├── validators.ts       # Real implementations
│   └── mocks.ts            # Mock implementations
└── types/
```

### 2. Route-Based Mode Separation

NOT a mode prop. Different routes with different behavior:

| Route | Data Source | Validators | Persistence | Navigation |
|-------|-------------|------------|-------------|------------|
| `/play/:huntId` | API | Real | Yes | Sequential |
| `/preview` | postMessage | Mock | No | Free |

### 3. Behavior Injection (Dependency Injection)

Same `<PlayerUI />` component, different props:

```tsx
// Production route
<PlayerUI
  hunt={huntFromAPI}
  validateLocation={realGPSValidator}
  saveProgress={api.saveProgress}
  canJumpToStep={false}
/>

// Preview route
<PlayerUI
  hunt={huntFromPostMessage}
  validateLocation={mockValidator}
  saveProgress={noop}
  canJumpToStep={true}
/>
```

**PlayerUI doesn't know if it's preview or production.** It just uses what it receives.

### 4. Thin SDK (postMessage Only)

The SDK does NOT contain:
- UI components
- Player logic
- State management
- Validation

The SDK ONLY contains:
- TypeScript types for messages
- A class that wraps postMessage

```typescript
// This is essentially the entire SDK
class PlayerSDK {
  renderHunt(hunt: Hunt) {
    this.iframe.contentWindow?.postMessage({ type: 'RENDER_HUNT', hunt }, '*');
  }

  navigateToStep(index: number) {
    this.iframe.contentWindow?.postMessage({ type: 'NAVIGATE_TO_STEP', stepIndex: index }, '*');
  }
}
```

### 5. Admin Controls in Preview Route

Admin controls (toggles, step picker, debug panel) are:
- Part of the Player App codebase
- Only rendered in the `/preview` route
- NOT in the Editor
- NOT in the SDK

```tsx
// pages/preview/PreviewPage.tsx
<div className="preview-container">
  {/* The actual player */}
  <div className="player-frame">
    <PlayerUI {...props} />
  </div>

  {/* Admin controls (preview-only) */}
  <aside className="admin-controls">
    <StepPicker />
    <Toggle label="Skip validation" />
  </aside>
</div>
```

---

## Why This Architecture?

### Why not a shared component package?

| Shared Component (rejected) | Iframe + Routes (chosen) |
|----------------------------|--------------------------|
| Player logic split across packages | All code in one place |
| Complex package dependencies | Simple iframe embed |
| Tighter coupling | True isolation |
| Hard to deploy independently | Deploy separately |

### Why iframe instead of direct import?

1. **Isolation** - Player and Editor are separate apps
2. **Independent deployment** - Update player without redeploying editor
3. **Proven pattern** - Catalyst uses this at scale
4. **Simpler mental model** - "Editor embeds player"

### Why admin controls in Player App?

1. **Works standalone** - Can test preview at `localhost:5174/preview`
2. **Works embedded** - Same experience when embedded in Editor
3. **No extra messages** - Controls affect local state directly
4. **Self-contained** - Player app owns all player-related UI

---

## Implementation Order

1. **Phase 1:** Player App with `/play/:huntId` route (production)
2. **Phase 2:** Add `/preview` route with admin controls
3. **Phase 3:** Create thin SDK package
4. **Phase 4:** Integrate PreviewPanel in Editor
5. **Phase 5:** Backend Player API
6. **Phase 6:** Full integration

---

## Reference

- **Full plan:** `/Users/catalinleca/.claude/plans/greedy-tinkering-hamster.md`
- **Efecta comparison:** `/Users/catalinleca/.claude/plans/inherited-roaming-glade.md`
- **Backend API design:** `.claude/guides/player-api-design.md`