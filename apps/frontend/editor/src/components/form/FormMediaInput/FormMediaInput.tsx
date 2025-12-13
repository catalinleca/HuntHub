import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography } from '@mui/material';
import type { Media } from '@hunthub/shared';
import { MediaUpdater } from '@/utils/data/media';
import type { MediaFormData } from '@/utils/data/media';
import { MediaDetailsDrawer } from '@/components/media/MediaDetailsDrawer';
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const media: Media | null | undefined = useWatch({ name });
  const hasMedia = media?.type != null;

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
  };

  const handleSave = (formData: MediaFormData) => {
    const apiMedia = MediaUpdater.toMedia(formData);
    setValue(name, apiMedia, { shouldDirty: true });
    setDrawerOpen(false);
  };

  const handleRemove = () => {
    setValue(name, null, { shouldDirty: true });
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

        {hasMedia ? (
          <MediaCardPreview media={media} disabled={disabled} onEdit={handleOpenDrawer} onRemove={handleRemove} />
        ) : (
          <AddMediaPlaceholder disabled={disabled} onAdd={handleOpenDrawer} />
        )}
      </Stack>

      <MediaDetailsDrawer open={drawerOpen} onClose={handleCloseDrawer} onSave={handleSave} initialMedia={media} />
    </>
  );
};
