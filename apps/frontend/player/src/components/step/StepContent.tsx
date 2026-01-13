import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Stack } from '@mui/material';

const Content = styled(Stack)`
  flex: 1;
  overflow-y: auto;
`;

interface StepContentProps {
  children: ReactNode;
}

export const StepContent = ({ children }: StepContentProps) => {
  return <Content gap={2}>{children}</Content>;
};