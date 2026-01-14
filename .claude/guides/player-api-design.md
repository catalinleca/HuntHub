# Play API Overview

**Last updated:** 2025-01-14

**Status:** Implemented

---

## What It Does

The Play API enables players to play published hunts. Players start a session, navigate through steps, submit answers for validation, and optionally request hints. Sessions work for both anonymous and authenticated players.

---

## Core Concepts

### Session-Based Access

Players don't need accounts. When starting a hunt, they provide a name and receive a `sessionId` (UUID). This ID acts as a bearer token for all subsequent requests - no Firebase auth required. Enables frictionless gameplay via QR codes.

### Version Pinning

When a session starts, it locks to the hunt's current `liveVersion`. The player sees this version throughout their session, even if the creator publishes updates. Stored in `progress.version`.

### Server as Source of Truth

The server controls which steps are accessible. Players can only fetch their current step or the next step (for prefetching). This prevents skipping steps while enabling smooth UX.

### Lightweight Validation

The `/validate` endpoint returns minimal data - just whether the answer was correct, feedback, and attempt count. It does NOT return the next step. Clients prefetch the next step separately while players work on the current one.

---

## Data Model

Uses the existing `Progress` model (no separate PlaySession model):

**Progress document stores:**
- `sessionId` - UUID for session identification
- `huntId`, `version` - Which hunt and version they're playing
- `playerName`, `userId` (optional) - Who's playing
- `currentStepId` - Where they are
- `status` - in_progress, completed, abandoned
- `steps[]` - Per-step progress (attempts, hintsUsed, submissions, timestamps)
- `startedAt`, `completedAt` - Session timing

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/play/:huntId/start` | Start new session |
| GET | `/play/sessions/:sessionId` | Resume session (get current state) |
| GET | `/play/sessions/:sessionId/step/:stepId` | Get specific step (current or next only) |
| POST | `/play/sessions/:sessionId/validate` | Submit answer |
| POST | `/play/sessions/:sessionId/hint` | Request hint |

---

## Response Types

### SessionResponse (unified)

Both `startSession` and `getSession` return the same shape:

- `sessionId` - For client storage
- `hunt` - Sanitized hunt metadata (HuntMetaPF)
- `status` - in_progress or completed
- `currentStepIndex`, `totalSteps` - Progress indicators
- `startedAt`, `completedAt` - Timestamps
- `currentStep` - The step to display (StepResponse)

### StepResponse

- `step` - Sanitized step data (StepPF) - no answers
- `stepIndex`, `totalSteps` - Position
- `attempts`, `maxAttempts` - Attempt tracking
- `hintsUsed`, `maxHints` - Hint tracking
- `_links` - HATEOAS links (self, next, validate)

### ValidateAnswerResponse (lightweight)

- `correct` - boolean
- `feedback` - optional message
- `attempts`, `maxAttempts` - current state
- `isComplete` - true if hunt finished
- `expired`, `exhausted` - edge case flags

---

## Data Sanitization

`PlayerExporter` (in `@hunthub/shared`) strips sensitive data before sending to clients:

**Removed from steps:**
- `targetId`, `expectedAnswer` - Quiz answers
- `options[].isCorrect` - Correct option markers
- `ai` - AI validation instructions
- Target coordinates for missions

**Used by:**
- Backend Play API
- Frontend Editor preview (via Player SDK)

Single source of truth - no duplication.

---

## Validation Flow

1. **Session validation** - Check session exists and is active
2. **Time limit check** - If step has timeLimit, verify not expired
3. **Attempt limit check** - If step has maxAttempts, verify not exhausted
4. **Answer validation** - Type-specific validation via `AnswerValidator`
5. **State update** - Atomic transaction: increment attempts, record submission, advance if correct

### Answer Validation by Type

**Quiz (single/multiple choice):**
- Compare submitted answer against `expectedAnswer`
- Case-insensitive, trimmed

**Clue (text input):**
- Compare against `expectedAnswer`
- Case-insensitive, trimmed

**Location-based (future):**
- GPS proximity check against target coordinates

---

## Architecture

### Service Layer

`PlayService` - Orchestrates all operations:
- `startSession()` - Create progress, return first step
- `getSession()` - Resume, return current state
- `getStep()` - Fetch step with access control
- `validateAnswer()` - Validate and advance
- `requestHint()` - Return hint, track usage

### Helpers

- `SessionManager` - Progress CRUD, atomic updates
- `StepNavigator` - Step lookup and traversal
- `AnswerValidator` - Challenge-type-specific validation

---

## Client Flow

```
1. Player scans QR / clicks link
2. POST /play/:huntId/start { playerName }
   → Get sessionId + first step
   → Store sessionId in localStorage

3. While on step N:
   → GET /step/:nextStepId (prefetch N+1)
   → Player works on current step

4. POST /validate { answerType, payload }
   → Get { correct, feedback }
   → If correct, client shows prefetched step

5. Repeat until isComplete: true
```

---

## Current Limitations (MVP)

- **1 hint per step** (hardcoded maxHints: 1)
- **No session expiry** (could add expiresAt check)
- **No scoring/leaderboards** (track data, no formula)
- **No AI validation** for missions/tasks (auto-approve)

---

## Files

```
apps/backend/api/src/features/play/
├── play.service.ts          # Core business logic
├── play.controller.ts       # HTTP handlers
├── play.routes.ts           # Route definitions
├── play.validation.ts       # Request schemas
└── helpers/
    ├── session-manager.helper.ts   # Progress operations
    ├── step-navigator.helper.ts    # Step traversal
    └── answer-validator.helper.ts  # Validation logic

packages/shared/src/exporters/
└── PlayerExporter.ts        # Data sanitization
```

---

## Related

- **Publishing** - Makes hunt available via `liveVersion`
- **Progress model** - `apps/backend/api/src/database/models/Progress.ts`
- **Player SDK** - `packages/player-sdk/` - Editor preview communication
