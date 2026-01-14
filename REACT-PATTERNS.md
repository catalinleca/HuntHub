# React Patterns for State-Based Rendering

This document describes patterns for handling components with multiple UI states. These patterns make code **linear**, **predictable**, and **easy to understand**.

---

## Table of Contents

1. [The Problem: Boolean Soup](#the-problem-boolean-soup)
2. [Pattern 1: Binary Ternary (2 states)](#pattern-1-binary-ternary-2-states)
3. [Pattern 2: Enum/Object Lookup (3-5 states)](#pattern-2-enumobject-lookup-3-5-states)
4. [Pattern 3: Derived Status (booleans → enum)](#pattern-3-derived-status-booleans--enum)
5. [Pattern 4: Single Source of Truth for State](#pattern-4-single-source-of-truth-for-state)
6. [Pattern 5: Consistent Component Architecture](#pattern-5-consistent-component-architecture)
7. [Pattern 6: Enum Lookup for Variants](#pattern-6-enum-lookup-for-variants)
8. [When to Use What](#when-to-use-what)
9. [Sources](#sources)

---

## The Problem: Boolean Soup

When components have multiple states, developers often use multiple boolean flags:

```tsx
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
```

**Why this is bad:**

1. **Impossible states exist** - What if `isLoading` AND `isError` are both true? That's impossible in reality, but the code allows it.

2. **2^n complexity** - With 3 booleans, you have 8 possible combinations (2³). Most are invalid.

3. **Scattered conditionals** - You end up with nested `if/else` chains that are hard to follow:

```tsx
// BAD: Hard to understand what renders when
{isLoading && !isError && (
  <Loading />
)}
{isError && !isLoading && (
  <Error />
)}
{!isLoading && !isError && data && (
  <Content />
)}
```

**The solution:** Use a single status variable that can only be one value at a time.

---

## Pattern 1: Binary Ternary (2 states)

**Use when:** Component has exactly 2 mutually exclusive states.

**Example:** Photo capture - either you have a photo or you don't.

### Before (verbose)

```tsx
const PhotoContent = () => {
  const { hasPhoto, preview } = usePhotoCapture();

  return (
    <Container>
      {hasPhoto && preview && (
        <PreviewContainer>
          <img src={preview} />
          <Button onClick={reset}>Retake</Button>
        </PreviewContainer>
      )}

      {!hasPhoto && (
        <UploadZone onClick={openCamera}>
          <CameraIcon />
          <Typography>Tap to open camera</Typography>
        </UploadZone>
      )}

      <Button disabled={!hasPhoto}>
        {hasPhoto ? 'Submit Photo' : 'Take Photo'}
      </Button>
    </Container>
  );
};
```

**Problems:**
- `hasPhoto && preview` is redundant (if hasPhoto is true, preview exists)
- Two separate conditional blocks for a binary choice
- Harder to scan and understand

### After (clean)

```tsx
// Extract each state into a named component
const CapturePrompt = ({ onClick }) => (
  <UploadZone onClick={onClick}>
    <CameraIcon />
    <Typography>Tap to open camera</Typography>
  </UploadZone>
);

const PhotoPreview = ({ src, onRetake }) => (
  <PreviewContainer>
    <img src={src} />
    <Button onClick={onRetake}>Retake</Button>
  </PreviewContainer>
);

// Main component is now simple
const PhotoContent = () => {
  const { hasPhoto, preview, reset } = usePhotoCapture();

  return (
    <Container>
      {hasPhoto ? <PhotoPreview src={preview} onRetake={reset} /> : <CapturePrompt onClick={openCamera} />}

      <Button disabled={!hasPhoto}>
        {hasPhoto ? 'Submit Photo' : 'Take Photo'}
      </Button>
    </Container>
  );
};
```

**Why this is better:**
- One line shows the binary choice: `hasPhoto ? A : B`
- Named components make each state self-documenting
- A 5-year-old can understand: "if has photo, show preview; otherwise, show capture"

---

## Pattern 2: Enum/Object Lookup (3-5 states)

**Use when:** Component has 3-5 mutually exclusive states.

**Example:** Audio recorder with states: idle, requesting, recording, stopped, error.

### Before (nested conditionals)

```tsx
const AudioContent = () => {
  const { status, isRecording, hasRecording } = useAudioRecorder();

  const renderContent = () => {
    if (hasRecording && audioUrl) {
      return <AudioPreview />;
    }
    if (isRecording) {
      return <RecordingDisplay />;
    }
    return <ReadyPrompt />;
  };

  const renderButton = () => {
    if (isRecording) {
      return <Button>Stop Recording</Button>;
    }
    if (hasRecording) {
      return <Button>Submit Recording</Button>;
    }
    return <Button>{status === 'requesting' ? 'Requesting access...' : 'Start Recording'}</Button>;
  };

  return (
    <Container>
      {renderContent()}
      {renderButton()}
    </Container>
  );
};
```

**Problems:**
- Two separate render functions with their own if/else chains
- `hasRecording && audioUrl` is redundant
- Mixed derived booleans (`isRecording`, `hasRecording`) with status enum
- What if status is 'error'? The ternary defaults to "Start Recording" - wrong!
- Hard to see what renders for each state

### After (enum lookup)

```tsx
// Shared UI pieces - small, focused components
const ReadyPrompt = () => (
  <UploadZone>
    <MicrophoneIcon />
    <Typography>Ready to Record</Typography>
  </UploadZone>
);

const RecordingDisplay = ({ duration }) => (
  <UploadZone>
    <RecordingDot />
    <Typography>{formatDuration(duration)}</Typography>
  </UploadZone>
);

const AudioPreview = ({ audioUrl, duration, onReset }) => (
  <PreviewContainer>
    <audio src={audioUrl} controls />
    <Typography>Duration: {formatDuration(duration)}</Typography>
    <Button onClick={onReset}>Re-record</Button>
  </PreviewContainer>
);

// Main component uses object lookup
const AudioContent = () => {
  const { status, audioUrl, duration, startRecording, stopRecording, reset } = useAudioRecorder();

  // Each status maps to its complete UI
  const views: Record<Status, React.ReactNode> = {
    idle: (
      <>
        <ReadyPrompt />
        <Button onClick={startRecording}>Start Recording</Button>
      </>
    ),
    requesting: (
      <>
        <ReadyPrompt />
        <Button disabled>Requesting access...</Button>
      </>
    ),
    error: (
      <>
        <ReadyPrompt />
        <Button onClick={startRecording}>Try Again</Button>
      </>
    ),
    recording: (
      <>
        <RecordingDisplay duration={duration} />
        <Button onClick={stopRecording}>Stop Recording</Button>
      </>
    ),
    stopped: (
      <>
        <AudioPreview audioUrl={audioUrl} duration={duration} onReset={reset} />
        <Button onClick={onSubmit}>Submit Recording</Button>
      </>
    ),
  };

  return (
    <Container>
      {error && <Alert>{error}</Alert>}
      {views[status]}
    </Container>
  );
};
```

**Why this is better:**
- **Linear** - Read the `views` object top to bottom, see exactly what each state renders
- **Explicit** - Each status has its complete UI defined in one place
- **Type-safe** - `Record<Status, ReactNode>` ensures all states are handled
- **No impossible states** - Status can only be one value at a time
- **5-year-old friendly** - "when status is 'idle', show this; when 'recording', show this"

---

## Pattern 3: Derived Status (booleans → enum)

**Use when:** A hook returns multiple booleans, but you want the enum pattern.

**Example:** Geolocation hook returns `isLoading`, `error`, `position` separately.

### Before (boolean conditionals)

```tsx
const LocationContent = () => {
  const { position, error, isLoading } = useGeolocation();

  return (
    <Container>
      <UploadZone>
        <MapPinIcon />

        {isLoading && !position && (
          <>
            <CircularProgress />
            <Typography>Getting your location...</Typography>
          </>
        )}

        {error && (
          <Alert>{error}</Alert>
        )}

        {!isLoading && !error && !position && (
          <>
            <Typography>Find the Location</Typography>
          </>
        )}

        {position && (
          <>
            <Typography>Location Acquired</Typography>
          </>
        )}
      </UploadZone>

      <Button disabled={!position || isLoading}>
        {isLoading ? 'Getting location...' : 'Check Location'}
      </Button>
    </Container>
  );
};
```

**Problems:**
- `isLoading && !position` - compound conditional
- `!isLoading && !error && !position` - triple negation, hard to parse
- Four separate conditional blocks scattered in JSX
- Easy to miss a state or have overlapping conditions

### After (derived status + lookup)

```tsx
// Define the possible states
type LocationStatus = 'idle' | 'loading' | 'error' | 'ready';

// Derive status from booleans - single source of truth
const getStatus = (isLoading: boolean, error: string | null, hasPosition: boolean): LocationStatus => {
  if (error) return 'error';
  if (hasPosition) return 'ready';
  if (isLoading) return 'loading';
  return 'idle';
};

// Small, focused prompt components
const LoadingPrompt = () => (
  <>
    <CircularProgress />
    <Typography>Getting your location...</Typography>
  </>
);

const IdlePrompt = () => (
  <>
    <Typography>Find the Location</Typography>
    <Typography>Navigate to the target area</Typography>
  </>
);

const ReadyPrompt = () => (
  <>
    <Typography>Location Acquired</Typography>
    <Typography>Tap to verify your position</Typography>
  </>
);

const ErrorPrompt = ({ message }) => (
  <Typography color="error">{message}</Typography>
);

// Main component
const LocationContent = () => {
  const { position, error, isLoading } = useGeolocation();

  // Derive single status from multiple booleans
  const status = getStatus(isLoading, error, !!position);

  // Map status to prompt component
  const prompts: Record<LocationStatus, React.ReactNode> = {
    idle: <IdlePrompt />,
    loading: <LoadingPrompt />,
    error: <ErrorPrompt message={error || 'Location error'} />,
    ready: <ReadyPrompt />,
  };

  return (
    <Container>
      <UploadZone>
        <MapPinIcon />
        {prompts[status]}
      </UploadZone>

      <Button disabled={status !== 'ready'}>
        {status === 'loading' ? 'Getting location...' : 'Check Location'}
      </Button>
    </Container>
  );
};
```

**Why this is better:**
- **Single source of truth** - `getStatus()` converts booleans to one status
- **Priority is explicit** - The if-chain in `getStatus` shows: error > ready > loading > idle
- **No compound conditionals** - Just `{prompts[status]}`
- **Easy to extend** - Add a new status? Add it to the type, getStatus, and prompts object

---

## When to Use What

| Number of States | Pattern | Example |
|------------------|---------|---------|
| 2 states | Binary ternary | `hasPhoto ? <Preview /> : <Capture />` |
| 3-5 states | Enum/Object lookup | `views[status]` |
| 6+ states | Consider XState | Complex wizards, forms |
| Booleans from hook | Derive status first | `getStatus() → prompts[status]` |

### Decision Flow

```
Is it binary (2 states)?
  YES → Use ternary: condition ? <A /> : <B />
  NO  → Does the hook return status enum?
          YES → Use object lookup: views[status]
          NO  → Derive status first: getStatus(booleans) → views[status]
```

---

## Key Principles

### 1. Enumerate, Don't Booleanate

```tsx
// BAD: 3 booleans = 8 possible states (most impossible)
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);

// GOOD: 1 enum = 4 possible states (all valid)
type Status = 'idle' | 'loading' | 'error' | 'success';
const [status, setStatus] = useState<Status>('idle');
```

### 2. Derived Booleans Are OK

If you need boolean checks for convenience, derive them from status:

```tsx
const status = 'loading';
const isLoading = status === 'loading';  // Derived, always in sync
const isReady = status === 'ready';
```

### 3. One Status, One UI

Each status should map to exactly one UI configuration:

```tsx
const views = {
  idle: <IdleView />,      // Not: if idle AND something else
  loading: <LoadingView />, // Each status = one complete UI
  error: <ErrorView />,
  success: <SuccessView />,
};

return <Container>{views[status]}</Container>;
```

### 4. Compose, Don't Duplicate

Extract shared UI pieces into components, then compose them:

```tsx
// Shared pieces
const ReadyPrompt = () => <UploadZone>...</UploadZone>;
const ActionButton = ({ children, ...props }) => <Button {...props}>{children}</Button>;

// Compose in views
const views = {
  idle: (
    <>
      <ReadyPrompt />
      <ActionButton onClick={start}>Start</ActionButton>
    </>
  ),
  requesting: (
    <>
      <ReadyPrompt />  {/* Reused */}
      <ActionButton disabled>Requesting...</ActionButton>
    </>
  ),
};
```

---

## Sources

- [Kent C. Dodds - Stop using isLoading booleans](https://kentcdodds.com/blog/stop-using-isloading-booleans)
- [Kyle Shevlin - Enumerate, Don't Booleanate](https://kyleshevlin.com/enumerate-dont-booleanate/)
- [React Docs - Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure)
- [Robin Wieruch - Conditional Rendering in React](https://www.robinwieruch.de/conditional-rendering-react/)

---

## Real Examples in This Codebase

| Component | File | Pattern Used |
|-----------|------|--------------|
| AudioContent | `challenges/components/Mission/AudioContent.tsx` | Enum lookup (5 states) |
| LocationContent | `challenges/components/Mission/LocationContent.tsx` | Derived status (4 states) |
| PhotoContent | `challenges/components/Mission/PhotoContent.tsx` | Binary ternary (2 states) |
| MissionChallenge | `challenges/Mission/MissionChallenge.tsx` | Enum lookup for variants |
| QuizChallenge | `challenges/Quiz/QuizChallenge.tsx` | Binary ternary (choice vs input) |
| ValidationContext | `context/Validation/` | Single source of truth (attemptCount) |

---

## Pattern 4: Single Source of Truth for State

**Use when:** Data could be derived client-side OR come from a source of truth (backend/context).

**Rule:** Always get state from its source of truth. Don't derive it client-side if the source already tracks it.

### Anti-Pattern: Deriving state from other data

```tsx
// ❌ BAD: Client-side attempt tracking by parsing feedback strings
const useAttemptTracking = (feedback: string | null) => {
  const [attemptCount, setAttemptCount] = useState(0);
  const prevFeedbackRef = useRef<string | null>(null);

  useEffect(() => {
    if (!feedback || feedback === prevFeedbackRef.current) return;
    const feedbackLower = feedback.toLowerCase();
    // Fragile! What if feedback text changes?
    const isCorrect = feedbackLower.includes('correct') || feedbackLower.includes('received');
    if (!isCorrect) {
      setAttemptCount((prev) => prev + 1);
    }
    prevFeedbackRef.current = feedback;
  }, [feedback]);

  return attemptCount;
};

// Used in component
const QuizChallenge = ({ feedback }) => {
  const attemptCount = useAttemptTracking(feedback); // Derived client-side
  // ...
};
```

**Why this is bad:**
- Parses feedback strings (fragile, breaks if text changes)
- Duplicates logic that the backend/context already knows
- Source of truth should be the validation system, not derived state

### Correct Pattern: Get from source of truth

```tsx
// ✅ GOOD: Context tracks attemptCount internally
interface ValidationContextValue {
  validate: (...) => ...;
  isValidating: boolean;
  isCorrect: boolean | null;
  feedback: string | null;
  attemptCount: number;  // Source of truth
  reset: () => void;
}

// Provider tracks attempts when validation fails
const MockValidationProvider = ({ step, children }) => {
  const [state, setState] = useState({
    isCorrect: null,
    feedback: null,
    attemptCount: 0,  // Tracked here
  });

  const validate = useCallback((answerType, payload) => {
    const result = checkAnswer(step, answerType, payload);
    setState((prev) => ({
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      // Increment on wrong answer - source of truth
      attemptCount: result.isCorrect ? prev.attemptCount : prev.attemptCount + 1,
    }));
  }, [step]);

  return (
    <ValidationContext.Provider value={{ ...state, validate, reset }}>
      {children}
    </ValidationContext.Provider>
  );
};

// Component just reads from context
const QuizChallenge = ({ currentAttempts }) => {
  // currentAttempts comes from context via props
  // No client-side derivation needed
};
```

**Why this is better:**
- **Single source of truth** - Context/backend tracks attempts
- **Not fragile** - No string parsing
- **Correct by design** - API can return attemptCount directly later
- **Simpler components** - Just read the value, don't compute it

---

## Pattern 5: Consistent Component Architecture

**Use when:** Multiple components share the same structure/layout.

**Example:** All challenge types share the same card layout.

### Before (inconsistent)

```tsx
// ClueChallenge.tsx - uses one structure
const ClueChallenge = () => (
  <StepContainer>
    <StepContent>
      <StepIndicators badge={badge} />
      <Typography>{title}</Typography>
    </StepContent>
    <StepActions>
      <Button>Continue</Button>
    </StepActions>
  </StepContainer>
);

// QuizChallenge.tsx - uses different structure
const QuizChallenge = () => (
  <ChallengeCard badge={badge} title={title} footer={<ActionButton />}>
    {content}
  </ChallengeCard>
);
```

**Problems:**
- Different components use different wrappers
- Inconsistent look/feel
- Harder to maintain global changes

### After (consistent)

```tsx
// ALL challenges use ChallengeCard
const ClueChallenge = () => (
  <ChallengeCard
    badge={badge}
    title={title}
    footer={<ActionButton label="Continue" />}
  >
    {null}
  </ChallengeCard>
);

const QuizChallenge = () => (
  <ChallengeCard
    badge={badge}
    title={title}
    footer={<ActionButton label="Submit" />}
  >
    {isChoiceMode ? <ChoiceContent /> : <InputContent />}
  </ChallengeCard>
);

const MissionChallenge = () => (
  <ChallengeCard
    badge={badge}
    title={title}
    footer={<></>}
  >
    {contents[challenge.type]}
  </ChallengeCard>
);
```

**Why this is better:**
- **Consistent UI** - All challenges look the same
- **Single wrapper** - Change ChallengeCard, change all challenges
- **Predictable structure** - badge + title + content + footer

---

## Pattern 6: Enum Lookup for Variants

**Use when:** A component renders different content based on a type/variant.

**Example:** MissionChallenge renders different content based on mission type.

### Before (switch or if/else)

```tsx
const MissionChallenge = ({ challenge }) => {
  const renderContent = () => {
    switch (challenge.type) {
      case MissionType.MatchLocation:
        return <LocationContent />;
      case MissionType.UploadMedia:
        return <PhotoContent />;
      case MissionType.UploadAudio:
        return <AudioContent />;
      default:
        return null;
    }
  };

  return (
    <ChallengeCard>
      {renderContent()}
    </ChallengeCard>
  );
};
```

**Problems:**
- `renderContent()` function adds indirection
- Switch statement is verbose
- TypeScript doesn't enforce exhaustive handling

### After (object lookup)

```tsx
const MissionChallenge = ({ challenge, onValidate, isValidating }) => {
  const handleLocationSubmit = useCallback(
    (position) => onValidate(AnswerType.MissionLocation, { missionLocation: position }),
    [onValidate]
  );

  const handleMediaSubmit = useCallback(
    () => onValidate(AnswerType.MissionMedia, { missionMedia: { assetId: 0 } }),
    [onValidate]
  );

  const contents: Record<MissionType, React.ReactNode> = {
    [MissionType.MatchLocation]: (
      <LocationContent mission={challenge} onSubmit={handleLocationSubmit} disabled={isValidating} />
    ),
    [MissionType.UploadMedia]: (
      <PhotoContent mission={challenge} onSubmit={handleMediaSubmit} disabled={isValidating} />
    ),
    [MissionType.UploadAudio]: (
      <AudioContent mission={challenge} onSubmit={handleMediaSubmit} disabled={isValidating} />
    ),
  };

  return (
    <ChallengeCard>
      {contents[challenge.type]}
    </ChallengeCard>
  );
};
```

**Why this is better:**
- **Type-safe** - `Record<MissionType, ReactNode>` ensures all types handled
- **Linear** - Read top to bottom, see all variants
- **No function wrapper** - `contents[type]` is direct lookup
- **Easy to add** - New type? TypeScript tells you to add it to the object
