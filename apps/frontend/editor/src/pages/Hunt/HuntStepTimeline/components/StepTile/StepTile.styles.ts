import styled from 'styled-components';
import { Stack, Typography } from '@mui/material';
import { getColor } from '@/utils';
import type { PaletteColor } from '@/utils/getColor/types';

export const Container = styled(Stack)`
  width: 88px;
  align-items: center;
  position: relative;
  cursor: pointer;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const IconArea = styled(Stack)<{ $selected: boolean; $color: PaletteColor }>`
  width: 68px;
  height: 68px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background: ${({ theme, $selected, $color }) => ($selected ? getColor($color) : theme.palette.grey[100])};
  color: ${({ theme, $selected, $color }) => ($selected ? theme.palette.common.white : getColor($color))};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $selected, $color }) => ($selected ? getColor($color) : theme.palette.grey[200])};
    transform: translateY(-2px);
  }
`;

export const Badge = styled(Stack)`
  position: absolute;
  top: -4px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 2px solid ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.grey[500]};
  font-size: 10px;
  font-weight: 700;
`;

export const Title = styled(Typography)`
  max-width: 100%;
  font-size: 11px;
  text-align: center;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
