import React from 'react';
import { Typography } from '@mui/material';
import { CameraIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import * as S from './Mission.styles';

interface PhotoContentProps {
  mission: MissionPF;
}

export const PhotoContent = ({ mission }: PhotoContentProps) => {
  return (
    <S.PlaceholderBox>
      <CameraIcon size={48} weight="duotone" />
      <Typography variant="body2" color="text.secondary">
        Photo upload coming soon
      </Typography>
    </S.PlaceholderBox>
  );
};
