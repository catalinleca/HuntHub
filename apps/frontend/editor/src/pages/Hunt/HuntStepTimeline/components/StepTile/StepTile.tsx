import React from 'react';
import { Tooltip } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import type { ChallengeFormData } from '@/types/editor';
import { STEP_TYPE_CONFIG } from '../../../HuntSteps/stepTypeConfig';
import * as S from './StepTile.styles';

export interface StepTileProps {
  formKey: string;
  stepNumber: number;
  type: ChallengeType;
  challenge: ChallengeFormData;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
}

export const StepTile = ({
  formKey,
  stepNumber,
  type,
  challenge,
  isSelected,
  onClick,
  style,
  ref,
  ...rest
}: StepTileProps) => {
  const config = STEP_TYPE_CONFIG[type];
  const Icon = config.icon;
  const title = config.getTitle(challenge);

  return (
    <Tooltip title={`${config.label} step`} enterDelay={1500} placement="top">
      <S.Container
        ref={ref}
        style={style}
        data-form-key={formKey}
        onClick={onClick}
        $selected={isSelected}
        $color={config.color}
        {...rest}
      >
        <Icon size={32} weight={isSelected ? 'fill' : 'regular'} />
        <S.TitleArea>{title && <S.Title variant="xsMedium">{title}</S.Title>}</S.TitleArea>
        <S.Badge>{stepNumber}</S.Badge>
      </S.Container>
    </Tooltip>
  );
};
