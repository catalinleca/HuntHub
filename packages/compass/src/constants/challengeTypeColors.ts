import { ChallengeType } from '@hunthub/shared';
import type { PaletteColor } from '../utils/types';

export const CHALLENGE_TYPE_COLORS: Record<ChallengeType, PaletteColor> = {
  [ChallengeType.Clue]: 'challenge.clue',
  [ChallengeType.Quiz]: 'challenge.quiz',
  [ChallengeType.Task]: 'challenge.task',
  [ChallengeType.Mission]: 'challenge.mission',
};
