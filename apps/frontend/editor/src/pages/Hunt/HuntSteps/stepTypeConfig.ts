import { MapTrifoldIcon, QuestionIcon, CameraIcon, CheckSquareIcon, Icon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import type { PaletteColor } from '@/utils/getColor/types';
import type { ChallengeFormData } from '@/types/editor';

interface StepTypeConfig {
  icon: Icon;
  label: string;
  description: string;
  color: PaletteColor;
  getTitle: (challenge: ChallengeFormData) => string | undefined;
}

export const STEP_TYPE_CONFIG: Record<ChallengeType, StepTypeConfig> = {
  [ChallengeType.Clue]: {
    icon: MapTrifoldIcon,
    label: 'Clue',
    description: 'Informational step - auto-completes on view',
    color: 'primary.main',
    getTitle: (challenge) => challenge.clue?.title,
  },
  [ChallengeType.Quiz]: {
    icon: QuestionIcon,
    label: 'Quiz',
    description: 'Question with validation',
    color: 'success.main',
    getTitle: (challenge) => challenge.quiz?.title,
  },
  [ChallengeType.Mission]: {
    icon: CameraIcon,
    label: 'Mission',
    description: 'Physical action required',
    color: 'common.black',
    getTitle: (challenge) => challenge.mission?.title,
  },
  [ChallengeType.Task]: {
    icon: CheckSquareIcon,
    label: 'Task',
    description: 'Open-ended with AI validation',
    color: 'accent.dark',
    getTitle: (challenge) => challenge.task?.title,
  },
};
