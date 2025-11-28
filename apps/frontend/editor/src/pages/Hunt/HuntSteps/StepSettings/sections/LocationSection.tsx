import { Typography, Stack, Grid2 } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import { FormNumberInput, getFieldPath } from '@/components/form';
import * as S from '../StepSettings.styles';

interface LocationSectionProps {
  stepIndex: number;
}

export const LocationSection = ({ stepIndex }: LocationSectionProps) => {
  const latPath = getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.lat);
  const lngPath = getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.lng);
  const radiusPath = getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.radius);

  return (
    <S.SectionCard>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <MapPinIcon size={20} weight="duotone" />
          <Typography variant="smBold">Required Location</Typography>
        </Stack>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <FormNumberInput
              name={latPath}
              label="Latitude"
              placeholder="0.0000"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <FormNumberInput
              name={lngPath}
              label="Longitude"
              placeholder="0.0000"
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <FormNumberInput
              name={radiusPath}
              label="Radius (meters)"
              placeholder="100"
            />
          </Grid2>
        </Grid2>
      </Stack>
    </S.SectionCard>
  );
};
