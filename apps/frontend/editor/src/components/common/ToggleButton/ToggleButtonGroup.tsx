import {
  ToggleButtonGroup as MuiToggleButtonGroup,
  ToggleButtonGroupProps as MuiToggleButtonGroupProps,
} from '@mui/material';
import { ReactNode } from 'react';
import { ToggleButton } from './ToggleButton';
import type { PaletteColor } from '@/utils/getColor/types';

export interface ToggleButtonOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

export interface ToggleButtonGroupProps extends Omit<MuiToggleButtonGroupProps, 'children' | 'color'> {
  options: ToggleButtonOption[];
  color?: PaletteColor;
}

export const ToggleButtonGroup = ({ options, color, ...props }: ToggleButtonGroupProps) => (
  <MuiToggleButtonGroup {...props}>
    {options.map((option) => (
      <ToggleButton key={option.value} value={option.value} icon={option.icon} color={color}>
        {option.label}
      </ToggleButton>
    ))}
  </MuiToggleButtonGroup>
);
