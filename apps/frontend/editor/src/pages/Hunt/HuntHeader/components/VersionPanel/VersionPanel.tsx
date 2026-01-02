import { useState } from 'react';
import { Popover, Typography, Stack, Divider, List } from '@mui/material';
import { usePublishingContext } from '@/pages/Hunt/context';
import { VersionItem, VersionStatus } from './VersionItem';
import { EmptyVersionState } from './EmptyVersionState';

interface VersionPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

interface Version {
  number: number;
  status: VersionStatus;
}

const buildVersionList = (latestVersion: number, liveVersion: number | null): Version[] => {
  const versions: Version[] = [];

  versions.push({
    number: latestVersion,
    status: 'draft',
  });

  for (let v = latestVersion - 1; v >= 1; v--) {
    versions.push({
      number: v,
      status: v === liveVersion ? 'live' : 'published',
    });
  }

  return versions;
};

export const VersionPanel = ({ anchorEl, open, onClose }: VersionPanelProps) => {
  const { latestVersion, liveVersion, handleRelease, handleTakeOffline, isReleasing, isTakingOffline } =
    usePublishingContext();

  const [releasingVersion, setReleasingVersion] = useState<number | null>(null);

  const versions = buildVersionList(latestVersion, liveVersion);
  const hasPublishedVersions = latestVersion > 1;

  const onReleaseClick = (version: number) => {
    setReleasingVersion(version);
    handleRelease(version);
  };

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
          {liveVersion ? `Version ${liveVersion} is currently live for players` : 'No version is live yet'}
        </Typography>
      </Stack>

      <Divider />

      {!hasPublishedVersions ? (
        <EmptyVersionState />
      ) : (
        <List dense sx={{ py: 0 }}>
          {versions.map((version) => (
            <VersionItem
              key={version.number}
              version={version.number}
              status={version.status}
              onRelease={onReleaseClick}
              onTakeOffline={handleTakeOffline}
              isReleasing={isReleasing}
              isTakingOffline={isTakingOffline}
              releasingVersion={releasingVersion}
            />
          ))}
        </List>
      )}

      <Divider />

      <Stack p={2}>
        <Typography variant="caption" color="text.secondary">
          Publish creates an immutable snapshot. Release makes a version visible to players.
        </Typography>
      </Stack>
    </Popover>
  );
};
