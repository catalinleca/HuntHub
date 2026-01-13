import type { Step, StepPF, ChallengePF } from '@hunthub/shared';

/**
 * Convert full Step (with answers) to StepPF (player format, no answers)
 * Used by preview mode to display steps without exposing answers to DevTools
 *
 * Removes:
 * - quiz.targetId (correct choice ID)
 * - quiz.expectedAnswer (correct text answer)
 * - mission.targetLocation (correct location)
 * - task.aiInstructions (internal AI prompts)
 * - Metadata and timestamps
 */
export const stripAnswers = (step: Step): StepPF => {
  const challengePF: ChallengePF = {};

  // Strip based on challenge type
  if (step.challenge.clue) {
    challengePF.clue = {
      title: step.challenge.clue.title ?? '',
      description: step.challenge.clue.description ?? '',
    };
  }

  if (step.challenge.quiz) {
    challengePF.quiz = {
      title: step.challenge.quiz.title ?? '',
      description: step.challenge.quiz.description ?? '',
      type: step.challenge.quiz.type!,
      options: step.challenge.quiz.options,
      randomizeOrder: step.challenge.quiz.randomizeOrder,
      // Explicitly NOT including: targetId, expectedAnswer
    };
  }

  if (step.challenge.mission) {
    challengePF.mission = {
      title: step.challenge.mission.title ?? '',
      description: step.challenge.mission.description ?? '',
      type: step.challenge.mission.type!,
      referenceAssetIds: step.challenge.mission.referenceAssetIds,
      // Explicitly NOT including: targetLocation
    };
  }

  if (step.challenge.task) {
    challengePF.task = {
      title: step.challenge.task.title ?? '',
      instructions: step.challenge.task.instructions ?? '',
      // Explicitly NOT including: aiInstructions, aiModel
    };
  }

  return {
    stepId: step.stepId,
    type: step.type,
    challenge: challengePF,
    media: step.media,
    timeLimit: step.timeLimit,
    maxAttempts: step.maxAttempts,
    // Explicitly NOT including: requiredLocation, hint, metadata, timestamps
  };
};
