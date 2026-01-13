import styled from 'styled-components';
import { alpha, Box } from '@mui/material';

export const Badge = styled(Box)<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  background-color: ${({ $color }) => alpha($color, 0.1)};
  border-radius: 100px;
  color: ${({ $color }) => $color};
`;
