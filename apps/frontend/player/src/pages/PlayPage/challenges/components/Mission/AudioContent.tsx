import React from 'react';
import { Typography } from '@mui/material';
import { MicrophoneIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import * as S from './Mission.styles';

interface AudioContentProps {
  mission: MissionPF;
}

export const AudioContent = ({ mission }: AudioContentProps) => {
  return (
    <S.PlaceholderBox>
      <MicrophoneIcon size={48} weight="duotone" />
      <Typography variant="body2" color="text.secondary">
        Audio recording coming soon
      </Typography>
    </S.PlaceholderBox>
  );
};
