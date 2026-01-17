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

export const MediaCard = styled(Box)`
  overflow: hidden;
  border-radius: ${({ theme }) => theme.shape.md}px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  background-color: ${({ theme }) => theme.palette.background.surface};

  img,
  video {
    width: 100%;
    height: auto;
    display: block;
  }
`;

export const ContentCard = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.shape.md}px;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  text-align: center;
  background-color: ${({ theme }) => theme.palette.background.surface};
`;

export const Content = styled(Box)`
  flex: 1;
`;

export const Footer = styled(Box)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
