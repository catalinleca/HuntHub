import React from 'react';
import { Typography } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import * as S from './Mission.styles';

interface LocationContentProps {
  mission: MissionPF;
}

export const LocationContent = ({ mission }: LocationContentProps) => {
  return (
    <S.PlaceholderBox>
      <MapPinIcon size={48} weight="duotone" />
      <Typography variant="body2" color="text.secondary">
        Location check coming soon
      </Typography>
    </S.PlaceholderBox>
  );
};
