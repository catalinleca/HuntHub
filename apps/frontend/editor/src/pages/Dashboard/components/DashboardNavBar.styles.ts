import styled from 'styled-components';
import { Box } from '@mui/material';

export const MobileOnly = styled(Box)`
  display: none;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: inline-flex;
  }
`;

export const DesktopOnly = styled(Box)`
  display: inline-flex;

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none;
  }
`;
