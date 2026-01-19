import { styled } from '@mui/material/styles';
import { Stack, Paper } from '@mui/material';

export const Container = styled(Stack)`
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const Card = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  max-width: 400px;
  width: 100%;
`;
