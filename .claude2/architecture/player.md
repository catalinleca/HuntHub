# Player App Architecture

Mobile-first app for playing treasure hunts. This document covers the implemented architecture.

---

## Overview

```
User visits /play/:playSlug
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         Provider Stack                               │
│                                                                      │
│   PlaySessionProvider (or EditorPreviewSessionProvider)             │
│       ↓                                                              │
│   ApiValidationProvider (or EditorPreviewProvider)                  │
│       ↓                                                              │
│   PlayPage                                                           │
│       ↓                                                              │
│   StepRenderer → Challenge Component                                │
└─────────────────────────────────────────────────────────────────────┘
```

**Three modes:**
| Mode | Route | Providers | Data Source |
|------|-------|-----------|-------------|
| Production | `/play/:slug` | PlaySessionProvider + ApiValidationProvider | Backend API |
| Editor Preview | iframe | EditorPreviewSessionProvider + EditorPreviewProvider | postMessage |
| Author Preview | `/preview/:huntId` | AuthorPreviewSessionProvider + ApiValidationProvider | Backend (signed URL) |

---

## Provider Stack

### 1. Session Layer

Manages session state, step navigation, hunt metadata.

```
                    React Query
                        ↓
              PlaySessionProvider
                        ↓
         ┌──────────────┴──────────────┐
         ↓                             ↓
SessionStateContext          SessionActionsContext
(data - changes often)       (functions - stable)
```

**Split Context Pattern:** State and actions are separate contexts. Components using only `useSessionActions()` don't re-render when state changes.

**SessionStateContext provides:**
- `status`: 'loading' | 'error' | 'identifying' | 'playing' | 'completed'
- `sessionId`, `huntMeta`, `stepResponse`, `isLastStep`, `error`
- `isPreview` - Whether in preview mode (Author Preview only)
- `stepOrder` - Full step order array (Author Preview only, enables navigation)

**SessionActionsContext provides:**
- `startSession(playerName, email?)` - Start new session
- `abandonSession()` - Clear session
- `advanceToNextStep()` - Move to next step (uses refs for stability)
- `navigateToStep(stepId)` - Jump to specific step (preview only)
- `navigateNext()` / `navigatePrev()` - Step through hunt (preview only)

### 2. Validation Layer

Handles answer submission and feedback.

```
Challenge calls validate()
        ↓
ApiValidationProvider
        ↓
POST /validate → { isCorrect, feedback }
        ↓
Sets state: isCorrect, feedback, attemptCount
        ↓
If correct → calls onAdvance() callback
```

**ValidationContext provides:**
- `validate(answerType, payload)` - Submit answer
- `isValidating`, `isCorrect`, `feedback`, `attemptCount`
- `isExpired`, `isExhausted` - Step constraints
- `reset()` - Clear validation state

**Decoupled design:** Validation doesn't know about session internals. It receives `onAdvance` callback and calls it on success.

**SuccessDialog:** When `showSuccessDialog` prop is true, `ApiValidationProvider` renders a `SuccessDialog` component that shows feedback and a "Continue" button. The dialog uses `useStableWhileLoading` hook to keep UI stable during validation transitions.

---

## Session Status Flow

```
loading ──→ error (query failed)
   │
   ├──→ identifying (no session) ──→ loading (start session)
   │                                      │
   │                                      ↓
   └──→ playing (session exists) ──→ completed (last step done)
```

| Status | Meaning | UI |
|--------|---------|-----|
| `loading` | Fetching session or step | Spinner |
| `error` | Query failed | Error message |
| `identifying` | No session, need name | PlayerIdentification form |
| `playing` | Active session | StepRenderer |
| `completed` | Hunt finished | Completion screen |

---

## Step Completion Flow

```
User submits correct answer
        ↓
ApiValidationProvider.validate()
        ↓
POST /sessions/:id/validate
        ↓
{ isCorrect: true, feedback: "..." }
        ↓
Show feedback → User clicks Continue
        ↓
onAdvance() callback
        ↓
PlaySessionProvider.advanceToNextStep()
        ↓
Update cache: currentStepId = nextStepId
        ↓
React Query re-render → CACHE HIT (was prefetched!)
        ↓
Next step renders instantly
```

**Prefetching:** While playing step N, step N+1 is prefetched. When advancing, it's already cached.

---

## HATEOAS Navigation

Server provides `_links` - client follows them, doesn't hardcode step logic.

```typescript
// Step response
{
  step: { stepId: 1, type: "clue", ... },
  _links: {
    self: { href: "/sessions/abc/step/current" },
    next: { href: "/sessions/abc/step/2" },     // Not present on last step!
    validate: { href: "/sessions/abc/validate" }
  }
}
```

- **Has `next` link** → prefetch it
- **No `next` link** → last step, show "Finish Hunt"

---

## Selector Hooks

Components subscribe only to what they need:

```typescript
// Session state
useSessionId()        // string | null
useSessionStatus()    // SessionStatus enum
useSessionError()     // Error | null
useHuntMeta()         // { name, totalSteps, ... }
useIsLastStep()       // boolean
useIsPreview()        // boolean (false in production)
useStepOrder()        // number[] (empty in production)

// Step data
useStepResponse()     // Full StepResponse (stable ref)
useCurrentStep()      // StepPF | null
useStepProgress()     // { currentStepIndex, totalSteps, isLastStep }
useStepPlayProgress() // { attempts, hintsUsed, startedAt }

// Actions (all from useSessionActions())
useSessionActions()      // Full actions object
useAdvanceToNextStep()   // () => void (production + preview)
useNavigateToStep()      // (stepId) => void (preview only)
useNavigateNext()        // () => void (preview only)
useNavigatePrev()        // () => void (preview only)

// Validation
useValidation()       // Full validation context
useIsCorrect()        // boolean | null
useIsValidating()     // boolean
useFeedback()         // string | null
useAttemptCount()     // number
```

---

## Key Files

| Need | Location |
|------|----------|
| Session providers | `context/PlaySession/` |
| Validation providers | `context/Validation/` |
| Selector hooks | `context/PlaySession/hooks.ts` |
| Challenge components | `pages/PlayPage/challenges/` |
| Step renderer | `pages/PlayPage/components/StepRenderer/` |
| Media hooks | `hooks/usePhotoCapture.ts`, `useAudioRecorder.ts`, etc. |

**See `codebase.md` for full navigation guide.**

---

## Key Design Decisions

### Split Context (State vs Actions)
Components using only actions (like a submit button) don't re-render when state changes.

### Refs for Stable Actions
`advanceToNextStep` uses refs to read `sessionId` and `nextStepId` at call time, keeping the actions context stable.

### Status Enum Over Booleans
Single `status` enum replaces `isLoading`, `hasSession`, `isComplete`. Cleaner switch-based rendering.

### Validation Decoupled
`ApiValidationProvider` receives `onAdvance` callback. It doesn't know about session internals—just calls the callback on success.

### stepResponse Pass-Through
`stepResponse` from React Query is passed through unchanged. Components use selector hooks to extract what they need.

### Stable UI During Loading
`useStableWhileLoading(value, isLoading)` hook returns the previous value while loading, preventing UI flicker during transitions. Used in `SuccessDialog` and other components that need visual stability.

### Session Persistence
`sessionId` saved to localStorage keyed by `playSlug`. On return visit, attempt to resume session.

### Version Lock
Session locks to hunt version at start. Creator changes don't affect active players.

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/play/:playSlug/start` | Start new session |
| GET | `/play/sessions/:sessionId` | Get session state |
| GET | `/play/sessions/:sessionId/step/:stepId` | Get step data |
| POST | `/play/sessions/:sessionId/validate` | Validate answer |
| POST | `/play/sessions/:sessionId/hint` | Request hint |

---

## Challenge Types

| Type | Component | Validation |
|------|-----------|------------|
| **Clue** | ClueChallenge | Auto-pass (acknowledge) |
| **Quiz** (choice) | QuizChallenge → ChoiceContent | Server checks optionId |
| **Quiz** (input) | QuizChallenge → InputContent | Server fuzzy-match |
| **Mission** (location) | MissionChallenge → LocationContent | GPS distance check |
| **Mission** (photo) | MissionChallenge → PhotoContent | AI validation |
| **Mission** (audio) | MissionChallenge → AudioContent | AI validation |
| **Task** | TaskChallenge | AI text validation |

**BaseChallengeProps:** StepRenderer builds a standard props object for all challenges:

```typescript
interface BaseChallengeProps {
  onValidate: (type, payload) => void;  // From validation context
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
  currentAttempts: number;
  media?: Media;           // Step media content
  timeLimit?: number;      // Seconds allowed
  maxAttempts?: number;    // Max tries before lockout
  hasHint?: boolean;       // Whether hint is available
}
```

Each challenge type extends this with type-specific props (e.g., `QuizChallengeProps` adds `quiz` data).
