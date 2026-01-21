import { MapTrifoldIcon, QuestionIcon, CameraIcon, CheckSquareIcon, Icon } from '@phosphor-icons/react';
import { ChallengeType, Challenge } from '@hunthub/shared';
import type { PaletteColor } from '@hunthub/compass';

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
    color: 'primary.main',
    getTitle: (challenge) => challenge.clue?.title ?? undefined,
  },
  [ChallengeType.Quiz]: {
    icon: QuestionIcon,
    label: 'Quiz',
    description: 'Question with validation',
    color: 'success.main',
    getTitle: (challenge) => challenge.quiz?.title ?? undefined,
  },
  [ChallengeType.Mission]: {
    icon: CameraIcon,
    label: 'Mission',
    description: 'Physical action required',
    color: 'common.black',
    getTitle: (challenge) => challenge.mission?.title ?? undefined,
  },
  [ChallengeType.Task]: {
    icon: CheckSquareIcon,
    label: 'Task',
    description: 'Open-ended with AI validation',
    color: 'accent.dark',
    getTitle: (challenge) => challenge.task?.title ?? undefined,
  },
};
