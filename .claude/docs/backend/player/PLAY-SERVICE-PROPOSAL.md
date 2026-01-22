# Play Service - Architecture Proposal

**Goal:** Clean, fast Play API with ultra-smooth UX for players.

---

## Key Decisions

1. **PlayerExporter** in `@hunthub/shared` - single source of truth for step transformation
2. **Unified SessionResponse** - same type for start and resume
3. **Lightweight validate** - just returns correct/feedback, no step data
4. **Step by ID** - `/step/:stepId` with server-side validation (not `/step/next`)
5. **Prefetch pattern** - cache next step while solving current, instant display

---

## Endpoints

```
POST /play/:huntId/start           → SessionResponse
GET  /play/sessions/:id            → SessionResponse
GET  /play/sessions/:id/step/:stepId → StepResponse (with validation)
POST /play/sessions/:id/validate   → ValidateAnswerResponse (lightweight)
POST /play/sessions/:id/hint       → HintResponse
```

**Dropped:**
- ~~`/step/current`~~ - included in SessionResponse
- ~~`/step/next`~~ - use `/step/:stepId` with link

---

## Types

### SessionResponse (unified)

```typescript
interface SessionResponse {
  sessionId: string;
  hunt: HuntMetaPF;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentStepIndex: number;
  totalSteps: number;
  startedAt: string;
  completedAt?: string;
  currentStep?: StepResponse;
}
```

### StepResponse

```typescript
interface StepResponse {
  step: StepPF;
  stepIndex: number;
  totalSteps: number;
  attempts: number;
  maxAttempts: number | null;
  hintsUsed: number;
  maxHints: number;
  _links: {
    self: { href: string };      // /sessions/abc/step/10
    next?: { href: string };     // /sessions/abc/step/20
    validate: { href: string };  // /sessions/abc/validate
  };
}
```

### ValidateAnswerResponse (lightweight)

```typescript
interface ValidateAnswerResponse {
  correct: boolean;
  feedback?: string;
  attempts: number;
  maxAttempts?: number;
  isComplete?: boolean;
  // NO nextStep - client uses prefetched cache
}
```

---

## PlayerExporter

Lives in `@hunthub/shared`, used by backend AND frontend.

```typescript
// packages/shared/src/exporters/PlayerExporter.ts

export class PlayerExporter {
  /**
   * Transform Step to player-safe format (no answers)
   */
  static step(step: Step): StepPF {
    return {
      stepId: step.stepId,
      type: step.type,
      challenge: this.challenge(step.type, step.challenge),
      media: step.media,
      timeLimit: step.timeLimit ?? null,
      maxAttempts: step.maxAttempts ?? null,
    };
  }

  /**
   * Transform HuntVersion to player-safe hunt metadata
   */
  static hunt(huntId: number, version: HuntVersion): HuntMetaPF {
    return {
      huntId,
      name: version.name,
      description: version.description,
      totalSteps: version.stepOrder.length,
      coverImage: version.coverImage ?? null,
    };
  }

  private static challenge(type: ChallengeType, challenge: Challenge): ChallengePF {
    switch (type) {
      case ChallengeType.Clue:
        return { clue: this.clue(challenge) };
      case ChallengeType.Quiz:
        return { quiz: this.quiz(challenge) };
      case ChallengeType.Mission:
        return { mission: this.mission(challenge) };
      case ChallengeType.Task:
        return { task: this.task(challenge) };
    }
  }

  private static clue(challenge: Challenge): CluePF {
    return {
      title: challenge.clue!.title,
      description: challenge.clue!.description,
    };
  }

  private static quiz(challenge: Challenge): QuizPF {
    return {
      title: challenge.quiz!.title,
      description: challenge.quiz!.description,
      type: challenge.quiz!.type,
      options: challenge.quiz!.options,
      randomizeOrder: challenge.quiz!.randomizeOrder,
      // STRIPPED: targetId, expectedAnswer
    };
  }

  private static mission(challenge: Challenge): MissionPF {
    return {
      title: challenge.mission!.title,
      description: challenge.mission!.description,
      type: challenge.mission!.type,
      referenceAssetIds: challenge.mission!.referenceAssetIds,
      // STRIPPED: targetLocation, aiInstructions, aiModel
    };
  }

  private static task(challenge: Challenge): TaskPF {
    return {
      title: challenge.task!.title,
      instructions: challenge.task!.instructions,
      // STRIPPED: aiInstructions, aiModel
    };
  }

  /**
   * Randomize quiz options if enabled
   */
  static maybeRandomizeOptions(step: StepPF): StepPF {
    if (step.type !== ChallengeType.Quiz) return step;

    const quiz = step.challenge.quiz;
    if (!quiz?.randomizeOrder || !quiz.options) return step;

    return {
      ...step,
      challenge: {
        quiz: {
          ...quiz,
          options: this.shuffle([...quiz.options]),
        },
      },
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
```

---

## PlayService Implementation

```typescript
@injectable()
export class PlayService {

  // ============================================
  // START SESSION
  // ============================================

  async startSession(huntId: number, playerName: string, userId?: string): Promise<SessionResponse> {
    const hunt = await this.requireLiveHunt(huntId);
    const huntVersion = await this.requireHuntVersion(huntId, hunt.liveVersion!);

    if (!huntVersion.stepOrder.length) {
      throw new ValidationError('This hunt has no steps', []);
    }

    const firstStepId = huntVersion.stepOrder[0];
    const progress = await SessionManager.createSession(
      huntId, hunt.liveVersion!, playerName, firstStepId, userId
    );

    const step = await StepNavigator.getStepById(huntId, hunt.liveVersion!, firstStepId);

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(huntId, huntVersion),
      status: 'in_progress',
      currentStepIndex: 0,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      currentStep: this.buildStepResponse(progress.sessionId, step!, huntVersion, progress.steps[0]),
    };
  }

  // ============================================
  // GET SESSION (Resume)
  // ============================================

  async getSession(sessionId: string): Promise<SessionResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    const currentStepIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, progress.currentStepId);

    let currentStep: StepResponse | undefined;
    if (progress.status === 'in_progress') {
      const step = await StepNavigator.getStepById(progress.huntId, progress.version, progress.currentStepId);
      if (step) {
        currentStep = this.buildStepResponse(
          sessionId, step, huntVersion, SessionManager.getCurrentStepProgress(progress)
        );
      }
    }

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(progress.huntId, huntVersion),
      status: progress.status,
      currentStepIndex,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString(),
      currentStep,
    };
  }

  // ============================================
  // GET STEP BY ID (with server-side validation)
  // ============================================

  async getStep(sessionId: string, requestedStepId: number): Promise<StepResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    // SERVER STATE is source of truth
    const currentIndex = huntVersion.stepOrder.indexOf(progress.currentStepId);
    const currentStepId = progress.currentStepId;
    const nextStepId = huntVersion.stepOrder[currentIndex + 1]; // may be undefined

    // Validate: only current or next step allowed
    const allowedStepIds = [currentStepId, nextStepId].filter(Boolean);
    if (!allowedStepIds.includes(requestedStepId)) {
      throw new ForbiddenError('Step not accessible from current position');
    }

    const step = await StepNavigator.getStepById(progress.huntId, progress.version, requestedStepId);
    if (!step) {
      throw new NotFoundError('Step not found');
    }

    // Get step progress if this is the current step
    const stepProgress = requestedStepId === currentStepId
      ? SessionManager.getCurrentStepProgress(progress)
      : undefined;

    return this.buildStepResponse(sessionId, step, huntVersion, stepProgress);
  }

  // ============================================
  // VALIDATE ANSWER (lightweight)
  // ============================================

  async validateAnswer(sessionId: string, request: ValidateAnswerRequest): Promise<ValidateAnswerResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);
    const step = await StepNavigator.getStepById(progress.huntId, progress.version, progress.currentStepId);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    const currentAttempts = (stepProgress?.attempts ?? 0) + 1;
    const isLastStep = StepNavigator.isLastStep(huntVersion.stepOrder, progress.currentStepId);

    // Check time limit
    if (step.timeLimit && stepProgress?.startedAt) {
      const elapsedSeconds = (Date.now() - stepProgress.startedAt.getTime()) / 1000;
      if (elapsedSeconds > step.timeLimit) {
        return { correct: false, expired: true, attempts: currentAttempts, maxAttempts: step.maxAttempts ?? undefined };
      }
    }

    // Check max attempts
    if (step.maxAttempts && currentAttempts > step.maxAttempts) {
      return { correct: false, exhausted: true, attempts: currentAttempts - 1, maxAttempts: step.maxAttempts };
    }

    // Validate answer
    const validationResult = AnswerValidator.validate(request.answerType, request.payload, step);

    // Atomic state updates
    return withTransaction(async (session) => {
      await SessionManager.incrementAttempts(sessionId, progress.currentStepId, session);
      await SessionManager.recordSubmission(
        sessionId, progress.currentStepId, request.payload, validationResult.isCorrect, validationResult.feedback, session
      );

      let isComplete = false;

      if (validationResult.isCorrect) {
        if (isLastStep) {
          await SessionManager.completeSession(sessionId, progress.currentStepId, session);
          isComplete = true;
        } else {
          const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, progress.currentStepId);
          if (nextStepId !== null) {
            await SessionManager.advanceToNextStep(sessionId, progress.currentStepId, nextStepId, session);
          }
        }
      }

      return {
        correct: validationResult.isCorrect,
        feedback: validationResult.feedback,
        attempts: currentAttempts,
        maxAttempts: step.maxAttempts ?? undefined,
        isComplete: isComplete || undefined,
      };
    });
  }

  // ============================================
  // REQUEST HINT
  // ============================================

  async requestHint(sessionId: string): Promise<HintResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);
    const step = await StepNavigator.getStepById(progress.huntId, progress.version, progress.currentStepId);

    if (!step) throw new NotFoundError('Current step not found');
    if (!step.hint) throw new NotFoundError('No hint available for this step');

    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    if ((stepProgress?.hintsUsed ?? 0) >= 1) {
      throw new ConflictError('You have already used your hint for this step');
    }

    const hintsUsed = await SessionManager.incrementHintsUsed(sessionId, progress.currentStepId);

    return { hint: step.hint, hintsUsed, maxHints: 1 };
  }

  // ============================================
  // HELPERS
  // ============================================

  private buildStepResponse(
    sessionId: string,
    step: HydratedDocument<IStep>,
    huntVersion: HydratedDocument<IHuntVersion>,
    stepProgress?: IStepProgress,
  ): StepResponse {
    const stepIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, step.stepId);
    const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, step.stepId);

    const stepPF = PlayerExporter.maybeRandomizeOptions(PlayerExporter.step(step));

    return {
      step: stepPF,
      stepIndex,
      totalSteps: huntVersion.stepOrder.length,
      attempts: stepProgress?.attempts ?? 0,
      maxAttempts: step.maxAttempts ?? null,
      hintsUsed: stepProgress?.hintsUsed ?? 0,
      maxHints: 1,
      _links: {
        self: { href: `/api/play/sessions/${sessionId}/step/${step.stepId}` },
        ...(nextStepId && { next: { href: `/api/play/sessions/${sessionId}/step/${nextStepId}` } }),
        validate: { href: `/api/play/sessions/${sessionId}/validate` },
      },
    };
  }

  private async requireLiveHunt(huntId: number): Promise<HydratedDocument<IHunt>> {
    const hunt = await HuntModel.findOne({ huntId, isDeleted: false });
    if (!hunt) throw new NotFoundError('Hunt not found');
    if (hunt.liveVersion === null || hunt.liveVersion === undefined) {
      throw new ForbiddenError('This hunt is not currently available for playing');
    }
    return hunt;
  }

  private async requireHuntVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion>> {
    const huntVersion = await HuntVersionModel.findPublishedVersion(huntId, version);
    if (!huntVersion) throw new NotFoundError('Hunt version not found');
    return huntVersion;
  }
}
```

---

## Frontend UX Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ULTRA-SMOOTH FLOW                                │
│                                                                         │
│  1. startSession()                                                      │
│     └── Returns: currentStep with _links.next = "/step/20"              │
│                                                                         │
│  2. Prefetch next step (background)                                     │
│     └── GET /step/20 → cache by URL                                     │
│                                                                         │
│  3. User solves, clicks Validate                                        │
│     └── POST /validate → { correct: true } (fast, small payload)        │
│                                                                         │
│  4. INSTANT: Display from cache                                         │
│     └── Get cached /step/20 → display immediately                       │
│                                                                         │
│  5. Prefetch next-next step (background)                                │
│     └── GET /step/30 → cache by URL                                     │
│                                                                         │
│  Repeat...                                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

```typescript
// Frontend example
const [currentStep, setCurrentStep] = useState<StepResponse | null>(null);

// Prefetch on step change
useEffect(() => {
  if (currentStep?._links.next) {
    queryClient.prefetchQuery({
      queryKey: ['step', currentStep._links.next.href],
      queryFn: () => api.get(currentStep._links.next.href),
    });
  }
}, [currentStep]);

// Handle validate
const handleValidate = async (answer) => {
  const result = await api.validate(sessionId, answer);

  if (result.correct) {
    if (result.isComplete) {
      navigate('/complete');
    } else {
      // INSTANT - from cache
      const nextStep = queryClient.getQueryData(['step', currentStep._links.next.href]);
      setCurrentStep(nextStep);
    }
  }
};
```

---

## File Structure

```
packages/shared/src/
├── types/
├── schemas/
└── exporters/
    ├── index.ts
    └── PlayerExporter.ts          ← NEW: Used by backend + frontend

apps/backend/api/src/features/play/
├── play.controller.ts
├── play.service.ts                ← Updated implementation
├── play.routes.ts                 ← Updated routes
├── play.validation.ts
└── helpers/
    ├── session-manager.helper.ts
    ├── step-navigator.helper.ts   ← Simplified (no link generation)
    └── answer-validator.helper.ts

apps/backend/api/src/shared/mappers/
└── play.mapper.ts                 ← DELETE (replaced by PlayerExporter)

apps/frontend/player/src/utils/
└── stripAnswers.ts                ← DELETE (replaced by PlayerExporter)
```

---

## Implementation Steps

### Step 1: Create PlayerExporter in Shared

```bash
# Create file
packages/shared/src/exporters/PlayerExporter.ts

# Export from index
packages/shared/src/index.ts
```

### Step 2: Update OpenAPI Schema

```yaml
# hunthub_models.yaml

# Delete StartSessionResponse
# Update SessionResponse (unified)
# Update ValidateAnswerResponse (remove nextStep, prefetchedSteps)
# Update StepLinks (self includes stepId)
```

### Step 3: Update Backend

1. Update `play.routes.ts` - add `/step/:stepId` route
2. Update `play.service.ts` - use PlayerExporter, add getStep method
3. Update `step-navigator.helper.ts` - remove link generation (moved to service)
4. Delete `play.mapper.ts`

### Step 4: Update Frontend

1. Import `PlayerExporter` from `@hunthub/shared`
2. Delete `stripAnswers.ts`
3. Update prefetch logic to use link URLs as cache keys

### Step 5: Run Tests

```bash
cd apps/backend/api && npm test
cd packages/shared && npm run build
cd apps/frontend/player && npm run build
```

---

## Summary

| Before | After |
|--------|-------|
| `StartSessionResponse` | `SessionResponse` (unified) |
| `PlayMapper` | `PlayerExporter` (in shared) |
| `stripAnswers.ts` (frontend) | `PlayerExporter` (from shared) |
| `/step/next` | `/step/:stepId` (with validation) |
| `/step/current` | Dropped (in session response) |
| Validate returns nextStep | Validate is lightweight |
| Cache invalidation needed | Cache by step ID (no invalidation) |

**Result:** Fast UX, clean code, single source of truth.
