import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { ShareNetworkIcon, RocketLaunchIcon, CaretDownIcon } from '@phosphor-icons/react';
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

  return (
    <S.Container>
      <Button
        variant="outlined"
        size="small"
        disabled={!hasUnsavedChanges || isSaving || isBusy}
        onClick={onSave}
        startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
      >
        Save
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<ShareNetworkIcon size={18} />}
        endIcon={<CaretDownIcon size={14} />}
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
