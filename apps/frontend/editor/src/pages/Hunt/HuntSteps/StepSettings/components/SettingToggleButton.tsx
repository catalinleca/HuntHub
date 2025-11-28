import { Button } from '@mui/material';
import { CheckIcon } from '@phosphor-icons/react';
import { ReactNode } from 'react';

interface SettingToggleButtonProps {
  label: string;
  enabled: boolean;
  onClick: () => void;
  icon?: ReactNode;
}

export const SettingToggleButton = ({ label, enabled, onClick, icon }: SettingToggleButtonProps) => (
  <Button
    variant={enabled ? 'contained' : 'outlined'}
    color={enabled ? 'primary' : 'inherit'}
    onClick={onClick}
    startIcon={icon}
    endIcon={enabled ? <CheckIcon size={16} weight="bold" /> : null}
    size="small"
    sx={{
      textTransform: 'none',
      borderColor: enabled ? undefined : 'divider',
      borderRadius: '18px',
    }}
  >
    {label}
  </Button>
);
