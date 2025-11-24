import styled from 'styled-components';
import { Stack, IconButton } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const BackButton = styled(IconButton)`
  &:hover {
    background-color: ${({ theme }) => theme.palette.action.hover};
  }
`;

export const TitleSection = styled(Stack)`
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const TitleRow = styled(Stack)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;
