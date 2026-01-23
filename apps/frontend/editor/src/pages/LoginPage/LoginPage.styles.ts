import styled from 'styled-components';
import { Stack, Paper, alpha } from '@mui/material';

export const PageContainer = styled(Stack)`
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(4)};
  background:
    radial-gradient(ellipse at 30% 20%, ${({ theme }) => alpha(theme.palette.accent.light, 0.4)} 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, ${({ theme }) => alpha(theme.palette.primary.main, 0.25)} 0%, transparent 50%),
    radial-gradient(ellipse at 90% 30%, ${({ theme }) => alpha(theme.palette.divider, 0.5)} 0%, transparent 40%),
    linear-gradient(
      160deg,
      ${({ theme }) => theme.palette.background.defaultLight} 0%,
      ${({ theme }) => theme.palette.background.default} 50%,
      ${({ theme }) => alpha(theme.palette.accent.medium, 0.2)} 100%
    );
`;

export const Card = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(6)};
  width: 100%;
  max-width: 420px;
  border-radius: ${({ theme }) => theme.shape.lg}px;
`;

export const IconCircle = styled(Stack)`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};
`;

export const PromptCard = styled(Stack)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.palette.background.paper};
  border-radius: ${({ theme }) => theme.shape.sm}px;
`;

export const StepCircle = styled(Stack)<{ $isActive?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ theme, $isActive }) => ($isActive ? theme.palette.primary.main : theme.palette.grey[200])};
  color: ${({ theme, $isActive }) => ($isActive ? theme.palette.common.white : theme.palette.text.secondary)};
  font-size: 12px;
  font-weight: 600;
`;

export const StepConnector = styled.div`
  width: 40px;
  height: 2px;
  background-color: ${({ theme }) => theme.palette.grey[300]};
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
