import { Stack } from '@mui/material';
import { FormInput, FormTextArea } from '@/components/form/components';
import { AssetInput } from './AssetInput';

export interface MediaAudioInputProps {
  name?: string;
}

export const MediaAudioInput = ({ name = 'media' }: MediaAudioInputProps) => (
  <Stack gap={2}>
    <AssetInput name={`${name}.audio.asset`} type="audio" height={120} />
    <FormInput name={`${name}.audio.title`} label="Title" placeholder="Optional title" />
    <FormTextArea name={`${name}.audio.transcript`} label="Transcript" placeholder="Text transcript for accessibility" rows={3} />
  </Stack>
);
