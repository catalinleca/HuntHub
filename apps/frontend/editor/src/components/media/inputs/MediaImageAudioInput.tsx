import { Stack, Typography, Divider } from '@mui/material';
import { FormInput } from '@/components/form/components';
import { AssetInput } from './AssetInput';

export interface MediaImageAudioInputProps {
  name?: string;
}

export const MediaImageAudioInput = ({ name = 'media' }: MediaImageAudioInputProps) => (
  <Stack gap={3}>
    <Stack gap={2}>
      <Typography variant="body2" fontWeight={500}>Image</Typography>
      <AssetInput name={`${name}.image.asset`} type="image" height={160} />
      <FormInput name={`${name}.image.title`} label="Title" placeholder="Optional title" />
    </Stack>

    <Divider />

    <Stack gap={2}>
      <Typography variant="body2" fontWeight={500}>Audio</Typography>
      <AssetInput name={`${name}.audio.asset`} type="audio" height={100} />
      <FormInput name={`${name}.audio.title`} label="Title" placeholder="Optional title" />
    </Stack>
  </Stack>
);
