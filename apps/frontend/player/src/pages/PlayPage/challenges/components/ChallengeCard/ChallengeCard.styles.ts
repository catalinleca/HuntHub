import styled, { keyframes } from 'styled-components';
import { Box, Paper } from '@mui/material';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const Container = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  animation: ${fadeIn} 0.3s ease-out;
`;

export const Content = styled(Box)`
  flex: 1;
`;

export const Footer = styled(Box)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
