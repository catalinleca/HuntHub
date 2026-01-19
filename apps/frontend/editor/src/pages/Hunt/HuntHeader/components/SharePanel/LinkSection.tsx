import { Typography, Stack, IconButton, Paper, Link } from '@mui/material';
import { CopyIcon, CheckIcon, LinkIcon } from '@phosphor-icons/react';
import { useResetPlayLink } from '@/api/Hunt';
import { useCopyToClipboard } from '@/hooks';
import { useDialogStore, DialogVariants, useSnackbarStore } from '@/stores';

interface LinkSectionProps {
  playUrl: string;
  huntId: number;
}

export const LinkSection = ({ playUrl, huntId }: LinkSectionProps) => {
  const { copied, copy } = useCopyToClipboard();
  const { success } = useSnackbarStore();
  const { confirm } = useDialogStore();
  const { resetPlayLink } = useResetPlayLink();

  const handleCopy = () => {
    if (!playUrl) {
      return;
    }
    copy(playUrl);
    success('Link copied!');
  };

  const handleResetLink = () => {
    confirm({
      title: 'Reset share link?',
      message:
        'This will invalidate the current link. Anyone with the old link will no longer be able to access this hunt.',
      confirmText: 'Reset link',
      variant: DialogVariants.Warning,
      onConfirm: async () => {
        await resetPlayLink(huntId);
        success('Link reset successfully');
      },
    });
  };

  return (
    <Stack p={2} gap={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        Share Hunt
      </Typography>
      {playUrl ? (
        <>
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
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={handleResetLink}
            sx={{ alignSelf: 'flex-start' }}
          >
            Reset link
          </Link>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Release your hunt to get a shareable link
        </Typography>
      )}
    </Stack>
  );
};
