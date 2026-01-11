# HuntHub Player Documentation

## Start Here

**Branch:** `player-start-implementation-RENAME-BRANCH`
**Status:** Core play flow implemented (session, steps, validation, challenges)

**What's working:**
- Player can start a hunt, see steps, submit answers
- HATEOAS navigation with prefetch
- Session persistence (localStorage)
- Clue and Quiz challenges

**What's next:**
- Mission/Task challenges
- Preview route for Editor integration
- Real backend integration (currently mocked)

---

## Quick Commands

```bash
npm run dev:player     # Start on port 5175
npm run type-check     # From apps/frontend/player
```

---

## Documentation

| Document | When to Read |
|----------|--------------|
| **PLAYER-ARCHITECTURE.md** | Understanding the implementation - data flow, HATEOAS, examples |
| **PLAYER-FORMAT.md** | When working with types (StepPF vs Step) |
| **PREVIEW-INTEGRATION.md** | When implementing Editor preview (future) |
| **COMPASS-LIBRARY.md** | When working on theming |

---

## Architecture Summary

```
User visits /play/:huntId
        ↓
PlaySessionProvider (context)
    ├── useSessionLayer → session, startSession, huntMeta
    └── useStepLayer → currentStep, prefetchNext (HATEOAS)
        ↓
PlayPage → StepRenderer → Challenge Components
        ↓
useStepValidation → validate answer → cache invalidation → next step
```

**Key patterns:**
- HATEOAS: Server provides `_links.next` - client follows links, doesn't hardcode step indices
- Prefetch: Next step fetched while playing current → instant transitions
- Layer separation: Session concerns vs Step concerns
- Version lock: Session locks to hunt version at start

---

## File Structure

```
apps/frontend/player/src/
├── api/play/
│   ├── keys.ts              # Cache keys
│   ├── mockData.ts          # Mock backend
│   ├── useCurrentStep.ts    # GET /step/current
│   ├── usePrefetchNextStep.ts
│   ├── useGetSession.ts
│   ├── useStartSession.ts
│   └── useValidateAnswer.ts
├── context/PlaySession/
│   ├── useSessionLayer.ts   # Session concerns
│   ├── useStepLayer.ts      # Step concerns
│   ├── useSessionLogic.ts   # Composition
│   └── sessionStorage.ts    # localStorage
├── hooks/
│   └── useStepValidation.ts
├── components/challenges/
│   ├── ClueChallenge/
│   └── QuizChallenge/
└── pages/PlayPage/
    ├── PlayPage.tsx
    └── components/
        ├── PlayerIdentification/
        └── StepRenderer/
```

---

## Historical Branches (Do Not Merge)

- `player-setup-and-poc`
- `player-sdk-and-iframe`
- `player-editor-integration`

These contain outdated patterns. Current work is on the main branch listed above.
