import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Wrapper = styled(Stack)`
  align-items: center;
  background: ${({ theme }) => theme.palette.background.defaultLight};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const InnerWrapper = styled(Stack)`
  flex-direction: row;
  align-items: flex-start;
  width: fit-content;
  min-width: ${({ theme }) => theme.breakpoints.values.md}px;
  max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  padding: ${({ theme }) => theme.spacing(0, 3)};
`;
