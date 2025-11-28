import styled from 'styled-components';
import { Container, Card } from '@mui/material';

export const FormArea = styled(Container)`
  flex: 1;
  display: flex;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
`;

FormArea.defaultProps = {
  maxWidth: 'sm',
};

export const FormCard = styled(Card)`
  width: 100%;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border-color: ${({ theme }) => theme.palette.divider};
`;
