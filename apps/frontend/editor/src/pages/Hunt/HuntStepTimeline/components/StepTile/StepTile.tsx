import { Tooltip } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import type { ChallengeFormData } from '@/types/editor';
import { STEP_TYPE_CONFIG } from '../../../HuntSteps/stepTypeConfig';
import * as S from './StepTile.styles';

interface StepTileProps {
  stepNumber: number;
  type: ChallengeType;
  challenge: ChallengeFormData;
  isSelected: boolean;
  onClick: () => void;
}

export const StepTile = ({ stepNumber, type, challenge, isSelected, onClick }: StepTileProps) => {
  const config = STEP_TYPE_CONFIG[type];
  const Icon = config.icon;
  const title = config.getTitle(challenge);

  return (
    <Tooltip title={`${config.label} step`} enterDelay={1500} placement="top">
      <S.Container onClick={onClick}>
        <S.IconArea $selected={isSelected} $color={config.color}>
          <Icon size={28} weight={isSelected ? 'fill' : 'regular'} />
        </S.IconArea>
        <S.Badge>{stepNumber}</S.Badge>
        {title && <S.Title noWrap>{title}</S.Title>}
      </S.Container>
    </Tooltip>
  );
};
