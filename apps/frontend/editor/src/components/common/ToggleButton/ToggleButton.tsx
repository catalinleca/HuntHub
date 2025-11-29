import { ToggleButtonProps as MuiToggleButtonProps } from '@mui/material';
import { ReactNode } from 'react';
import * as S from './ToggleButton.styles';

export interface ToggleButtonProps extends Omit<MuiToggleButtonProps, 'color'> {
  icon?: ReactNode;
  color?: string;
}

export const ToggleButton = ({ icon, color, children, ...props }: ToggleButtonProps) => (
  <S.ToggleButton $color={color} {...props}>
    {icon}
    {children}
  </S.ToggleButton>
);
