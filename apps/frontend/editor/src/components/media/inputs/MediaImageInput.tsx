import { Stack } from '@mui/material';
import { FormInput, FormTextArea } from '@/components/form/components';
import { AssetInput } from './AssetInput';

export interface MediaImageInputProps {
  name?: string;
}

export const MediaImageInput = ({ name = 'media' }: MediaImageInputProps) => (
  <Stack gap={2}>
    <AssetInput name={`${name}.image.asset`} type="image" height={180} />
    <FormInput name={`${name}.image.title`} label="Title" placeholder="Optional title" />
    <FormTextArea name={`${name}.image.alt`} label="Alt text" placeholder="Description for accessibility" rows={2} />
  </Stack>
);
