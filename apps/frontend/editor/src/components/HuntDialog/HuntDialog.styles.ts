import styled from 'styled-components';
import { Dialog as MuiDialog, DialogTitle, DialogContent } from '@mui/material';

const HUNT_DIALOG_Z_INDEX = 1100;

export const Dialog = styled(MuiDialog)`
  z-index: ${HUNT_DIALOG_Z_INDEX};

  .MuiDialog-paper {
    border: none;
    overflow: hidden;
  }
`;

export const Title = styled(DialogTitle)`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: ${({ theme }) => theme.typography.body1.fontSize};
  color: ${({ theme }) => theme.palette.common.white};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.palette.accent.light} 0%,
    ${({ theme }) => theme.palette.accent.medium} 40%,
    ${({ theme }) => theme.palette.secondary.main} 100%
  );
  box-shadow: ${({ theme }) => theme.shadows[4]};
`;

export const Content = styled(DialogContent)`
  text-align: left;
  border: 4px solid ${({ theme }) => theme.palette.divider};
  border-top: none;
  border-radius: 0 0 ${({ theme }) => theme.shape.lg}px ${({ theme }) => theme.shape.lg}px;
`;
