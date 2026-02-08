import styled from 'styled-components';
import { Box, Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};

  ${({ theme }) => theme.breakpoints.down('md')} {
    margin-left: auto;
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

export const UnsavedDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.accent.main};
  flex-shrink: 0;
`;

export const PreviewTrigger = styled(Box)`
  display: none;

  ${({ theme }) => theme.breakpoints.down('lg')} {
    display: inline-flex;
  }
`;

export const DesktopActions = styled(Box)`
  display: contents;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none;
  }
`;

export const MobileActions = styled(Box)`
  display: none;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: contents;
  }
`;
