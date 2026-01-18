import { Button, CircularProgress } from '@mui/material';
import { ShareNetworkIcon, RocketLaunchIcon } from '@phosphor-icons/react';
import { usePublishingContext } from '@/pages/Hunt/context';
import * as S from './ActionBar.styles';

interface ActionBarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ActionBar = ({ hasUnsavedChanges, isSaving, onSave }: ActionBarProps) => {
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

      <Button variant="outlined" size="small" startIcon={<ShareNetworkIcon size={18} />} disabled={isBusy}>
        Share
      </Button>

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
