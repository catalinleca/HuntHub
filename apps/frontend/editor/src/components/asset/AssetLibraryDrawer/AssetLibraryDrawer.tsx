import { useState, useMemo } from 'react';
import { Typography, IconButton, TextField, InputAdornment, Button, CircularProgress } from '@mui/material';
import { ArrowLeftIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { useAssetsQuery } from '@/api/Asset';
import { AssetGrid } from './AssetGrid';
import { CreateAssetModal } from '@/components/asset';
import * as S from './AssetLibraryDrawer.styles';

export interface AssetLibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  filterType?: 'image' | 'audio' | 'video';
}

export const AssetLibraryDrawer = ({ open, onClose, onSelect, filterType }: AssetLibraryDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const {
    data: assetsResponse,
    isLoading,
    refetch,
  } = useAssetsQuery({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const filteredAssets = useMemo(() => {
    if (!assetsResponse?.data) return [];

    let assets = assetsResponse.data;

    if (filterType) {
      assets = assets.filter((asset) => asset.mimeType.startsWith(`${filterType}/`));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      assets = assets.filter((asset) => asset.originalFilename?.toLowerCase().includes(query));
    }

    return assets;
  }, [assetsResponse?.data, filterType, searchQuery]);

  const selectedAsset = filteredAssets.find((a) => a.assetId === selectedAssetId);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAssetId(asset.assetId === selectedAssetId ? null : asset.assetId);
  };

  const handleSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedAssetId(null);
    setSearchQuery('');
    onClose();
  };

  const handleUploadComplete = () => {
    setUploadModalOpen(false);
    refetch();
  };

  return (
    <>
      <S.Drawer anchor="right" open={open} onClose={handleClose}>
        <S.Container>
          <S.Header>
            <IconButton onClick={handleClose} size="small">
              <ArrowLeftIcon size={20} />
            </IconButton>
            <Typography variant="h6" flex={1}>
              Asset Library
            </Typography>
            <Button size="small" startIcon={<PlusIcon size={16} />} onClick={() => setUploadModalOpen(true)}>
              Upload
            </Button>
          </S.Header>

          <S.SearchContainer>
            <TextField
              fullWidth
              size="small"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlassIcon size={20} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </S.SearchContainer>

          <S.Content>
            {isLoading ? (
              <S.LoadingContainer>
                <CircularProgress size={32} />
              </S.LoadingContainer>
            ) : (
              <AssetGrid
                assets={filteredAssets}
                selectedAssetId={selectedAssetId}
                onAssetClick={handleAssetClick}
                onAssetDoubleClick={onSelect}
                emptyMessage={
                  searchQuery
                    ? 'No assets match your search'
                    : filterType
                      ? `No ${filterType} assets yet`
                      : 'No assets yet'
                }
              />
            )}
          </S.Content>

          <S.Footer>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSelect} disabled={!selectedAsset}>
              Select
            </Button>
          </S.Footer>
        </S.Container>
      </S.Drawer>

      <CreateAssetModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};
