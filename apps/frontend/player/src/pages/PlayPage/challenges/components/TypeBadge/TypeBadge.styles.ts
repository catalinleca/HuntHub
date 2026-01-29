import styled from 'styled-components';
import { alpha, Chip, Stack } from '@mui/material';

export const Badge = styled(Chip)<{ $color: string }>`
  color: ${({ $color }) => $color};
  background-color: ${({ $color }) => alpha($color, 0.08)};
  border-color: ${({ $color }) => alpha($color, 0.3)};

  .MuiChip-icon {
    color: inherit;
  }
`;

export const BadgeContainer = styled(Stack)`
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
