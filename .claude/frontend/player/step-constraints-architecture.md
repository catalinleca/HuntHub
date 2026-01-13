# Step Constraints Architecture - Security & Validation

> **Purpose:** Document how hint, timeLimit, and maxAttempts are handled securely between client and server.

---

## Core Principle

**Never trust the client. Server is the source of truth.**

- Client = UX (display countdowns, show attempt counts)
- Server = Enforcement (validate time, track attempts, guard hints)

---

## Constraint Summary

| Field | Sent to Client? | Why | Enforcement |
|-------|-----------------|-----|-------------|
| `hint` | ❌ NO | High cheat risk - visible in DevTools | Server-only via API |
| `timeLimit` | ✅ YES | Low risk - can't extend time | Server validates on submission |
| `maxAttempts` | ✅ YES | Low risk - can't add attempts | Server tracks & validates |

---

## 1. HINT - Server Guarded

**Problem:** If hint is in step payload → user opens DevTools → sees hint → cheats.

**Solution:** Separate API endpoint.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│                                                             │
│  HintSection shows: [ Need a hint? ]                       │
│                           │                                 │
│                     user clicks                             │
│                           ▼                                 │
│  POST /api/play/sessions/:id/hint ─────────────────────────┼──►
│                                                             │
│  ◄────────────────────────────────────────────────────────┼──
│  { hint: "Look under...", hintsUsed: 1, maxHints: 1 }     │
│                                                             │
│  Display hint, button disabled                              │
└─────────────────────────────────────────────────────────────┘

Server tracks:
- hintsUsed: number (per step)
- Can affect scoring (used hint = fewer points)
- Can limit hints (maxHints per step)
```

**API Contract:**
```typescript
// Request
POST /api/play/sessions/:sessionId/hint
{ stepIndex: number }

// Response
{
  hint: string;
  hintsUsed: number;
  maxHints: number;
}
```

---

## 2. TIME LIMIT - Client Display, Server Enforced

**Client needs:** Display countdown for UX
**Server enforces:** Check elapsed time on submission

```
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                              │
│                                                             │
│  On step load, stores:                                     │
│  session.stepProgress[stepIndex] = {                       │
│    startedAt: "2024-01-15T10:00:00Z"  ← timestamp          │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Step response includes: { timeLimit: 120 }
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                                                             │
│  TimeLimit component shows countdown:                       │
│  2:00 → 1:59 → 1:58 → ... (visual only)                   │
│                                                             │
│  Player submits answer at 10:03:00 (3 min later)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ POST /submit { answer: "..." }
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER VALIDATES                         │
│                                                             │
│  now = 10:03:00                                             │
│  startedAt = 10:00:00                                       │
│  elapsed = 180 seconds                                      │
│  timeLimit = 120 seconds                                    │
│                                                             │
│  180 > 120 → ❌ TIME EXPIRED                               │
│                                                             │
│  Return: { correct: false, expired: true }                 │
└─────────────────────────────────────────────────────────────┘
```

**Even if hacker modifies client timer** → server rejects late submissions.

---

## 3. MAX ATTEMPTS - Client Display, Server Enforced

**Client needs:** Display "Attempt 2/3" for UX
**Server enforces:** Track attempts, reject when exhausted

```
Step definition: { maxAttempts: 3 }
Session tracks: stepProgress[stepIndex].attempts = 0

┌────────────────────────────────────────────────────────────┐
│ Attempt 1: Player submits wrong answer                     │
│                                                            │
│ SERVER:                                                    │
│   attempts++ → now 1                                       │
│   return { correct: false, attempts: 1, maxAttempts: 3 }  │
│                                                            │
│ CLIENT: AttemptsCounter shows "1/3"                        │
└────────────────────────────────────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Attempt 2: Wrong again                                     │
│                                                            │
│ SERVER: attempts++ → 2                                     │
│ CLIENT: "2/3"                                              │
└────────────────────────────────────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Attempt 3: Wrong again                                     │
│                                                            │
│ SERVER:                                                    │
│   attempts++ → 3                                           │
│   3 >= maxAttempts → EXHAUSTED                            │
│   return { correct: false, exhausted: true }              │
│                                                            │
│ CLIENT: Shows "No attempts remaining" dialog               │
└────────────────────────────────────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────┐
│ Attempt 4: Hacker tries anyway                             │
│                                                            │
│ SERVER: 3 >= 3 → ❌ REJECTED                              │
└────────────────────────────────────────────────────────────┘
```

**Even if hacker shows "1/3" on client** → server tracks real count.

---

## Data Model Changes Required

### StepPF (Player-Facing Step) - ADD:
```typescript
interface StepPF {
  stepId: number;
  type: ChallengeType;
  challenge: ChallengePF;
  media?: Media;
  // ADD these:
  timeLimit?: number | null;    // For countdown display
  maxAttempts?: number | null;  // For "X/Y" display
  // hint is NOT here - fetched via API
}
```

### Session State (Backend) - Track per step:
```typescript
interface StepProgress {
  startedAt: Date;           // When player loaded this step
  attempts: number;          // Current attempt count
  hintsUsed: number;         // How many hints requested
  completed: boolean;        // Whether step is done
  completedAt?: Date;        // When completed
  expired?: boolean;         // If time ran out
}

interface PlaySession {
  sessionId: string;
  huntId: number;
  huntVersion: number;
  playerId?: string;         // If authenticated
  playerName: string;
  email?: string;
  currentStepIndex: number;
  stepProgress: StepProgress[];  // Per-step tracking
  startedAt: Date;
  completedAt?: Date;
  score?: number;            // For future scoring
}
```

### ValidateAnswerResponse - ADD:
```typescript
interface ValidateAnswerResponse {
  correct: boolean;
  feedback?: string;
  isComplete?: boolean;
  attempts?: number;         // Already exists
  // ADD these:
  maxAttempts?: number;      // So client knows the limit
  expired?: boolean;         // If time ran out
  exhausted?: boolean;       // If attempts exhausted
  _links: ValidateAnswerLinks;
}
```

---

## API Contracts

### GET Step (when advancing)
```typescript
// Response includes constraints for display
{
  step: {
    stepId: 123,
    type: "quiz",
    challenge: {...},
    timeLimit: 120,      // Client shows countdown
    maxAttempts: 3,      // Client shows "0/3"
  },
  // Session info for current progress
  attempts: 0,           // Current attempts on this step
  _links: {...}
}
```

### POST Validate Answer
```typescript
// Request
{ answerType: "quiz-choice", payload: { optionId: "abc" } }

// Response - Wrong answer
{
  correct: false,
  feedback: "Try again!",
  attempts: 2,
  maxAttempts: 3,
  expired: false,
  exhausted: false
}

// Response - Time expired
{
  correct: false,
  expired: true,
  feedback: "Time's up!"
}

// Response - Attempts exhausted
{
  correct: false,
  exhausted: true,
  feedback: "No more attempts"
}
```

### POST Request Hint
```typescript
// Request
POST /api/play/sessions/:sessionId/hint
{ stepIndex: 0 }

// Response
{
  hint: "Look under the old oak tree",
  hintsUsed: 1,
  maxHints: 1
}

// Error - No hint available
{ error: "No hint available for this step" }

// Error - Already used
{ error: "Hint already used", hintsUsed: 1, maxHints: 1 }
```

---

## Frontend Component Behavior

### TimeLimit
```typescript
// Receives from step
<TimeLimit
  seconds={step.timeLimit}     // From StepPF
  onExpire={() => {            // Client-side expiry (UX)
    // Show dialog, but real enforcement is server-side
    // Next submission will be rejected if truly expired
  }}
/>
```

### AttemptsCounter
```typescript
// Receives max from step, current from validation response
<AttemptsCounter
  current={attemptsUsed}       // From last ValidateAnswerResponse
  max={step.maxAttempts}       // From StepPF
  onMaxAttempts={() => {
    // Show dialog, proceed to next step
  }}
/>
```

### HintSection
```typescript
// Does NOT receive hint as prop
// Fetches via API
<HintSection
  sessionId={sessionId}
  stepIndex={currentStepIndex}
  onHintUsed={(hint) => {
    // Display hint
    // Score affected (future)
  }}
/>
```

---

## Implementation Checklist

### OpenAPI / Types (packages/shared)
- [ ] Add `timeLimit` to StepPF
- [ ] Add `maxAttempts` to StepPF
- [ ] Add `expired`, `exhausted`, `maxAttempts` to ValidateAnswerResponse
- [ ] Verify HintResponse has `hint`, `hintsUsed`, `maxHints`

### Backend (when implementing Player API)
- [ ] PlaySession model with `stepProgress` array
- [ ] Track `startedAt` when step is served
- [ ] Track `attempts` on each validation
- [ ] Track `hintsUsed` on hint request
- [ ] Validate time limit on submission
- [ ] Validate attempts on submission
- [ ] Hint endpoint guards hint content

### Frontend (current work)
- [x] TimeLimit component (display + client expiry)
- [x] AttemptsCounter component (display + client exhausted)
- [ ] HintSection - REWORK to call API instead of receiving prop
- [ ] Wire up `attempts` from validation response

---

## Security Guarantees

1. **Hint** - Never sent to client unless explicitly requested via API
2. **Time** - Server tracks `startedAt`, validates on submission
3. **Attempts** - Server tracks count, rejects when exhausted
4. **Scoring** - Server calculates (future), never trust client score

**The client is untrusted. All enforcement happens server-side.**
