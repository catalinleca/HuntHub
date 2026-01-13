import styled, { css, keyframes } from 'styled-components';
import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
`;

export const AttemptsBadge = styled(Box)<{ $isWarning: boolean; $isExhausted: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5, 1)};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  background-color: ${({ theme }) => alpha(theme.palette.grey[500], 0.1)};
  color: ${({ theme }) => theme.palette.text.secondary};

  ${({ $isWarning, theme }) =>
    $isWarning &&
    css`
      background-color: ${alpha(theme.palette.warning.main, 0.15)};
      color: ${theme.palette.warning.dark};
    `}

  ${({ $isExhausted, theme }) =>
    $isExhausted &&
    css`
      background-color: ${alpha(theme.palette.error.main, 0.15)};
      color: ${theme.palette.error.main};
      animation: ${shake} 0.3s ease-in-out;
    `}
`;

export const DialogHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.error.main};
`;
