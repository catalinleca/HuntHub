import { ChallengeType, MissionType, OptionType } from '@hunthub/shared';
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
  [ChallengeType.Clue]: { label: 'Clue', icon: ScrollIcon, color: '#6BCF7F' },
  [ChallengeType.Quiz]: { label: 'Quiz', icon: QuestionIcon, color: '#5DADE2' },
  [ChallengeType.Mission]: { label: 'Mission', icon: CameraIcon, color: '#FF6B6B' },
  [ChallengeType.Task]: { label: 'Challenge', icon: LightningIcon, color: '#9B59B6' },
};

export const QUIZ_BADGES: Record<OptionType, BadgeConfig> = {
  [OptionType.Choice]: { label: 'Quiz', icon: QuestionIcon, color: '#5DADE2' },
  [OptionType.Input]: { label: 'Puzzle', icon: KeyIcon, color: '#5DADE2' },
};

export const MISSION_BADGES: Record<MissionType, BadgeConfig> = {
  [MissionType.MatchLocation]: { label: 'Location', icon: MapPinIcon, color: '#FF6B6B' },
  [MissionType.UploadMedia]: { label: 'Photo Mission', icon: CameraIcon, color: '#FF6B6B' },
  [MissionType.UploadAudio]: { label: 'Audio Mission', icon: MicrophoneIcon, color: '#FF6B6B' },
};

export const MISSION_ACTION_LABELS: Record<MissionType, string> = {
  [MissionType.MatchLocation]: 'Check Location',
  [MissionType.UploadMedia]: 'Upload Photo',
  [MissionType.UploadAudio]: 'Record Audio',
};
