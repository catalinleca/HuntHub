import type { ReactNode } from 'react';
import * as S from './StepContainer.styles';

interface StepContainerProps {
  children: ReactNode;
}

export const StepContainer = ({ children }: StepContainerProps) => {
  return <S.Container elevation={1}>{children}</S.Container>;
};
