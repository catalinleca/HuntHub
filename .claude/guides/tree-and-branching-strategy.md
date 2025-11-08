# Tree & Branching Strategy

**Last updated:** 2025-10-27

**Status:** Tree VIEW in progress, Branching reserved for future

## The Two "Trees" 🌳

It's crucial to distinguish between two different concepts:

### 1. Tree VIEW (Editor Visualization) - **NOW**
**Frontend-only feature. No model changes needed.**

Visual representation in the editor showing hunt steps in a tree structure with lazy loading.

```
Editor UI shows:
📍 Start Location: Plaça Catalunya
  ├─ 🧩 Step 1: Sagrada Familia (Clue)
  ├─ 🧩 Step 2: Park Güell (Quiz)
  ├─ 🧩 Step 3: Casa Batlló (Mission)
  └─ 🧩 Step 4: La Rambla (Task)
```

**Purpose:**
- Better UX for hunt creators
- Visual overview of hunt structure
- Easy navigation between steps
- Drag-and-drop reordering (future)

**Technical Implementation:** API endpoints with lazy loading (see below)

---

### 2. Tree STRUCTURE (Gameplay Branching) - **FUTURE (V1.1+)**
**Requires model extensions. Complex feature.**

Conditional paths where players take different routes based on their choices or answers.

```
Gameplay example:
Step 1 → Step 2 (Quiz: "Take easy or hard path?")
           ├─ Answer "Easy" → Step 3a (Simple clue)
           └─ Answer "Hard" → Step 3b (Complex puzzle)
```

**Purpose:**
- Multiple story paths
- Difficulty options
- Replayability
- Adaptive difficulty

**Technical Implementation:** Use `Step.metadata` field (see below)

---

## Decision: MVP = Tree VIEW Only

**Rationale:**
- Tree VIEW is straightforward (API + frontend component)
- Branching is complex (editor UI for connections, validation logic, progress tracking)
- Current model is **already designed** to support branching later via `metadata` field
- No breaking changes needed when adding branching

**Timeline:**
- **Now (MVP):** Tree VIEW with lazy loading API
- **V1.1+:** Gameplay branching when ready

---

## Tree VIEW Implementation (MVP)

### API Design - Lazy Loading Pattern ✅

**Principle:** Progressive disclosure - load only what's needed, when needed.

```typescript
// 1. GET /hunts - Compact list for sidebar
Response: {
  hunts: [
    {
      id: "hunt-1",
      name: "Barcelona Adventure",
      status: "draft",
      stepCount: 14,
      updatedAt: "2025-10-27T..."
    }
  ]
}

// 2. GET /hunts/:id/tree - Compact step list for tree visualization
Response: {
  id: "hunt-1",
  name: "Barcelona Adventure",
  status: "draft",
  steps: [
    { id: "step-1", type: "clue", title: "Find Sagrada Familia", order: 1 },
    { id: "step-2", type: "quiz", title: "Who designed it?", order: 2 },
    { id: "step-3", type: "mission", title: "Take a photo", order: 3 }
  ]
}

// 3. GET /steps/:id - Full step details when clicked
Response: {
  id: "step-1",
  huntId: "hunt-1",
  type: "clue",
  challenge: {
    clue: {
      title: "The Unfinished Masterpiece",
      description: "Look for the building with towers reaching toward heaven..."
    }
  },
  hint: "Look for the Nativity Façade",
  requiredLocation: { lat: 41.4036, lng: 2.1744, radius: 50 },
  timeLimit: 600,
  maxAttempts: 3,
  metadata: {},
  createdAt: "...",
  updatedAt: "..."
}
```

**Why This Design:**
- ✅ **Network efficient** - Don't transfer full challenge data until needed
- ✅ **Fast tree rendering** - Only IDs, types, titles
- ✅ **Scalable** - Works with 100+ steps
- ✅ **Mobile-friendly** - Minimal data transfer
- ✅ **Caching-friendly** - Can cache step list separately from details

**Usage Pattern:**
1. User opens hunt editor
2. Load compact step list → Render tree
3. User clicks step → Load full details → Show edit form

---

### Frontend Implementation

**Component structure:**
```
HuntEditor
  ├─ HuntTree (shows compact list)
  │   └─ StepTreeNode (id, type, title only)
  │       └─ onClick → loadStepDetails()
  └─ StepEditor (shows full details form)
```

**State management:**
```typescript
// Compact list (loaded once)
const [steps, setSteps] = useState<StepTreeNode[]>([]);

// Full details (loaded on demand)
const [selectedStep, setSelectedStep] = useState<Step | null>(null);

// Click handler
const handleStepClick = async (stepId: string) => {
  const fullStep = await api.getStep(stepId);
  setSelectedStep(fullStep);
};
```

---

## Branching Implementation (Future V1.1+)

### Model Extensions - Using Metadata Field ✅

**No schema migration needed!** Use existing `Step.metadata` field.

```typescript
// Linear step (current - MVP)
{
  id: "step-2",
  type: "quiz",
  challenge: { quiz: {...} },
  metadata: {}  // Empty
}

// Branching step (future - V1.1+)
{
  id: "step-2",
  type: "quiz",
  challenge: {
    quiz: {
      title: "Choose your path",
      target: "easy",
      distractors: [{ id: "hard", text: "Take the hard path" }]
    }
  },
  metadata: {
    // ✅ Branching config (future feature)
    isBranchPoint: true,
    branches: {
      "easy": "step-3a",    // If answer "easy" → go to step-3a
      "hard": "step-3b"     // If answer "hard" → go to step-3b
    },
    defaultNext: "step-3a"  // Fallback if no match
  }
}
```

**Why This Works:**
- ✅ No breaking changes to existing hunts (they have `metadata: {}`)
- ✅ MongoDB flexible schema (can add fields anytime)
- ✅ `IStep.metadata?: Record<string, any>` already defined
- ✅ Editor can show/hide branching UI based on `metadata.isBranchPoint`

---

### Progress Tracking With Branches

**Current `ISubmission` already supports this!**

```typescript
{
  timestamp: Date,
  content: "easy",  // User's answer
  isCorrect: true,
  metadata: {
    branchTaken: "step-3a",  // ✅ Track which path player took
    branchPoint: "step-2"
  }
}
```

**Progress query:**
```typescript
// Get player's path through hunt
const playerPath = progress.steps
  .filter(s => s.completed)
  .map(s => ({
    stepId: s.stepId,
    branchTaken: s.responses[0]?.metadata?.branchTaken
  }));

// Result: ["step-1", "step-2", "step-3a", "step-5", ...]
```

---

### Backend Logic (When Implementing Branches)

```typescript
// POST /play/:huntId/steps/:stepId/complete
async submitStepCompletion(req, res) {
  const { stepId, answer } = req.body;
  const step = await Step.findById(stepId);

  // Validate answer
  const isCorrect = validateAnswer(step, answer);

  // Determine next step
  let nextStepId;
  if (step.metadata?.isBranchPoint && isCorrect) {
    // ✅ Use branching logic
    nextStepId = step.metadata.branches[answer] || step.metadata.defaultNext;
  } else {
    // ✅ Use default linear progression
    const hunt = await Hunt.findById(step.huntId);
    const currentIndex = hunt.stepOrder.indexOf(stepId);
    nextStepId = hunt.stepOrder[currentIndex + 1];
  }

  return res.json({
    isCorrect,
    nextStepId,
    completed: !nextStepId  // Hunt complete if no next step
  });
}
```

---

### Editor UI for Branching (Future)

**Visual branch editor:**
```
┌─────────────────────────────────────────┐
│ Step 2: Choose your path (Quiz)        │
│                                         │
│ ☑ Enable branching                     │
│                                         │
│ Branches:                               │
│   Answer "easy" → Step 3a              │
│   Answer "hard" → Step 3b              │
│   Default → Step 3a                    │
│                                         │
│ [Add Branch] [Remove Branching]        │
└─────────────────────────────────────────┘
```

**Or visual flow editor:**
```
  [Step 1]
      ↓
  [Step 2] ← Click to add branches
    ↙   ↘
[Step 3a] [Step 3b]
    ↘   ↙
  [Step 4]
```

---

## Why Current Model Supports Branching

### 1. Metadata Escape Hatch ✅
**From `data-model-decisions.md` (documented 2025-10-27):**

> **Field: `metadata`**
>
> **What:** Flexible key-value storage for unforeseen data
>
> **Why we added it:**
> - Can't predict all future needs
> - Allows extension without schema migration
> - Safety net for experimentation
>
> **Example: Branching**
> ```typescript
> metadata: {
>   isBranchPoint: true,
>   answerPaths: { "brave": "step-3a", "clever": "step-3b" }
> }
> ```

**This was designed for exactly this use case!**

---

### 2. Separate Step Collection ✅
- Not embedded → Can add optional fields
- Can add `nextStepId?: ObjectId` without breaking existing steps
- MongoDB → No strict schema enforcement

---

### 3. Progress Already Tracks Paths ✅
```typescript
ISubmission {
  content: unknown;  // ✅ Can be answer that determines branch
  metadata?: Record<string, any>;  // ✅ Can store branchTaken
}
```

---

### 4. stepOrder Array Flexible ✅
```typescript
// Linear hunt (now):
stepOrder: ["step-1", "step-2", "step-3", "step-4"]

// Branched hunt (later):
stepOrder: ["step-1", "step-2", "step-3a", "step-3b", "step-4"]
// All steps exist, player only follows their path
```

---

## Implementation Phases

### Phase 1: MVP (Now) - Tree VIEW
**Estimated: 1 week**

**Backend:**
- [ ] Create `GET /hunts/:id/tree` endpoint (compact step list)
- [ ] Update `GET /hunts` to include `stepCount`
- [ ] Ensure `GET /steps/:id` returns full details
- [ ] Add indexes for performance

**Frontend:**
- [ ] HuntTree component (visual tree from compact data)
- [ ] Lazy load step details on click
- [ ] Tree node styling (icons per challenge type)
- [ ] Loading states

**Testing:**
- [ ] API returns correct compact data
- [ ] Full details load on click
- [ ] Performance with 50+ steps

---

### Phase 2: V1.1 (Future) - Gameplay Branching
**Estimated: 2-3 weeks**

**Backend:**
- [ ] Update player API to read `metadata.branches`
- [ ] Logic to determine next step based on answer
- [ ] Progress tracking for branch paths
- [ ] Validation for branch consistency

**Frontend - Editor:**
- [ ] Branch editor UI (enable/disable branching)
- [ ] Define branch rules per step
- [ ] Visual flow editor (nice to have)
- [ ] Validation warnings (unreachable steps, etc.)

**Frontend - Player:**
- [ ] Handle branched next step
- [ ] Show player their path (optional)
- [ ] "Replay with different choices" feature

**Testing:**
- [ ] All branch paths reachable
- [ ] Progress tracks correctly
- [ ] Edge cases (loops, unreachable steps)

---

### Phase 3: V1.2+ (Optional) - Advanced Features
**Future considerations:**

- [ ] Optional steps (player can skip)
- [ ] Multiple paths converge to same step
- [ ] Conditional unlocks (e.g., "unlock if score > 80%")
- [ ] Time-based branches (different paths based on time of day)
- [ ] Loop detection and warnings

---

## Design Philosophy

**From `data-model-decisions.md`:**

> **Philosophy:** Don't over-engineer now. Good base + metadata escape hatch = can extend later.

**Applied to tree & branching:**
1. ✅ Build solid foundation (tree VIEW API)
2. ✅ Design for extension (metadata field ready)
3. ✅ No premature optimization (branching when needed)
4. ✅ No breaking changes (existing hunts work)

**User quote (2025-10-27):**
> "Let's pray to God we get there because that means we got into a pretty advanced state of the application and I believe that our current model is flexible enough to be able to withstand complicated features like branching."

**Answer:** Yes, the model is flexible enough. The metadata field was designed for exactly this! 🎉

---

## Key Takeaways

**For MVP (Now):**
1. Implement tree VIEW (visualization + lazy loading)
2. API design is production-quality
3. No model changes needed

**For Future (V1.1+):**
1. Use `metadata` field for branching config
2. No schema migrations needed
3. Existing hunts work unchanged
4. Can add branching incrementally

**Documentation:**
- Tree VIEW: This document + API endpoints in `backend/current-state.md`
- Branching: Reserved in `metadata` field, documented in `data-model-decisions.md`

---

**Next Steps:** See `backend/current-state.md` for tree API implementation tasks.
