import styled from 'styled-components';
import { Stack, Box } from '@mui/material';

export const FormArea = styled(Stack)`
  flex: 1;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const FormCard = styled(Box)`
  max-width: 800px;
  width: 100%;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border-radius: ${({ theme }) => theme.spacing(2)};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: ${({ theme }) => theme.spacing(4)};
`;
