import styled from 'styled-components';
import { Box, Button } from '@mui/material';

export const SectionCard = styled(Box)`
  border: 2px solid ${({ theme }) => theme.palette.primary.main};
  border-radius: ${({ theme }) => theme.shape.md}px;
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.background.paper};
`;

export const ToggleButtonsRow = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;
