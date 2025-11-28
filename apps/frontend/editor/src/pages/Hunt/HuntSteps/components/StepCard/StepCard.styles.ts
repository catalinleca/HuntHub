import styled from 'styled-components';
import { Box } from '@mui/material';

export const IconWrapper = styled(Box)<{ $bgColor: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.shape.sm}px;
  background-color: ${({ $bgColor }) => $bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.palette.common.white};
  box-shadow: ${({ theme }) => theme.shadows[3]};
`;

