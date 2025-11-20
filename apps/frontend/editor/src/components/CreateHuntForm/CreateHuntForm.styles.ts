import styled from 'styled-components';
import { Paper, Box, Typography } from '@mui/material';

export const FormPaper = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(3)};
  max-width: 600px;
  margin: 0 auto;
`;

export const FormDescription = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const ButtonContainer = styled(Box)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;
