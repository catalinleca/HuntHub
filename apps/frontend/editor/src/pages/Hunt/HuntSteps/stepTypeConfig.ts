import { MapTrifoldIcon, QuestionIcon, CameraIcon, CheckSquareIcon, Icon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import { getColor } from '@/utils';

interface StepTypeConfig {
  icon: Icon;
  label: string;
  description: string;
  color: string;
}

export const STEP_TYPE_CONFIG: Record<ChallengeType, StepTypeConfig> = {
  [ChallengeType.Clue]: {
    icon: MapTrifoldIcon,
    label: 'Clue',
    description: 'Informational step - auto-completes on view',
    color: getColor('primary.main'),
  },
  [ChallengeType.Quiz]: {
    icon: QuestionIcon,
    label: 'Quiz',
    description: 'Question with validation',
    color: getColor('success.main'),
  },
  [ChallengeType.Mission]: {
    icon: CameraIcon,
    label: 'Mission',
    description: 'Physical action required',
    color: getColor('error.main'),
  },
  [ChallengeType.Task]: {
    icon: CheckSquareIcon,
    label: 'Task',
    description: 'Open-ended with AI validation',
    color: getColor('accent.dark'),
  },
};
