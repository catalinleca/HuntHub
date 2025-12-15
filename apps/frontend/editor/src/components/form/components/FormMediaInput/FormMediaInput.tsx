import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography } from '@mui/material';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import { MediaUpdater, MediaHelper } from '@/components/media/data';
import type { MediaFormData } from '@/components/media/data';
import { useConfirmationDialog } from '@/hooks';
import { DialogVariants } from '@/stores/useDialogStore';
import { MediaDetailsDrawer } from '@/components/media';
import { MediaCardPreview } from './MediaCardPreview';
import { AddMediaPlaceholder } from './AddMediaPlaceholder';
import * as S from './FormMediaInput.styles';

export interface FormMediaInputProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const FormMediaInput = ({ name, label = 'Media', description, disabled = false }: FormMediaInputProps) => {
  const { setValue } = useFormContext();
  const { confirm } = useConfirmationDialog();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const media: Media | null | undefined = useWatch({ name });
  const hasMedia = MediaHelper.isMediaValid(media);

  const handleOpenDrawer = () => {
    if (disabled) {
      return;
    }
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSave = (formData: MediaFormData, type: MediaType) => {
    const apiMedia = MediaUpdater.toMedia(formData, type);
    if (!apiMedia) {
      return;
    }
    setValue(name, apiMedia, { shouldDirty: true });
    setDrawerOpen(false);
  };

  const handleRemove = () => {
    confirm({
      title: 'Remove Media',
      message: 'Are you sure you want to remove this media?',
      confirmText: 'Remove',
      variant: DialogVariants.Danger,
      onConfirm: () => {
        setValue(name, null, { shouldDirty: true });
      },
    });
  };

  return (
    <>
      <Stack gap={1}>
        <S.SectionLabel>{label}</S.SectionLabel>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}

        {hasMedia && media ? (
          <MediaCardPreview media={media} disabled={disabled} onEdit={handleOpenDrawer} onRemove={handleRemove} />
        ) : (
          <AddMediaPlaceholder disabled={disabled} onAdd={handleOpenDrawer} />
        )}
      </Stack>

      <MediaDetailsDrawer open={drawerOpen} onClose={handleCloseDrawer} onSave={handleSave} initialMedia={media} />
    </>
  );
};
