import styled from 'styled-components';
import { Box, Stack, Typography } from '@mui/material';

export const AddLocationButton = styled(Stack).attrs({
  direction: 'row',
  alignItems: 'center',
})(({ theme }) => ({
  gap: theme.spacing(1),
  color: theme.palette.primary.main,
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `2px dashed ${theme.palette.divider}`,
  justifyContent: 'center',

  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
}));

export const MapContainer = styled(Box)(({ theme }) => ({
  height: 200,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.action.hover,
}));

export const MapPlaceholder = styled(Stack).attrs({
  justifyContent: 'center',
  alignItems: 'center',
})(({ theme }) => ({
  height: '100%',
  color: theme.palette.text.secondary,
}));

export const SectionLabel = styled(Typography).attrs({
  variant: 'overline',
})(({ theme }) => ({
  fontWeight: 600,
  letterSpacing: '1.5px',
  color: theme.palette.text.secondary,
}));

export const RadiusHelper = styled(Typography).attrs({
  variant: 'body2',
})(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const RadiusLabel = styled(Typography).attrs({
  variant: 'body2',
})(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.primary,
}));
