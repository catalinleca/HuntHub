import { ListItem, ListItemText, Typography, Stack, Chip, Button, CircularProgress } from '@mui/material';
import { RocketLaunchIcon, EyeSlashIcon } from '@phosphor-icons/react';

interface VersionItemProps {
  version: number;
  publishedAt: string;
  stepCount: number;
  isLive: boolean;
  onSetAsLive: (version: number) => void;
  onTakeOffline: () => void;
  isSettingLive: boolean;
  isTakingOffline: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const VersionItem = ({
  version,
  publishedAt,
  stepCount,
  isLive,
  onSetAsLive,
  onTakeOffline,
  isSettingLive,
  isTakingOffline,
}: VersionItemProps) => {
  const isLoading = isSettingLive || isTakingOffline;

  return (
    <ListItem
      secondaryAction={
        isLive ? (
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
        ) : (
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={isSettingLive ? <CircularProgress size={14} /> : <RocketLaunchIcon size={14} />}
            onClick={() => onSetAsLive(version)}
            disabled={isLoading}
          >
            Set as Live
          </Button>
        )
      }
      sx={{
        py: 1,
        bgcolor: isLive ? 'success.50' : 'transparent',
      }}
    >
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="body2" fontWeight={500}>
              v{version} ({formatDate(publishedAt)})
            </Typography>
            {isLive && <Chip label="Live" size="small" color="success" />}
          </Stack>
        }
        secondary={`${stepCount} step${stepCount !== 1 ? 's' : ''}`}
      />
    </ListItem>
  );
};
