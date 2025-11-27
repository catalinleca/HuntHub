import { Stack, Typography } from '@mui/material';
import { FormInput, FormNumberInput, getFieldPath } from '@/components/form';

interface LocationFieldsProps {
  stepIndex: number;
}

const getLocationFieldNames = (stepIndex: number) => ({
  lat: getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.lat),
  lng: getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.lng),
  radius: getFieldPath((h) => h.hunt.steps[stepIndex].requiredLocation.radius),
});

export const LocationFields = ({ stepIndex }: LocationFieldsProps) => {
  const fields = getLocationFieldNames(stepIndex);

  return (
    <Stack spacing={3}>
      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        LOCATION DETAILS
      </Typography>

      <FormInput name={fields.lat} label="Latitude" placeholder="40.7128" />

      <FormInput name={fields.lng} label="Longitude" placeholder="-74.006" />

      <FormNumberInput
        name={fields.radius}
        label="Check-in Radius (meters)"
        placeholder="50"
        min={10}
        max={1000}
        helperText="How close players need to be to check in"
      />
    </Stack>
  );
};
