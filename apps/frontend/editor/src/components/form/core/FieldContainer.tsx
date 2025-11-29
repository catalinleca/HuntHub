import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';

const StyledFieldContainer = styled(Box)<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${({ $fullWidth = true }) => ($fullWidth ? 1 : 'none')};
  min-width: 0;
  align-items: ${({ $fullWidth = true }) => ($fullWidth ? 'stretch' : 'flex-start')};
`;

interface FieldContainerProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const FieldContainer = ({ children, fullWidth = true }: FieldContainerProps) => {
  return <StyledFieldContainer $fullWidth={fullWidth}>{children}</StyledFieldContainer>;
};
