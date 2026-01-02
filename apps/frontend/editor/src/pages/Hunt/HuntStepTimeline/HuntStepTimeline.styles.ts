import styled from 'styled-components';
import { Stack, Container as MuiContainer } from '@mui/material';

export const Wrapper = styled(Stack)`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.defaultLight};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const InnerWrapper = styled(MuiContainer).attrs({ maxWidth: 'md' })`
  display: flex;
  align-items: flex-start;
`;
