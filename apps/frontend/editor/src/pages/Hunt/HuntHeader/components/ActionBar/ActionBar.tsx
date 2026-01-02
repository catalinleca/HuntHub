import React, { useState } from 'react';
import { Button, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { ShareNetworkIcon, UploadIcon, RocketLaunchIcon, CaretDownIcon } from '@phosphor-icons/react';
import { usePublishingContext } from '@/pages/Hunt/context';
import * as S from './ActionBar.styles';

interface ActionBarProps {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
}

export const ActionBar = ({ hasUnsavedChanges, isSaving, onSave }: ActionBarProps) => {
  const { handlePublish, handlePublishAndRelease, isPublishing } = usePublishingContext();

  const [publishMenuAnchor, setPublishMenuAnchor] = useState<HTMLElement | null>(null);

  const handlePublishClick = (event: React.MouseEvent<HTMLElement>) => {
    setPublishMenuAnchor(event.currentTarget);
  };

  const handlePublishMenuClose = () => {
    setPublishMenuAnchor(null);
  };

  const handlePublishOnly = () => {
    handlePublishMenuClose();
    handlePublish();
  };

  const handlePublishAndReleaseClick = () => {
    handlePublishMenuClose();
    handlePublishAndRelease();
  };

  return (
    <S.Container>
      <Button
        variant="outlined"
        size="small"
        disabled={!hasUnsavedChanges || isSaving || isPublishing}
        onClick={onSave}
        startIcon={isSaving ? <CircularProgress size={16} /> : undefined}
      >
        Save
      </Button>

      <Button variant="outlined" size="small" startIcon={<ShareNetworkIcon size={18} />} disabled={isPublishing}>
        Share
      </Button>

      <Button
        variant="contained"
        size="small"
        startIcon={isPublishing ? <CircularProgress size={16} color="inherit" /> : <UploadIcon size={18} />}
        endIcon={<CaretDownIcon size={14} />}
        onClick={handlePublishClick}
        disabled={isPublishing}
      >
        {isPublishing ? 'Publishing...' : 'Publish'}
      </Button>

      <Menu
        anchorEl={publishMenuAnchor}
        open={Boolean(publishMenuAnchor)}
        onClose={handlePublishMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handlePublishOnly}>
          <ListItemIcon>
            <UploadIcon size={18} />
          </ListItemIcon>
          <ListItemText primary="Publish" secondary="Create version snapshot" />
        </MenuItem>
        <MenuItem onClick={handlePublishAndReleaseClick}>
          <ListItemIcon>
            <RocketLaunchIcon size={18} />
          </ListItemIcon>
          <ListItemText primary="Publish & Go Live" secondary="Publish and release to players" />
        </MenuItem>
      </Menu>
    </S.Container>
  );
};
