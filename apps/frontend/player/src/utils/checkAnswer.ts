import type { Step, AnswerType, AnswerPayload } from '@hunthub/shared';
import type { ValidationResult } from '@/context/Validation/types';

/**
 * Client-side validation against full Step data (with answers)
 * Used by MockValidationProvider for preview mode
 *
 * @param step - Full Step with answers (quiz.targetId, quiz.expectedAnswer, etc.)
 * @param answerType - Type of answer being validated
 * @param payload - The answer payload from the user
 * @returns ValidationResult with isCorrect and feedback
 */
export const checkAnswer = (step: Step, answerType: AnswerType, payload: AnswerPayload): ValidationResult => {
  switch (answerType) {
    case 'clue': {
      // Clues are always "correct" - just acknowledgment
      return {
        isCorrect: true,
        feedback: 'Got it! Moving on...',
      };
    }

    case 'quiz-choice': {
      const expectedId = step.challenge.quiz?.targetId;
      const actualId = payload.quizChoice?.optionId;

      if (!expectedId) {
        // No correct answer defined - pass through
        return { isCorrect: true, feedback: 'Acknowledged' };
      }

      const isCorrect = expectedId === actualId;
      return {
        isCorrect,
        feedback: isCorrect ? 'Correct! Well done.' : 'Not quite right. Try again!',
      };
    }

    case 'quiz-input': {
      const expectedAnswer = step.challenge.quiz?.expectedAnswer;
      const actualAnswer = payload.quizInput?.answer;

      if (!expectedAnswer) {
        // No correct answer defined - pass through
        return { isCorrect: true, feedback: 'Acknowledged' };
      }

      // Case-insensitive, trimmed comparison
      const isCorrect = expectedAnswer.toLowerCase().trim() === actualAnswer?.toLowerCase().trim();

      return {
        isCorrect,
        feedback: isCorrect ? 'Correct! Well done.' : 'Not quite right. Try again!',
      };
    }

    case 'mission-location': {
      const targetLocation = step.challenge.mission?.targetLocation;
      const playerLocation = payload.missionLocation;

      if (!targetLocation || !playerLocation) {
        // No location to validate against - pass through
        return { isCorrect: true, feedback: 'Location acknowledged' };
      }

      // Calculate distance and check if within radius
      const distance = calculateDistance(
        playerLocation.lat,
        playerLocation.lng,
        targetLocation.lat,
        targetLocation.lng,
      );

      const isCorrect = distance <= targetLocation.radius;
      return {
        isCorrect,
        feedback: isCorrect ? 'You found the location!' : `You're about ${Math.round(distance)}m away. Keep looking!`,
      };
    }

    case 'mission-media': {
      // Media upload validation would be server-side (AI analysis)
      // For preview, auto-pass
      return {
        isCorrect: true,
        feedback: 'Media received (preview mode - auto-validated)',
      };
    }

    case 'task': {
      // Task validation would be server-side (AI analysis)
      // For preview, auto-pass
      return {
        isCorrect: true,
        feedback: 'Task response received (preview mode - auto-validated)',
      };
    }

    default: {
      console.warn(`Unknown answer type: ${answerType}`);
      return {
        isCorrect: true,
        feedback: 'Validated',
      };
    }
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
