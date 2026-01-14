import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

const DEFAULT_RADIUS_METERS = 50;

/**
 * MissionLocationValidator - Validates GPS location answers
 *
 * Uses Haversine formula to calculate distance between
 * player's location and target location.
 */
export const MissionLocationValidator: IAnswerValidator = {
  validate(payload: AnswerPayload, step: IStep): ValidationResult {
    const challenge = step.challenge as Challenge;
    const mission = challenge.mission;

    if (!mission) {
      return {
        isCorrect: false,
        feedback: 'Invalid mission configuration',
      };
    }

    const targetLocation = mission.targetLocation;
    const submittedLocation = payload.missionLocation;

    if (!submittedLocation) {
      return {
        isCorrect: false,
        feedback: 'Location data missing',
      };
    }

    if (!targetLocation) {
      return {
        isCorrect: false,
        feedback: 'Invalid mission configuration - no target location',
      };
    }

    const distance = haversineDistance(
      submittedLocation.lat,
      submittedLocation.lng,
      targetLocation.lat,
      targetLocation.lng,
    );

    const radius = targetLocation.radius ?? DEFAULT_RADIUS_METERS;
    const isCorrect = distance <= radius;

    if (isCorrect) {
      return {
        isCorrect: true,
        feedback: 'You found it!',
      };
    }

    // Provide distance feedback for incorrect answers
    const distanceRounded = Math.round(distance);
    return {
      isCorrect: false,
      feedback: `You're ${distanceRounded}m away. Keep searching!`,
    };
  },
};

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 *
 * @returns Distance in meters
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
