import type {
  StepPF,
  HuntMetaPF,
  StartSessionResponse,
  ValidateAnswerResponse,
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
  },
  {
    stepId: 4,
    type: 'clue' as ChallengeType,
    challenge: {
      clue: {
        title: 'Congratulations!',
        description:
          'You have completed the City Explorer Adventure! Thank you for playing.',
      },
    },
  },
];

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
  // Simulate network delay
  await delay(500);

  const sessionId = `session_${huntId}_${Date.now()}`;

  // Create session in "database"
  const session: MockSession = {
    sessionId,
    huntId,
    playerName,
    email,
    currentStepIndex: 0,
    completedSteps: [],
    attempts: {},
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
export const mockGetSession = async (
  sessionId: string,
): Promise<StartSessionResponse | null> => {
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

export const mockValidateAnswer = async (
  sessionId: string,
  stepIndex: number,
  answerType: AnswerType,
  payload: AnswerPayload,
): Promise<ValidateAnswerResponse> => {
  await delay(300);

  const session = mockSessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  if (stepIndex !== session.currentStepIndex) {
    throw new Error('Invalid step index');
  }

  const step = mockSteps[stepIndex];
  const stepId = step.stepId;

  session.attempts[stepId] = (session.attempts[stepId] || 0) + 1;

  const isCorrect = checkAnswer(step, answerType, payload);

  if (isCorrect) {
    session.completedSteps.push(stepId);
    session.currentStepIndex++;

    const isComplete = session.currentStepIndex >= mockSteps.length;
    if (isComplete) {
      session.status = 'completed';
    }

    const nextStep = mockSteps[session.currentStepIndex];

    return {
      correct: true,
      feedback: 'Correct! Well done.',
      currentStepIndex: session.currentStepIndex,
      nextStep,
      isComplete,
    };
  }

  return {
    correct: false,
    feedback: 'Not quite right. Try again!',
    currentStepIndex: session.currentStepIndex,
    attempts: session.attempts[stepId],
  };
};

// =============================================================================
// HELPERS
// =============================================================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const checkAnswer = (
  step: StepPF,
  answerType: AnswerType,
  payload: AnswerPayload,
): boolean => {
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
