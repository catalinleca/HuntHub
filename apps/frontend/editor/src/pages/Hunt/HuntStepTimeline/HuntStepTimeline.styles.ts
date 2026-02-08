import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Wrapper = styled(Stack)`
  position: sticky;
  top: 0;
  z-index: 100;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(3, 0)};
  background: ${({ theme }) => theme.palette.background.defaultLight};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

export const ActionsContainer = styled(Stack)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(3)};
`;

export const InnerWrapper = styled(Stack)`
  flex-direction: row;
  align-items: center;
  max-width: ${({ theme }) => theme.breakpoints.values.lg}px;
  width: 100%;
  overflow: hidden;
`;
