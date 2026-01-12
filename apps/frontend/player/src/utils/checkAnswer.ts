import type { Step, AnswerType, AnswerPayload } from '@hunthub/shared';
import type { ValidationResult } from '@/context/Validation/types';

const CORRECT = 'Correct! Well done.';
const INCORRECT = 'Not quite right. Try again!';

/**
 * Client-side validation for preview mode.
 * Validates user answers against full Step data (which includes correct answers).
 */
export const checkAnswer = (step: Step, answerType: AnswerType, payload: AnswerPayload): ValidationResult => {
  switch (answerType) {
    case 'clue':
      return { isCorrect: true, feedback: 'Got it! Moving on...' };

    case 'quiz-choice': {
      const expected = step.challenge.quiz?.targetId;
      const actual = payload.quizChoice?.optionId;

      if (!expected) {
        return { isCorrect: true, feedback: 'Acknowledged' };
      }

      const isCorrect = expected === actual;
      return { isCorrect, feedback: isCorrect ? CORRECT : INCORRECT };
    }

    case 'quiz-input': {
      const expected = step.challenge.quiz?.expectedAnswer?.toLowerCase().trim();
      const actual = payload.quizInput?.answer?.toLowerCase().trim();

      if (!expected) {
        return { isCorrect: true, feedback: 'Acknowledged' };
      }

      const isCorrect = expected === actual;
      return { isCorrect, feedback: isCorrect ? CORRECT : INCORRECT };
    }

    case 'mission-location': {
      const target = step.challenge.mission?.targetLocation;
      const player = payload.missionLocation;

      if (!target || !player) {
        return { isCorrect: true, feedback: 'Location acknowledged' };
      }

      const distance = haversineDistance(player.lat, player.lng, target.lat, target.lng);
      const isCorrect = distance <= target.radius;

      return {
        isCorrect,
        feedback: isCorrect ? 'You found the location!' : `You're about ${Math.round(distance)}m away. Keep looking!`,
      };
    }

    case 'mission-media':
      return { isCorrect: true, feedback: 'Media received (preview: auto-validated)' };

    case 'task':
      return { isCorrect: true, feedback: 'Task received (preview: auto-validated)' };

    default:
      console.warn(`Unknown answer type: ${answerType}`);
      return { isCorrect: true, feedback: 'Validated' };
  }
};

/** Haversine formula - distance between two coordinates in meters */
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const toRad = (deg: number): number => deg * (Math.PI / 180);
