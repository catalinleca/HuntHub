import * as S from './HuntCard.styles';
import { ReactNode } from 'react'

export interface HuntCardProps {
  children: ReactNode;
  transition?: boolean;
  onClick?: () => void;
}

export const HuntCard = ({ children, transition = true, onClick }: HuntCardProps) => {
  return (
    <S.Card $transition={transition} onClick={onClick}>
      {children}
    </S.Card>
  );
};
