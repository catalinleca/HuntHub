import styled from 'styled-components';
import { Paper } from '@mui/material';

export const OptionCard = styled(Paper)<{ $selected?: boolean; $disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing(2)};
  border: 1px solid ${({ theme, $selected }) => ($selected ? theme.palette.primary.main : theme.palette.grey[300])};
  border-radius: ${({ theme }) => theme.shape.md}px;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  transition: all 0.2s ease;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.palette.primary.light : theme.palette.background.surface};

  &:hover {
    border-color: ${({ theme, $disabled }) => ($disabled ? undefined : theme.palette.primary.main)};
    background-color: ${({ theme, $disabled }) => ($disabled ? undefined : theme.palette.grey[100])};
  }
`;
