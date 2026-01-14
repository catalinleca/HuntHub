import styled, { css, keyframes } from 'styled-components';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export const TimerBadge = styled(Box)<{ $isWarning: boolean; $isExpired: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1, 2)};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  background-color: ${({ theme }) => alpha(theme.palette.grey[500], 0.1)};
  color: ${({ theme }) => theme.palette.text.secondary};

  ${({ $isWarning, theme }) =>
    $isWarning &&
    css`
      background-color: ${alpha(theme.palette.warning.main, 0.15)};
      color: ${theme.palette.warning.dark};
      animation: ${pulse} 1s ease-in-out infinite;
    `}

  ${({ $isExpired, theme }) =>
    $isExpired &&
    css`
      background-color: ${alpha(theme.palette.error.main, 0.15)};
      color: ${theme.palette.error.main};
      animation: none;
    `}
`;

export const DialogHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.warning.main};
`;
