# Play API - Design Decisions & Rationale

**Created:** 2025-01-14
**Status:** Planning phase, pre-implementation

This document captures the design discussions, trade-offs, and decisions made for the Play API backend implementation.

---

## Architecture Decisions

### 1. Feature Module (Not Module)

**Decision:** Play API is a Feature module under `/src/features/play/`

**Rationale:** Play orchestrates multiple entities:
- Hunt (check if live)
- HuntVersion (get live content)
- Step (challenge data)
- Progress (session tracking)

This matches the pattern used by `publishing` and `sharing` features.

---

### 2. Strategy Pattern for Answer Validators

**Decision:** Use Strategy pattern with separate validator classes per answer type.

**Rationale:**
- Eliminates switch statements
- Each validator independently testable
- Easy to extend for new challenge types
- [Industry best practice](https://dev.to/tak089/typescript-design-patterns-5hei)

**File Structure:**
```
helpers/validators/
├── clue.validator.ts
├── quiz-choice.validator.ts
├── quiz-input.validator.ts
├── mission-location.validator.ts
├── mission-media.validator.ts
└── task.validator.ts
```

**Future Consideration:** When AI validation is added (mission-media, task), validators will need external service dependencies. At that point, consider making them injectable rather than static.

---

### 3. HATEOAS for Step Navigation

**Decision:** Use HATEOAS links for step-to-step navigation.

**Rationale:**
- Frontend already expects `_links.next` to determine `hasNextLink`
- [Loose coupling](https://pradeepl.com/blog/rest/hateoas/) - client doesn't hardcode step URLs
- Natural for step-by-step game flow ("what can I do next?")
- Enables future evolution without breaking clients

**Implementation:**
```typescript
_links: {
  self: { href: `/api/play/sessions/${sessionId}/step/current` },
  next: { href: `/api/play/sessions/${sessionId}/step/next` },  // absent on final step
  validate: { href: `/api/play/sessions/${sessionId}/validate` }
}
```

---

### 4. Session Security - UUID as Bearer Token

**Decision:** Use UUID v4 as session identifier, no additional auth required after session start.

**Rationale:**
- UUID v4 is cryptographically random, unguessable
- Simple mental model: sessionId = "game save file"
- Sufficient for game app with no sensitive data
- [Follows security best practices](https://group107.com/blog/rest-api-security-best-practices/)

**Trade-offs acknowledged:**
- No token rotation (acceptable for game app)
- Anyone with sessionId controls the session (by design)
- No expiry on sessionId itself (TTL only for anonymous Progress documents)

---

### 5. Response Flags vs Error Codes

**Decision:** Use response flags for game state outcomes, not HTTP errors.

**Example:**
```typescript
// Time expired
{ correct: false, expired: true }  // 200 OK

// Max attempts reached
{ correct: false, exhausted: true }  // 200 OK
```

**Rationale:**
- These aren't errors - player didn't do anything wrong
- Cleaner client handling (no try/catch needed)
- Consistent response shape
- Game can continue after these states

**Actual errors use proper HTTP codes:**
- Hunt not found → 404
- Hunt not live → 403
- Invalid request → 400

---

## Data Handling Decisions

### 6. Transaction Safety for Step Transitions

**Decision:** Wrap step advancement in `withTransaction()`.

**Operations that must be atomic:**
1. Record submission in `Progress.steps[].responses`
2. Update `Progress.steps[].attempts`
3. Mark step completed if correct
4. Update `Progress.currentStepId` to next step
5. Create new StepProgress entry for next step

**Implementation pattern:**
```typescript
return withTransaction(async (session) => {
  // All Progress updates happen atomically
});
```

---

### 7. Atomic Attempt Counting

**Decision:** Use MongoDB `$inc` operator for attempt counting.

**Problem:** Race condition if two requests read/write attempts simultaneously.

**Solution:**
```typescript
await ProgressModel.updateOne(
  { sessionId, 'steps.stepId': currentStepId },
  { $inc: { 'steps.$.attempts': 1 } },
  { session }
);
```

`$inc` is atomic at the database level - no lost updates.

---

### 8. StepProgress Initialization

**Decision:** Create StepProgress lazily on first `getCurrentStep` call for that step.

**When:**
- Session start: Create StepProgress for first step with `startedAt: new Date()`
- Step advance: Create StepProgress for next step with `startedAt: new Date()`

**Why not pre-create all:**
- Wasteful if player quits early
- Harder to track accurate startedAt per step

---

### 9. Duration Calculation

**Decision:** Standard wall-clock calculation.

```typescript
// Per step
StepProgress.duration = StepProgress.completedAt - StepProgress.startedAt

// Total hunt
Progress.duration = Progress.completedAt - Progress.startedAt
```

**Calculated:** On completion, not real-time updated.

---

### 10. Duplicate Submissions

**Decision:** Allow duplicates for MVP.

**Scenario:** Network retry, double-click → two submissions recorded.

**Rationale:**
- Simple implementation
- Submission[] array handles multiple entries
- Doesn't affect game correctness (attempts still increment)
- Can add idempotency later if needed

---

## MVP Simplifications

### 11. Hints - Simple for MVP

**Decision:** One hint per step, `maxHints` always 1.

**Current schema:**
```typescript
// Step model
hint?: string;  // Single hint text
```

**Future evolution:**
```typescript
// Later: hints array with progressive reveals
hints?: Array<{ text: string; penalty?: number }>;
```

**MVP implementation:**
- `requestHint` returns `step.hint`
- Track `hintsUsed` in StepProgress (0 or 1)
- `maxHints: 1` always

---

### 12. AI Validation - Auto-Pass for MVP

**Decision:** Mission media and Task types auto-pass in MVP.

**Validators:**
- `mission-media.validator.ts` → Always returns `{ isCorrect: true }`
- `task.validator.ts` → Always returns `{ isCorrect: true }`

**Future:** Replace with AI service calls. When this happens, consider:
- Making validators injectable (not static)
- Adding service dependencies
- Async validation with status polling

---

## Security Decisions

### 13. Data Stripping in PlayMapper

**Critical:** Never expose answer data to players.

**Strip from challenges:**
| Type | Remove |
|------|--------|
| Quiz | `targetId`, `expectedAnswer`, `validation` |
| Mission | `targetLocation`, `aiInstructions`, `aiModel` |
| Task | `aiInstructions`, `aiModel` |

**Implementation:** PlayMapper.toStepPF() handles all stripping.

---

### 14. Only Live Hunts Playable

**Decision:** Return 403 if `hunt.liveVersion === null`.

**Check in:** `PlayService.startSession()` before creating Progress.

---

## Open for Future

1. **Rate limiting** - Add if abuse detected
2. **Hint penalties** - Score reduction for using hints
3. **Leaderboards** - Completion times, scores
4. **AI validation** - Real validation for media/task
5. **Progressive hints** - Multiple hints with increasing specificity
6. **Concurrent session limits** - Limit sessions per player per hunt

---

## Sources

- [Strategy Pattern in TypeScript](https://dev.to/tak089/typescript-design-patterns-5hei)
- [HATEOAS Guide 2025](https://pradeepl.com/blog/rest/hateoas/)
- [REST API Security Best Practices 2025](https://group107.com/blog/rest-api-security-best-practices/)
- [Session Management Best Practices](https://getstream.io/blog/session-management/)
