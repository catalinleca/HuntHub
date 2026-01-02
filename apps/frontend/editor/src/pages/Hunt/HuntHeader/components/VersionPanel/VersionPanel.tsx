import { useState } from 'react';
import {
  Popover,
  Typography,
  Stack,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
} from '@mui/material';
import { RocketLaunchIcon, EyeSlashIcon, ClockIcon } from '@phosphor-icons/react';

interface Version {
  number: number;
  status: 'draft' | 'published' | 'live';
}

interface VersionPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  latestVersion: number;
  liveVersion: number | null;
  onRelease: (version: number) => void;
  onTakeOffline: () => void;
  isReleasing: boolean;
  isTakingOffline: boolean;
}

const getVersions = (latestVersion: number, liveVersion: number | null): Version[] => {
  const versions: Version[] = [];

  // Draft version (always the latest)
  versions.push({
    number: latestVersion,
    status: 'draft',
  });

  // Published versions (from latestVersion - 1 down to 1)
  for (let v = latestVersion - 1; v >= 1; v--) {
    versions.push({
      number: v,
      status: v === liveVersion ? 'live' : 'published',
    });
  }

  return versions;
};

const getStatusChip = (status: Version['status']) => {
  switch (status) {
    case 'live':
      return <Chip label="Live" size="small" color="success" />;
    case 'published':
      return <Chip label="Published" size="small" color="primary" variant="outlined" />;
    case 'draft':
      return <Chip label="Draft" size="small" color="default" variant="outlined" />;
  }
};

export const VersionPanel = ({
  anchorEl,
  open,
  onClose,
  latestVersion,
  liveVersion,
  onRelease,
  onTakeOffline,
  isReleasing,
  isTakingOffline,
}: VersionPanelProps) => {
  const [releasingVersion, setReleasingVersion] = useState<number | null>(null);
  const versions = getVersions(latestVersion, liveVersion);
  const hasPublishedVersions = latestVersion > 1;

  const handleRelease = (version: number) => {
    setReleasingVersion(version);
    onRelease(version);
  };

  const isLoading = isReleasing || isTakingOffline;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: { width: 320, mt: 1 },
        },
      }}
    >
      <Stack p={2} gap={1}>
        <Typography variant="subtitle1" fontWeight={600}>
          Version History
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {liveVersion
            ? `Version ${liveVersion} is currently live for players`
            : 'No version is live yet'}
        </Typography>
      </Stack>

      <Divider />

      {!hasPublishedVersions ? (
        <Stack p={2} alignItems="center" gap={1}>
          <ClockIcon size={32} weight="light" />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            No published versions yet.
            <br />
            Click "Publish" to create your first version.
          </Typography>
        </Stack>
      ) : (
        <List dense sx={{ py: 0 }}>
          {versions.map((version) => (
            <ListItem
              key={version.number}
              sx={{
                py: 1.5,
                bgcolor: version.status === 'live' ? 'success.50' : 'transparent',
              }}
            >
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500}>
                      Version {version.number}
                    </Typography>
                    {getStatusChip(version.status)}
                  </Stack>
                }
                secondary={
                  version.status === 'draft'
                    ? 'Currently editing'
                    : version.status === 'live'
                      ? 'Players can see this version'
                      : 'Ready to release'
                }
              />
              <ListItemSecondaryAction>
                {version.status === 'published' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={
                      isReleasing && releasingVersion === version.number ? (
                        <CircularProgress size={14} />
                      ) : (
                        <RocketLaunchIcon size={14} />
                      )
                    }
                    onClick={() => handleRelease(version.number)}
                    disabled={isLoading}
                  >
                    Release
                  </Button>
                )}
                {version.status === 'live' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={
                      isTakingOffline ? <CircularProgress size={14} /> : <EyeSlashIcon size={14} />
                    }
                    onClick={onTakeOffline}
                    disabled={isLoading}
                  >
                    Take Offline
                  </Button>
                )}
              </ListItemSecondaryAction>
            </ListItem>
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
