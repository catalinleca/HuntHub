import { Stack } from '@mui/material';
import { FormInput, FormTextArea, FormAssetInput } from '@/components/form/components';

export interface MediaAudioInputProps {
  name?: string;
}

export const MediaAudioInput = ({ name = 'media' }: MediaAudioInputProps) => (
  <Stack gap={2}>
    <FormAssetInput name={`${name}.audio.asset`} type="audio" height={120} />
    <FormInput name={`${name}.audio.title`} label="Title" placeholder="Optional title" />
    <FormTextArea
      name={`${name}.audio.transcript`}
      label="Transcript"
      placeholder="Text transcript for accessibility"
      rows={3}
    />
  </Stack>
);
