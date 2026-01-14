import type {
  SessionResponse,
  StepResponse,
  ValidateAnswerResponse,
  HintResponse,
  AnswerType,
  AnswerPayload,
} from '@hunthub/shared';
import { httpClient } from '@/services/http-client';

/**
 * Play API - Real backend calls
 *
 * Endpoints:
 * - POST /play/:huntId/start - Start new session
 * - GET /play/sessions/:sessionId - Resume session
 * - GET /play/sessions/:sessionId/step/:stepId - Get specific step
 * - POST /play/sessions/:sessionId/validate - Submit answer
 * - POST /play/sessions/:sessionId/hint - Request hint
 */

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * POST /play/:huntId/start
 * Creates a new session and returns initial state with first step
 */
export const startSession = async (
  huntId: number,
  playerName: string,
  email?: string,
): Promise<SessionResponse> => {
  const response = await httpClient.post<SessionResponse>(`/play/${huntId}/start`, {
    playerName,
    ...(email && { email }),
  });

  return response.data;
};

/**
 * GET /play/sessions/:sessionId
 * Resume an existing session - returns current state
 */
export const getSession = async (sessionId: string): Promise<SessionResponse> => {
  const response = await httpClient.get<SessionResponse>(`/play/sessions/${sessionId}`);

  return response.data;
};

// =============================================================================
// STEP NAVIGATION (HATEOAS)
// =============================================================================

/**
 * GET /play/sessions/:sessionId/step/:stepId
 * Get specific step data with navigation links
 *
 * Access control: Can only fetch current step or next step (for prefetching)
 */
export const getStep = async (sessionId: string, stepId: number): Promise<StepResponse> => {
  const response = await httpClient.get<StepResponse>(`/play/sessions/${sessionId}/step/${stepId}`);

  return response.data;
};

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * POST /play/sessions/:sessionId/validate
 * Submit answer for current step
 *
 * Server tracks current step position - no stepId needed in request
 */
export const validateAnswer = async (
  sessionId: string,
  answerType: AnswerType,
  payload: AnswerPayload,
): Promise<ValidateAnswerResponse> => {
  const response = await httpClient.post<ValidateAnswerResponse>(
    `/play/sessions/${sessionId}/validate`,
    {
      answerType,
      payload,
    },
  );

  return response.data;
};

// =============================================================================
// HINTS
// =============================================================================

/**
 * POST /play/sessions/:sessionId/hint
 * Request hint for current step
 *
 * MVP: 1 hint per step (hardcoded limit)
 */
export const requestHint = async (sessionId: string): Promise<HintResponse> => {
  const response = await httpClient.post<HintResponse>(`/play/sessions/${sessionId}/hint`);

  return response.data;
};
