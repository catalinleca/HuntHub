import { useState } from 'react';
import { Popover, Typography, Stack, Divider, IconButton, Collapse, Paper, Box } from '@mui/material';
import { CopyIcon, CheckIcon, LinkIcon, EyeIcon } from '@phosphor-icons/react';
import { useParams } from 'react-router-dom';
import { HuntAccessMode } from '@hunthub/shared';
import { useGetHunt, useUpdateAccessMode, useGetPreviewLink } from '@/api/Hunt';
import { useSnackbarStore } from '@/stores';
import { ToggleButtonGroup } from '@/components/common';
import { getPlayUrl } from '@/utils';
import { InviteSection } from './InviteSection';

const ACCESS_MODE_OPTIONS = [
  { value: HuntAccessMode.Open, label: 'Link access' },
  { value: HuntAccessMode.InviteOnly, label: 'Invite only' },
];

interface SharePanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const SharePanel = ({ anchorEl, open, onClose }: SharePanelProps) => {
  const { id } = useParams<{ id: string }>();
  const huntId = Number(id);
  const [copied, setCopied] = useState(false);
  const [previewCopied, setPreviewCopied] = useState(false);

  const { data: hunt } = useGetHunt(huntId);
  const { data: previewLink } = useGetPreviewLink(huntId);
  const { mutate: updateAccessMode, isPending: isUpdatingAccessMode } = useUpdateAccessMode();
  const { success } = useSnackbarStore();

  const hasPlayUrl = Boolean(hunt?.playSlug);
  const playUrl = hasPlayUrl ? getPlayUrl(hunt!.playSlug!) : '';
  const accessMode = hunt?.accessMode ?? HuntAccessMode.Open;
  const isInviteOnly = accessMode === HuntAccessMode.InviteOnly;

  const handleCopy = () => {
    if (!playUrl) {
      return;
    }
    navigator.clipboard.writeText(playUrl);
    setCopied(true);
    success('Link copied!');
  };

  const handlePreviewCopy = () => {
    if (!previewLink?.previewUrl) {
      return;
    }
    navigator.clipboard.writeText(previewLink.previewUrl);
    setPreviewCopied(true);
    success('Preview link copied!');
  };

  const handleAccessModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: string | null) => {
    if (newMode && newMode !== accessMode) {
      updateAccessMode({ huntId, accessMode: newMode as HuntAccessMode });
    }
  };

  const handleClose = () => {
    setCopied(false);
    setPreviewCopied(false);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ width: 300 }}>
        <Stack p={2} gap={1}>
          <Stack direction="row" alignItems="center" gap={1}>
            <EyeIcon size={18} />
            <Typography variant="subtitle1" fontWeight={600}>
              Preview Link
            </Typography>
          </Stack>
          {previewLink?.previewUrl ? (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="body2" noWrap sx={{ minWidth: 0, flex: 1 }}>
                  {previewLink.previewUrl}
                </Typography>
                <IconButton size="small" onClick={handlePreviewCopy}>
                  {previewCopied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                </IconButton>
              </Stack>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Add steps to enable preview
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Expires in ~1 hour. For testing only.
          </Typography>
        </Stack>

        <Divider />

        <Stack p={2} gap={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Share Hunt
          </Typography>
          {hasPlayUrl ? (
            <Paper variant="outlined" sx={{ p: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                  <LinkIcon size={18} />
                  <Typography variant="body2" noWrap>
                    {playUrl}
                  </Typography>
                </Stack>
                <IconButton size="small" onClick={handleCopy}>
                  {copied ? <CheckIcon size={18} /> : <CopyIcon size={18} />}
                </IconButton>
              </Stack>
            </Paper>
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
      </Box>
    </Popover>
  );
};
