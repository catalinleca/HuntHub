import { Typography } from '@mui/material';
import { CompassIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';
import * as S from './NavBar.styles';

interface NavBarProps {
  actions?: ReactNode;
}

export const NavBar = ({ actions }: NavBarProps) => {
  return (
    <S.AppBar position="static" elevation={0}>
      <S.Toolbar>
        <S.LogoContainer>
          <CompassIcon size={32} weight="duotone" />
          <Typography variant="h6" component="div" fontWeight={700}>
            HuntHub
          </Typography>
        </S.LogoContainer>

        {actions && <S.ActionsContainer>{actions}</S.ActionsContainer>}
      </S.Toolbar>
    </S.AppBar>
  );
};
