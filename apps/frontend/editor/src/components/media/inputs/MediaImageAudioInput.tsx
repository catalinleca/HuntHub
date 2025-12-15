import { Stack, Typography, Divider } from '@mui/material';
import { FormInput, FormAssetInput } from '@/components/form/components';

export interface MediaImageAudioInputProps {
  name?: string;
}

export const MediaImageAudioInput = ({ name = 'media' }: MediaImageAudioInputProps) => (
  <Stack gap={3}>
    <Stack gap={2}>
      <Typography variant="body2" fontWeight={500}>
        Image
      </Typography>
      <FormAssetInput name={`${name}.image.asset`} type="image" height={160} />
      <FormInput name={`${name}.image.title`} label="Title" placeholder="Optional title" />
    </Stack>

    <Divider />

    <Stack gap={2}>
      <Typography variant="body2" fontWeight={500}>
        Audio
      </Typography>
      <FormAssetInput name={`${name}.audio.asset`} type="audio" height={100} />
      <FormInput name={`${name}.audio.title`} label="Title" placeholder="Optional title" />
    </Stack>
  </Stack>
);
