import { ReactNode } from 'react';
import * as S from './HuntCard.styles';

interface HuntCardProps {
  children: ReactNode;
  onClick?: () => void;
}

export const HuntCard = ({ children, onClick }: HuntCardProps) => {
  return <S.HuntCard onClick={onClick}>{children}</S.HuntCard>;
};
