import styled from 'styled-components';
import { Box } from '@mui/material';
import { getColor } from '@/utils';
import type { PaletteColor } from '@/utils/getColor/types';

export const IconWrapper = styled(Box)<{ $bgColor: PaletteColor }>(({ theme, $bgColor }) => ({
  width: 44,
  height: 44,
  borderRadius: theme.shape.sm,
  backgroundColor: getColor($bgColor),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.common.white,
  boxShadow: theme.shadows[3],
}));
