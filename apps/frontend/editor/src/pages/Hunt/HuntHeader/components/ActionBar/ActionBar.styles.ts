import styled from 'styled-components';
import { Box, Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down('md')} {
    margin-left: auto;
  }
`;

export const UnsavedDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.accent.main};
  flex-shrink: 0;
`;

export const MobileOnly = styled(Box)`
  display: none;

  ${({ theme }) => theme.breakpoints.down('lg')} {
    display: inline-flex;
  }
`;
