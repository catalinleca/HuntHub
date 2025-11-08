# Player API Design & Implementation

**Last updated:** 2025-10-27

**Status:** Design complete, ready for implementation in Week 5-6

---

## 🎯 Overview

Player API enables users to play published hunts. Session-based gameplay with progress tracking, hints, and challenge validation.

**Key Principle:** Same backend, different routes. Same DB models, filtered API responses.

---

## 📋 Design Decisions (ALL CONFIRMED)

### 1. Anonymous Players with Optional Name

**Decision:** localStorage-based sessions + REQUIRED playerName field

```typescript
PlaySession {
  sessionId: string        // UUID for localStorage
  playerName: string       // REQUIRED (can be nickname, not bound to user)
  userId?: string          // Optional if they login
}
```

**Flow:**
1. Player starts hunt → Must provide name
2. sessionId stored in localStorage
3. Can resume on same device
4. Optional: Link to user account later

**Privacy:** Nicknames not bound to users (GDPR-friendly)

**Creator sees:** List of player names actively playing

---

### 2. Publishing with Active Sessions (MVP)

**Decision:** Block publishing if active sessions exist (extendable to force publish in V1.1)

**MVP Implementation (Simple):**
```typescript
async publishHunt(huntId: string): Promise<PublishedHunt> {
  const activeSessions = await PlaySession.count({
    huntId,
    status: 'active'
  });

  if (activeSessions > 0) {
    throw new ValidationError(
      `Cannot publish: ${activeSessions} players are currently playing. ` +
      `Please wait for them to finish.`
    );
  }

  // Proceed with publishing...
}
```

**V1.1 Extension (No modification!):**
```typescript
async publishHunt(huntId: string, options?: PublishOptions): Promise<PublishedHunt> {
  const activeSessions = await PlaySession.count({
    huntId,
    status: 'active'
  });

  if (activeSessions > 0) {
    if (!options?.force) {
      throw new ValidationError(
        `Cannot publish: ${activeSessions} players are currently playing.`,
        { activeSessions, canForce: true }  // UI shows warning modal
      );
    }

    // Force abandon if creator confirms
    await PlaySession.updateMany(
      { huntId, status: 'active' },
      { status: 'abandoned' }
    );
  }

  // Same publishing logic (unchanged)
}
```

**Frontend V1.1 shows warning modal with "Force Publish" option.**

**✅ Open for extension, closed for modification (SOLID-O)**

---

### 3. Session Expiry

**Decision:** 2 days from session start

```typescript
PlaySession {
  expiresAt: Date  // startedAt + 2 days
}

// Validation:
if (session.expiresAt < now) {
  return { error: "Session expired. Please start a new hunt." }
}
```

**Rationale:** Hunts designed to complete in couple of hours, 2 days is generous buffer.

---

### 4. Hints System

**Decision:** 3 hints per step

```typescript
PlaySession {
  hintsUsed: {
    "step-1": 2,  // Used 2 of 3
    "step-2": 0   // Used 0 of 3
  }
}

// Validation:
if (session.hintsUsed[stepId] >= 3) {
  throw new ValidationError("No hints remaining for this step");
}
```

**Rationale:** Generous but not unlimited, per-step allows getting stuck on one without penalizing others.

---

### 5. Attempts/Retries

**Decision:** Unlimited retries for MVP

**Rationale:**
- Simpler (no tracking needed)
- Less frustrating for casual players
- Can add attempt limits in V1.1 if needed

---

### 6. Scoring/Leaderboards

**Decision for MVP:**
- ✅ Track completion time
- ✅ Track hints used
- ❌ No scoring formula (V1.1)
- ❌ No leaderboard (V1.1)

**Completion stats:**
```json
{
  "completed": true,
  "stats": {
    "completedAt": "2025-10-27T15:30:00Z",
    "duration": "45 minutes",
    "hintsUsed": 5,
    "totalSteps": 10
  }
}
```

---

### 7. Challenge Validation

**Decision:** Simple validation rules, no AI for MVP

#### Clue Validation
```typescript
// Player submits location
{ lat: 41.403629, lng: 2.174356 }

// Backend validates GPS proximity:
const distance = calculateDistance(
  submission.location,
  step.requiredLocation
);

if (distance <= step.requiredLocation.radius) {
  return { correct: true };
}
```

#### Quiz Validation
```typescript
// Player submits answer
{ answer: "Gaudí" }

// Backend validates (case-insensitive, trimmed):
const correct = submission.answer.toLowerCase().trim()
  === step.challenge.quiz.target.toLowerCase().trim();

return { correct };
```

#### Mission Validation
```typescript
// Player submits location + photo
{
  location: { lat, lng },
  assetId: "photo-123"
}

// Backend validates:
1. Check location proximity (like clue)
2. Check asset exists and belongs to this session
3. MVP: Auto-approve photo (no AI validation)
4. V1.1: AI validates photo matches description

return { correct: true };
```

#### Task Validation
```typescript
// Player submits text
{ text: "I helped 3 people cross the street" }

// Backend validates:
1. Text not empty
2. Min length met (if configured)
3. MVP: Auto-approve (no AI validation)
4. V1.1: AI validates text makes sense

return { correct: true };
```

---

## 🗄️ Data Models

### NEW: PlaySession Model

```typescript
interface IPlaySession {
  _id: ObjectId;

  // Who's playing
  sessionId: string;           // UUID for localStorage
  playerName: string;          // REQUIRED (nickname allowed)
  userId?: string;             // If they login

  // What they're playing
  huntId: string;              // The hunt ID
  versionId: string;           // Published version ID (locked)

  // Where they are
  currentStepId: string;
  currentStepOrder: number;    // 1, 2, 3...

  // Hints tracking
  hintsUsed: {
    [stepId: string]: number;  // { "step-1": 2, "step-3": 1 }
  };
  maxHintsPerStep: number;     // 3 hints per step

  // Session state
  status: 'active' | 'completed' | 'abandoned' | 'expired';

  // Timestamps
  startedAt: Date;
  lastActivityAt: Date;        // Updated on every action
  completedAt?: Date;
  expiresAt: Date;             // startedAt + 2 days

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
```typescript
PlaySession.index({ sessionId: 1 }, { unique: true });
PlaySession.index({ huntId: 1, status: 1 });  // For counting active sessions
PlaySession.index({ userId: 1 });              // For user's session history
PlaySession.index({ expiresAt: 1 });           // For cleanup cron
```

---

### UPDATED: Progress Model

```typescript
interface IProgress {
  _id: ObjectId;

  // Links
  userId?: string;             // Optional (anonymous players)
  sessionId: string;           // Link to PlaySession
  huntId: string;
  versionId: string;           // ADDED: Lock to version

  // Completed steps
  completedSteps: [
    {
      stepId: string;
      completedAt: Date;
      submission?: any;        // Their answer/photo
      hintsUsed: number;       // How many hints for this step
      attempts: number;        // How many tries (future)
    }
  ];

  // Current state
  currentStepId: string;

  // Timestamps
  startedAt: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Changes from current:**
- Added `versionId` (lock to published version)
- Added `sessionId` (link to PlaySession)
- userId now optional (anonymous players)

---

## 🛣️ API Routes

### 1. Start Hunt

**Endpoint:** `POST /api/play/:huntId/start`

**Request:**
```json
{
  "playerName": "CoolPlayer123"
}
```

**Flow:**
1. Get live version (LiveHunt → versionId)
2. Get published hunt + first step
3. Create PlaySession:
   - sessionId = UUID
   - playerName (required)
   - versionId (locked)
   - currentStepId = first step
   - expiresAt = now + 2 days
   - status = 'active'
4. Create Progress record (linked to session)
5. Filter step response (remove answer)
6. Return session data

**Response:**
```json
{
  "sessionId": "uuid-123",
  "hunt": {
    "name": "Barcelona Adventure",
    "description": "Explore the city"
  },
  "currentStep": {
    "id": "step-1",
    "type": "clue",
    "challenge": {
      "title": "Find the famous basilica",
      "description": "Look for the unfinished masterpiece"
    },
    "order": 1,
    "requiredLocation": {
      "lat": 41.403629,
      "lng": 2.174356,
      "radius": 50
    }
  },
  "progress": {
    "completed": 0,
    "total": 5
  },
  "hintsAvailable": 3,
  "hintsUsed": 0
}
```

**Note:** Answer/hint NOT included in response

---

### 2. Submit Answer

**Endpoint:** `POST /api/play/sessions/:sessionId/submit`

**Request:**
```json
{
  "stepId": "step-1",
  "submission": {
    "answer": "Sagrada Familia"
  }
}
```

**Or for location:**
```json
{
  "stepId": "step-1",
  "submission": {
    "location": {
      "lat": 41.403629,
      "lng": 2.174356
    }
  }
}
```

**Or for mission:**
```json
{
  "stepId": "step-1",
  "submission": {
    "location": { "lat": 41.403629, "lng": 2.174356 },
    "assetId": "photo-123"
  }
}
```

**Flow:**
1. Get PlaySession
2. Validate session not expired
3. Validate it's the current step (prevent skipping)
4. Get step definition
5. Validate submission based on challenge type:
   - Clue: Check location proximity
   - Quiz: Check answer matches target
   - Mission: Check location + asset
   - Task: Validate text submission
6. If correct:
   - Update Progress.completedSteps (add entry)
   - Get next step
   - Update PlaySession.currentStepId
   - Update PlaySession.lastActivityAt
7. If incorrect:
   - Return feedback
8. Filter next step response (remove answer/hint)

**Response (correct):**
```json
{
  "correct": true,
  "feedback": "Great! You found it!",
  "nextStep": {
    "id": "step-2",
    "type": "quiz",
    "challenge": {
      "question": "Who designed this basilica?",
      "distractors": ["Picasso", "Dalí", "Miró", "Gaudí"]
    },
    "order": 2
  },
  "progress": {
    "completed": 1,
    "total": 5
  },
  "hintsAvailable": 3,
  "hintsUsed": 0
}
```

**Response (incorrect):**
```json
{
  "correct": false,
  "feedback": "Not quite. Try again!",
  "hintAvailable": true,
  "hintsRemaining": 3
}
```

**Response (last step completed):**
```json
{
  "correct": true,
  "completed": true,
  "feedback": "Congratulations! Hunt complete!",
  "stats": {
    "completedAt": "2025-10-27T15:30:00Z",
    "duration": "45 minutes",
    "hintsUsed": 5,
    "totalSteps": 5
  }
}
```

---

### 3. Request Hint

**Endpoint:** `POST /api/play/sessions/:sessionId/hint`

**Request:**
```json
{
  "stepId": "step-1"
}
```

**Flow:**
1. Get PlaySession
2. Check hintsUsed[stepId]
3. If < 3:
   - Increment PlaySession.hintsUsed[stepId]
   - Get hint from Step.hint
   - Update lastActivityAt
   - Return hint
4. Else: Return "No hints remaining"

**Response:**
```json
{
  "hint": "Look for the tall building with the cranes",
  "hintsUsed": 1,
  "hintsRemaining": 2
}
```

**Response (no hints left):**
```json
{
  "error": "No hints remaining for this step",
  "hintsUsed": 3,
  "hintsRemaining": 0
}
```

---

### 4. Resume Session

**Endpoint:** `GET /api/play/sessions/:sessionId/resume`

**Flow:**
1. Get PlaySession by sessionId
2. Validate session not expired
3. Get Progress
4. Get current step
5. Filter step response (remove answer/hint)
6. Return current state

**Response:**
```json
{
  "sessionId": "uuid-123",
  "hunt": {
    "name": "Barcelona Adventure",
    "description": "..."
  },
  "currentStep": {
    "id": "step-3",
    "type": "mission",
    "challenge": { "..." }
  },
  "progress": {
    "completed": 2,
    "total": 5
  },
  "hintsUsed": {
    "step-1": 1,
    "step-2": 0,
    "step-3": 2
  },
  "startedAt": "2025-10-27T10:00:00Z",
  "expiresAt": "2025-10-29T10:00:00Z"
}
```

**Response (expired):**
```json
{
  "error": "Session expired",
  "message": "This session expired on 2025-10-29. Please start a new hunt.",
  "canRestart": true
}
```

---

### 5. Get Session Progress

**Endpoint:** `GET /api/play/sessions/:sessionId/progress`

**Flow:**
1. Get PlaySession
2. Get Progress with completedSteps
3. Return progress summary

**Response:**
```json
{
  "progress": {
    "completed": 2,
    "total": 5,
    "percentage": 40
  },
  "completedSteps": [
    {
      "stepId": "step-1",
      "stepTitle": "Find Sagrada Familia",
      "completedAt": "2025-10-27T10:30:00Z",
      "hintsUsed": 1
    },
    {
      "stepId": "step-2",
      "stepTitle": "Quiz about Gaudí",
      "completedAt": "2025-10-27T11:00:00Z",
      "hintsUsed": 0
    }
  ],
  "currentStep": {
    "stepId": "step-3",
    "stepTitle": "Take a photo at Park Güell"
  }
}
```

---

## 🔒 Response Filtering (Security)

**Critical:** Never send answers/hints unless explicitly requested

### Step Response Filtering

```typescript
// services/player.service.ts
filterStepForPlayer(step: IStep): PlayerStepView {
  const filtered: any = {
    id: step.id,
    type: step.type,
    order: step.order,
    requiredLocation: step.requiredLocation,
    challenge: this.filterChallenge(step.challenge)
    // hint: NOT INCLUDED (separate endpoint)
  };

  return filtered;
}

private filterChallenge(challenge: Challenge): PlayerChallengeView {
  switch (challenge.type) {
    case 'quiz':
      return {
        question: challenge.quiz.question,
        distractors: challenge.quiz.distractors
        // target: REMOVED - never sent to player
      };

    case 'clue':
      return {
        title: challenge.clue.title,
        description: challenge.clue.description
        // No answer to remove (location-based)
      };

    case 'mission':
      return {
        title: challenge.mission.title,
        description: challenge.mission.description,
        requiresPhoto: challenge.mission.requiresPhoto,
        requiresVideo: challenge.mission.requiresVideo
        // targetDescription exists but not the validation logic
      };

    case 'task':
      return {
        title: challenge.task.title,
        description: challenge.task.description
        // target stored but not sent
      };
  }
}
```

**Editor API vs Player API:**
```typescript
// Editor API (GET /api/hunts/:id)
Step {
  challenge: {
    quiz: {
      question: "Who designed it?",
      target: "Gaudí",              // ← INCLUDED
      distractors: ["Picasso", ...]
    }
  },
  hint: "Think modernist"           // ← INCLUDED
}

// Player API (GET /api/play/sessions/:id/resume)
Step {
  challenge: {
    quiz: {
      question: "Who designed it?",
      // target: REMOVED
      distractors: ["Picasso", ...]
    }
  }
  // hint: REMOVED (separate endpoint)
}
```

---

## 📊 Example Complete Flow

### Scenario: Player completes 3-step hunt

```
1. START HUNT
   POST /api/play/barcelona-hunt/start
   Body: { playerName: "JohnDoe" }

   → Creates PlaySession (uuid-123)
   → Creates Progress record
   → Returns hunt + step 1 (clue)
   → Frontend stores uuid-123 in localStorage

2. COMPLETE STEP 1 (Clue - Location)
   POST /api/play/sessions/uuid-123/submit
   Body: {
     stepId: "step-1",
     submission: { location: { lat: 41.403, lng: 2.174 } }
   }

   → Validates location proximity
   → Correct! Updates progress
   → Returns step 2 (quiz)

3. WRONG ANSWER ON STEP 2
   POST /api/play/sessions/uuid-123/submit
   Body: {
     stepId: "step-2",
     submission: { answer: "Picasso" }
   }

   → Validates answer (incorrect)
   → Returns { correct: false, feedback: "Try again" }

4. REQUEST HINT
   POST /api/play/sessions/uuid-123/hint
   Body: { stepId: "step-2" }

   → Returns hint
   → Increments hintsUsed["step-2"] = 1

5. CORRECT ANSWER ON STEP 2
   POST /api/play/sessions/uuid-123/submit
   Body: {
     stepId: "step-2",
     submission: { answer: "Gaudí" }
   }

   → Correct! Updates progress
   → Returns step 3 (mission)

6. COMPLETE STEP 3 (Mission - Photo + Location)
   POST /api/play/sessions/uuid-123/submit
   Body: {
     stepId: "step-3",
     submission: {
       location: { lat: 41.414, lng: 2.152 },
       assetId: "photo-456"
     }
   }

   → Validates location + asset exists
   → Last step! Updates session.status = 'completed'
   → Returns completion stats

7. VIEW FINAL STATS
   Response from step 6:
   {
     "completed": true,
     "stats": {
       "completedAt": "2025-10-27T15:30:00Z",
       "duration": "45 minutes",
       "hintsUsed": 1,
       "totalSteps": 3
     }
   }
```

---

## 🔄 State Transitions

### PlaySession Status Flow

```
Start Hunt
    ↓
[active] ──────────────────────┐
    │                           │
    ├─ Submit correct answer ───┤ (stays active)
    ├─ Request hint ────────────┤
    ├─ Submit wrong answer ─────┤
    │                           │
    ├─ Complete last step ──→ [completed]
    │
    ├─ 2 days pass ──────────→ [expired]
    │
    └─ (manual action) ───────→ [abandoned]
```

**Status meanings:**
- `active`: Currently playing
- `completed`: Successfully finished all steps
- `expired`: Exceeded 2-day limit
- `abandoned`: Manually abandoned or creator force-published

---

## 🧹 Cleanup & Maintenance

### Expired Session Cleanup (Cron Job)

```typescript
// Run daily
async function cleanupExpiredSessions() {
  const now = new Date();

  // Mark expired sessions
  await PlaySession.updateMany(
    {
      status: 'active',
      expiresAt: { $lt: now }
    },
    {
      status: 'expired'
    }
  );

  // Optional: Delete old completed/expired sessions after 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await PlaySession.deleteMany({
    status: { $in: ['expired', 'abandoned'] },
    updatedAt: { $lt: thirtyDaysAgo }
  });
}
```

---

## 🎯 Implementation Checklist

### Models
- [ ] Create PlaySession model (new)
- [ ] Update Progress model (add versionId, sessionId, make userId optional)

### Services
- [ ] PlayerService (all gameplay logic)
- [ ] ValidationService (challenge validation by type)
- [ ] ResponseFilterService (remove answers/hints from responses)

### Controllers
- [ ] PlayerController (handle HTTP requests)

### Routes
- [ ] POST /api/play/:huntId/start
- [ ] POST /api/play/sessions/:sessionId/submit
- [ ] POST /api/play/sessions/:sessionId/hint
- [ ] GET /api/play/sessions/:sessionId/resume
- [ ] GET /api/play/sessions/:sessionId/progress

### Middleware
- [ ] Session validation middleware (check expiry, exists)
- [ ] Optional: Rate limiting for submissions (prevent spam)

### Validation
- [ ] Request validation schemas (Zod)
- [ ] Challenge-specific validation logic (clue, quiz, mission, task)

### Publishing Changes
- [ ] Update PublishService: Check active sessions before publishing
- [ ] Add activeSessions count to error response

### Cron Jobs
- [ ] Daily cleanup of expired sessions

### Tests
- [ ] Integration tests for all player endpoints
- [ ] Challenge validation tests
- [ ] Session expiry tests
- [ ] Response filtering tests

---

## 🚀 V1.1 Extensions (Future)

### Planned Enhancements

1. **Force Publish**
   - Add `force` option to publishHunt
   - Show warning modal in UI
   - Abandon active sessions if confirmed

2. **Attempt Limits**
   - Track attempts per step
   - Configurable max attempts
   - "Game over" if limit exceeded

3. **Scoring System**
   - Formula: base score - (hints * 10) - (time penalty)
   - Leaderboard per hunt
   - Global player stats

4. **AI Validation**
   - Mission: Validate photo matches description
   - Task: Validate text submission makes sense
   - Integration with OpenAI Vision API

5. **Player Accounts**
   - Link anonymous sessions to accounts
   - Session history
   - Achievements/badges

6. **Creator Analytics**
   - View active players in real-time
   - Completion rates per step
   - Average completion time
   - Hint usage patterns

---

## 📝 Notes

**Remember:**
- Same backend, different routes (no separate app)
- Same DB models, filtered API responses
- Security: Never send answers/hints unless requested
- SOLID-O: Built for extension (force publish, scoring, AI)
- 2-day session expiry (no exceptions)
- Unlimited retries (MVP simplicity)
- 3 hints per step (generous but finite)

**Dependencies:**
- Must complete Asset Management (Epic 6) before Player API
- Missions require file upload working
- Publishing workflow must handle active session checks

**Timeline:** Week 5-6 implementation (after Assets complete)

---

**Design complete. Ready for implementation.** 🚀
