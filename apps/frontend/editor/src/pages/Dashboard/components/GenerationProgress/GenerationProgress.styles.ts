import styled, { keyframes } from 'styled-components';
import { Stack, alpha } from '@mui/material';

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

export const Card = styled(Stack)`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background: ${({ theme }) => alpha(theme.palette.primary.main, 0.04)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.primary.main, 0.12)};
  max-width: 400px;
  width: 100%;
`;

export const Cursor = styled.span`
  animation: ${blink} 1s infinite;
  margin-left: 1px;
`;
