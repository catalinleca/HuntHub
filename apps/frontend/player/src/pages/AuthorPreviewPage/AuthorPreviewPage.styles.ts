import styled from 'styled-components';
import { Stack } from '@mui/material';

export const PageContainer = styled(Stack)`
  min-height: 100vh;
`;

export const CenteredContainer = styled(Stack)`
  flex: 1;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
`;

export const Content = styled(Stack)`
  flex: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
