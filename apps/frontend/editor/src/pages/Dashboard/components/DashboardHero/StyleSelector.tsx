import { Stack } from '@mui/material';
import styled from 'styled-components';
import { GraduationCapIcon, CompassIcon, UsersThreeIcon, HouseIcon } from '@phosphor-icons/react';
import { GenerateHuntStyle } from '@hunthub/shared';
import { ToggleButtonGroup, type ToggleButtonOption } from '@/components/common/ToggleButton';

const styleOptions: ToggleButtonOption[] = [
  { value: GenerateHuntStyle.Educational, label: 'Educational', icon: <GraduationCapIcon size={18} /> },
  { value: GenerateHuntStyle.Adventure, label: 'Adventure', icon: <CompassIcon size={18} /> },
  { value: GenerateHuntStyle.TeamBuilding, label: 'Team', icon: <UsersThreeIcon size={18} /> },
  { value: GenerateHuntStyle.FamilyFriendly, label: 'Family', icon: <HouseIcon size={18} /> },
];

const ResponsiveToggleGroup = styled(ToggleButtonGroup)`
  justify-content: center;

  ${({ theme }) => theme.breakpoints.down('md')} {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing(1)};
  }
`;

interface StyleSelectorProps {
  value: GenerateHuntStyle | undefined;
  onChange: (value: GenerateHuntStyle | null) => void;
  disabled?: boolean;
}

export const StyleSelector = ({ value, onChange, disabled }: StyleSelectorProps) => (
  <Stack alignItems="center" sx={{ mt: 3 }}>
    <ResponsiveToggleGroup
      exclusive
      value={value ?? null}
      onChange={(_, newValue) => onChange(newValue)}
      options={styleOptions}
      size="small"
      disabled={disabled}
    />
  </Stack>
);
