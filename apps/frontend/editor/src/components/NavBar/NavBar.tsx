import { Typography } from '@mui/material';
import { CompassIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import { StyledAppBar, StyledToolbar, LogoContainer, ActionsContainer } from './NavBar.styles';

interface NavBarProps {
  actions?: ReactNode;
}

export function NavBar({ actions }: NavBarProps) {
  return (
    <StyledAppBar position="sticky" elevation={0}>
      <StyledToolbar>
        <LogoContainer>
          <CompassIcon size={32} weight="duotone" />
          <Typography variant="h6" component="div" fontWeight={700}>
            HuntHub
          </Typography>
        </LogoContainer>

        {actions && <ActionsContainer>{actions}</ActionsContainer>}
      </StyledToolbar>
    </StyledAppBar>
  );
}
