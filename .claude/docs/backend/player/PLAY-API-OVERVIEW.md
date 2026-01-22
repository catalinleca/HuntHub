# Play API - Implementation Overview

Quick guide to understand what was built and why.

---

## What It Does

Players can now play published hunts via 6 endpoints at `/api/play`.

```
Start hunt → Navigate steps → Submit answers → Get hints → Complete
```

---

## File Structure

```
src/features/play/
├── play.service.ts          ← Business logic (start, validate, hints)
├── play.controller.ts       ← HTTP handlers (req/res)
├── play.routes.ts           ← Route definitions (PUBLIC, no auth)
├── play.validation.ts       ← Zod schemas (from shared)
├── index.ts                 ← Barrel export
└── helpers/
    ├── session-manager.helper.ts    ← Progress CRUD
    ├── step-navigator.helper.ts     ← Step traversal + HATEOAS links
    ├── answer-validator.helper.ts   ← Strategy dispatcher
    └── validators/                  ← One per answer type
        ├── clue.validator.ts
        ├── quiz-choice.validator.ts
        ├── quiz-input.validator.ts
        ├── mission-location.validator.ts
        ├── mission-media.validator.ts
        └── task.validator.ts
```

---

## Key Design Decisions

### 1. Session ID as Auth Token

**Why:** After starting a session, players don't need Firebase auth. The UUID session ID acts as a bearer token.

```typescript
// Start session (optional auth)
POST /api/play/:huntId/start → returns sessionId

// All other calls use sessionId (no auth needed)
GET /api/play/sessions/:sessionId/step/current
```

**Where:** `play.routes.ts:54` - mounted BEFORE authMiddleware in `server.ts:54`

---

### 2. Strategy Pattern for Validators

**Why:** Each challenge type validates differently. Strategy pattern means adding new types doesn't touch existing code.

```typescript
// answer-validator.helper.ts:49-56
private static validators: Record<AnswerType, IAnswerValidator> = {
  [AnswerType.Clue]: ClueValidator,           // Auto-pass
  [AnswerType.QuizChoice]: QuizChoiceValidator, // Match optionId
  [AnswerType.QuizInput]: QuizInputValidator,   // Text compare
  [AnswerType.MissionLocation]: MissionLocationValidator, // GPS distance
  [AnswerType.MissionMedia]: MissionMediaValidator, // Auto-pass (AI later)
  [AnswerType.Task]: TaskValidator,             // Auto-pass (AI later)
};
```

**To add new type:** Create validator file → implement interface → add to registry → done.

---

### 3. HATEOAS Links

**Why:** Frontend doesn't hardcode URLs. Server tells it where to go next.

```typescript
// Response includes navigation links
{
  "step": { ... },
  "_links": {
    "self": { "href": "/api/play/sessions/abc-123/step/current" },
    "next": { "href": "/api/play/sessions/abc-123/step/next" },
    "validate": { "href": "/api/play/sessions/abc-123/validate" }
  }
}
```

**Where:** `step-navigator.helper.ts:90-128`

---

### 4. Transaction Safety

**Why:** Validating an answer updates multiple things (attempts, submission, step advancement). Must be atomic.

```typescript
// play.service.ts:273-319
return withTransaction(async (session) => {
  await SessionManager.incrementAttempts(..., session);
  await SessionManager.recordSubmission(..., session);
  if (isCorrect) {
    await SessionManager.advanceToNextStep(..., session);
  }
});
```

**If any fails:** All rollback. No partial state.

---

### 5. PlayMapper Strips Answers

**Why:** Players shouldn't see correct answers, target locations, or AI instructions.

```typescript
// Quiz → strips targetId, expectedAnswer
// Mission → strips targetLocation, aiInstructions
// Task → strips aiInstructions
```

**Where:** `shared/mappers/play.mapper.ts:92-156`

---

## Data Flow Example

**Player submits quiz answer:**

```
1. POST /api/play/sessions/:sessionId/validate
   └─ play.controller.ts:validateAnswer()

2. Validate request (Zod)
   └─ validateRequest(validateAnswerSchema)

3. Service orchestrates
   └─ play.service.ts:validateAnswer()
       ├─ Get session (SessionManager.requireSession)
       ├─ Get step (StepNavigator.getCurrentStepForSession)
       ├─ Check time/attempts limits
       └─ Validate answer (AnswerValidator.validate)
           └─ QuizChoiceValidator.validate()  ← Strategy pattern

4. Update state in transaction
   ├─ Increment attempts
   ├─ Record submission
   └─ Advance if correct

5. Return response with HATEOAS links
```

---

## Modified Files (Outside /features/play/)

| File | Change |
|------|--------|
| `shared/types/index.ts` | Added `TYPES.PlayService`, `TYPES.PlayController` |
| `config/inversify.ts` | Bound PlayService, PlayController to DI container |
| `server.ts` | Mounted `/api/play` routes (before authMiddleware) |
| `database/types/Progress.ts` | Added `hintsUsed?: number` to IStepProgress |
| `database/models/Progress.ts` | Added hintsUsed field to schema |
| `shared/errors/index.ts` | Exported ConflictError (409) |
| `shared/middlewares/index.ts` | Exported optionalAuthMiddleware |
| `shared/mappers/play.mapper.ts` | New file - transforms Step → StepPF |
| `tests/setup/testServer.ts` | Added play routes for testing |

---

## Response Flags vs HTTP Errors

**Game state outcomes return 200 with flags, not 4xx errors:**

```typescript
// Time expired
{ correct: false, expired: true, _links: {...} }

// Max attempts reached
{ correct: false, exhausted: true, _links: {...} }

// Hunt completed
{ correct: true, isComplete: true, _links: {...} }
```

**Why:** These aren't errors - they're valid game states. Frontend shows different UI based on flags.

---

## Quick Reference

| Endpoint | What it does |
|----------|--------------|
| `POST /api/play/:huntId/start` | Create session, return first steps |
| `GET /api/play/sessions/:id` | Resume session (get status) |
| `GET /api/play/sessions/:id/step/current` | Get current step (no answers) |
| `GET /api/play/sessions/:id/step/next` | Prefetch next step |
| `POST /api/play/sessions/:id/validate` | Submit answer |
| `POST /api/play/sessions/:id/hint` | Request hint (max 1 per step) |

---

## Tests

All existing tests pass (217/217). Play API tests not yet written.

---

## Next Steps (Optional)

1. Move `SessionResponse`/`StepResponse` to shared types (frontend needs them)
2. Write integration tests for Play API
