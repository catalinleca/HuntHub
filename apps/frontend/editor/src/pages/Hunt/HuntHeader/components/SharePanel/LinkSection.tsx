import { Typography, Stack, IconButton, Paper } from '@mui/material';
import { CopyIcon, CheckIcon, LinkIcon } from '@phosphor-icons/react';
import { useCopyToClipboard } from '@/hooks';
import { useSnackbarStore } from '@/stores';

interface LinkSectionProps {
  playUrl: string;
}

export const LinkSection = ({ playUrl }: LinkSectionProps) => {
  const { copied, copy } = useCopyToClipboard();
  const { success } = useSnackbarStore();

  const handleCopy = () => {
    if (!playUrl) {
      return;
    }
    copy(playUrl);
    success('Link copied!');
  };

  return (
    <Stack p={2} gap={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        Share Hunt
      </Typography>
      {playUrl ? (
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
  );
};
