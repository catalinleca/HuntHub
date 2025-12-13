import { Stack } from '@mui/material';
import { FormInput, FormTextArea } from '@/components/form/components';
import { AssetInput } from './AssetInput';

export interface MediaVideoInputProps {
  name?: string;
}

export const MediaVideoInput = ({ name = 'media' }: MediaVideoInputProps) => (
  <Stack gap={2}>
    <AssetInput name={`${name}.video.asset`} type="video" height={180} />
    <FormInput name={`${name}.video.title`} label="Title" placeholder="Optional title" />
    <FormTextArea name={`${name}.video.alt`} label="Alt text" placeholder="Description for accessibility" rows={2} />
  </Stack>
);
