import type { ReactNode } from 'react';
import * as S from './StepActions.styles';

interface StepActionsProps {
  children: ReactNode;
}

export const StepActions = ({ children }: StepActionsProps) => {
  return <S.Actions gap={2}>{children}</S.Actions>;
};