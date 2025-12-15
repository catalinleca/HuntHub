import { MediaType } from '@hunthub/shared';
import { assertNever } from '@/utils';
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
      return assertNever(type);
  }
};
