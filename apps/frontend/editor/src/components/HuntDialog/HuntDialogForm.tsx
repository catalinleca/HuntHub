import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack, Button, Alert, Typography, Divider } from '@mui/material';
import { MapPinIcon, ImageIcon, UsersIcon } from '@phosphor-icons/react';
import type { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { HuntCreate as HuntCreateSchema, HuntUpdate as HuntUpdateSchema } from '@hunthub/shared/schemas';
import { FormInput, FormTextArea } from '@/components/form';
import { useCreateHunt, useUpdateHunt } from '@/api/Hunt';
import { useHuntDialogStore } from '@/stores';
import * as S from './HuntDialogForm.styles';

interface HuntDialogFormProps {
  hunt?: Hunt;
}

interface HuntFormData {
  name: string;
  description: string;
}

interface PlaceholderSectionProps {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  message: string;
}

const PlaceholderSection = ({ icon: Icon, label, message }: PlaceholderSectionProps) => {
  return (
    <Stack>
      <S.SectionLabel>{label}</S.SectionLabel>
      <S.PlaceholderBox gap={2}>
        <Icon size={20} />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </S.PlaceholderBox>
    </Stack>
  );
};

export const HuntDialogForm = ({ hunt }: HuntDialogFormProps) => {
  const navigate = useNavigate();
  const { close } = useHuntDialogStore();
  const isEditMode = !!hunt;

  const createMutation = useCreateHunt();
  const updateMutation = useUpdateHunt();

  const methods = useForm<HuntFormData>({
    resolver: zodResolver(isEditMode ? HuntUpdateSchema : HuntCreateSchema),
    values: hunt ? { name: hunt.name, description: hunt.description ?? '' } : undefined,
    defaultValues: { name: '', description: '' },
  });

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = methods;

  const nameValue = useWatch({ control, name: 'name' });
  const descriptionValue = useWatch({ control, name: 'description' });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const onSubmit = (data: HuntFormData) => {
    if (isEditMode && hunt) {
      const updateData: HuntUpdate = {
        name: data.name,
        description: data.description || undefined,
        updatedAt: hunt.updatedAt,
      };

      // Close immediately - optimistic update handles cache
      // Frontend validation (Zod) catches most errors
      close();

      updateMutation.mutate(
        { huntId: hunt.huntId, data: updateData },
        {
          onError: () => {
            // TODO: show toast error - dialog is already closed
          },
        },
      );
    } else {
      const createData: HuntCreate = {
        name: data.name,
        description: data.description || undefined,
      };

      // CREATE still needs to wait for huntId to navigate
      createMutation.mutate(createData, {
        onSuccess: (newHunt) => {
          close();
          navigate(`/editor/${newHunt.huntId}`);
        },
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <S.Form component="form" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message}
          </Alert>
        )}

        <S.FormContent spacing={3}>
          <FormInput
            name="name"
            label="Hunt Name"
            placeholder="Enter hunt name..."
            required
            helperText={`${nameValue?.length || 0}/100`}
          />

          <FormTextArea
            name="description"
            label="Description"
            placeholder="What's this adventure about?"
            rows={3}
            helperText={`${descriptionValue?.length || 0}/500`}
          />

          <Divider />

          <PlaceholderSection icon={ImageIcon} label="Cover Image" message="Cover image upload coming soon" />

          <Divider />

          <PlaceholderSection icon={MapPinIcon} label="Starting Point" message="Add starting location after creating" />

          <Divider />

          <PlaceholderSection
            icon={UsersIcon}
            label="Collaborators"
            message="You can add collaborators after creating the hunt"
          />
        </S.FormContent>

        <S.ActionBar spacing={2} sx={{ mt: 3, pt: 2 }}>
          <Button variant="outlined" onClick={close} disabled={isPending} fullWidth>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending || (isEditMode && !isDirty)} fullWidth>
            {isPending ? (isEditMode ? 'Saving...' : 'Creating...') : isEditMode ? 'Save Changes' : 'Create Hunt'}
          </Button>
        </S.ActionBar>
      </S.Form>
    </FormProvider>
  );
};
