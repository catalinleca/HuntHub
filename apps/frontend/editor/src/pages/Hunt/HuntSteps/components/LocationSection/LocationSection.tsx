import { Box, Stack, TextField } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import { Section, SectionButton, SectionTitle } from '../Section/Section.styles';
import type { PaletteColor } from '@/utils/getColor/types';

interface LocationSectionProps {
  title?: string;
  buttonLabel?: string;
  color?: PaletteColor;
}

export const LocationSection = ({
  title = 'Location',
  buttonLabel = 'Pick on map',
  color = 'primary.main',
}: LocationSectionProps) => {
  return (
    <Section $color={color}>
      <SectionTitle $color={color}>{title}</SectionTitle>

      <Stack gap={2}>
        <TextField placeholder="Search location..." size="small" fullWidth />

        <Box mt={3}>
          <SectionButton $color={color} startIcon={<MapPinIcon size={18} weight="bold" />}>
            {buttonLabel}
          </SectionButton>
        </Box>
      </Stack>
    </Section>
  );
};
