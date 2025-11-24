import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)<{ $selected: boolean }>`
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.palette.primary.main : theme.palette.grey[100]};
  color: ${({ theme, $selected }) =>
    $selected ? theme.palette.primary.contrastText : theme.palette.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.palette.primary.dark : theme.palette.grey[200]};
    transform: translateY(-2px);
  }
`;

export const Number = styled(Box)`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.background.paper};
  color: ${({ theme }) => theme.palette.text.primary};
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
`;
