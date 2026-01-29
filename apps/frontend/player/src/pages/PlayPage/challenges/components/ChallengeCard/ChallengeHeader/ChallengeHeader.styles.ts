import styled from 'styled-components';
import { Box, Divider } from '@mui/material';

export const Divider_ = styled(Divider)`
  margin: ${({ theme }) => theme.spacing(0, -3)};
  border-color: ${({ theme }) => theme.palette.grey[200]};
`;

export const StepBadge = styled(Box)`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1, 2)};
  background-color: ${({ theme }) => theme.palette.grey[150]};
  border-radius: 100px;
`;

export const HuntTitle = styled(Box)`
  flex: 1;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: ${({ theme }) => theme.spacing(0, 1)};
`;
