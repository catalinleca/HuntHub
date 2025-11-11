import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import { FloppyDisk } from '@phosphor-icons/react';

// Import TypeScript types from @hunthub/shared (same as backend)
import type { HuntCreate, Hunt } from '@hunthub/shared';

// Import Zod schemas from @hunthub/shared/schemas (same as backend)
import { HuntCreate as HuntCreateSchema } from '@hunthub/shared/schemas';

// Import API client
import { huntsApi } from '@/api/hunts';

/**
 * Example form demonstrating type imports from @hunthub/shared
 *
 * Pattern matches backend:
 * - TypeScript types from '@hunthub/shared' for type safety
 * - Zod schemas from '@hunthub/shared/schemas' for validation
 * - Same validation rules as backend API
 */
export function CreateHuntForm() {
  const queryClient = useQueryClient();

  // React Hook Form with Zod validation
  // HuntCreate type ensures type safety
  // HuntCreateSchema provides runtime validation
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

  // React Query mutation
  const createHuntMutation = useMutation({
    mutationFn: (data: HuntCreate) => huntsApi.create(data),
    onSuccess: (newHunt: Hunt) => {
      console.log('Hunt created:', newHunt);

      // Invalidate hunts list query
      queryClient.invalidateQueries({ queryKey: ['hunts'] });

      // Reset form
      reset();
    },
    onError: (error) => {
      console.error('Failed to create hunt:', error);
    },
  });

  const onSubmit = (data: HuntCreate) => {
    createHuntMutation.mutate(data);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Create New Hunt
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This form uses the same types and validation as the backend.
        Types from <code>@hunthub/shared</code>, schemas from{' '}
        <code>@hunthub/shared/schemas</code>
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Hunt Name Field */}
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

          {/* Description Field */}
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

          {/* Start Location (optional - can be added later) */}
          <Typography variant="caption" color="text.secondary">
            Start location and steps can be added after creating the hunt.
          </Typography>

          {/* Submit Button */}
          <Box sx={{ display: 'flex', gap: 2 }}>
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
          </Box>

          {/* Success/Error Messages */}
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
    </Paper>
  );
}
