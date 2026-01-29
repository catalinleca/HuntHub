import type { Icon } from '@phosphor-icons/react';
import * as S from './TypeBadge.styles';

interface TypeBadgeProps {
  label: string;
  icon: Icon;
  color: string;
}

export const TypeBadge = ({ label, icon: IconComponent, color }: TypeBadgeProps) => {
  return (
    <S.Badge
      size="small"
      variant="outlined"
      icon={<IconComponent size={14} weight="bold" />}
      label={label}
      $color={color}
    />
  );
};
