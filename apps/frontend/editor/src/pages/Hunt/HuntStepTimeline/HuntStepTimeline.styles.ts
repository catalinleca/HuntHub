import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3, 4)};
  background-color: ${({ theme }) => theme.palette.background.defaultLight};
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.palette.grey[300]};
    border-radius: 3px;
  }
`;

export const Connector = styled('div')`
  position: relative;
  width: 28px;
  height: 0;
  border-top: 2px dashed ${({ theme }) => theme.palette.divider};
  align-self: center;
  margin-top: -20px;

  &::after {
    content: '';
    position: absolute;
    right: -1px;
    top: -5px;
    width: 0;
    height: 0;
    border-left: 6px solid ${({ theme }) => theme.palette.divider};
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
  }
`;
