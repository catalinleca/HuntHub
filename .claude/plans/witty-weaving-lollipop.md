# Fix Step-Level Features Architecture

## Problem Summary

Step-level features (media, timeLimit, maxAttempts, hint) are NOT showing in Mission and Task challenges because:
1. Only `ClueChallenge` properly uses these features with the `StepContainer` pattern
2. `QuizChallenge`, `TaskChallenge`, `MissionChallenge` use `ChallengeCard` which ignores these props
3. `StepRenderer` already passes these props via `BaseChallengeProps` - they're just not consumed

## Architecture Distinction

### Step-Level Features (Apply to ALL steps)
- `media?: Media` - Optional images/audio/video content author adds
- `timeLimit?: number | null` - Countdown timer in seconds
- `maxAttempts?: number | null` - Max submission attempts allowed
- `hint?: string | null` - Text hint (fetched via HintSection)

### Challenge-Specific Features (Vary by type)
- **Clue**: title, description (just display and continue)
- **Quiz**: type (choice/input), options, validation
- **Mission**: type (location/photo/audio), reference assets
- **Task**: instructions, text response

---

## Solution: Enhance ChallengeCard

**Approach**: Enhance `ChallengeCard` to support step-level features so ALL challenges using it automatically get support. This is DRY and modular.

### New ChallengeCard Architecture

```
ChallengeCard (enhanced)
├── Indicators Row (if timeLimit OR maxAttempts)
│   ├── TimeLimit (countdown badge)
│   └── AttemptsCounter (X/Y badge)
├── Media Section (if media exists)
│   └── MediaDisplay (image/audio/video/image-audio)
├── TypeBadge
├── Title
├── Description
├── Children (challenge-specific content)
├── HintSection (if showHint)
├── FeedbackDisplay (moved here for consistency)
└── Footer (action buttons)
```

---

## Files to Modify

### 1. ChallengeCard.tsx - Add step-level feature support
**Path:** `apps/frontend/player/src/pages/PlayPage/challenges/components/ChallengeCard/ChallengeCard.tsx`

Add new props:
```typescript
interface ChallengeCardProps {
  // Existing
  children: React.ReactNode;
  badge: BadgeConfig;
  title?: string;
  description?: string;
  footer: React.ReactNode;
  showHint?: boolean;

  // NEW - Step-level features
  media?: Media;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  currentAttempts?: number;
  onTimeExpire?: () => void;
  onMaxAttempts?: () => void;
  feedback?: string | null; // Move FeedbackDisplay here
}
```

New layout structure:
```tsx
<S.Container>
  {/* Step indicators - top row */}
  {hasIndicators && (
    <S.IndicatorsRow>
      {timeLimit && <TimeLimit seconds={timeLimit} onExpire={onTimeExpire} />}
      {maxAttempts && <AttemptsCounter current={currentAttempts} max={maxAttempts} onMaxAttempts={onMaxAttempts} />}
    </S.IndicatorsRow>
  )}

  {/* Optional media - before content */}
  {hasVisualMedia && <MediaDisplay media={media} />}

  {/* Badge + content */}
  <TypeBadge {...badge} />
  {title && <Typography variant="h5">{title}</Typography>}
  {description && <Typography color="text.secondary">{description}</Typography>}

  <S.Content>
    {children}
    {hasAudioOnly && <MediaDisplay media={media} />}
  </S.Content>

  {/* Feedback + Hint */}
  <FeedbackDisplay feedback={feedback} />
  {showHint && <HintSection />}

  <S.Footer>{footer}</S.Footer>
</S.Container>
```

### 2. ChallengeCard.styles.ts - Add IndicatorsRow
**Path:** `apps/frontend/player/src/pages/PlayPage/challenges/components/ChallengeCard/ChallengeCard.styles.ts`

Add:
```typescript
export const IndicatorsRow = styled(Stack)`
  flex-direction: row;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing(1)};
`;
```

### 3. QuizChallenge.tsx - Pass step-level props
**Path:** `apps/frontend/player/src/pages/PlayPage/challenges/Quiz/QuizChallenge.tsx`

Changes:
- Destructure `media`, `timeLimit`, `maxAttempts`, `feedback` from props
- Track attempts locally with `useState`
- Increment attempts on incorrect validation (via useEffect on feedback)
- Pass all props to ChallengeCard
- Remove FeedbackDisplay from children (now in ChallengeCard)

### 4. MissionChallenge.tsx - Pass step-level props
**Path:** `apps/frontend/player/src/pages/PlayPage/challenges/Mission/MissionChallenge.tsx`

Changes:
- Destructure `media`, `timeLimit`, `maxAttempts`, `feedback` from props
- Track attempts locally
- Pass all props to ChallengeCard
- Remove FeedbackDisplay from footer

### 5. TaskChallenge.tsx - Pass step-level props
**Path:** `apps/frontend/player/src/pages/PlayPage/challenges/Task/TaskChallenge.tsx`

Changes:
- Destructure `media`, `timeLimit`, `maxAttempts`, `feedback` from props
- Track attempts locally
- Pass all props to ChallengeCard
- Remove FeedbackDisplay from footer

---

## Attempt Tracking Pattern

Each challenge that uses validation needs to track attempts:

```typescript
const [attemptCount, setAttemptCount] = useState(0);
const prevFeedbackRef = useRef<string | null>(null);

// Increment attempts when validation returns incorrect
useEffect(() => {
  // Only count when feedback changes from null to something (new validation result)
  if (feedback && feedback !== prevFeedbackRef.current && !feedback.toLowerCase().includes('correct')) {
    setAttemptCount(prev => prev + 1);
  }
  prevFeedbackRef.current = feedback;
}, [feedback]);

// Handle max attempts reached
const handleMaxAttempts = useCallback(() => {
  // Auto-submit or show failure state
  onValidate(/* auto-fail or continue */);
}, [onValidate]);
```

---

## Implementation Order

1. **ChallengeCard.tsx** - Enhance with step-level features
2. **ChallengeCard.styles.ts** - Add IndicatorsRow styled component
3. **QuizChallenge.tsx** - Wire up step-level props + attempt tracking
4. **MissionChallenge.tsx** - Wire up step-level props + attempt tracking
5. **TaskChallenge.tsx** - Wire up step-level props + attempt tracking

---

## Verification

1. **Preview Mode Test**:
   - Create/use a hunt with steps that have `timeLimit`, `maxAttempts`, and `media` set
   - Verify TimeLimit badge appears and counts down
   - Verify AttemptsCounter badge appears
   - Verify media displays above challenge content
   - Verify HintSection appears when `showHint` is enabled

2. **Test each challenge type**:
   - Quiz (choice) - with timer, attempts, media
   - Quiz (input) - with timer, attempts, media
   - Mission (location) - with timer, attempts, media
   - Mission (photo) - with timer, attempts, media
   - Mission (audio) - with timer, attempts, media
   - Task - with timer, attempts, media

3. **Edge Cases**:
   - Step with no step-level features (should work normally)
   - Timer expiry (should trigger callback)
   - Max attempts reached (should trigger callback)

---

## Key Principles Followed

1. **Modular** - Step-level features in ChallengeCard, challenge-specific in children
2. **DRY** - No duplication of TimeLimit/AttemptsCounter/MediaDisplay across challenges
3. **Composition** - ChallengeCard composes step-level + challenge-specific via slots
4. **Flexible** - Each challenge opts-in by passing props, can customize callbacks
5. **Production-grade** - Proper cleanup, effect dependencies, memoization
