import styled from 'styled-components';
import { Stack, Paper } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const Card = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(4)};
  max-width: 400px;
  width: 100%;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;
