import { useMemo, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HuntProgressStatus, type PreviewSessionResponse } from '@hunthub/shared';
import { useStartPreviewSession, useNavigateToStep as useNavigateToStepMutation, playKeys } from '@/api';
import { SessionStatus, SessionStateContext, SessionActionsContext } from './SessionContexts';
import { deriveStatus } from './internal/deriveStatus';
import { useStepManagement } from './internal/useStepManagement';
import type { SessionState, SessionActions } from './SessionContexts';

interface AuthorPreviewSessionProviderProps {
  previewToken: string;
  children: ReactNode;
}

export const AuthorPreviewSessionProvider = ({ previewToken, children }: AuthorPreviewSessionProviderProps) => {
  const queryClient = useQueryClient();

  const sessionQuery = useStartPreviewSession(previewToken);
  const session = sessionQuery.data;

  const { stepQuery } = useStepManagement(session?.sessionId ?? null, session?.currentStepId ?? null);

  const { navigateToStep: navigateToStepMutate } = useNavigateToStepMutation();

  const sessionIdRef = useRef<string | null>(null);
  const stepOrderRef = useRef<number[]>([]);
  const currentStepIndexRef = useRef<number>(0);

  sessionIdRef.current = session?.sessionId ?? null;
  stepOrderRef.current = session?.stepOrder ?? [];
  currentStepIndexRef.current = session?.currentStepIndex ?? 0;

  const derivedStatus = deriveStatus(sessionQuery, stepQuery);
  const status = derivedStatus === SessionStatus.Identifying ? SessionStatus.Loading : derivedStatus;
  const error = sessionQuery.error ?? stepQuery.error ?? null;

  const isLastStep = session ? currentStepIndexRef.current >= stepOrderRef.current.length - 1 : false;

  const stateValue: SessionState = useMemo(
    () => ({
      status,
      error,
      sessionId: session?.sessionId ?? null,
      huntMeta: session?.hunt ?? null,
      stepResponse: stepQuery.data ?? null,
      isLastStep,
      startedAt: session?.startedAt ?? null,
      completedAt: session?.completedAt ?? null,
      isPreview: true,
      stepOrder: session?.stepOrder,
    }),
    [status, error, session, stepQuery.data, isLastStep],
  );

  const actionsValue: SessionActions = useMemo(
    () => ({
      startSession: () => {},
      abandonSession: () => {
        queryClient.removeQueries({ queryKey: playKeys.all });
        window.location.reload();
      },
      advanceToNextStep: () => {
        const stepOrder = stepOrderRef.current;
        const currentIndex = currentStepIndexRef.current;

        if (stepOrder.length === 0) {
          return;
        }

        const nextIndex = currentIndex + 1;
        const isComplete = nextIndex >= stepOrder.length;

        queryClient.setQueryData<PreviewSessionResponse>(playKeys.previewSession(previewToken), (old) => {
          if (!old) {
            return old;
          }

          if (isComplete) {
            return { ...old, status: HuntProgressStatus.Completed, currentStepId: null };
          }

          return {
            ...old,
            currentStepIndex: nextIndex,
            currentStepId: stepOrder[nextIndex],
          };
        });
      },
      navigateToStep: async (stepId: number) => {
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) {
          return;
        }

        try {
          const result = await navigateToStepMutate({ sessionId: currentSessionId, stepId });

          queryClient.setQueryData<PreviewSessionResponse>(playKeys.previewSession(previewToken), (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              currentStepIndex: result.currentStepIndex,
              currentStepId: result.currentStepId,
            };
          });
        } catch (err) {
          console.error('Failed to navigate to step:', err);
        }
      },
      navigateNext: async () => {
        const stepOrder = stepOrderRef.current;
        const currentIndex = currentStepIndexRef.current;
        const nextIndex = currentIndex + 1;

        if (nextIndex >= stepOrder.length) {
          return;
        }

        const nextStepId = stepOrder[nextIndex];
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) {
          return;
        }

        try {
          const result = await navigateToStepMutate({ sessionId: currentSessionId, stepId: nextStepId });

          queryClient.setQueryData<PreviewSessionResponse>(playKeys.previewSession(previewToken), (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              currentStepIndex: result.currentStepIndex,
              currentStepId: result.currentStepId,
            };
          });
        } catch (err) {
          console.error('Failed to navigate to next step:', err);
        }
      },
      navigatePrev: async () => {
        const stepOrder = stepOrderRef.current;
        const currentIndex = currentStepIndexRef.current;
        const prevIndex = currentIndex - 1;

        if (prevIndex < 0) {
          return;
        }

        const prevStepId = stepOrder[prevIndex];
        const currentSessionId = sessionIdRef.current;
        if (!currentSessionId) {
          return;
        }

        try {
          const result = await navigateToStepMutate({ sessionId: currentSessionId, stepId: prevStepId });

          queryClient.setQueryData<PreviewSessionResponse>(playKeys.previewSession(previewToken), (old) => {
            if (!old) {
              return old;
            }

            return {
              ...old,
              currentStepIndex: result.currentStepIndex,
              currentStepId: result.currentStepId,
            };
          });
        } catch (err) {
          console.error('Failed to navigate to previous step:', err);
        }
      },
    }),
    [previewToken, queryClient, navigateToStepMutate],
  );

  return (
    <SessionActionsContext.Provider value={actionsValue}>
      <SessionStateContext.Provider value={stateValue}>{children}</SessionStateContext.Provider>
    </SessionActionsContext.Provider>
  );
};
