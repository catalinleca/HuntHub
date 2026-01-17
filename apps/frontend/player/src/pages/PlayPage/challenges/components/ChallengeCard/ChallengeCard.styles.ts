import styled, { keyframes } from 'styled-components';
import { alpha, Box, Paper } from '@mui/material';

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
  gap: ${({ theme }) => theme.spacing(3)};
  animation: ${fadeIn} 0.3s ease-out;
`;

export const MediaCard = styled(Box)`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.md}px;
  border: 2px solid ${({ theme }) => theme.palette.grey[300]};
`;

export const ContentCard = styled(Box)`
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border-radius: ${({ theme }) => theme.shape.md}px;
  text-align: center;
  background-color: ${({ theme }) => alpha(theme.palette.accent.main, 0.08)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.accent.main, 0.15)};
`;

export const Content = styled(Box)`
  flex: 1;
`;

export const Footer = styled(Box)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
