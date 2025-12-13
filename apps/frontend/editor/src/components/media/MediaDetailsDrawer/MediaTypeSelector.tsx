import { ToggleButtonGroup, ToggleButton, Stack, Typography } from '@mui/material';
import { ImageIcon, WaveformIcon, VideoIcon, ImagesIcon } from '@phosphor-icons/react';
import { MediaType } from '@hunthub/shared';

export interface MediaTypeSelectorProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
}

const MEDIA_TYPES: { value: MediaType; label: string; icon: React.ReactNode }[] = [
  { value: MediaType.Image, label: 'Image', icon: <ImageIcon size={20} /> },
  { value: MediaType.Audio, label: 'Audio', icon: <WaveformIcon size={20} /> },
  { value: MediaType.Video, label: 'Video', icon: <VideoIcon size={20} /> },
  { value: MediaType.ImageAudio, label: 'Image + Audio', icon: <ImagesIcon size={20} /> },
];

export const MediaTypeSelector = ({ value, onChange }: MediaTypeSelectorProps) => {
  const handleChange = (_: React.MouseEvent, newValue: MediaType | null) => {
    // Don't allow deselection
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Stack gap={1}>
      <Typography variant="body2" color="text.secondary">
        Media Type
      </Typography>
      <ToggleButtonGroup value={value} exclusive onChange={handleChange} fullWidth size="small">
        {MEDIA_TYPES.map((type) => (
          <ToggleButton key={type.value} value={type.value}>
            <Stack direction="row" alignItems="center" gap={1}>
              {type.icon}
              <Typography variant="body2">{type.label}</Typography>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};
