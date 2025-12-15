import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { Stack, Button, Alert, Typography, Divider } from '@mui/material';
import { UsersIcon } from '@phosphor-icons/react';
import type { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { MediaType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormLocationPicker, FormMediaInput } from '@/components/form';
import { useCreateHunt, useUpdateHunt } from '@/api/Hunt';
import { useHuntDialogStore } from '@/stores';
import { HuntDialogFormData } from '@/types/editor';
import { transformHuntToDialogFormData } from '@/utils/transformers/huntInput';
import * as S from './HuntDialogForm.styles';

interface HuntDialogFormProps {
  hunt?: Hunt;
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

  const methods = useForm<HuntDialogFormData>({
    values: transformHuntToDialogFormData(hunt),
    resetOptions: {
      keepDirtyValues: true,
    },
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

  const onSubmit = (data: HuntDialogFormData) => {
    const hasLocation =
      data.startLocation.lat != null && data.startLocation.lng != null && data.startLocation.radius != null;

    const startLocation = hasLocation
      ? {
          lat: data.startLocation.lat!,
          lng: data.startLocation.lng!,
          radius: data.startLocation.radius!,
          address: data.startLocation.address ?? undefined,
        }
      : undefined;

    if (isEditMode && hunt) {
      const updateData: HuntUpdate = {
        name: data.name,
        description: data.description || undefined,
        startLocation,
        coverImage: data.coverImage,
        updatedAt: hunt.updatedAt,
      };

      // Close immediately - optimistic update handles cache
      // Frontend validation (Zod) catches most errors
      close();

      updateMutation.mutate(
        { huntId: hunt.huntId, data: updateData },
        {
          onError: (error) => {
            // TODO: show toast error - dialog is already closed
            console.error('Failed to update hunt:', error);
          },
        },
      );
    } else {
      const createData: HuntCreate = {
        name: data.name,
        description: data.description || undefined,
        startLocation,
        coverImage: data.coverImage,
      };

      // CREATE still needs to wait for huntId to navigate
      createMutation.mutate(createData, {
        onSuccess: (newHunt) => {
          close();
          navigate(`/editor/${newHunt.huntId}`);
        },
        onError: (error) => {
          // TODO: show toast error
          console.error('Failed to create hunt:', error);
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

          <FormMediaInput
            name="coverImage"
            label="Cover Image"
            description="A cover image for your hunt"
            restrictToTypes={[MediaType.Image]}
          />

          <Divider />

          <FormLocationPicker
            name="startLocation"
            label="STARTING POINT"
            description="Where does this adventure begin?"
          />

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
