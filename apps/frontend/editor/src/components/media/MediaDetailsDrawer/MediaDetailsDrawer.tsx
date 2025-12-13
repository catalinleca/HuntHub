import { useEffect } from 'react';
import { Drawer, Stack, Typography, IconButton, Box, Divider } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useForm, FormProvider } from 'react-hook-form';
import type { Media } from '@hunthub/shared';
import { MediaParser, MediaHelper } from '@/utils/data/media';
import type { MediaFormData, MediaDrawerForm } from '@/utils/data/media';
import { MediaTypeSelector } from './MediaTypeSelector';
import { MediaForm } from './MediaForm';
import { DrawerActions } from './DrawerActions';

const DRAWER_WIDTH = 400;

export interface MediaDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (formData: MediaFormData) => void;
  initialMedia?: Media | null;
}

export const MediaDetailsDrawer = ({ open, onClose, onSave, initialMedia }: MediaDetailsDrawerProps) => {
  const formMethods = useForm<MediaDrawerForm>({
    defaultValues: { media: MediaParser.toFormData(null) },
  });

  const mediaType = formMethods.watch('media.type');
  const formData = formMethods.watch('media');

  useEffect(() => {
    if (open) {
      formMethods.reset({ media: MediaParser.toFormData(initialMedia) });
    }
  }, [open, initialMedia, formMethods]);

  const handleSave = () => {
    const data = formMethods.getValues('media');
    onSave(data);
  };

  const handleTypeChange = (newType: typeof mediaType) => {
    formMethods.setValue('media.type', newType);
  };

  return (
    <FormProvider {...formMethods}>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
      >
        <Stack sx={{ height: '100%' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6">Media Details</Typography>
            <IconButton onClick={onClose} size="small">
              <XIcon size={20} />
            </IconButton>
          </Stack>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Stack gap={3}>
              <MediaTypeSelector value={mediaType} onChange={handleTypeChange} />
              <Divider />
              <MediaForm type={mediaType} />
            </Stack>
          </Box>

          <DrawerActions onSave={handleSave} onClose={onClose} canSave={MediaHelper.canSave(formData)} />
        </Stack>
      </Drawer>
    </FormProvider>
  );
};
