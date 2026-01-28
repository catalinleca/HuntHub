import { useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import { ShareNetworkIcon, RocketLaunchIcon } from '@phosphor-icons/react';
import { usePublishingContext } from '@/pages/Hunt/context';
import { SharePanel } from '../SharePanel';
import * as S from './ActionBar.styles';

interface ActionBarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ActionBar = ({ hasUnsavedChanges, isSaving, onSave }: ActionBarProps) => {
  const [shareAnchor, setShareAnchor] = useState<HTMLElement | null>(null);
  const { handleRelease, isPublishing, isReleasing } = usePublishingContext();

  const isBusy = isPublishing || isReleasing;
  const isSaveDisabled = !hasUnsavedChanges || isSaving || isBusy;

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
