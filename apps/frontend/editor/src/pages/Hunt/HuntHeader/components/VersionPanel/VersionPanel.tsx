import { Popover, Typography, Stack, Divider, List, CircularProgress } from '@mui/material';
import { useParams } from 'react-router-dom';
import { usePublishingContext } from '@/pages/Hunt/context';
import { useGetVersionHistory } from '@/api/Hunt';
import { VersionItem } from './VersionItem';
import { EmptyVersionState } from './EmptyVersionState';

interface VersionPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export const VersionPanel = ({ anchorEl, open, onClose }: VersionPanelProps) => {
  const { id } = useParams<{ id: string }>();
  const huntId = Number(id);

  const { liveVersion, handleSetAsLive, handleTakeOffline, isReleasing, isTakingOffline, settingLiveVersion } =
    usePublishingContext();

  const { data: versionHistory, isLoading } = useGetVersionHistory(huntId);

  const versions = versionHistory?.versions ?? [];
  const hasPublishedVersions = versions.length > 0;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: { sx: { width: 320, mt: 1 } },
      }}
    >
      <Stack p={2} gap={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Version History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {liveVersion ? `Version ${liveVersion} is currently live` : 'No version is live yet'}
        </Typography>
      </Stack>

      <Divider />

      {isLoading ? (
        <Stack alignItems="center" p={3}>
          <CircularProgress size={24} />
        </Stack>
      ) : !hasPublishedVersions ? (
        <EmptyVersionState />
      ) : (
        <List dense sx={{ py: 0 }}>
          {versions.map((version) => (
            <VersionItem
              key={version.version}
              version={version.version}
              publishedAt={version.publishedAt}
              stepCount={version.stepCount}
              isLive={version.version === liveVersion}
              onSetAsLive={handleSetAsLive}
              onTakeOffline={handleTakeOffline}
              isSettingLive={isReleasing && settingLiveVersion === version.version}
              isTakingOffline={isTakingOffline && version.version === liveVersion}
            />
          ))}
        </List>
      )}

      <Divider />

      <Stack p={2}>
        <Typography variant="caption" color="text.secondary">
          Switch which version players see, or take the hunt offline.
        </Typography>
      </Stack>
    </Popover>
  );
};
