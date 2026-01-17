import styled from 'styled-components';
import { alpha, Box, Stack } from '@mui/material';

export const Badge = styled(Box)<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  background-color: ${({ $color }) => alpha($color, 0.08)};
  border: 1px solid ${({ $color }) => alpha($color, 0.3)};
  border-radius: 100px;
  color: ${({ $color }) => $color};
`;

export const BadgeContainer = styled(Stack)`
  align-items: center;
  margin: ${({ theme }) => `${theme.spacing(2)} 0`};
`;
