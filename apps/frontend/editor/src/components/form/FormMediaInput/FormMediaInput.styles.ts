import styled from 'styled-components';
import { Stack, Typography, Card } from '@mui/material';

export const SectionLabel = styled(Typography).attrs({
  variant: 'overline',
})(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '1.5px',
  color: theme.palette.text.secondary,
}));

export const AddMediaButton = styled(Stack).attrs({
  direction: 'row',
  alignItems: 'center',
})<{ $disabled?: boolean }>(({ theme, $disabled }) => ({
  gap: theme.spacing(1),
  color: $disabled ? theme.palette.text.disabled : theme.palette.primary.main,
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  justifyContent: 'center',
  cursor: $disabled ? 'not-allowed' : 'pointer',
  transition: 'border-color 0.2s ease-in-out',

  ...(!$disabled && {
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  }),
}));

export const MediaCard = styled(Card)<{ $disabled?: boolean }>(({ theme, $disabled }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  cursor: $disabled ? 'not-allowed' : 'pointer',
  transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  opacity: $disabled ? 0.6 : 1,

  ...(!$disabled && {
    '&:hover': {
      boxShadow: theme.shadows[2],
      transform: 'translateY(-1px)',
    },
  }),
}));

export const PreviewContainer = styled.div(({ theme }) => ({
  width: 80,
  height: 60,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  flexShrink: 0,
  backgroundColor: theme.palette.action.hover,
}));

export const MediaInfo = styled(Stack)({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
});
