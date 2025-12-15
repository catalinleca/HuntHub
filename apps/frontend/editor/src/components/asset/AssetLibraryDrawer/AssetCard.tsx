import { CardActionArea, Stack, Typography } from '@mui/material';
import { CheckCircleIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { prettyBytes } from '@/utils';
import { AssetPreview } from '../AssetPreview';
import * as S from './AssetLibraryDrawer.styles';

export interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const COMPACT_HEIGHT = 80;

export const AssetCard = ({ asset, selected = false, onClick, onDoubleClick }: AssetCardProps) => {
  return (
    <S.Card variant="outlined" $selected={selected}>
      <CardActionArea onClick={onClick} onDoubleClick={onDoubleClick} sx={{ p: 1 }}>
        <S.PreviewWrapper>
          <AssetPreview asset={asset} height={COMPACT_HEIGHT} />
        </S.PreviewWrapper>

        <Stack gap={1} sx={{ mt: 1 }}>
          <Typography variant="body2" noWrap title={asset.originalFilename || undefined} fontWeight={500}>
            {asset.originalFilename || `Asset ${asset.assetId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {prettyBytes(asset.size)}
          </Typography>
        </Stack>

        {selected && (
          <S.SelectionIndicator>
            <CheckCircleIcon size={24} weight="fill" />
          </S.SelectionIndicator>
        )}
      </CardActionArea>
    </S.Card>
  );
};
