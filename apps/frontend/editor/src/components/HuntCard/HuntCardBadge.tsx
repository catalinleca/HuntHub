import { HuntCardBadgeProps } from './types';
import * as S from './HuntCard.styles';

export const HuntCardBadge = ({ children, color = 'primary' }: HuntCardBadgeProps) => {
  return (
    <S.Badge label={children} color={color} size="small" />
  );
};