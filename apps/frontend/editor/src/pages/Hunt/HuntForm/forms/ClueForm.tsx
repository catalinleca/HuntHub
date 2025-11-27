import { Stack, TextField, Typography, Divider } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { HuntFormData } from '@/types/editor';
import * as S from './ClueForm.styles';

interface ClueFormProps {
  stepIndex: number;
}

export const ClueForm = ({ stepIndex }: ClueFormProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<{ hunt: HuntFormData }>();

  const titlePath = `hunt.steps.${stepIndex}.challenge.clue.title` as const;
  const descriptionPath = `hunt.steps.${stepIndex}.challenge.clue.description` as const;

  return (
    <S.Container>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Step {stepIndex + 1}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure this hunt step
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <S.Section>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
          BASIC INFORMATION
        </Typography>

        <S.FormFields>
          <TextField
            label="Step Title"
            placeholder="Welcome to Downtown"
            fullWidth
            {...register(titlePath)}
            error={!!errors.hunt?.steps?.[stepIndex]?.challenge?.clue?.title}
            helperText={errors.hunt?.steps?.[stepIndex]?.challenge?.clue?.title?.message}
          />

          <TextField
            label="Description"
            placeholder="Start your journey at the historic fountain in the town square"
            fullWidth
            multiline
            rows={4}
            {...register(descriptionPath)}
            error={!!errors.hunt?.steps?.[stepIndex]?.challenge?.clue?.description}
            helperText={errors.hunt?.steps?.[stepIndex]?.challenge?.clue?.description?.message}
          />
        </S.FormFields>
      </S.Section>

      <Divider sx={{ my: 3 }} />

      <S.Section>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2 }}>
          📍 LOCATION DETAILS
        </Typography>

        <S.FormFields>
          <TextField label="Address" placeholder="e.g., Central Park, New York" fullWidth />

          <Stack direction="row" spacing={2}>
            <TextField label="Latitude" placeholder="40,7128" fullWidth />

            <TextField label="Longitude" placeholder="-74,006" fullWidth />
          </Stack>

          <TextField label="Check-in Radius (meters)" placeholder="50" type="number" fullWidth />
        </S.FormFields>
      </S.Section>
    </S.Container>
  );
};
