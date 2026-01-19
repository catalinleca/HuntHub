import styled from 'styled-components';
import { alpha, Box } from '@mui/material';

export const OptionCard = styled(Box)<{ $selected?: boolean; $disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing(1, 2)};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.palette.accent.main : theme.palette.grey[300])};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: all 0.15s ease;
  background-color: ${({ theme, $selected }) => ($selected ? alpha(theme.palette.accent.main, 0.08) : 'transparent')};

  &:hover {
    border-color: ${({ theme, $disabled, $selected }) =>
      $disabled ? ($selected ? theme.palette.accent.main : theme.palette.grey[300]) : theme.palette.accent.main};
    background-color: ${({ theme, $disabled, $selected }) =>
      $disabled
        ? $selected
          ? alpha(theme.palette.accent.main, 0.08)
          : 'transparent'
        : $selected
          ? alpha(theme.palette.accent.main, 0.12)
          : alpha(theme.palette.grey[500], 0.08)};
  }
`;
