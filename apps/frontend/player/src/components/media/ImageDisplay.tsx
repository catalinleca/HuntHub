import type { ImageMedia } from '@hunthub/shared';
import * as S from './ImageDisplay.styles';

interface ImageDisplayProps {
  image: ImageMedia;
}

export const ImageDisplay = ({ image }: ImageDisplayProps) => {
  const { asset, alt, title } = image;

  return (
    <S.Container>
      <S.Image src={asset.url} alt={alt || title || 'Step image'} />
    </S.Container>
  );
};
