import { Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HHLogo } from '@/components/HHLogo';
import * as S from './NavBar.styles';

interface NavBarProps {
  actions?: ReactNode;
}

export const NavBar = ({ actions }: NavBarProps) => {
  return (
    <S.AppBar position="static" elevation={0}>
      <S.Toolbar>
        <S.LogoContainer as={Link} to="/">
          <HHLogo />
          <Typography variant="h6" component="div" fontWeight={700} sx={{ pl: 2 }}>
            HedgeHunt
          </Typography>
        </S.LogoContainer>

        {actions && <S.ActionsContainer>{actions}</S.ActionsContainer>}
      </S.Toolbar>
    </S.AppBar>
  );
};
