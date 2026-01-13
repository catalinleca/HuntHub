import styled from 'styled-components';
import { Box, ButtonBase } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const HintButton = styled(ButtonBase)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1.5, 2)};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  background-color: ${({ theme }) => alpha(theme.palette.warning.main, 0.1)};
  color: ${({ theme }) => theme.palette.warning.dark};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => alpha(theme.palette.warning.main, 0.15)};
  }
`;

export const HintContainer = styled(Box)`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  background-color: ${({ theme }) => alpha(theme.palette.warning.main, 0.08)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.warning.main, 0.2)};
  animation: fadeIn 0.3s ease;
`;

export const HintHeader = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.palette.warning.dark};
`;
