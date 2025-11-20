import styled from 'styled-components';
import { Avatar } from '@mui/material';

export const StyledAvatar = styled(Avatar)`
  width: 36px;
  height: 36px;
  background-color: ${({ theme }) => theme.palette.accent.main};
  color: ${({ theme }) => theme.palette.common.white};
`;
