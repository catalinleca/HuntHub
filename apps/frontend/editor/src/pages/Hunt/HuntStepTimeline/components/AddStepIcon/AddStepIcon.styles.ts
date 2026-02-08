import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex-shrink: 0;
  align-self: center;
  margin-left: ${({ theme }) => theme.spacing(1)};
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows[3]};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.palette.primary.dark};
    box-shadow: ${({ theme }) => theme.shadows[4]};
    transform: scale(1.05);
  }

  ${({ theme }) => theme.breakpoints.down('md')} {
    display: none;
  }
`;
