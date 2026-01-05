# ADR-002: Mode Prop Pattern for Preview vs Production

**Status:** Proposed
**Date:** 2026-01-04
**Deciders:** Development Team

---

## Context

The same SDK components will be used in two different contexts:

1. **Editor Preview** - Embedded in the Editor, fed by form state, no API calls
2. **Player App** - Standalone PWA, fed by backend API, full gameplay

These contexts have different requirements:

| Requirement | Preview | Production |
|-------------|---------|------------|
| Data source | Form state | Backend API |
| Answer validation | Skip/show answers | Real validation |
| Progress saving | None | Persisted |
| Navigation | Free (any step) | Sequential |
| Hints | Always visible | Limited (3/step) |
| GPS check | Mock/bypass | Real validation |

---

## Decision

**Use a `mode` prop on the `PlayerShell` component to control behavior.**

```tsx
interface PlayerConfig {
  mode: 'preview' | 'production';

  // Preview-specific overrides
  showAnswers?: boolean;
  skipValidation?: boolean;
  freeNavigation?: boolean;
  mockLocation?: Location;
}
```

### Usage

```tsx
// In Editor Preview
<PlayerShell mode="preview" showAnswers freeNavigation>
  <StepView step={currentStep} onSubmit={() => {}} />
</PlayerShell>

// In Player App
<PlayerShell mode="production">
  <StepView step={currentStep} onSubmit={handleSubmit} />
</PlayerShell>
```

---

## Rationale

### Why a prop (not environment variable)?

| Approach | Problem |
|----------|---------|
| `process.env.NODE_ENV` | Both apps run in "development" during dev |
| Separate components | Code duplication |
| Separate packages | Over-engineered |
| **Mode prop** | Simple, explicit, testable |

### Why on PlayerShell (not each component)?

- Single configuration point
- Context propagates to children
- Consistent behavior across all step types
- Easy to reason about

---

## Implementation

### PlayerContext

```tsx
// packages/player-sdk/src/context/PlayerContext.tsx

interface PlayerContextValue {
  mode: 'preview' | 'production';
  config: PlayerConfig;

  // Derived helpers
  shouldValidate: boolean;
  canNavigateFreely: boolean;
  showHints: boolean;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export const PlayerShell = ({ mode, children, ...config }: Props) => {
  const value = useMemo(() => ({
    mode,
    config,
    shouldValidate: mode === 'production' && !config.skipValidation,
    canNavigateFreely: mode === 'preview' || config.freeNavigation,
    showHints: mode === 'preview' || config.showAnswers,
  }), [mode, config]);

  return (
    <PlayerContext.Provider value={value}>
      <ThemeProvider theme={playerTheme}>
        {children}
      </ThemeProvider>
    </PlayerContext.Provider>
  );
};
```

### Component Usage

```tsx
// packages/player-sdk/src/components/steps/QuizStep.tsx

const QuizStep = ({ step, onSubmit }) => {
  const { shouldValidate, showHints } = usePlayerContext();

  const handleSubmit = (answer: string) => {
    if (shouldValidate) {
      // Call API to validate
      onSubmit(answer);
    } else {
      // Preview mode: just show feedback
      console.log('Preview: answer submitted', answer);
    }
  };

  return (
    <div>
      <QuizOptions options={step.challenge.quiz.options} />
      {showHints && <CorrectAnswer answer={step.challenge.quiz.target} />}
      <SubmitButton onClick={handleSubmit} />
    </div>
  );
};
```

---

## Consequences

### Positive
- **Single codebase** - No duplication between preview and production
- **Explicit configuration** - Easy to see what mode is active
- **Testable** - Can test both modes in Storybook
- **Flexible** - Can add more modes later (e.g., 'demo', 'testing')

### Negative
- **Conditional logic** - Components have if/else for modes
- **Context dependency** - All components need PlayerContext
- **Testing burden** - Must test both modes

### Acceptable Trade-offs
- The conditional logic is minimal and isolated
- Context is a standard React pattern
- Testing both modes ensures quality

---

## Behavior Matrix

| Behavior | Preview | Production |
|----------|---------|------------|
| `shouldValidate` | `false` | `true` |
| `canNavigateFreely` | `true` | `false` |
| `showHints` | `true` | `false` (until requested) |
| `saveProgress` | `false` | `true` |
| `trackAnalytics` | `false` | `true` |
| `requireGPS` | `false` | `true` |
| `requirePhoto` | `false` | `true` |

---

## Alternatives Considered

### Option 1: Separate Components (Rejected)
```
PreviewStepView.tsx
ProductionStepView.tsx
```
**Rejected because:** Too much code duplication.

### Option 2: Higher-Order Component (Rejected)
```tsx
const PreviewStep = withPreviewMode(StepView);
const ProductionStep = withProductionMode(StepView);
```
**Rejected because:** HOCs are outdated, harder to type.

### Option 3: Environment Detection (Rejected)
```tsx
const isPreview = window.location.hostname === 'localhost';
```
**Rejected because:** Unreliable, not explicit, can't test.

---

## References

- [React Context for Configuration](https://react.dev/learn/passing-data-deeply-with-context)
- [Feature Flags Pattern](https://martinfowler.com/articles/feature-toggles.html)