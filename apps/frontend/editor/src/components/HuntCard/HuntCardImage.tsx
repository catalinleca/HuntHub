import { HuntCardImageProps } from './types';
import * as S from './HuntCard.styles';
import pirateMapFallback from '@/assets/images/pirate-map.webp';

export const HuntCardImage = ({ src, alt = 'Hunt cover', height, isPublished }: HuntCardImageProps) => {
  const imageSrc = src || pirateMapFallback;

  return (
    <S.ImageContainer>
      <S.Image src={imageSrc} alt={alt} $height={height} />
      {isPublished !== undefined && (
        <S.Badge id='asd'
          label={isPublished ? 'Published' : 'Draft'}
          color={isPublished ? 'success' : 'default'}
          size="small"
        />
      )}
    </S.ImageContainer>
  );
};
