import styled from 'styled-components';
import { Stack, Paper, Button, alpha } from '@mui/material';

export const PageContainer = styled(Stack)`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(4)};
  background:
    radial-gradient(
      ellipse 80% 60% at 10% 20%,
      ${({ theme }) => alpha(theme.palette.accent.main, 0.55)} 0%,
      transparent 50%
    ),
    radial-gradient(
      ellipse 70% 80% at 90% 80%,
      ${({ theme }) => alpha(theme.palette.primary.main, 0.5)} 0%,
      transparent 55%
    ),
    radial-gradient(
      ellipse 50% 40% at 80% 15%,
      ${({ theme }) => alpha(theme.palette.divider, 0.45)} 0%,
      transparent 45%
    ),
    radial-gradient(
      ellipse 60% 50% at 20% 85%,
      ${({ theme }) => alpha(theme.palette.accent.light, 0.4)} 0%,
      transparent 50%
    ),
    radial-gradient(circle at 50% 50%, ${({ theme }) => alpha(theme.palette.primary.light, 0.15)} 0%, transparent 60%),
    linear-gradient(
      145deg,
      ${({ theme }) => theme.palette.grey[50]} 0%,
      ${({ theme }) => theme.palette.background.default} 50%,
      ${({ theme }) => theme.palette.background.surface} 100%
    );
`;

export const Card = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  max-width: 420px;
  border-radius: ${({ theme }) => theme.shape.lg}px;
`;

export const PromptCard = styled(Stack)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.05)};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.md}px;
`;

export const Divider = styled(Stack)`
  width: 100%;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.palette.divider};
  }
`;

export const GoogleButton = styled(Button)`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.palette.primary.main} 0%,
    ${({ theme }) => theme.palette.primary.dark} 100%
  );

  &:hover {
    background: linear-gradient(
      135deg,
      ${({ theme }) => theme.palette.primary.dark} 0%,
      ${({ theme }) => theme.palette.primary.main} 100%
    );
  }
`;
