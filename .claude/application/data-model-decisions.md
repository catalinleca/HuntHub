# Data Model Decisions & Rationale

**Purpose:** Quick reference for "Why did we design it this way?" questions.

**Last updated:** 2025-10-27

---

## Progress & Submission Model

### **ISubmission Fields**

**Structure:**
```typescript
interface ISubmission {
  timestamp: Date;           // When submitted
  content: unknown;          // User's answer (flexible type)
  isCorrect: boolean;        // Pass/fail validation result

  // Extended fields (added 2025-10-27)
  score?: number;            // AI quality/confidence rating
  feedback?: string;         // Player guidance message
  metadata?: Record<string, any>; // Extensibility escape hatch
}
```

---

#### **Field: `score`**

**What:** Numeric rating (0-1 or 0-10) for response quality

**Why we added it:**
- AI validation returns confidence, not just pass/fail
- Enables leaderboards (rank by quality, not just completion)
- Analytics: Track which responses were best
- Dynamic hints: "Your answer scored 4/10, try adding more detail"

**Examples:**
```typescript
// Photo validation (0-1 confidence)
{
  content: "asset-789",
  isCorrect: true,
  score: 0.85  // AI is 85% confident photo shows target
}

// Task description (0-10 quality)
{
  content: "The building has organic shapes and colorful mosaics...",
  isCorrect: true,
  score: 9.2  // High quality response
}

// Failed attempt
{
  content: "nice building",
  isCorrect: false,
  score: 2.1  // Too vague
}
```

**Future uses:**
- Minimum score thresholds
- Partial credit
- Quality-based scoring systems

---

#### **Field: `feedback`**

**What:** Human-readable message explaining result

**Why we added it:**
- Better UX: Player knows WHY they failed
- Educational: Learn correct information
- Retry guidance: Hints for improvement
- AI-generated explanations

**Examples:**
```typescript
// Photo too blurry
{
  content: "asset-789",
  isCorrect: false,
  feedback: "Photo is too blurry. Try getting closer and holding camera steady."
}

// Quiz close answer (fuzzy match)
{
  content: "Joan Miro",  // Missing accent
  isCorrect: true,
  feedback: "Correct! (Note: The proper spelling is 'Joan Miró' with an accent)"
}

// Task needs more detail
{
  content: "nice building",
  isCorrect: false,
  score: 2,
  feedback: "Too vague. Describe specific architectural features you observe (shapes, colors, materials)."
}

// Success with encouragement
{
  content: "The architecture features flowing organic shapes...",
  isCorrect: true,
  score: 9,
  feedback: "Excellent observation! You clearly studied the details."
}
```

**Without feedback:**
- Player just sees ✅ or ❌ (frustrating!)
- No learning opportunity
- No guidance for retry

**With feedback:**
- Educational experience
- Clear improvement path
- Better engagement

---

#### **Field: `metadata`**

**What:** Flexible key-value storage for unforeseen data

**Why we added it:**
- Can't predict all future needs
- Allows extension without schema migration
- Analytics gold mine
- Safety net for experimentation

**Examples:**
```typescript
// AI matched specific reference image
{
  content: "player-asset-999",
  isCorrect: true,
  metadata: {
    matchedReferenceId: "statue-b",     // Which reference image matched
    aiConfidence: 0.92,
    processingTimeMs: 1200,
    aiModel: "gpt-4-vision-preview"
  }
}

// Location validation details
{
  content: { lat: 41.4145, lng: 2.1527 },
  isCorrect: true,
  metadata: {
    distanceFromTargetMeters: 3.2,
    gpsAccuracyMeters: 5,
    attemptedFromLocation: "Barcelona, Spain"
  }
}

// Future: Team contributions
{
  content: "team-composite-asset",
  isCorrect: true,
  metadata: {
    teamMembers: ["user-1", "user-2", "user-3"],
    individualContributions: {
      "user-1": "asset-a",
      "user-2": "asset-b",
      "user-3": "asset-c"
    }
  }
}

// Future: Multi-attempt tracking
{
  content: "final-answer",
  isCorrect: true,
  metadata: {
    attemptNumber: 3,
    previousAttempts: [
      { answer: "wrong1", score: 2 },
      { answer: "wrong2", score: 5 }
    ],
    hintsUsed: ["hint-1", "hint-2"]
  }
}
```

**Critical for:**
- Analytics (track detailed metrics)
- Debugging (what went wrong?)
- A/B testing (compare AI models)
- Future features (don't know what we'll need!)

---

## Step Ordering Design

### **Why NO `order` field on Step documents?**

**Decision:** Hunt stores `stepOrder: ObjectId[]` array, NOT `Step.order: number`

**Rationale:**

1. **MongoDB preserves array order** (this was a key reason for choosing MongoDB)
2. **Simpler reordering:** Just update array, don't recalculate all order numbers
3. **Avoids "order field hell":** Order field causes problems for non-traversal operations

**Structure:**
```typescript
// Hunt document
{
  _id: "hunt-123",
  name: "Barcelona Adventure",
  stepOrder: ["step-1", "step-2", "step-3"]  // ✅ Ordered array of references
}

// Step documents (separate)
{
  _id: "step-1",
  huntId: "hunt-123",
  type: 'clue',
  // NO order: 1 field ✅
}
```

**Operations:**

**Get steps in order:**
```typescript
const hunt = await Hunt.findById(huntId).populate('stepOrder');
// Steps returned in array order (MongoDB preserves it)
```

**Reorder steps (author editing):**
```typescript
// Old way with order field ❌
// Would need to:
// 1. Update step-1: order = 2
// 2. Update step-2: order = 3
// 3. Update step-3: order = 1
// = 3 database writes!

// Our way ✅
await Hunt.updateOne(
  { _id: huntId },
  { stepOrder: ["step-3", "step-1", "step-2"] }
);
// = 1 database write!
```

**Insert step in middle:**
```typescript
// Add new-step between step-1 and step-2
const newOrder = [
  "step-1",
  "new-step",  // Inserted
  "step-2",
  "step-3"
];
await Hunt.updateOne({ _id: huntId }, { stepOrder: newOrder });
```

**Delete step:**
```typescript
// Remove step-2
await Hunt.updateOne(
  { _id: huntId },
  { $pull: { stepOrder: "step-2" } }
);
// Order automatically preserved!
```

**Why "order field is hell":**
- Reordering: Must update ALL steps (slow, error-prone)
- Insert in middle: Recalculate all subsequent order values
- Delete: Recalculate all subsequent order values
- Gaps in order numbers (step 1, 3, 5 after deletes)
- Race conditions when multiple edits

**Array approach advantages:**
- ✅ One atomic update
- ✅ MongoDB handles ordering
- ✅ No gaps, no recalculation
- ✅ Simple mental model

---

## Embedded vs Referenced Steps

### **Why separate Step documents instead of embedding in Hunt?**

**Decision:** Steps are separate collection, Hunt references them via `stepOrder` array

**Consideration:** Could embed entire step data in Hunt:
```typescript
// Alternative (NOT chosen)
{
  _id: "hunt-123",
  steps: [
    { type: 'clue', challenge: {...} },  // Embedded
    { type: 'quiz', challenge: {...} },
    { type: 'mission', challenge: {...} }
  ]
}
```

**Why we chose separate documents:**

1. **Progress tracking needs step references**
   - Player progress references individual steps
   - Need stable step IDs across hunt versions

2. **Hunt versioning/publishing**
   - Cloning hunt for versioning is cleaner
   - Can track which published version a step belongs to

3. **Flexibility for future features**
   - Steps could be reused across hunts (future)
   - Step-level analytics easier
   - Can query steps independently

4. **MongoDB 16MB document limit**
   - Not a concern now, but allows unlimited steps
   - Hunts can grow without hitting limits

**Trade-off:**
- ❌ Slightly more complex queries (need to fetch steps separately)
- ✅ But we get flexibility and future-proofing

**Note:** Still using array order for sequencing (best of both worlds)

---

## Branching / Tree Structure

### **Decision: NOT in MVP, designed for future extension**

**MVP Scope:**
- ✅ Linear hunts only (Step 1 → 2 → 3)
- ✅ `stepOrder` array defines sequence
- ❌ No branching, no optional paths, no conditionals

**Future (when needed):**

Could add to Step schema:
```typescript
interface IStep {
  // ... existing fields

  // Branching support (future)
  isOptional?: boolean;
  alternativeStepId?: ObjectId;
  nextStepId?: ObjectId;  // Override default next
  conditionalNext?: Record<string, ObjectId>;  // Answer → Next step
}
```

**OR create composite step types:**
```typescript
// New challenge type
enum ChallengeType {
  // ... existing
  Branch = 'branch'  // Decision point
}

interface BranchChallenge {
  question: string;
  paths: Array<{
    label: string;
    nextStepId: ObjectId;
  }>;
}
```

**OR use metadata field:**
```typescript
// Leverage existing metadata field
{
  type: 'quiz',
  challenge: {...},
  metadata: {
    isBranchPoint: true,
    answerPaths: {
      "brave": "step-3a",
      "clever": "step-3b"
    }
  }
}
```

**Philosophy:** Don't over-engineer now. Good base + `metadata` escape hatch = can extend later.

---

## Asset Ownership

### **Why remove `huntId` from Asset model?**

**Decision (2025-10-27):** Assets are user-owned, not hunt-owned

**Before:**
```typescript
{
  id: "asset-1",
  huntId: "barcelona-hunt",  // ❌ Locked to one hunt
  ownerId: "user-123",
  url: "s3://fountain.jpg"
}
```

**After:**
```typescript
{
  id: "asset-1",
  ownerId: "user-123",  // ✅ User's media library
  url: "s3://fountain.jpg",
  usage: [{  // Track where used
    model: 'Step',
    field: 'mission.referenceAssetIds',
    documentId: "step-456"
  }]
}
```

**Why:**
- ✅ Reuse assets across multiple hunts
- ✅ User media library (upload once, use many times)
- ✅ Deleting hunt doesn't delete user's photos
- ✅ Simpler management

**Asset types:**
1. **Author's reference assets:** Used in `mission.referenceAssetIds`
2. **Player's response assets:** Uploaded during gameplay, stored in `Progress.responses`

---

## Challenge Type Strategy

### **Why 4 types defined but only 3 implemented in MVP?**

**Types:**
1. **Clue** - ✅ Implemented (informational, auto-pass)
2. **Quiz** - ✅ Implemented (validated Q&A)
3. **Mission** - ✅ Implemented (photo/location)
4. **Task** - ⏸️ Schema only (reserved for AI validation)

**Why Task exists but isn't implemented:**
- Open/Closed Principle (SOLID-O)
- Schema ready for AI feature
- Can add later without modifying existing types
- No harm having it in enum now

**Task future use:**
- AI validates open-ended responses
- Example: "Describe the architecture you see"
- AI checks understanding vs memorization

**See:** `.claude/application/challenge-types-guide.md` for full details

---

## Metadata Placement

### **Why metadata at Step level only?**

**Decision:** `Step.metadata`, NOT `Challenge.metadata`

**Rationale:**
- Applies to all challenge types uniformly
- Step is the natural "entity" level
- Simpler schema (one metadata field location)
- Challenge data should be type-specific only

**Usage:**
```typescript
{
  huntId: "...",
  type: 'mission',
  challenge: { mission: {...} },  // Type-specific data
  metadata: {                      // ✅ Generic extensibility
    authorNotes: "This is the climax step",
    difficulty: 8,
    estimatedTimeMinutes: 10,
    tags: ["photo", "landmark", "gaudí"]
  }
}
```

---

## Future Extension Points

**Where we can extend WITHOUT breaking changes:**

1. **ISubmission.metadata** - Store any response data
2. **Step.metadata** - Store any step data
3. **Quiz.validation** - Add validation modes
4. **Mission.type** - Add new mission types
5. **ChallengeType enum** - Add new types (already have Task ready)
6. **Asset.mimeType** - Add new formats (3D models, AR, etc.)

**Design principle:** Good base + escape hatches > perfect schema

---

**End of Data Model Decisions**