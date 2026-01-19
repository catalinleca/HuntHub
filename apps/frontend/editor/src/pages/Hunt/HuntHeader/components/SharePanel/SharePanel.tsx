import { Popover, Divider, Collapse, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { HuntAccessMode } from '@hunthub/shared';
import { useGetHunt, useUpdateAccessMode } from '@/api/Hunt';
import { LinkSection } from './LinkSection';
import { AccessModeSection } from './AccessModeSection';
import { InviteSection } from './InviteSection';

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';
const PANEL_WIDTH = 300;

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

  const playUrl = hunt?.playSlug ? `${PLAYER_URL}/${hunt.playSlug}` : '';
  const accessMode = hunt?.accessMode ?? HuntAccessMode.Open;
  const isInviteOnly = accessMode === HuntAccessMode.InviteOnly;

  const handleAccessModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: HuntAccessMode | null) => {
    if (newMode && newMode !== accessMode) {
      updateAccessMode({ huntId, accessMode: newMode });
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box width={PANEL_WIDTH}>
        <LinkSection playUrl={playUrl} huntId={huntId} />
        <Divider />
        <AccessModeSection accessMode={accessMode} onChange={handleAccessModeChange} disabled={isUpdatingAccessMode} />
        <Collapse in={isInviteOnly}>
          <Divider />
          <InviteSection huntId={huntId} />
        </Collapse>
      </Box>
    </Popover>
  );
};
