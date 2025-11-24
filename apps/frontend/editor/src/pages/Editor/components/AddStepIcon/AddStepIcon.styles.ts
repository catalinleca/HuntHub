import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  border: 2px dashed ${({ theme }) => theme.palette.divider};
  background-color: transparent;
  color: ${({ theme }) => theme.palette.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.palette.primary.main};
    color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.primary.main}08;
  }
`;
