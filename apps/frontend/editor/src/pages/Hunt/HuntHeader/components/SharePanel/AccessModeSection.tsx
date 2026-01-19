import { Typography, Stack } from '@mui/material';
import { HuntAccessMode } from '@hunthub/shared';
import { ToggleButtonGroup } from '@/components/common/ToggleButton';

const ACCESS_MODE_OPTIONS = [
  { value: HuntAccessMode.Open, label: 'Link access' },
  { value: HuntAccessMode.InviteOnly, label: 'Invite only' },
];

interface AccessModeSectionProps {
  accessMode: HuntAccessMode;
  onChange: (event: React.MouseEvent<HTMLElement>, value: HuntAccessMode | null) => void;
  disabled?: boolean;
}

export const AccessModeSection = ({ accessMode, onChange, disabled }: AccessModeSectionProps) => {
  const isInviteOnly = accessMode === HuntAccessMode.InviteOnly;

  return (
    <Stack p={2} gap={1}>
      <Typography variant="body2" fontWeight={500}>
        Who can play
      </Typography>
      <ToggleButtonGroup
        value={accessMode}
        exclusive
        onChange={onChange}
        options={ACCESS_MODE_OPTIONS}
        fullWidth
        disabled={disabled}
      />
      <Typography variant="caption" color="text.secondary">
        {isInviteOnly ? 'Only invited players can access this hunt' : 'Anyone with the link can play'}
      </Typography>
    </Stack>
  );
};
