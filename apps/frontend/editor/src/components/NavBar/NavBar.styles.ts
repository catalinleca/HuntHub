import styled from 'styled-components';
import { AppBar, Toolbar, Box } from '@mui/material';

export const StyledAppBar = styled(AppBar)`
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.primary.main};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  box-shadow: none;
`;

export const StyledToolbar = styled(Toolbar)`
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const LogoContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  flex: 1;
  color: ${({ theme }) => theme.palette.primary.main};
`;

export const ActionsContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
