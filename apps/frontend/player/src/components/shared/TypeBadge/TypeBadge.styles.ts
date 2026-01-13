import styled from 'styled-components';
import { Box } from '@mui/material';

export const Badge = styled(Box)<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};
  color: ${({ $color }) => $color};
`;