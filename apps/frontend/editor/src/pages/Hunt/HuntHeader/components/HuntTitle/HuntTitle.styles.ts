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

export const VersionBadge = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${({ theme }) => theme.palette.grey[50]};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.sm}px;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.palette.grey[100]};
  }
`;

export const LiveDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ theme }) => theme.palette.success.main};
`;
