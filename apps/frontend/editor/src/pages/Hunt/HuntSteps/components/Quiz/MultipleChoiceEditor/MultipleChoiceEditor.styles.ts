import styled from 'styled-components';
import { Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const AddOptionButton = styled(Button)`
  align-self: flex-start;
  background-color: ${({ theme }) => alpha(theme.palette.success.main, 0.15)};
  color: ${({ theme }) => theme.palette.success.main};

  &:hover {
    background-color: ${({ theme }) => alpha(theme.palette.success.main, 0.25)};
  }
`;
