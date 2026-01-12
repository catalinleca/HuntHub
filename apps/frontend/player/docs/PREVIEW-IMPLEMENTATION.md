# Preview Route Implementation

## Overview

This document explains the technical challenges faced when implementing the `/preview` route and how they were solved using the **Strategy Pattern via React Context**.

---

## The Problem: Tight Coupling

### Before: StepRenderer Was Married to Sessions

```
┌─────────────────────────────────────────────────────────────────┐
│                        StepRenderer                              │
│                                                                  │
│   const { validate, isValidating, ... } = useStepValidation()   │
│                              │                                   │
│                              ▼                                   │
│                    ┌─────────────────┐                          │
│                    │ useValidateAnswer│ ◄── Needs sessionId!    │
│                    │    (mutation)    │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│                             ▼                                    │
│                    POST /api/sessions/:id/validate               │
└─────────────────────────────────────────────────────────────────┘
```

**The Issue:**
- `StepRenderer` directly called `useStepValidation(step.stepId)`
- That hook internally used `useValidateAnswer` mutation
- The mutation required a `sessionId` from the play session
- **Preview has no session** - it receives hunt data via postMessage or loads mock data

### What Preview Needed

```
┌──────────────────────────────────────────────────────────────────┐
│                         Preview Mode                              │
│                                                                   │
│   ┌─────────────┐         ┌─────────────────────────────────┐   │
│   │   Editor    │ ──────► │  Player /preview                │   │
│   │  (iframe)   │ postMsg │  - No session                   │   │
│   └─────────────┘         │  - Has full Step (with answers) │   │
│                           │  - Needs client-side validation │   │
│         OR                └─────────────────────────────────┘   │
│                                                                   │
│   ┌─────────────┐         ┌─────────────────────────────────┐   │
│   │  Standalone │ ──────► │  Player /preview                │   │
│   │    (dev)    │ timeout │  - Loads mock hunt              │   │
│   └─────────────┘         │  - Shows toolbar for navigation │   │
│                           └─────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

---

## The Solution: Strategy Pattern via Context

### The Idea: Same Interface, Different Implementations

Just like how React Router's `useNavigate()` works the same whether you're in BrowserRouter or MemoryRouter, we created a validation context that works the same regardless of the validation source.

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ValidationContext                                │
│                                                                      │
│   interface ValidationContextValue {                                 │
│     validate: (type, payload) => void   // Same signature            │
│     isValidating: boolean               // Same state                │
│     isCorrect: boolean | null           // Same result               │
│     feedback: string | null             // Same feedback             │
│     reset: () => void                   // Same reset                │
│   }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│  ApiValidationProvider  │     │  MockValidationProvider │
│                         │     │                         │
│  - Uses useMutation     │     │  - Client-side check    │
│  - Calls BE endpoint    │     │  - Has full Step data   │
│  - For /play route      │     │  - For /preview route   │
└─────────────────────────┘     └─────────────────────────┘
```

### StepRenderer: Now Decoupled

```tsx
// After: StepRenderer doesn't care WHERE validation comes from
const StepRenderer = ({ step, isLastStep }) => {
  const { validate, isValidating, isCorrect, feedback } = useValidation();
  //      ▲
  //      │ Same hook, different behavior depending on provider

  const handleSubmit = (answerType, payload) => {
    validate(answerType, payload);  // Works for both /play and /preview
  };
};
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PLAYER APP                                  │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                        /play/:huntId                                │ │
│  │                                                                     │ │
│  │   ┌─────────────────────────────────────────────────────────────┐  │ │
│  │   │              ApiValidationProvider                           │  │ │
│  │   │                                                              │  │ │
│  │   │   sessionId ──► useMutation ──► POST /api/sessions/validate  │  │ │
│  │   │                                                              │  │ │
│  │   │   ┌──────────────────────────────────────────────────────┐  │  │ │
│  │   │   │                   StepRenderer                        │  │  │ │
│  │   │   │                                                       │  │  │ │
│  │   │   │   useValidation() ──► validates via API               │  │  │ │
│  │   │   └──────────────────────────────────────────────────────┘  │  │ │
│  │   └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │                          /preview                                   │ │
│  │                                                                     │ │
│  │   ┌─────────────────────────────────────────────────────────────┐  │ │
│  │   │              MockValidationProvider                          │  │ │
│  │   │                                                              │  │ │
│  │   │   step (with answers) ──► checkAnswer() ──► instant result   │  │ │
│  │   │                                                              │  │ │
│  │   │   ┌──────────────────────────────────────────────────────┐  │  │ │
│  │   │   │                   StepRenderer                        │  │  │ │
│  │   │   │                                                       │  │  │ │
│  │   │   │   useValidation() ──► validates client-side           │  │  │ │
│  │   │   └──────────────────────────────────────────────────────┘  │  │ │
│  │   └─────────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Play vs Preview

### /play Route Flow

```
User clicks "Check Answer"
         │
         ▼
┌─────────────────┐
│  StepRenderer   │
│  validate(...)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  ApiValidationProvider  │
│  useMutation.mutate()   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  POST /api/sessions/    │
│       :id/validate      │
│                         │
│  Backend checks answer  │
│  Returns { isCorrect }  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update context state   │
│  isCorrect, feedback    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  StepRenderer re-renders│
│  Shows feedback UI      │
└─────────────────────────┘
```

### /preview Route Flow

```
User clicks "Check Answer"
         │
         ▼
┌─────────────────┐
│  StepRenderer   │
│  validate(...)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  MockValidationProvider │
│  checkAnswer(step, ...) │
│                         │
│  Client-side check:     │
│  step.challenge.quiz    │
│    .targetId === answer │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Update context state   │
│  isCorrect, feedback    │
│                         │
│  Call onValidated()     │
│  (for auto-advance)     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  StepRenderer re-renders│
│  Shows feedback UI      │
└─────────────────────────┘
```

---

## Preview Mode: Standalone vs Embedded

### How Detection Works

```
┌───────────────────────────────────────────────────────────────────────┐
│                         usePreviewMode()                               │
│                                                                        │
│   on mount:                                                            │
│   ┌─────────────────────────────────────────────────────────────────┐ │
│   │                                                                  │ │
│   │   if (window.parent !== window) {                               │ │
│   │     // We're in an iframe!                                      │ │
│   │     window.parent.postMessage({ type: 'PREVIEW_READY' }, '*')   │ │
│   │   }                                                             │ │
│   │                                                                  │ │
│   │   // Listen for messages from parent                            │ │
│   │   window.addEventListener('message', handleMessage)             │ │
│   │                                                                  │ │
│   │   // Fallback: if no message in 500ms, load mock data           │ │
│   │   setTimeout(() => {                                            │ │
│   │     if (!hunt) loadMockHunt()                                   │ │
│   │   }, 500)                                                       │ │
│   │                                                                  │ │
│   └─────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

### Standalone Mode (Developer Testing)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    http://localhost:5174/preview                     │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │  ┌────────────────────────────────────────────────────────┐  │  │
│   │  │  ◄ Prev    Step 2 of 4    Next ►    [Preview Mode]    │  │  │
│   │  └────────────────────────────────────────────────────────┘  │  │
│   │                                                              │  │
│   │  ┌────────────────────────────────────────────────────────┐  │  │
│   │  │                                                        │  │  │
│   │  │                   StepRenderer                         │  │  │
│   │  │                                                        │  │  │
│   │  │              (Shows current step UI)                   │  │  │
│   │  │                                                        │  │  │
│   │  └────────────────────────────────────────────────────────┘  │  │
│   │                                                              │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   Features:                                                          │
│   - Loads mock hunt data automatically                               │
│   - Shows navigation toolbar                                         │
│   - Auto-advances on correct answer                                  │
│   - Perfect for testing Player UI without Editor                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Embedded Mode (Inside Editor)

```
┌─────────────────────────────────────────────────────────────────────┐
│                           EDITOR APP                                 │
│                                                                      │
│   ┌──────────────────────┐    ┌───────────────────────────────────┐ │
│   │                      │    │                                   │ │
│   │    Step Editor       │    │  ┌─────────────────────────────┐ │ │
│   │                      │    │  │     Player /preview         │ │ │
│   │    [Step 1]          │    │  │        (iframe)             │ │ │
│   │    [Step 2] ◄────────┼────┼──│                             │ │ │
│   │    [Step 3]          │    │  │   No toolbar (hidden)       │ │ │
│   │                      │    │  │   Step controlled by        │ │ │
│   │                      │    │  │   parent via postMessage    │ │ │
│   │                      │    │  │                             │ │ │
│   └──────────────────────┘    │  └─────────────────────────────┘ │ │
│                               │                                   │ │
│                               └───────────────────────────────────┘ │
│                                                                      │
│   Communication:                                                     │
│   Editor ──► RENDER_HUNT ──► Player (sends hunt data)               │
│   Editor ──► JUMP_TO_STEP ──► Player (changes step index)           │
│   Player ──► STEP_VALIDATED ──► Editor (reports validation result)  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## PostMessage Protocol

### Editor → Player Messages

```typescript
// Send hunt data to preview
{
  type: 'RENDER_HUNT',
  hunt: Hunt  // Full hunt with steps including answers
}

// Navigate to specific step
{
  type: 'JUMP_TO_STEP',
  stepIndex: number  // 0-based index
}
```

### Player → Editor Messages

```typescript
// Player is ready to receive data
{
  type: 'PREVIEW_READY'
}

// Validation result (so Editor can show feedback)
{
  type: 'STEP_VALIDATED',
  isCorrect: boolean,
  feedback: string
}
```

---

## Security: StepPF (Player Format)

### Why Strip Answers?

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SECURITY MODEL                               │
│                                                                      │
│   Full Step (Backend/Preview has this)                              │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │ {                                                             │ │
│   │   stepId: 1,                                                  │ │
│   │   challenge: {                                                │ │
│   │     quiz: {                                                   │ │
│   │       question: "What color is the sky?",                     │ │
│   │       options: [                                              │ │
│   │         { optionId: "a", text: "Red" },                       │ │
│   │         { optionId: "b", text: "Blue" },  ◄── Correct!        │ │
│   │         { optionId: "c", text: "Green" }                      │ │
│   │       ],                                                      │ │
│   │       targetId: "b",           ◄── ANSWER (sensitive!)        │ │
│   │       expectedAnswer: "blue"   ◄── ANSWER (sensitive!)        │ │
│   │     }                                                         │ │
│   │   }                                                           │ │
│   │ }                                                             │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                          stripAnswers()                              │
│                              │                                       │
│                              ▼                                       │
│                                                                      │
│   StepPF (Player Format - what StepRenderer receives)               │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │ {                                                             │ │
│   │   stepId: 1,                                                  │ │
│   │   challenge: {                                                │ │
│   │     quiz: {                                                   │ │
│   │       question: "What color is the sky?",                     │ │
│   │       options: [                                              │ │
│   │         { optionId: "a", text: "Red" },                       │ │
│   │         { optionId: "b", text: "Blue" },                      │ │
│   │         { optionId: "c", text: "Green" }                      │ │
│   │       ]                                                       │ │
│   │       // NO targetId                                          │ │
│   │       // NO expectedAnswer                                    │ │
│   │     }                                                         │ │
│   │   }                                                           │ │
│   │ }                                                             │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│   StepRenderer never sees answers - can't cheat via DevTools!       │
└─────────────────────────────────────────────────────────────────────┘
```

### How It Works in Preview

```typescript
// PreviewPage.tsx
const PreviewPage = () => {
  const { currentStep } = usePreviewMode();  // Full step with answers

  // Strip answers before passing to UI
  const stepPF = stripAnswers(currentStep);

  return (
    // Provider has full step (for validation)
    <MockValidationProvider step={currentStep} onValidated={handleValidated}>
      {/* Renderer only sees stripped step (no answers) */}
      <StepRenderer step={stepPF} isLastStep={isLastStep} />
    </MockValidationProvider>
  );
};
```

---

## File Structure

```
apps/frontend/player/src/
│
├── context/
│   └── Validation/
│       ├── index.ts                    # Barrel exports
│       ├── types.ts                    # ValidationResult, ValidationContextValue
│       ├── context.ts                  # ValidationContext + useValidation hook
│       ├── ApiValidationProvider.tsx   # For /play (API-based)
│       └── MockValidationProvider.tsx  # For /preview (client-side)
│
├── hooks/
│   └── usePreviewMode.ts               # PostMessage + state management
│
├── utils/
│   ├── checkAnswer.ts                  # Client-side validation logic
│   └── stripAnswers.ts                 # Step → StepPF conversion
│
├── api/
│   └── preview/
│       ├── index.ts
│       └── mockPreviewData.ts          # Mock hunt for standalone mode
│
└── pages/
    ├── PlayPage/
    │   ├── PlayPage.tsx                # Wraps with ApiValidationProvider
    │   └── components/
    │       └── StepRenderer/           # Uses useValidation() (decoupled)
    │
    └── PreviewPage/
        ├── PreviewPage.tsx             # Wraps with MockValidationProvider
        ├── PreviewPage.styles.ts
        └── components/
            └── PreviewToolbar/         # Navigation for standalone mode
```

---

## Key Takeaways

### 1. Strategy Pattern via Context = Dependency Injection for React

```
Same pattern used by:
- React Router (useNavigate works in any router)
- React Query (useQuery works with any QueryClient)
- Theme providers (useTheme works with any theme)

Now we use it for:
- Validation (useValidation works with API or Mock provider)
```

### 2. Separation of Concerns

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   StepRenderer  │     │    Provider     │     │   Validation    │
│                 │     │                 │     │     Logic       │
│  "Show step UI" │ ──► │ "Route request" │ ──► │ "Check answer"  │
│  "Handle input" │     │  "to correct"   │     │                 │
│                 │     │  "destination"  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
     UI Layer              Routing Layer         Business Logic
```

### 3. Future-Proof Design

When Backend Player API is built:
1. Add stateless `/api/validate-preview` endpoint
2. Create `HybridValidationProvider` (try API → fallback to mock)
3. No changes needed to StepRenderer or PreviewPage

---

## Testing Checklist

### Play Mode (/play/:huntId)
- [ ] Loads hunt from API
- [ ] Shows current step
- [ ] Validates via API call
- [ ] Shows correct/incorrect feedback
- [ ] Advances on correct answer

### Preview Mode (/preview) - Standalone
- [ ] Shows "Waiting for hunt data..." briefly
- [ ] Loads mock hunt after 500ms timeout
- [ ] Shows navigation toolbar
- [ ] Prev/Next buttons work
- [ ] Step indicator shows "Step X of Y"
- [ ] Validates client-side (instant)
- [ ] Auto-advances on correct answer

### Preview Mode (/preview) - Embedded (Future)
- [ ] Sends PREVIEW_READY on mount
- [ ] Receives RENDER_HUNT from parent
- [ ] Hides toolbar when embedded
- [ ] Receives JUMP_TO_STEP from parent
- [ ] Sends STEP_VALIDATED to parent

---

## Summary

| Problem | Solution |
|---------|----------|
| StepRenderer coupled to sessions | Strategy Pattern via ValidationContext |
| Preview has no session | MockValidationProvider with full Step data |
| Need same UI for both routes | useValidation() hook works with any provider |
| Answers visible in DevTools | stripAnswers() creates safe StepPF |
| Standalone vs Embedded modes | usePreviewMode() detects via postMessage |

---

## IMPORTANT: Temporary Mock Validation

> **This section documents temporary code that will be removed when BE validation API exists.**

### Current State (Temporary)

Mock validation exists because:
- BE Player API is not implemented yet
- We need preview to work for development/testing

**Temporary files to remove later:**
- `context/Validation/MockValidationProvider.tsx`
- `utils/checkAnswer.ts`
- `utils/stripAnswers.ts` (Player won't need this - BE sends StepPF)
- `api/preview/mockPreviewData.ts`

### Future State (When BE Validation Exists)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FUTURE VALIDATION FLOW                          │
│                                                                     │
│   Option A: Run Everything Together (Preferred)                     │
│   ──────────────────────────────────────────────                   │
│                                                                     │
│   Player ──► POST /api/validate ──► Backend ──► { isCorrect }      │
│                                                                     │
│   - Devs run Player + Backend together                              │
│   - Real validation against real API                                │
│   - Same code path as production                                    │
│                                                                     │
│   Option B: Mock API Response                                       │
│   ────────────────────────────                                     │
│                                                                     │
│   Player ──► POST /api/validate ──► MSW/Mock ──► { isCorrect }     │
│                                                                     │
│   - Override validation response manually                           │
│   - Return SUCCESS or FAILED as needed                              │
│   - For isolated Player testing                                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Cleanup Checklist (When BE is Ready)

- [ ] Remove `MockValidationProvider.tsx`
- [ ] Remove `checkAnswer.ts`
- [ ] Remove `stripAnswers.ts` from Player (BE already sends StepPF)
- [ ] Remove `mockPreviewData.ts`
- [ ] Update `PreviewPage.tsx` to use `ApiValidationProvider`
- [ ] Editor sends StepPF via postMessage (consistency with BE)
- [ ] Add stateless validation endpoint: `POST /api/validate-preview`

### Why Current Approach is Correct (For Now)

```
Current (temporary):
Editor ──► Full Step ──► Player ──► stripAnswers() ──► UI
                              │
                              └──► MockValidationProvider (uses full Step)

Future (production):
Editor ──► StepPF ──► Player ──► UI
                          │
                          └──► ApiValidationProvider ──► BE validation
```

The current approach:
1. **Easy to remove** - MockValidationProvider is isolated, just delete it
2. **Validation interface stays** - useValidation() hook unchanged
3. **StepRenderer unchanged** - Already works with any provider
4. **Clear boundary** - Temporary code is in specific files, easy to find

**DO NOT** try to "future-proof" the mock validation. It's temporary. Keep it simple, delete it later.