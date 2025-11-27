import React from 'react';
import styled from 'styled-components';
import { Box } from '@mui/material';

const StyledFieldContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface FieldContainerProps {
  children: React.ReactNode;
}

export const FieldContainer = ({ children }: FieldContainerProps) => {
  return <StyledFieldContainer>{children}</StyledFieldContainer>;
};
