import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  width: 100%;
`;

export const Section = styled(Box)`
  width: 100%;
`;

export const FormFields = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;