import styled from 'styled-components';
import { Stack, Typography } from '@mui/material';

export const ContentContainer = styled(Stack)`
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const TextareaContainer = styled(Stack)`
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: ${({ theme }) => theme.spacing(2)};
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.palette.grey[100]};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${({ theme }) => theme.palette.text.disabled};
  }
`;

export const CharacterCount = styled(Typography)<{ $isWarning?: boolean; $isError?: boolean }>`
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $isWarning, $isError }) => {
    if ($isError) return theme.palette.error.main;
    if ($isWarning) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  }};
`;
