import { Popover, Typography, Stack, Divider, TextField, IconButton, InputAdornment, Collapse } from '@mui/material';
import { CopyIcon } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
import { HuntAccessMode } from '@hunthub/shared';
import { useGetHunt, useUpdateAccessMode } from '@/api/Hunt';
import { useSnackbarStore } from '@/stores';
import { ToggleButtonGroup } from '@/components/common';
import { InviteSection } from './InviteSection';

const ACCESS_MODE_OPTIONS = [
  { value: HuntAccessMode.Open, label: 'Anyone with link' },
  { value: HuntAccessMode.InviteOnly, label: 'Invite only' },
];

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

interface SharePanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const SharePanel = ({ anchorEl, open, onClose }: SharePanelProps) => {
  const { id } = useParams<{ id: string }>();
  const huntId = Number(id);

  const { data: hunt } = useGetHunt(huntId);
  const { mutate: updateAccessMode, isPending: isUpdatingAccessMode } = useUpdateAccessMode();
  const { success } = useSnackbarStore();

  const hasPlayUrl = Boolean(hunt?.playSlug);
  const playUrl = hasPlayUrl ? `${PLAYER_URL}/${hunt!.playSlug}` : '';
  const accessMode = hunt?.accessMode ?? HuntAccessMode.Open;
  const isInviteOnly = accessMode === HuntAccessMode.InviteOnly;

  const handleCopy = () => {
    if (!playUrl) {
      return;
    }
    navigator.clipboard.writeText(playUrl);
    success('Link copied!');
  };

  const handleAccessModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode && newMode !== accessMode) {
      updateAccessMode({ huntId, accessMode: newMode as HuntAccessMode });
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: { sx: { width: 360, mt: 1 } },
      }}
    >
      <Stack p={2} gap={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Share Hunt
        </Typography>
        {hasPlayUrl ? (
          <TextField
            value={playUrl}
            size="small"
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleCopy}>
                      <CopyIcon size={18} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Release your hunt to get a shareable link
          </Typography>
        )}
      </Stack>

      <Divider />

      <Stack p={2} gap={1}>
        <Typography variant="body2" fontWeight={500}>
          Who can play
        </Typography>
        <ToggleButtonGroup
          value={accessMode}
          exclusive
          onChange={handleAccessModeChange}
          fullWidth
          disabled={isUpdatingAccessMode}
          options={ACCESS_MODE_OPTIONS}
        />
        <Typography variant="caption" color="text.secondary">
          {isInviteOnly ? 'Only invited players can access this hunt' : 'Anyone with the link can play'}
        </Typography>
      </Stack>

      <Collapse in={isInviteOnly}>
        <Divider />
        <InviteSection huntId={huntId} />
      </Collapse>
    </Popover>
  );
};
