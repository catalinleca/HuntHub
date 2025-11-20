import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, Typography, Stack } from '@mui/material';
import { FloppyDisk } from '@phosphor-icons/react';
import type { HuntCreate } from '@hunthub/shared';
import { HuntCreate as HuntCreateSchema } from '@hunthub/shared/schemas';
import { useCreateHunt } from '@/api/Hunt';
import { FormPaper, FormDescription, ButtonContainer } from './CreateHuntForm.styles';

export const CreateHuntForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<HuntCreate>({
    resolver: zodResolver(HuntCreateSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createHuntMutation = useCreateHunt();

  const onSubmit = (data: HuntCreate) => {
    createHuntMutation.mutate(data, {
      onSuccess: (newHunt) => {
        console.log('Hunt created:', newHunt);
        reset();
      },
      onError: (error) => {
        console.error('Failed to create hunt:', error);
      },
    });
  };

  return (
    <FormPaper elevation={2}>
      <Typography variant="h5" gutterBottom>
        Create New Hunt
      </Typography>

      <FormDescription variant="body2" color="text.secondary">
        This form uses the same types and validation as the backend. Types from{' '}
        <code>@hunthub/shared</code>, schemas from <code>@hunthub/shared/schemas</code>
      </FormDescription>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <TextField
            {...register('name')}
            label="Hunt Name"
            placeholder="Barcelona Adventure"
            fullWidth
            required
            error={!!errors.name}
            helperText={errors.name?.message || 'Minimum 1 character, maximum 100'}
            inputProps={{
              minLength: 1,
              maxLength: 100,
            }}
          />

          <TextField
            {...register('description')}
            label="Description"
            placeholder="Explore the hidden gems of Barcelona..."
            fullWidth
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message || 'Maximum 500 characters (optional)'}
            inputProps={{
              maxLength: 500,
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Start location and steps can be added after creating the hunt.
          </Typography>

          <ButtonContainer>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={isSubmitting || createHuntMutation.isPending}
              startIcon={<FloppyDisk size={20} />}
            >
              {createHuntMutation.isPending ? 'Creating...' : 'Create Hunt'}
            </Button>
          </ButtonContainer>

          {createHuntMutation.isSuccess && (
            <Typography color="success.main" variant="body2">
              ✓ Hunt created successfully!
            </Typography>
          )}

          {createHuntMutation.isError && (
            <Typography color="error.main" variant="body2">
              ✗ Failed to create hunt. Please try again.
            </Typography>
          )}
        </Stack>
      </form>
    </FormPaper>
  );
}
