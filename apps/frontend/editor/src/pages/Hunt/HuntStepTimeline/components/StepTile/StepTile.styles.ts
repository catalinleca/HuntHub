import styled from 'styled-components';
import { Stack, Typography } from '@mui/material';
import { getColor } from '@/utils';
import type { PaletteColor } from '@/utils/getColor/types';

export const Container = styled(Stack)<{ $selected: boolean; $color: PaletteColor }>`
  flex-shrink: 0;
  width: 90px;
  height: 90px;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: 16px;
  position: relative;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 2px;
  background: ${({ theme, $selected, $color }) => ($selected ? getColor($color) : theme.palette.grey[100])};
  color: ${({ theme, $selected, $color }) => ($selected ? theme.palette.common.white : getColor($color))};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme, $selected, $color }) => ($selected ? getColor($color) : theme.palette.grey[200])};
  }
`;

export const TitleArea = styled(Stack)`
  height: 28px;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(0, 1)};
`;

export const Title = styled(Typography)`
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const Badge = styled(Stack)`
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.palette.background.paper};
  border: 2px solid ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.grey[500]};
  font-size: 11px;
  font-weight: 700;
`;
