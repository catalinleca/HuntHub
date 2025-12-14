import { useState, useEffect } from 'react';
import { Stack, Typography, IconButton, Divider } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useForm, FormProvider } from 'react-hook-form';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import { MediaParser } from '@/utils/data/media';
import type { MediaFormData, MediaDrawerForm } from '@/utils/data/media';
import { MediaTypeSelector } from './MediaTypeSelector';
import { MediaForm } from './MediaForm';
import { DrawerActions } from './DrawerActions';
import * as S from './MediaDetailsDrawer.styles';

export interface MediaDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: MediaFormData, type: MediaType) => void;
  initialMedia?: Media | null;
}

export const MediaDetailsDrawer = ({ open, onClose, onSave, initialMedia }: MediaDetailsDrawerProps) => {
  const [mediaType, setMediaType] = useState<MediaType>(initialMedia?.type ?? MediaType.Image);

  const formMethods = useForm<MediaDrawerForm>({
    defaultValues: { media: MediaParser.toFormData(null) },
  });

  useEffect(() => {
    if (open) {
      const parsedData = MediaParser.toFormData(initialMedia);
      formMethods.reset({ media: parsedData });
      setMediaType(initialMedia?.type ?? MediaType.Image);
    }
  }, [open, initialMedia, formMethods]);

  const handleSave = () => {
    const data = formMethods.getValues('media');
    onSave(data, mediaType);
  };

  const handleTypeChange = (newType: MediaType) => {
    setMediaType(newType);
    formMethods.reset({ media: MediaParser.toFormData(null) });
  };

  return (
    <FormProvider {...formMethods}>
      <S.Drawer anchor="right" open={open} onClose={onClose}>
        <S.Container>
          <S.Header direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Media Details</Typography>
            <IconButton onClick={onClose} size="small">
              <XIcon size={20} />
            </IconButton>
          </S.Header>

          <S.Content>
            <Stack gap={3}>
              <MediaTypeSelector value={mediaType} onChange={handleTypeChange} />
              <Divider />
              <MediaForm type={mediaType} />
            </Stack>
          </S.Content>

          <DrawerActions onSave={handleSave} onClose={onClose} />
        </S.Container>
      </S.Drawer>
    </FormProvider>
  );
};
