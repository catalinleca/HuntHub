import styled from 'styled-components';
import { Card } from '@mui/material';

export const HuntCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.spacing(2)};
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[2]};
    transform: translateY(-2px);
  }
`;
