import { ChallengeType, MissionType, OptionType } from '@hunthub/shared';
import { CHALLENGE_TYPE_COLORS, getColor } from '@hunthub/compass';
import {
  ScrollIcon,
  QuestionIcon,
  KeyIcon,
  MapPinIcon,
  CameraIcon,
  MicrophoneIcon,
  LightningIcon,
  Icon,
} from '@phosphor-icons/react';

export interface BadgeConfig {
  label: string;
  icon: Icon;
  color: string;
}

export const CHALLENGE_BADGES: Record<ChallengeType, BadgeConfig> = {
  [ChallengeType.Clue]: {
    label: 'Clue',
    icon: ScrollIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Clue]),
  },
  [ChallengeType.Quiz]: {
    label: 'Quiz',
    icon: QuestionIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Quiz]),
  },
  [ChallengeType.Mission]: {
    label: 'Mission',
    icon: CameraIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Mission]),
  },
  [ChallengeType.Task]: {
    label: 'Task',
    icon: LightningIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Task]),
  },
};

export const QUIZ_BADGES: Record<OptionType, BadgeConfig> = {
  [OptionType.Choice]: {
    label: 'Quiz',
    icon: QuestionIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Quiz]),
  },
  [OptionType.Input]: {
    label: 'Puzzle',
    icon: KeyIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Quiz]),
  },
};

export const MISSION_BADGES: Record<MissionType, BadgeConfig> = {
  [MissionType.MatchLocation]: {
    label: 'Location',
    icon: MapPinIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Mission]),
  },
  [MissionType.UploadMedia]: {
    label: 'Photo Mission',
    icon: CameraIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Mission]),
  },
  [MissionType.UploadAudio]: {
    label: 'Audio Mission',
    icon: MicrophoneIcon,
    color: getColor(CHALLENGE_TYPE_COLORS[ChallengeType.Mission]),
  },
};

export const MISSION_ACTION_LABELS: Record<MissionType, string> = {
  [MissionType.MatchLocation]: 'Check Location',
  [MissionType.UploadMedia]: 'Upload Photo',
  [MissionType.UploadAudio]: 'Record Audio',
};
