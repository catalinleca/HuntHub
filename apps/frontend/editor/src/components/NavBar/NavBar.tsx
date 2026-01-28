import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { HHLogo } from '@/components/HHLogo';
import * as S from './NavBar.styles';

interface NavBarProps {
  actions?: ReactNode;
}

export const NavBar = ({ actions }: NavBarProps) => {
  return (
    <S.AppBar position="static" elevation={0}>
      <S.Toolbar>
        <S.LogoContainer>
          <HHLogo />
          <Typography variant="h6" component="div" fontWeight={700}>
            HedgeHunt
          </Typography>
        </S.LogoContainer>

        {actions && <S.ActionsContainer>{actions}</S.ActionsContainer>}
      </S.Toolbar>
    </S.AppBar>
  );
};
