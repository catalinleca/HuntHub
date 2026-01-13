import styled from 'styled-components';
import { Box, Typography } from '@mui/material';

export const ClueContent = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 480px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(2, 0)};
`;

export const ClueTitle = styled(Typography)`
  font-weight: 700;
  color: ${({ theme }) => theme.palette.primary.main};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const ClueDescription = styled(Typography)`
  font-size: 1.125rem;
  font-style: italic;
  line-height: 1.7;
  color: ${({ theme }) => theme.palette.text.secondary};
`;
