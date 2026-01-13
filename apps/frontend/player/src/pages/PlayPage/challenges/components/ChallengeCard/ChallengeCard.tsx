import React from 'react';
import { Typography } from '@mui/material';
import type { BadgeConfig } from '@/constants';
import { TypeBadge } from '../TypeBadge';
import { HintSection } from '../HintSection';
import * as S from './ChallengeCard.styles';

interface ChallengeCardProps {
  children: React.ReactNode;
  badge: BadgeConfig;
  title?: string;
  description?: string;
  footer: React.ReactNode;
  showHint?: boolean;
}

export const ChallengeCard = ({ badge, title, description, children, footer, showHint }: ChallengeCardProps) => {
  return (
    <S.Container>
      <TypeBadge {...badge} />

      {title && <Typography variant="h5">{title}</Typography>}
      {description && <Typography color="text.secondary">{description}</Typography>}

      <S.Content>{children}</S.Content>

      {showHint && <HintSection />}

      <S.Footer>{footer}</S.Footer>
    </S.Container>
  );
};
