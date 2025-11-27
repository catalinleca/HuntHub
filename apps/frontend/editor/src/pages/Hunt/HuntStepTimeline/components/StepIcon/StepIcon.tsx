import {
  MapTrifold,
  Question,
  Camera,
  CheckSquare
} from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import * as S from './StepIcon.styles';

interface StepIconProps {
  stepNumber: number;
  type: ChallengeType;
  isSelected: boolean;
  onClick: () => void;
}

const STEP_ICONS: Record<ChallengeType, typeof MapTrifold> = {
  [ChallengeType.Clue]: MapTrifold,
  [ChallengeType.Quiz]: Question,
  [ChallengeType.Mission]: Camera,
  [ChallengeType.Task]: CheckSquare,
};

export const StepIcon = ({ stepNumber, type, isSelected, onClick }: StepIconProps) => {
  const Icon = STEP_ICONS[type];

  return (
    <S.Container $selected={isSelected} onClick={onClick}>
      <S.Number>{stepNumber}</S.Number>
      <Icon size={24} weight={isSelected ? 'fill' : 'regular'} />
    </S.Container>
  );
};
