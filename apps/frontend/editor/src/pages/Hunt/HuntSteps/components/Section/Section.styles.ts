import { Box, Button, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import styled from 'styled-components';
import { getColor } from '@/utils';
import type { PaletteColor } from '@/utils/getColor/types';

interface SectionProps {
  $color: PaletteColor;
}

export const Section = styled(Box)<SectionProps>(({ theme, $color }) => {
  const color = getColor($color);
  return {
    padding: theme.spacing(3),
    borderRadius: theme.shape.md,
    backgroundColor: alpha(color, 0.08),
    border: `1px solid ${alpha(color, 0.25)}`,
  };
});

export const SectionTitle = styled(Typography)<SectionProps>(({ theme, $color }) => ({
  ...theme.typography.smBold,
  marginBottom: theme.spacing(3),
  color: getColor($color),
}));

export const SectionButton = styled(Button)<SectionProps>(({ theme, $color }) => {
  const color = getColor($color);

  return {
    alignSelf: 'flex-start',
    padding: theme.spacing(4),
    backgroundColor: alpha(color, 0.15),
    color: color,
    fontWeight: 600,
    border: `2px solid ${alpha(color, 0.35)}`,

    '&:hover': {
      backgroundColor: alpha(color, 0.25),
    },
  };
});
