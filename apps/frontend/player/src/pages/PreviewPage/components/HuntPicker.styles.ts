import { styled, Box, Stack } from '@mui/material';

const PHONE_WIDTH = 320;
const PHONE_HEIGHT = 580;

export const PageContainer = styled(Stack)`
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.palette.background.default};
`;

export const PhoneContainer = styled(Box)`
  width: ${PHONE_WIDTH}px;
  height: ${PHONE_HEIGHT}px;
  background-color: ${({ theme }) => theme.palette.background.paper};
  border: 2px solid ${({ theme }) => theme.palette.divider};
  border-radius: 24px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows[8]};
`;

export const Content = styled(Stack)`
  height: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  overflow-y: auto;
`;
