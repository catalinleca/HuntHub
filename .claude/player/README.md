# HuntHub Player Application

**Status:** Approved, Ready for Implementation
**Plan File:** `/Users/catalinleca/.claude/plans/drifting-napping-porcupine.md`

---

## Quick Context for New Session

The Player Application enables users to play published treasure hunts. It consists of:

1. **Preview Panel** - Embedded in Editor for real-time testing
2. **Standalone PWA** - Production player accessed via QR code

Both share UI components via `@hunthub/player-sdk`.

---

## Confirmed Decisions (User Approved)

| Decision | Choice |
|----------|--------|
| **Platform** | React PWA (not React Native) |
| **Preview Architecture** | SDK components (not iframe) |
| **Layout** | Left-right split (form \| preview) |
| **PWA Features** | MVP-critical (offline support required) |
| **Photo Handling** | Upload to S3 immediately during gameplay |
| **Build Order** | Frontend SDK first, then backend |

---

## Documentation Index

| Document | Purpose |
|----------|---------|
| [PLAYER-ARCHITECTURE.md](./PLAYER-ARCHITECTURE.md) | High-level architecture, diagrams, tech stack |
| [PREVIEW-SYNC.md](./PREVIEW-SYNC.md) | How form-to-preview sync works (debounce, transform) |
| [PLAYER-MODES.md](./PLAYER-MODES.md) | Preview vs Production mode differences |
| [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) | One-page summary for quick lookup |
| [IMPLEMENTATION-CHECKLIST.md](./IMPLEMENTATION-CHECKLIST.md) | Specific files to create/modify |
| [decisions/](./decisions/) | Architecture Decision Records (ADRs) |

---

## Related Existing Documentation

| Document | Location | Content |
|----------|----------|---------|
| Player API Design | `.claude/guides/player-api-design.md` | Backend endpoints, sessions, validation |
| Player UI Design | `.claude/frontend/player/hunthub-player-design.md` | UI/UX specs, colors, animations |
| Frontend Architecture | `.claude/frontend/FRONTEND-ARCHITECTURE.md` | React patterns, form handling |

---

## Implementation Phases

### Phase 1: Foundation ← START HERE
- Create `packages/ui/` with theme factory and tokens
- Migrate editor theme to use `@hunthub/ui`
- Verify editor still works

### Phase 2: Player SDK
- Create `packages/player-sdk/`
- Build `PlayerShell`, `StepView`, step components
- Build `useGeolocation`, `useCamera` hooks

### Phase 3: Preview Integration
- Add `PreviewPanel` to editor
- Build `usePreviewData` hook
- Implement 300ms debounce

### Phase 4: Player App
- Create `apps/frontend/player/`
- Set up routes, theme, PWA config

### Phase 5: Backend API
- Implement endpoints from `.claude/guides/player-api-design.md`
- PlaySession model, validation services

### Phase 6: Integration
- Connect player to API
- End-to-end testing

---

## Key Patterns from Efekta Catalyst

We analyzed the Efekta Catalyst codebase as a production reference:

**What we adopted:**
- 300ms debounce on form-to-preview sync
- SDK component pattern for reuse
- Mode prop for dev/prod behavior differences

**What we simplified:**
- No iframe (we're React-to-React, not React-to-Angular)
- No postMessage (direct props instead)
- No backend preview endpoint (client-side transform)

---

## Start a New Session

To continue implementation in a new session:

```
I'm working on the HuntHub player application.
Read .claude/player/README.md for context.
Continue with Phase [N] from the implementation checklist.
```

---

## File Structure After Implementation

```
packages/
├── shared/              # Existing - types, schemas
├── ui/                  # NEW - theme factory, tokens
│   └── src/
│       ├── tokens/
│       ├── createTheme.ts
│       └── index.ts
└── player-sdk/          # NEW - player components
    └── src/
        ├── components/
        ├── hooks/
        └── context/

apps/frontend/
├── editor/              # Existing
│   └── src/pages/Hunt/
│       └── components/
│           └── PreviewPanel/  # NEW
└── player/              # NEW - PWA
    └── src/
        ├── pages/
        ├── api/
        └── theme/
```