import * as S from './HuntCard.styles';
import { ReactNode } from 'react';
import { Box } from '@mui/material';

export interface HuntCardProps {
  children: ReactNode;
  transition?: boolean;
  onClick?: () => void;
  disableGutters?: boolean;
}

export const HuntCard = ({ children, transition = true, onClick, disableGutters = false }: HuntCardProps) => {
  return (
    <S.Card $transition={transition} onClick={onClick}>
      <Box sx={{ p: disableGutters ? 0 : 3 }}>
        {children}
      </Box>
    </S.Card>
  );
};
