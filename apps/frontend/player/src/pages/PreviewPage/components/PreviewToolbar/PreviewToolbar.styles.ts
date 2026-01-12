import styled from 'styled-components';
import { Stack, Paper } from '@mui/material';

export const Toolbar = styled(Paper)`
  position: sticky;
  top: 0;
  z-index: 10;
  border-radius: 0;
`;

export const ToolbarContent = styled(Stack)`
  padding: ${({ theme }) => theme.spacing(1, 2)};
`;
