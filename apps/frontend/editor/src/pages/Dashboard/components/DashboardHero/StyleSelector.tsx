import { Stack } from '@mui/material';
import { GraduationCapIcon, CompassIcon, UsersThreeIcon, HouseIcon } from '@phosphor-icons/react';
import { GenerateHuntStyle } from '@hunthub/shared';
import { ToggleButtonGroup, type ToggleButtonOption } from '@/components/common/ToggleButton';

const styleOptions: ToggleButtonOption[] = [
  { value: GenerateHuntStyle.Educational, label: 'Educational', icon: <GraduationCapIcon size={18} /> },
  { value: GenerateHuntStyle.Adventure, label: 'Adventure', icon: <CompassIcon size={18} /> },
  { value: GenerateHuntStyle.TeamBuilding, label: 'Team', icon: <UsersThreeIcon size={18} /> },
  { value: GenerateHuntStyle.FamilyFriendly, label: 'Family', icon: <HouseIcon size={18} /> },
];

interface StyleSelectorProps {
  value: GenerateHuntStyle | undefined;
  onChange: (value: GenerateHuntStyle | null) => void;
  disabled?: boolean;
}

export const StyleSelector = ({ value, onChange, disabled }: StyleSelectorProps) => (
  <Stack alignItems="center" sx={{ mt: 3 }}>
    <ToggleButtonGroup
      exclusive
      value={value ?? null}
      onChange={(_, newValue) => onChange(newValue)}
      options={styleOptions}
      size="small"
      disabled={disabled}
      sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' }, justifyContent: 'center', gap: { xs: 1, md: 0 } }}
    />
  </Stack>
);
