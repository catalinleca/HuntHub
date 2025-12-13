import { useState, useMemo } from 'react';
import {
  Drawer,
  Stack,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { ArrowLeftIcon, MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { useAssetsQuery } from '@/api/Asset';
import { AssetGrid } from '../AssetGrid';
import { CreateAssetModal } from '../CreateAssetModal';

export interface AssetLibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;
  /** Filter assets by type (e.g., 'image/*' prefix) */
  filterType?: 'image' | 'audio' | 'video';
}

const DRAWER_WIDTH = 400;
const DRAWER_Z_INDEX = 1201; // Above MediaDetailsDrawer (1200)

export const AssetLibraryDrawer = ({ open, onClose, onSelect, filterType }: AssetLibraryDrawerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch all assets (no pagination for MVP)
  const {
    data: assetsResponse,
    isLoading,
    refetch,
  } = useAssetsQuery({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Filter assets client-side
  const filteredAssets = useMemo(() => {
    if (!assetsResponse?.data) return [];

    let assets = assetsResponse.data;

    // Filter by type
    if (filterType) {
      assets = assets.filter((asset) => asset.mimeType.startsWith(`${filterType}/`));
    }

    // Filter by search query
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
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: DRAWER_Z_INDEX,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Stack sx={{ height: '100%' }}>
          {/* Header */}
          <Stack direction="row" alignItems="center" gap={1} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <IconButton onClick={handleClose} size="small">
              <ArrowLeftIcon size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Asset Library
            </Typography>
            <Button size="small" startIcon={<PlusIcon size={16} />} onClick={() => setUploadModalOpen(true)}>
              Upload
            </Button>
          </Stack>

          {/* Search */}
          <Box sx={{ p: 2, pb: 1 }}>
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
          </Box>

          {/* Asset grid */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, pt: 1 }}>
            {isLoading ? (
              <Stack alignItems="center" justifyContent="center" py={4}>
                <CircularProgress size={32} />
              </Stack>
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
          </Box>

          {/* Footer with Select button */}
          <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSelect} disabled={!selectedAsset}>
              Select
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Upload modal */}
      <CreateAssetModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
};
