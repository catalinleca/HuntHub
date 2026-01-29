import { MapTrifoldIcon, QuestionIcon, TargetIcon, CheckSquareIcon, Icon } from '@phosphor-icons/react';
import { ChallengeType, Challenge } from '@hunthub/shared';
import { CHALLENGE_TYPE_COLORS, type PaletteColor } from '@hunthub/compass';

interface StepTypeConfig {
  icon: Icon;
  label: string;
  description: string;
  color: PaletteColor;
  getTitle: (challenge: Challenge) => string | undefined;
}

export const STEP_TYPE_CONFIG: Record<ChallengeType, StepTypeConfig> = {
  [ChallengeType.Clue]: {
    icon: MapTrifoldIcon,
    label: 'Clue',
    description: 'Informational step - auto-completes on view',
    color: CHALLENGE_TYPE_COLORS[ChallengeType.Clue],
    getTitle: (challenge) => challenge.clue?.title ?? undefined,
  },
  [ChallengeType.Quiz]: {
    icon: QuestionIcon,
    label: 'Quiz',
    description: 'Question with validation',
    color: CHALLENGE_TYPE_COLORS[ChallengeType.Quiz],
    getTitle: (challenge) => challenge.quiz?.title ?? undefined,
  },
  [ChallengeType.Mission]: {
    icon: TargetIcon,
    label: 'Mission',
    description: 'Physical action required',
    color: CHALLENGE_TYPE_COLORS[ChallengeType.Mission],
    getTitle: (challenge) => challenge.mission?.title ?? undefined,
  },
  [ChallengeType.Task]: {
    icon: CheckSquareIcon,
    label: 'Task',
    description: 'Open-ended with AI validation',
    color: CHALLENGE_TYPE_COLORS[ChallengeType.Task],
    getTitle: (challenge) => challenge.task?.title ?? undefined,
  },
};
