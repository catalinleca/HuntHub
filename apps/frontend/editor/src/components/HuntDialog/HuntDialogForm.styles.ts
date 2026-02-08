import styled from 'styled-components';
import { Stack, Typography } from '@mui/material';

export const Form = styled(Stack)`
  flex: 1;
` as typeof Stack;

export const FormContent = styled(Stack)`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(4)} 0;
`;

export const SectionLabel = styled(Typography).attrs({
  variant: 'overline',
})`
  font-weight: 600;
  letter-spacing: 1.5px;
  color: ${({ theme }) => theme.palette.text.secondary};
`;

export const PlaceholderBox = styled(Stack).attrs({
  direction: 'row',
  alignItems: 'center',
})`
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  background-color: ${({ theme }) => theme.palette.action.hover};
`;
