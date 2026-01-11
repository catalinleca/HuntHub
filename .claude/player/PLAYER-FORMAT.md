# Player Format (PF) Pattern for HuntHub

**Status:** Approved
**Date:** 2026-01-11

---

## TL;DR

- **Editor Format** - Full data with metadata, answers (internal)
- **Player Format (PF)** - Stripped, player-ready format (no answers)
- Transformation happens **server-side** in Play API
- Player app never sees answers (security)

---

## Why Two Formats?

| Reason | Explanation |
|--------|-------------|
| Security | Don't expose correct answers in browser DevTools |
| Optimization | Player doesn't need authoring metadata |
| Separation | Authoring vs consumption are different use cases |

---

## What Gets Stripped

| Editor Field | Player Field | Transformation |
|--------------|--------------|----------------|
| `quiz.targetId` | (removed) | Correct answer stripped |
| `quiz.expectedAnswer` | (removed) | Correct answer stripped |
| `mission.targetLocation` | (removed) | Target coords stripped |
| `hint` | (removed) | Controlled via separate API endpoint |
| `metadata` | (removed) | Internal only |
| Timestamps | (removed) | Not needed for playing |

---

## Type Definitions

### Editor Format (existing in @hunthub/shared)

```typescript
interface Step {
  stepId: number;
  type: ChallengeType;
  challenge: {
    quiz?: {
      title?: string;
      options?: Option[];
      targetId?: string;        // ← ANSWER (Editor only)
      expectedAnswer?: string;  // ← ANSWER (Editor only)
    };
    mission?: {
      targetLocation?: Location; // ← ANSWER (Editor only)
    };
    // ...
  };
  hint?: string;
  // ...
}
```

### Player Format (NEW - for Player)

```typescript
interface StepPF {
  stepId: number;
  type: ChallengeType;
  challenge: ChallengePF;
  media?: Media;
  // NO: hint (controlled separately), NO: answers
}

interface QuizPF {
  title?: string;
  description?: string;
  type?: OptionType;
  options?: Option[];
  randomizeOrder?: boolean;
  // NO: targetId, expectedAnswer
}

interface MissionPF {
  title?: string;
  description?: string;
  type?: MissionType;
  // NO: targetLocation
}
```

---

## Data Flow

```
┌─────────────────────────────────────────┐
│ EDITOR APP                              │
│ Works with full Step types              │
└──────────────────┬──────────────────────┘
                   │ Save
                   ▼
┌─────────────────────────────────────────┐
│ DATABASE                                │
│ Stores full Editor format               │
└──────────────────┬──────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────────┐
│ Editor API    │    │ Play API           │
│ Returns full  │    │ TRANSFORMS to PF   │
│ Step types    │    │ Returns StepPF     │
└───────────────┘    └────────────────────┘
        │                     │
        ▼                     ▼
┌───────────────┐    ┌────────────────────┐
│ Editor App    │    │ Player App         │
│ Full access   │    │ Stripped data only │
└───────────────┘    └────────────────────┘
```

---

## Transformation Location

**File:** `apps/backend/api/src/features/play/mappers/toPlayerFormat.ts`

```typescript
import type { Step, StepPF } from '@hunthub/shared';

export function toStepPF(step: Step): StepPF {
  return {
    stepId: step.stepId,
    type: step.type,
    challenge: toChallengePF(step.challenge),
    media: step.media,
    // STRIPPED: hint, requiredLocation, timeLimit, maxAttempts, metadata, timestamps
  };
}

function toQuizPF(quiz: Quiz): QuizPF {
  return {
    title: quiz.title,
    description: quiz.description,
    type: quiz.type,
    options: quiz.options,
    randomizeOrder: quiz.randomizeOrder,
    // STRIPPED: targetId, expectedAnswer, validation
  };
}
```

---

## Hint Control

**Decision:** Hints are controlled via a separate API endpoint (reveal after N attempts)

```typescript
// Hints are NOT included in StepPF
// Player must request hints explicitly

POST /api/play/sessions/:sessionId/hint
Request: { stepIndex: number }
Response: {
  hint: string;
  hintsUsed: number;
  maxHints: number;
}
```

---

## Validation is Server-Side ONLY

**CRITICAL:** The Player app NEVER validates answers locally. All validation goes through the backend.

```
Player App                    Backend
──────────                    ───────
User selects option "B"
        │
        └──► POST /validate { optionId: "B" }
                                    │
                                    ▼
                            Compare with targetId
                            (only backend knows)
                                    │
        ◄───────────────────────────┘
{ correct: true/false, feedback: "..." }
```

This ensures:
- Answers cannot be found in browser DevTools
- No client-side cheating possible
- Server has full control over validation logic

---

## Preview Mode Exception

Preview receives **full data** because:
- It's for the creator, not public players
- Allows showing correct answers for testing
- Sent via postMessage from Editor (trusted source)

```
Production (/play/:huntId)     Preview (/preview)
─────────────────────────      ─────────────────────
StepPF from API                Step from postMessage
Answers stripped               Answers included
Server-side validation         Can show answers
```

---

## Play API Endpoints

```typescript
// 1. START SESSION
POST /api/play/:huntId/start
Request: { playerName: string; email?: string }
Response: {
  sessionId: string;
  hunt: HuntMetaPF;           // Basic hunt info
  currentStepIndex: 0;
  steps: [StepPF, StepPF];    // First 2 steps, NO ANSWERS
}

// 2. GET NEXT STEP (prefetch)
GET /api/play/sessions/:sessionId/step/:index
Response: StepPF              // Only if index <= currentStepIndex + 1

// 3. VALIDATE ANSWER
POST /api/play/sessions/:sessionId/validate
Request: { stepIndex: number; answer: ValidateAnswerRequest }
Response: {
  correct: boolean;
  feedback?: string;
  nextStep?: StepPF;          // If correct, include next
  isComplete?: boolean;       // Hunt finished?
}
```

---

## Type Location (Generated from YAML)

PF types are defined in the same YAML as all other types:

```
packages/shared/openapi/hunthub_models.yaml
├── Step, Quiz, Mission, etc.        # Editor types
└── StepPF, QuizPF, MissionPF, etc.  # Player Format types
```

**Generation:** `npm run generate` produces:
- `types/index.ts` - TypeScript types (both Editor and PF)
- `schemas/gen/index.ts` - Zod schemas (both Editor and PF)

**Usage:**
```typescript
// Backend - transform with validation
import { Step, StepPF, StepPFSchema } from '@hunthub/shared/schemas';

function toStepPF(step: Step): StepPF {
  const stripped = { ... };
  return StepPFSchema.parse(stripped);  // Validate shape
}

// Player app - validate API response
import { StepPFSchema } from '@hunthub/shared/schemas';
const parsed = StepPFSchema.safeParse(apiResponse);
```

This keeps single source of truth and generates everything together.
