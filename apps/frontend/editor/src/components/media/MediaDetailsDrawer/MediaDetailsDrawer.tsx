import { useState, useEffect } from 'react';
import { Stack, Typography, IconButton, Divider } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useForm, FormProvider } from 'react-hook-form';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import { MediaParser } from '../data';
import type { MediaFormData, MediaDrawerForm } from '../data';
import { MediaTypeSelector } from './MediaTypeSelector';
import { MediaForm } from './MediaForm';
import { DrawerActions } from './DrawerActions';
import * as S from './MediaDetailsDrawer.styles';

export interface MediaDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: MediaFormData, type: MediaType) => void;
  initialMedia?: Media | null;
  restrictToTypes?: MediaType[];
}

const getDefaultType = (initialMedia?: Media | null, restrictToTypes?: MediaType[]): MediaType => {
  const initialType = initialMedia?.type;

  if (restrictToTypes && restrictToTypes.length > 0) {
    if (initialType && restrictToTypes.includes(initialType)) {
      return initialType;
    }
    return restrictToTypes[0];
  }

  return initialType ?? MediaType.Image;
};

export const MediaDetailsDrawer = ({
  open,
  onClose,
  onSave,
  initialMedia,
  restrictToTypes,
}: MediaDetailsDrawerProps) => {
  const [mediaType, setMediaType] = useState<MediaType>(() => getDefaultType(initialMedia, restrictToTypes));

  const formMethods = useForm<MediaDrawerForm>({
    defaultValues: { media: MediaParser.toFormData(null) },
  });

  useEffect(() => {
    if (open) {
      const parsedData = MediaParser.toFormData(initialMedia);
      formMethods.reset({ media: parsedData });
      setMediaType(getDefaultType(initialMedia, restrictToTypes));
    }
  }, [open, initialMedia]);

  const handleSave = () => {
    const data = formMethods.getValues('media');
    onSave(data, mediaType);
  };

  const handleTypeChange = (newType: MediaType) => {
    setMediaType(newType);
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
              <MediaTypeSelector value={mediaType} onChange={handleTypeChange} restrictToTypes={restrictToTypes} />
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
