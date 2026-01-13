import React from 'react';
import { Typography } from '@mui/material';
import type { BadgeConfig } from '@/constants';
import { TypeBadge } from '../TypeBadge';
import { HintSection } from '../HintSection';
import * as S from './ChallengeLayout.styles';

interface ChallengeLayoutProps {
  children: React.ReactNode;
  badge: BadgeConfig;
  title?: string;
  description?: string;
  footer: React.ReactNode;
  hint?: string | null;
}

export const ChallengeLayout = ({
  badge,
  title,
  description,
  children,
  footer,
  hint,
}: ChallengeLayoutProps) => {
  return (
    <S.Container>
      <TypeBadge {...badge} />

      {title && <Typography variant="h5">{title}</Typography>}
      {description && <Typography color="text.secondary">{description}</Typography>}

      <S.Content>{children}</S.Content>

      {hint && <HintSection hint={hint} />}

      <S.Footer>{footer}</S.Footer>
    </S.Container>
  );
};
