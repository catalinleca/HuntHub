import { MediaType } from '@hunthub/shared';
import { MediaImageInput, MediaAudioInput, MediaVideoInput, MediaImageAudioInput } from '../inputs';

export interface MediaFormProps {
  type: MediaType;
}

export const MediaForm = ({ type }: MediaFormProps) => {
  switch (type) {
    case MediaType.Image:
      return <MediaImageInput />;
    case MediaType.Audio:
      return <MediaAudioInput />;
    case MediaType.Video:
      return <MediaVideoInput />;
    case MediaType.ImageAudio:
      return <MediaImageAudioInput />;
    default:
      return null;
  }
};
