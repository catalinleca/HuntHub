import styled from 'styled-components';
import { alpha } from '@mui/material/styles';
import { Stack, Box, Paper } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(4)};
  padding-bottom: calc(${({ theme }) => theme.spacing(4)} + env(safe-area-inset-bottom));
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const LogoCircle = styled(Box)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.1)};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const Logo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

export const StatsCard = styled(Paper)`
  width: 100%;
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const StatItem = styled(Stack)`
  flex: 1;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const CompletionCard = styled(Box)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border-radius: ${({ theme }) => theme.shape.md}px;
  text-align: center;
  background-color: ${({ theme }) => alpha(theme.palette.accent.main, 0.08)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.accent.main, 0.15)};
`;

export const Footer = styled(Stack)`
  width: 100%;
  margin-top: auto;
  gap: ${({ theme }) => theme.spacing(2)};
`;
