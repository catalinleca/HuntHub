import { Stack } from '@mui/material';
import { FormInput, FormTextArea, FormAssetInput } from '@/components/form/components';

export interface MediaImageInputProps {
  name?: string;
}

export const MediaImageInput = ({ name = 'media' }: MediaImageInputProps) => (
  <Stack gap={2}>
    <FormAssetInput name={`${name}.image.asset`} type="image" height={180} />
    <FormInput name={`${name}.image.title`} label="Title" placeholder="Optional title" />
    <FormTextArea name={`${name}.image.alt`} label="Alt text" placeholder="Description for accessibility" rows={2} />
  </Stack>
);
