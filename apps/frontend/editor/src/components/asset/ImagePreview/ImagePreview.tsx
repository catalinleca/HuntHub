import { Typography } from '@mui/material';
import { ImageIcon } from '@phosphor-icons/react';
import * as S from './ImagePreview.styles';

interface PreviewAsset {
  url: string;
  name?: string;
  originalFilename?: string;
}

export interface ImagePreviewProps {
  asset?: PreviewAsset | null;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

export const ImagePreview = ({
  asset,
  onClick,
  emptyText = 'Click to select an image',
  height = 200,
}: ImagePreviewProps) => {
  const isClickable = !!onClick;

  if (!asset) {
    return (
      <S.EmptyState onClick={onClick} $clickable={isClickable} $height={height}>
        <ImageIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </S.EmptyState>
    );
  }

  return (
    <S.ImageContainer onClick={onClick} $clickable={isClickable} $height={height}>
      <S.Image src={asset.url} alt={asset.name || asset.originalFilename || 'Image preview'} />
    </S.ImageContainer>
  );
};
