# Player App Architecture

This document explains everything implemented in the Player app. Read this from top to bottom - each section builds on the previous one.

---

## Table of Contents

1. [What Does the Player Do?](#1-what-does-the-player-do)
2. [The Big Picture](#2-the-big-picture)
3. [Data Flow Diagram](#3-data-flow-diagram)
4. [Key Concepts](#4-key-concepts)
5. [Session Management](#5-session-management)
6. [HATEOAS Navigation](#6-hateoas-navigation)
7. [Validation Flow](#7-validation-flow)
8. [File Structure](#8-file-structure)
9. [Code Walkthrough](#9-code-walkthrough)
10. [Example: Complete Play Session](#10-example-complete-play-session)

---

## 1. What Does the Player Do?

The Player app lets users play treasure hunts. A hunt is a sequence of steps (challenges). The player:

1. Scans a QR code or opens a link (e.g., `/play/123`)
2. Enters their name
3. Sees the first step (a clue, quiz, etc.)
4. Completes each step to advance
5. Finishes the hunt

**Example Hunt:**
```
Step 1: Clue    → "Find the fountain in the main square"
Step 2: Quiz    → "When was this fountain built?" (Multiple choice)
Step 3: Quiz    → "Enter the code on the plaque" (Text input)
Step 4: Clue    → "Congratulations! You finished!"
```

---

## 2. The Big Picture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              PLAYER APP                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐    ┌─────────────────────────────────────────────────┐ │
│  │  PlayPage   │───▶│              PlaySessionProvider                │ │
│  └─────────────┘    │  (React Context - holds all session state)      │ │
│                     └─────────────────────────────────────────────────┘ │
│                                       │                                  │
│                     ┌─────────────────┼─────────────────┐               │
│                     ▼                 ▼                 ▼               │
│              ┌───────────┐    ┌─────────────┐    ┌───────────┐         │
│              │ Session   │    │    Step     │    │ Validation│         │
│              │  Layer    │    │   Layer     │    │   Hook    │         │
│              └───────────┘    └─────────────┘    └───────────┘         │
│                    │                │                  │                │
│                    ▼                ▼                  ▼                │
│              ┌─────────────────────────────────────────────────┐       │
│              │              React Query Cache                   │       │
│              │  (stores session data, current step, next step)  │       │
│              └─────────────────────────────────────────────────┘       │
│                                       │                                  │
│                                       ▼                                  │
│              ┌─────────────────────────────────────────────────┐       │
│              │                Mock API Layer                    │       │
│              │    (simulates backend - will be real API later)  │       │
│              └─────────────────────────────────────────────────┘       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Diagram

### Starting a Hunt

```
User visits /play/123
        │
        ▼
┌───────────────────┐
│ Check localStorage│  "Do we have a saved session for hunt 123?"
│ for sessionId     │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Found    Not Found
    │         │
    ▼         ▼
┌──────────┐  ┌──────────────────┐
│ Try to   │  │ Show Player      │
│ resume   │  │ Identification   │
│ session  │  │ Form             │
└────┬─────┘  └────────┬─────────┘
     │                 │
     ▼                 ▼
┌──────────┐     ┌──────────────┐
│ Session  │     │ User submits │
│ found?   │     │ name         │
└────┬─────┘     └──────┬───────┘
     │                  │
   Yes/No               ▼
     │           ┌──────────────┐
     │           │ POST /start  │
     │           │ Create new   │
     │           │ session      │
     │           └──────┬───────┘
     │                  │
     └────────┬─────────┘
              │
              ▼
     ┌────────────────┐
     │ Session Ready  │
     │ Fetch current  │
     │ step           │
     └────────────────┘
```

### Playing Through Steps

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STEP LIFECYCLE                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. FETCH CURRENT STEP                                              │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │ GET /sessions/{sessionId}/step/current                        │  │
│   │                                                               │  │
│   │ Response:                                                     │  │
│   │ {                                                             │  │
│   │   "step": { stepId: 1, type: "clue", challenge: {...} },     │  │
│   │   "_links": {                                                 │  │
│   │     "self": { "href": "/sessions/abc/step/current" },        │  │
│   │     "next": { "href": "/sessions/abc/step/next" },  ◀─────┐  │  │
│   │     "validate": { "href": "/sessions/abc/validate" }      │  │  │
│   │   }                                                       │  │  │
│   │ }                                                         │  │  │
│   └───────────────────────────────────────────────────────────┘  │  │
│                                                                  │  │
│   2. PREFETCH NEXT STEP (if "next" link exists)                 │  │
│   ┌──────────────────────────────────────────────────────────┐  │  │
│   │ GET /sessions/{sessionId}/step/next     ◀────────────────┘  │  │
│   │                                                             │  │
│   │ Cached with staleTime: Infinity                             │  │
│   │ (steps don't change during a session)                       │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   3. USER SUBMITS ANSWER                                             │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │ POST /sessions/{sessionId}/validate                          │  │
│   │                                                               │  │
│   │ Request: { answerType: "clue", payload: { clue: {} } }       │  │
│   │                                                               │  │
│   │ Response (correct):                                           │  │
│   │ {                                                             │  │
│   │   "correct": true,                                           │  │
│   │   "feedback": "Correct! Well done.",                         │  │
│   │   "_links": {                                                 │  │
│   │     "currentStep": { "href": "/sessions/abc/step/current" }, │  │
│   │     "nextStep": { "href": "/sessions/abc/step/next" }        │  │
│   │   }                                                           │  │
│   │ }                                                             │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│   4. CACHE INVALIDATION (on correct answer)                          │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │ - Invalidate session cache (refetch currentStepIndex)        │  │
│   │ - Invalidate currentStep cache (now shows next step)         │  │
│   │ - Invalidate nextStep cache (need to fetch new next)         │  │
│   │                                                               │  │
│   │ Result: UI instantly shows next step (was prefetched!)       │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Concepts

### 4.1 Version Lock

When a player starts a hunt, their session "locks" to the current version of that hunt.

```
Timeline:
─────────────────────────────────────────────────────────────────────▶

  Creator publishes      Player starts       Creator publishes
  Hunt v2                Hunt (locks to v2)  Hunt v3
      │                        │                   │
      ▼                        ▼                   ▼
  ════════════════════════════════════════════════════════════════════

                         Player continues playing
                         STILL SEES v2 content ✓
                         (not affected by v3)
```

**Why?** If the creator changes the hunt while someone is playing, the player shouldn't suddenly see different steps or have their progress broken.

**How?** The session response includes the hunt metadata (name, totalSteps, etc.) from the version that was live when they started. This is denormalized for efficiency - one request gets everything.

### 4.2 HATEOAS (Hypermedia as the Engine of Application State)

Instead of the client knowing "to get step 2, call `/steps/2`", the server tells the client what it can do next.

**Without HATEOAS:**
```javascript
// Client hardcodes the logic
const nextStepUrl = `/steps/${currentStepIndex + 1}`;
```

**With HATEOAS:**
```javascript
// Server provides the links
const response = {
  step: { ... },
  _links: {
    next: { href: "/sessions/abc/step/next" },  // Server says "here's next"
    validate: { href: "/sessions/abc/validate" }
  }
};

// Client just follows the links
if (response._links.next) {
  prefetch(response._links.next.href);
}
```

**Benefits:**
- Client doesn't need to know step indices
- Server controls navigation logic
- Last step simply has no "next" link
- API can evolve without breaking clients

### 4.3 Session Storage (localStorage)

When a player starts a hunt, we save their sessionId to localStorage:

```
localStorage:
┌─────────────────────────────────────┐
│ hunthub_session_123 = "session_abc" │  ← hunt 123, session abc
│ hunthub_session_456 = "session_xyz" │  ← hunt 456, session xyz
└─────────────────────────────────────┘
```

**Why?** If the player closes the tab and comes back, they can resume where they left off.

**Edge case:** What if the session expired on the server but is still in localStorage?
```
localStorage says: "You have session abc"
Server says: "Session abc doesn't exist"
→ Clear localStorage, show identification form
```

This is handled by `useClearInvalidSession`.

---

## 5. Session Management

### The Session Layer

```typescript
// useSessionLayer.ts - handles all session concerns

export const useSessionLayer = (huntId: number) => {
  // 1. Check localStorage for saved session
  const savedSessionId = sessionStorage.get(huntId);

  // 2. Try to get existing session from server
  const sessionQuery = useGetSession(huntId, savedSessionId);

  // 3. Mutation to start new session
  const startMutation = useStartSession(huntId);

  // 4. Clear invalid sessions (localStorage cleanup)
  useClearInvalidSession({...});

  // 5. Action to start new session
  const startSession = (playerName, email) => {
    startMutation.mutate({ playerName, email }, {
      onSuccess: (data) => {
        sessionStorage.set(huntId, data.sessionId);  // Save to localStorage
      }
    });
  };

  return {
    session,
    sessionId,
    huntMeta,
    currentStepIndex,
    startSession,
    isLoading,
    error,
  };
};
```

### Session Data Shape

```typescript
// What the server returns when starting/resuming a session
interface StartSessionResponse {
  sessionId: string;           // "session_123_1699999999"
  hunt: {
    huntId: number;            // 123
    name: string;              // "City Explorer"
    description: string;
    totalSteps: number;        // 4
    coverImage?: string;
  };
  currentStepIndex: number;    // 0 (first step)
  steps: StepPF[];             // First 2 steps (for initial cache)
}
```

---

## 6. HATEOAS Navigation

### The Step Layer

```typescript
// useStepLayer.ts - handles step fetching with HATEOAS

export const useStepLayer = (sessionId: string | null) => {
  // 1. Fetch current step (includes _links)
  const stepQuery = useCurrentStep(sessionId);
  const stepResponse = stepQuery.data;

  // 2. Check if there's a "next" link
  const hasNextLink = !!stepResponse?._links.next;

  // 3. Prefetch next step (only if link exists)
  usePrefetchNextStep(sessionId, hasNextLink);

  return {
    currentStep: stepResponse?.step ?? null,
    hasNextLink,
    isLoading,
    error,
  };
};
```

### Step Response Shape

```typescript
// What GET /step/current returns
interface StepResponse {
  step: {
    stepId: number;
    type: "clue" | "quiz" | "mission" | "task";
    challenge: {
      clue?: { title: string; description: string };
      quiz?: { title: string; options?: [...]; type: "choice" | "input" };
      // etc.
    };
  };
  _links: {
    self: { href: string };
    next?: { href: string };     // Not present on last step!
    validate: { href: string };
  };
}
```

### How isLastStep Works

```typescript
// In useSessionLogic.ts
const isLastStep = hasSession && !stepLayer.hasNextLink && stepLayer.currentStep !== null;
```

No "next" link means we're on the last step. The server decides this, not the client.

```
Step 1 response:  _links: { next: {...}, validate: {...} }  → Not last step
Step 2 response:  _links: { next: {...}, validate: {...} }  → Not last step
Step 3 response:  _links: { next: {...}, validate: {...} }  → Not last step
Step 4 response:  _links: { validate: {...} }               → Last step (no "next")
```

---

## 7. Validation Flow

### The Validation Hook

```typescript
// useStepValidation.ts - handles answer submission

export const useStepValidation = (stepId: number) => {
  const { sessionId, huntMeta } = usePlaySession();
  const validateMutation = useValidateAnswer(huntMeta.huntId);
  const [state, setState] = useState({ isCorrect: null, feedback: null });

  // Reset when step changes
  useEffect(() => {
    setState({ isCorrect: null, feedback: null });
  }, [stepId]);

  const validate = (answerType, payload) => {
    validateMutation.mutate(
      { sessionId, answerType, payload },
      {
        onSuccess: (data) => {
          setState({
            isCorrect: data.correct,
            feedback: data.feedback,
          });
        },
      }
    );
  };

  return { validate, isValidating, isCorrect, feedback };
};
```

### Answer Types

```typescript
// Three ways to answer
type AnswerType = "clue" | "quiz-choice" | "quiz-input";

// Clue: Just acknowledge
{ answerType: "clue", payload: { clue: {} } }

// Quiz (multiple choice): Select an option
{ answerType: "quiz-choice", payload: { quizChoice: { optionId: "b" } } }

// Quiz (text input): Type an answer
{ answerType: "quiz-input", payload: { quizInput: { answer: "EXPLORE2024" } } }
```

### Cache Invalidation on Correct Answer

```typescript
// useValidateAnswer.ts
onSuccess: (data, variables) => {
  if (data.correct) {
    // 1. Refetch session (updates currentStepIndex for progress display)
    queryClient.invalidateQueries({ queryKey: playKeys.session(huntId) });

    // 2. Refetch current step (now returns the NEXT step)
    queryClient.invalidateQueries({ queryKey: playKeys.currentStep(sessionId) });

    // 3. Refetch next step (need to prefetch the NEW next)
    queryClient.invalidateQueries({ queryKey: playKeys.nextStep(sessionId) });
  }
}
```

**Result:** After a correct answer, the UI instantly shows the next step because it was already prefetched!

---

## 8. File Structure

```
apps/frontend/player/src/
│
├── api/
│   └── play/
│       ├── keys.ts              # React Query cache keys
│       ├── mockData.ts          # Mock backend (temporary)
│       ├── useCurrentStep.ts    # GET /step/current
│       ├── usePrefetchNextStep.ts # GET /step/next (prefetch)
│       ├── useGetSession.ts     # GET /sessions/:id
│       ├── useStartSession.ts   # POST /hunts/:id/start
│       └── useValidateAnswer.ts # POST /sessions/:id/validate
│
├── context/
│   └── PlaySession/
│       ├── context.ts           # Context type definition
│       ├── hooks.ts             # usePlaySession hook
│       ├── PlaySessionProvider.tsx
│       ├── useSessionLayer.ts   # Session concerns
│       ├── useStepLayer.ts      # Step concerns
│       ├── useSessionLogic.ts   # Composes layers
│       ├── sessionStorage.ts    # localStorage wrapper
│       └── useClearInvalidSession.ts
│
├── hooks/
│   └── useStepValidation.ts     # Validation state & action
│
├── components/
│   └── challenges/
│       ├── ClueChallenge/       # Renders clue steps
│       └── QuizChallenge/       # Renders quiz steps
│
└── pages/
    └── PlayPage/
        ├── PlayPage.tsx         # Main page component
        └── components/
            ├── PlayerIdentification/  # Name input form
            └── StepRenderer/          # Routes step to correct challenge
```

---

## 9. Code Walkthrough

### Layer 1: PlayPage (Entry Point)

```tsx
// PlayPage.tsx
export const PlayPage = () => {
  const { huntId } = useParams();  // From URL: /play/:huntId

  return (
    <PlaySessionProvider huntId={Number(huntId)}>
      <PlayPageContent />
    </PlaySessionProvider>
  );
};

const PlayPageContent = () => {
  const {
    isLoading,
    hasSession,
    isComplete,
    currentStep,
    isLastStep,
    startSession,
    // ... etc
  } = usePlaySession();

  if (isLoading) return <Loading />;
  if (!hasSession) return <PlayerIdentification onSubmit={startSession} />;
  if (isComplete) return <HuntComplete />;
  if (!currentStep) return <Loading />;

  return <StepRenderer step={currentStep} isLastStep={isLastStep} />;
};
```

### Layer 2: PlaySessionProvider (Context)

```tsx
// PlaySessionProvider.tsx
export const PlaySessionProvider = ({ huntId, children }) => {
  const value = useSessionLogic(huntId);  // All the logic

  return (
    <PlaySessionContext.Provider value={value}>
      {children}
    </PlaySessionContext.Provider>
  );
};
```

### Layer 3: useSessionLogic (Composition)

```typescript
// useSessionLogic.ts
export const useSessionLogic = (huntId: number) => {
  const sessionLayer = useSessionLayer(huntId);  // Session concerns
  const stepLayer = useStepLayer(sessionLayer.sessionId);  // Step concerns

  // Derive final state
  const hasSession = !!sessionLayer.session;
  const isLastStep = hasSession && !stepLayer.hasNextLink && stepLayer.currentStep !== null;
  const isComplete = hasSession && stepLayer.currentStep === null;

  return {
    isLoading: sessionLayer.isLoading || stepLayer.isLoading,
    error: sessionLayer.error ?? stepLayer.error,
    sessionId: sessionLayer.sessionId,
    huntMeta: sessionLayer.huntMeta,
    currentStep: stepLayer.currentStep,
    currentStepIndex: sessionLayer.currentStepIndex,
    totalSteps: sessionLayer.huntMeta?.totalSteps ?? 0,
    startSession: sessionLayer.startSession,
    hasSession,
    isLastStep,
    isComplete,
  };
};
```

### Layer 4: StepRenderer (Challenge Routing)

```tsx
// StepRenderer.tsx
export const StepRenderer = ({ step, isLastStep }) => {
  const { validate, isValidating, feedback } = useStepValidation(step.stepId);

  switch (step.type) {
    case 'clue':
      return (
        <ClueChallenge
          clue={step.challenge.clue}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );
    case 'quiz':
      return (
        <QuizChallenge
          quiz={step.challenge.quiz}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );
    // ... other types
  }
};
```

### Layer 5: Challenge Components

```tsx
// ClueChallenge.tsx
export const ClueChallenge = ({ clue, onValidate, isValidating, isLastStep, feedback }) => {
  const handleContinue = () => {
    onValidate("clue", { clue: {} });  // Clues always succeed
  };

  return (
    <Paper>
      <Typography variant="h5">{clue.title}</Typography>
      <Typography>{clue.description}</Typography>
      {feedback && <Alert>{feedback}</Alert>}
      <Button onClick={handleContinue} disabled={isValidating}>
        {isLastStep ? 'Finish Hunt' : 'Continue'}
      </Button>
    </Paper>
  );
};
```

---

## 10. Example: Complete Play Session

Let's trace through a complete session with real data.

### Hunt Data

```javascript
const hunt = {
  huntId: 1,
  name: "City Explorer Adventure",
  totalSteps: 4,
};

const steps = [
  { stepId: 1, type: "clue", challenge: { clue: { title: "The Starting Point", description: "Find the fountain..." } } },
  { stepId: 2, type: "quiz", challenge: { quiz: { title: "History Question", type: "choice", options: [...] } } },
  { stepId: 3, type: "quiz", challenge: { quiz: { title: "Secret Code", type: "input" } } },
  { stepId: 4, type: "clue", challenge: { clue: { title: "Congratulations!", description: "You finished!" } } },
];
```

### Timeline

```
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 0:00 - User visits /play/1                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ localStorage: (empty)                                                     │
│ UI: Shows PlayerIdentification form                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 0:05 - User enters "John" and clicks Start                          │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: POST /play/1/start { playerName: "John" }                      │
│                                                                           │
│ Response: {                                                               │
│   sessionId: "session_1_1699999999",                                     │
│   hunt: { huntId: 1, name: "City Explorer", totalSteps: 4 },             │
│   currentStepIndex: 0,                                                    │
│   steps: [step1, step2]                                                   │
│ }                                                                         │
│                                                                           │
│ localStorage: hunthub_session_1 = "session_1_1699999999"                 │
│ Cache: session(1) = response                                              │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 0:06 - Session ready, fetch current step                            │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: GET /sessions/session_1_1699999999/step/current                │
│                                                                           │
│ Response: {                                                               │
│   step: { stepId: 1, type: "clue", challenge: {...} },                   │
│   _links: {                                                               │
│     self: { href: "/sessions/.../step/current" },                        │
│     next: { href: "/sessions/.../step/next" },     ← HAS NEXT            │
│     validate: { href: "/sessions/.../validate" }                         │
│   }                                                                       │
│ }                                                                         │
│                                                                           │
│ Cache: currentStep(sessionId) = response                                  │
│ Since _links.next exists → trigger prefetch                              │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 0:07 - Prefetch next step                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: GET /sessions/session_1_1699999999/step/next                   │
│                                                                           │
│ Response: {                                                               │
│   step: { stepId: 2, type: "quiz", challenge: {...} },                   │
│   _links: { self, next, validate }                                       │
│ }                                                                         │
│                                                                           │
│ Cache: nextStep(sessionId) = response                                     │
│                                                                           │
│ UI: Shows Step 1 - "The Starting Point" clue with Continue button        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 0:30 - User clicks Continue on clue                                 │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: POST /sessions/.../validate                                    │
│ Body: { answerType: "clue", payload: { clue: {} } }                      │
│                                                                           │
│ Response: {                                                               │
│   correct: true,                                                          │
│   feedback: "Correct! Well done.",                                        │
│   _links: { currentStep, nextStep }                                      │
│ }                                                                         │
│                                                                           │
│ Cache invalidation:                                                       │
│   - Invalidate session(1)         → refetch                              │
│   - Invalidate currentStep(...)   → refetch (now returns step 2!)        │
│   - Invalidate nextStep(...)      → refetch (now returns step 3)         │
│                                                                           │
│ UI: INSTANTLY shows step 2 (was already in cache from prefetch!)         │
│ Progress: "Step 2 of 4"                                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 1:00 - User answers quiz question wrong                             │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: POST /sessions/.../validate                                    │
│ Body: { answerType: "quiz-choice", payload: { quizChoice: { optionId: "a" } } }│
│                                                                           │
│ Response: {                                                               │
│   correct: false,                                                         │
│   feedback: "Not quite right. Try again!",                               │
│   _links: { currentStep }    ← No nextStep link when wrong               │
│ }                                                                         │
│                                                                           │
│ NO cache invalidation (answer was wrong)                                 │
│ UI: Shows "Not quite right" alert, stays on step 2                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 1:15 - User answers quiz question correctly                         │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: POST /sessions/.../validate                                    │
│ Body: { answerType: "quiz-choice", payload: { quizChoice: { optionId: "b" } } }│
│                                                                           │
│ Response: { correct: true, feedback: "Correct!", _links: {...} }         │
│                                                                           │
│ Cache invalidation → move to step 3                                      │
│ UI: Shows step 3 (text input quiz)                                       │
│ Progress: "Step 3 of 4"                                                   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 2:00 - User on step 4 (last step)                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ GET /step/current response:                                               │
│ {                                                                         │
│   step: { stepId: 4, type: "clue", ... },                                │
│   _links: {                                                               │
│     self: { href: "..." },                                               │
│     validate: { href: "..." }                                            │
│     // NO "next" link! ← This is how we know it's the last step          │
│   }                                                                       │
│ }                                                                         │
│                                                                           │
│ isLastStep = true (no next link)                                         │
│ Button shows "Finish Hunt" instead of "Continue"                         │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ TIME 2:30 - User clicks Finish Hunt                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ API Call: POST /sessions/.../validate                                    │
│                                                                           │
│ Response: {                                                               │
│   correct: true,                                                          │
│   feedback: "Correct!",                                                   │
│   isComplete: true,     ← Hunt is finished!                              │
│   _links: { currentStep }                                                │
│ }                                                                         │
│                                                                           │
│ Cache invalidation:                                                       │
│   - currentStep refetch returns NULL (no more steps)                     │
│                                                                           │
│ isComplete = hasSession && currentStep === null → true                   │
│ UI: Shows "Hunt Complete! Congratulations!"                              │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Concept | What It Does | Why |
|---------|--------------|-----|
| **Session** | Tracks player progress | Resume later, version lock |
| **localStorage** | Saves sessionId | Resume on page refresh |
| **HATEOAS** | Server provides navigation links | Client doesn't hardcode step logic |
| **Prefetch** | Fetch next step while playing current | Instant transitions |
| **Cache invalidation** | Refresh data on correct answer | Move to next step |
| **Version lock** | Session uses hunt snapshot | Consistent experience |
| **Layer separation** | Session vs Step concerns | Clean, testable code |

---

## Questions?

If something isn't clear:
1. Re-read the relevant section
2. Look at the actual code files
3. Trace through the example timeline
4. Ask!
