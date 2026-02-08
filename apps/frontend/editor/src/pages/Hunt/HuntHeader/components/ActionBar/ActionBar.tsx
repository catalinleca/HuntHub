import { useState } from 'react';
import { Button, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { DeviceMobileIcon, ShareNetworkIcon, RocketLaunchIcon } from '@phosphor-icons/react';
import { usePublishingContext } from '@/pages/Hunt/context';
import { useGetPreviewLink } from '@/api/Hunt';
import { useSnackbarStore } from '@/stores';
import { SharePanel } from '../SharePanel';
import * as S from './ActionBar.styles';

interface ActionBarProps {
  huntId: number;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ActionBar = ({ huntId, hasUnsavedChanges, isSaving, onSave }: ActionBarProps) => {
  const [shareAnchor, setShareAnchor] = useState<HTMLElement | null>(null);
  const { handleRelease, isPublishing, isReleasing } = usePublishingContext();
  const { getPreviewLink, isGettingPreviewLink } = useGetPreviewLink();
  const snackbar = useSnackbarStore();

  const isBusy = isPublishing || isReleasing;
  const isSaveDisabled = !hasUnsavedChanges || isSaving || isBusy;

  const handleMobilePreview = async () => {
    try {
      const { previewUrl } = await getPreviewLink(huntId);
      window.open(previewUrl, '_blank');
    } catch {
      snackbar.error('Failed to generate preview link');
    }
  };

  const saveButton = (
    <Button
      variant="outlined"
      size="small"
      onClick={onSave}
      disabled={isSaveDisabled}
      startIcon={isSaving ? <CircularProgress size={16} /> : hasUnsavedChanges ? <S.UnsavedDot /> : undefined}
    >
      {isSaving ? 'Saving' : 'Save'}
    </Button>
  );

  return (
    <S.Container>
      <S.MobileOnly>
        <Tooltip title="Preview hunt" placement="bottom" arrow>
          <IconButton size="small" onClick={handleMobilePreview} disabled={isGettingPreviewLink}>
            <DeviceMobileIcon size={20} />
          </IconButton>
        </Tooltip>
      </S.MobileOnly>

      {hasUnsavedChanges && !isSaving ? (
        <Tooltip title="You have unsaved changes" placement="bottom" arrow>
          {saveButton}
        </Tooltip>
      ) : (
        saveButton
      )}

      <Button
        variant="outlined"
        size="small"
        startIcon={<ShareNetworkIcon size={18} />}
        disabled={isBusy}
        onClick={(e) => setShareAnchor(e.currentTarget)}
      >
        Share
      </Button>
      <SharePanel anchorEl={shareAnchor} open={Boolean(shareAnchor)} onClose={() => setShareAnchor(null)} />

      <Button
        variant="contained"
        size="small"
        startIcon={isBusy ? <CircularProgress size={16} color="inherit" /> : <RocketLaunchIcon size={18} />}
        onClick={handleRelease}
        disabled={isBusy}
      >
        {isBusy ? 'Releasing...' : 'Release'}
      </Button>
    </S.Container>
  );
};
