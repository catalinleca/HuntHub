import { ChallengeType } from '@hunthub/shared';
import type { PaletteColor } from '../utils/types';

export const CHALLENGE_TYPE_COLORS: Record<ChallengeType, PaletteColor> = {
  [ChallengeType.Clue]: 'primary.main',
  [ChallengeType.Quiz]: 'success.main',
  [ChallengeType.Mission]: 'common.black',
  [ChallengeType.Task]: 'accent.dark',
};
