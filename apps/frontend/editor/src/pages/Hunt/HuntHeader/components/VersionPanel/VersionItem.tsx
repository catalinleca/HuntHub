import { ListItem, ListItemText, ListItemSecondaryAction, Typography, Stack, Chip, Button, CircularProgress } from '@mui/material';
import { RocketLaunchIcon, EyeSlashIcon } from '@phosphor-icons/react';

type VersionStatus = 'draft' | 'published' | 'live';

interface VersionItemProps {
  version: number;
  status: VersionStatus;
  onRelease: (version: number) => void;
  onTakeOffline: () => void;
  isReleasing: boolean;
  isTakingOffline: boolean;
  releasingVersion: number | null;
}

const StatusChip = ({ status }: { status: VersionStatus }) => {
  switch (status) {
    case 'live':
      return <Chip label="Live" size="small" color="success" />;
    case 'published':
      return <Chip label="Published" size="small" color="primary" variant="outlined" />;
    case 'draft':
      return <Chip label="Draft" size="small" color="default" variant="outlined" />;
  }
};

const getSecondaryText = (status: VersionStatus): string => {
  switch (status) {
    case 'draft':
      return 'Currently editing';
    case 'live':
      return 'Players can see this version';
    case 'published':
      return 'Ready to release';
  }
};

export const VersionItem = ({
  version,
  status,
  onRelease,
  onTakeOffline,
  isReleasing,
  isTakingOffline,
  releasingVersion,
}: VersionItemProps) => {
  const isLoading = isReleasing || isTakingOffline;
  const isThisVersionReleasing = isReleasing && releasingVersion === version;

  return (
    <ListItem
      sx={{
        py: 1,
        bgcolor: status === 'live' ? 'success.50' : 'transparent',
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={500}>
              Version {version}
            </Typography>
            <StatusChip status={status} />
          </Stack>
        }
        secondary={getSecondaryText(status)}
      />
      <ListItemSecondaryAction>
        {status === 'published' && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={isThisVersionReleasing ? <CircularProgress size={14} /> : <RocketLaunchIcon size={14} />}
            onClick={() => onRelease(version)}
            disabled={isLoading}
          >
            Release
          </Button>
        )}
        {status === 'live' && (
          <Button
            size="small"
            variant="outlined"
            color="warning"
            startIcon={isTakingOffline ? <CircularProgress size={14} /> : <EyeSlashIcon size={14} />}
            onClick={onTakeOffline}
            disabled={isLoading}
          >
            Take Offline
          </Button>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );
};
