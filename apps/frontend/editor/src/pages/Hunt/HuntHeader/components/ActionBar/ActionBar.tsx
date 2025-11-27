import { Button } from '@mui/material';
import { Eye, ShareNetwork, Upload } from '@phosphor-icons/react';
import * as S from './ActionBar.styles';

interface ActionBarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ActionBar = ({ hasUnsavedChanges, isSaving, onSave }: ActionBarProps) => {
  return (
    <S.Container>
      <Button
        variant="outlined"
        size="small"
        disabled={!hasUnsavedChanges || isSaving}
        onClick={onSave}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
      <Button variant="outlined" size="small" startIcon={<Eye size={18} />}>
        Hide
      </Button>
      <Button variant="outlined" size="small" startIcon={<ShareNetwork size={18} />}>
        Share
      </Button>
      <Button variant="contained" size="small" startIcon={<Upload size={18} />}>
        Publish
      </Button>
    </S.Container>
  );
};
