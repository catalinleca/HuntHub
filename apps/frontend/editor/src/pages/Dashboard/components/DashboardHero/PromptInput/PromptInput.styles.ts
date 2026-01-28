import styled from 'styled-components';
import { Box, TextField, IconButton, alpha } from '@mui/material';

export const Card = styled(Box)`
  background: ${({ theme }) => theme.palette.common.white};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  box-shadow: 0 8px 32px ${({ theme }) => alpha(theme.palette.primary.dark, 0.15)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const InputWrapper = styled(Box)`
  position: relative;
`;

export const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    & fieldset {
      border: none;
    }
  }

  & .MuiInputBase-input {
    padding-right: ${({ theme }) => theme.spacing(7)};
  }
`;

export const CharacterCount = styled.span<{ $isNearLimit: boolean }>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(8)};
  color: ${({ theme, $isNearLimit }) => ($isNearLimit ? theme.palette.warning.main : theme.palette.text.disabled)};
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
`;

export const GenerateButton = styled(IconButton)`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(1)};
  right: ${({ theme }) => theme.spacing(1)};
  background: ${({ theme }) => theme.palette.primary.main};
  color: ${({ theme }) => theme.palette.common.white};
  border-radius: 50%;
  padding: ${({ theme }) => theme.spacing(1.5)};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.palette.primary.dark};
  }

  &:disabled {
    background: ${({ theme }) => alpha(theme.palette.primary.main, 0.4)};
    color: ${({ theme }) => alpha(theme.palette.common.white, 0.7)};
  }
`;
