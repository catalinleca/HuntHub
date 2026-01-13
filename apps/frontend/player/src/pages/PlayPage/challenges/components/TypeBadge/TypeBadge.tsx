import { Typography } from '@mui/material';
import type { Icon } from '@phosphor-icons/react';
import * as S from './TypeBadge.styles';

interface TypeBadgeProps {
  label: string;
  icon: Icon;
  color: string;
}

export const TypeBadge = ({ label, icon: IconComponent, color }: TypeBadgeProps) => {
  return (
    <S.Badge $color={color}>
      <IconComponent size={16} weight="bold" />
      <Typography variant="overline">{label}</Typography>
    </S.Badge>
  );
};
