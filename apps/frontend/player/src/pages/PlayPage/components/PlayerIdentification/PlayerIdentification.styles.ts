import styled from 'styled-components';
import { alpha } from '@mui/material/styles';
import { Stack, Paper, Box } from '@mui/material';

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

export const LogoCircle = styled(Box)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.accent.main, 0.05)};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
`;

export const Logo = styled.img`
  width: 54px;
  height: 54px;
  object-fit: contain;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;
