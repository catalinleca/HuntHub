import type {
  StepPF,
  HuntMetaPF,
  StartSessionResponse,
  ValidateAnswerResponse,
  StepResponse,
  ChallengeType,
  OptionType,
  AnswerType,
  AnswerPayload,
} from '@hunthub/shared';

// =============================================================================
// MOCK DATA (Simulates what BE would store/return)
// =============================================================================

export const mockHuntMeta: HuntMetaPF = {
  huntId: 1,
  name: 'City Explorer Adventure',
  description: 'Discover hidden gems around the city center',
  totalSteps: 4,
  coverImage: undefined,
};

export const mockSteps: StepPF[] = [
  {
    stepId: 1,
    type: 'clue' as ChallengeType,
    challenge: {
      clue: {
        title: 'The Starting Point',
        description:
          'Welcome to the adventure! Look for the old fountain in the main square. Your journey begins here.',
      },
    },
    // Clue with all constraints for testing (will remove later)
    timeLimit: 120,
    maxAttempts: 3,
  },
  {
    stepId: 2,
    type: 'quiz' as ChallengeType,
    challenge: {
      quiz: {
        title: 'History Question',
        description: 'When was this fountain built?',
        type: 'choice' as OptionType,
        options: [
          { id: 'a', text: '1850' },
          { id: 'b', text: '1920' },
          { id: 'c', text: '1965' },
          { id: 'd', text: '1990' },
        ],
        randomizeOrder: false,
      },
    },
    timeLimit: 60,
    maxAttempts: 3,
  },
  {
    stepId: 3,
    type: 'quiz' as ChallengeType,
    challenge: {
      quiz: {
        title: 'Secret Code',
        description: 'Enter the code written on the plaque near the fountain',
        type: 'input' as OptionType,
      },
    },
    maxAttempts: 5,
  },
  {
    stepId: 4,
    type: 'clue' as ChallengeType,
    challenge: {
      clue: {
        title: 'Congratulations!',
        description: 'You have completed the City Explorer Adventure! Thank you for playing.',
      },
    },
  },
];

// Mock hints (server-side only - fetched via API)
const mockHints: Record<number, string> = {
  1: 'The fountain is near the central plaza, look for the statue of the founder.',
  2: 'Think about when the city was founded and add 70 years.',
  3: 'The code starts with "EXPLORE" followed by the current year.',
};

// Mock answers (server-side only - never sent to client)
const mockAnswers: Record<number, string> = {
  2: 'b', // Quiz answer: 1920
  3: 'EXPLORE2024', // Input answer
};

// =============================================================================
// MOCK SESSION STATE (Simulates BE session storage)
// =============================================================================

interface MockSession {
  sessionId: string;
  huntId: number;
  playerName: string;
  email?: string;
  currentStepIndex: number;
  completedSteps: number[];
  attempts: Record<number, number>;
  stepStartedAt: Record<number, number>; // stepId -> timestamp
  startedAt: string;
  status: 'in_progress' | 'completed' | 'abandoned';
}

// In-memory session store (simulates database)
const mockSessions = new Map<string, MockSession>();

// =============================================================================
// MOCK API FUNCTIONS (Simulate BE endpoints)
// =============================================================================

/**
 * POST /api/play/:huntId/start
 * Creates a new session and returns initial data
 */
export const mockStartSession = async (
  huntId: number,
  playerName: string,
  email?: string,
): Promise<StartSessionResponse> => {
  await delay(500);

  const sessionId = generateUUID();

  const session: MockSession = {
    sessionId,
    huntId,
    playerName,
    email,
    currentStepIndex: 0,
    completedSteps: [],
    attempts: {},
    stepStartedAt: { [mockSteps[0].stepId]: Date.now() }, // Start timer for first step
    startedAt: new Date().toISOString(),
    status: 'in_progress',
  };

  mockSessions.set(sessionId, session);

  return {
    sessionId,
    hunt: mockHuntMeta,
    currentStepIndex: 0,
    steps: mockSteps.slice(0, 2), // First 2 steps
  };
};

/**
 * GET /api/play/sessions/:sessionId
 * Resume an existing session
 */
export const mockGetSession = async (sessionId: string): Promise<StartSessionResponse | null> => {
  await delay(300);

  const session = mockSessions.get(sessionId);
  if (!session) {
    return null;
  }

  // Return current step + next step
  const startIdx = session.currentStepIndex;
  const steps = mockSteps.slice(startIdx, startIdx + 2);

  return {
    sessionId: session.sessionId,
    hunt: mockHuntMeta,
    currentStepIndex: session.currentStepIndex,
    steps,
  };
};

// =============================================================================
// HATEOAS STEP ENDPOINTS
// =============================================================================

/**
 * GET /play/sessions/:sessionId/step/current
 * Returns current step with HATEOAS navigation links
 */
export const mockGetCurrentStep = async (sessionId: string): Promise<StepResponse | null> => {
  await delay(200);

  const session = mockSessions.get(sessionId);
  if (!session) {
    return null;
  }

  const step = mockSteps[session.currentStepIndex];
  if (!step) {
    return null;
  }

  const isLastStep = session.currentStepIndex >= mockSteps.length - 1;

  return {
    step,
    _links: {
      self: { href: `/play/sessions/${sessionId}/step/current` },
      ...(isLastStep ? {} : { next: { href: `/play/sessions/${sessionId}/step/next` } }),
      validate: { href: `/play/sessions/${sessionId}/validate` },
    },
  };
};

/**
 * GET /play/sessions/:sessionId/step/next
 * Returns next step for prefetching (HATEOAS)
 */
export const mockGetNextStep = async (sessionId: string): Promise<StepResponse | null> => {
  await delay(200);

  const session = mockSessions.get(sessionId);
  if (!session) {
    return null;
  }

  const nextIndex = session.currentStepIndex + 1;
  const step = mockSteps[nextIndex];
  if (!step) {
    return null;
  }

  return {
    step,
    _links: {
      self: { href: `/play/sessions/${sessionId}/step/next` },
      validate: { href: `/play/sessions/${sessionId}/validate` },
    },
  };
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * POST /play/sessions/:sessionId/validate
 * Validates answer using HATEOAS response format
 * Session tracks current step - no stepIndex needed in request
 */
export const mockValidateAnswer = async (
  sessionId: string,
  answerType: AnswerType,
  payload: AnswerPayload,
): Promise<ValidateAnswerResponse> => {
  await delay(300);

  const session = mockSessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const step = mockSteps[session.currentStepIndex];
  if (!step) {
    throw new Error('No current step - session already complete');
  }

  const stepId = step.stepId;
  const currentAttempts = session.attempts[stepId] || 0;

  // Check time limit (server-side enforcement)
  if (step.timeLimit) {
    const startedAt = session.stepStartedAt[stepId];
    if (startedAt) {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      if (elapsed > step.timeLimit) {
        // Time expired - auto-advance to next step
        advanceToNextStep(session);
        return {
          correct: false,
          feedback: "Time's up!",
          expired: true,
          attempts: currentAttempts,
          maxAttempts: step.maxAttempts ?? undefined,
          _links: {
            currentStep: { href: `/play/sessions/${sessionId}/step/current` },
            nextStep: { href: `/play/sessions/${sessionId}/step/next` },
          },
        };
      }
    }
  }

  // Check max attempts (server-side enforcement)
  if (step.maxAttempts && currentAttempts >= step.maxAttempts) {
    return {
      correct: false,
      feedback: 'No more attempts remaining.',
      exhausted: true,
      attempts: currentAttempts,
      maxAttempts: step.maxAttempts,
      _links: {
        currentStep: { href: `/play/sessions/${sessionId}/step/current` },
      },
    };
  }

  // Increment attempts
  session.attempts[stepId] = currentAttempts + 1;

  const isCorrect = checkAnswer(step, answerType, payload);

  if (isCorrect) {
    advanceToNextStep(session);

    const isComplete = session.currentStepIndex >= mockSteps.length;
    if (isComplete) {
      session.status = 'completed';
    }

    return {
      correct: true,
      feedback: 'Correct! Well done.',
      isComplete,
      attempts: session.attempts[stepId],
      maxAttempts: step.maxAttempts ?? undefined,
      _links: {
        currentStep: { href: `/play/sessions/${sessionId}/step/current` },
        ...(isComplete ? {} : { nextStep: { href: `/play/sessions/${sessionId}/step/next` } }),
      },
    };
  }

  // Check if this attempt exhausted all attempts
  const isExhausted = step.maxAttempts ? session.attempts[stepId] >= step.maxAttempts : false;

  return {
    correct: false,
    feedback: isExhausted ? 'No more attempts remaining.' : 'Not quite right. Try again!',
    attempts: session.attempts[stepId],
    maxAttempts: step.maxAttempts ?? undefined,
    exhausted: isExhausted,
    _links: {
      currentStep: { href: `/play/sessions/${sessionId}/step/current` },
    },
  };
};

const advanceToNextStep = (session: MockSession) => {
  const currentStep = mockSteps[session.currentStepIndex];
  if (currentStep) {
    session.completedSteps.push(currentStep.stepId);
  }
  session.currentStepIndex++;

  // Start timer for next step
  const nextStep = mockSteps[session.currentStepIndex];
  if (nextStep) {
    session.stepStartedAt[nextStep.stepId] = Date.now();
  }
};

// =============================================================================
// HINT API
// =============================================================================

/**
 * POST /play/sessions/:sessionId/hint
 * Request a hint for the current step
 */
export const mockRequestHint = async (
  sessionId: string,
): Promise<{ hint: string; hintsUsed: number; maxHints: number }> => {
  await delay(300);

  // Handle preview/mock sessions
  if (sessionId === 'mock-session') {
    return {
      hint: 'This is a preview hint. In production, hints will come from the backend.',
      hintsUsed: 1,
      maxHints: 1,
    };
  }

  const session = mockSessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const step = mockSteps[session.currentStepIndex];
  if (!step) {
    throw new Error('No current step');
  }

  const hint = mockHints[step.stepId];
  if (!hint) {
    throw new Error('No hint available for this step');
  }

  return {
    hint,
    hintsUsed: 1,
    maxHints: 1,
  };
};

// =============================================================================
// HELPERS
// =============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const generateUUID = (): string => {
  return crypto.randomUUID();
};

const checkAnswer = (step: StepPF, answerType: AnswerType, payload: AnswerPayload): boolean => {
  if (answerType === 'clue') {
    return true;
  }

  const expectedAnswer = mockAnswers[step.stepId];
  if (!expectedAnswer) {
    return true;
  }

  if (answerType === 'quiz-choice' && payload.quizChoice) {
    return payload.quizChoice.optionId === expectedAnswer;
  }

  if (answerType === 'quiz-input' && payload.quizInput) {
    return payload.quizInput.answer.toLowerCase().trim() === expectedAnswer.toLowerCase().trim();
  }

  return false;
};
