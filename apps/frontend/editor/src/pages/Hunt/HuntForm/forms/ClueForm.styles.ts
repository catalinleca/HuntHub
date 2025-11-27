import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  width: 100%;
`;

export const Section = styled(Stack)`
  width: 100%;
`;

export const FormFields = styled(Stack)`
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;
