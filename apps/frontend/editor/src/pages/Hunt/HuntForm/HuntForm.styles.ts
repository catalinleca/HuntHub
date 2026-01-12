import styled from 'styled-components';
import { Container, Card } from '@mui/material';

interface FormAreaProps {
  $isPreviewOpen?: boolean;
}

export const FormArea = styled(Container).attrs({
  maxWidth: 'md',
})<FormAreaProps>`
  flex: 1;
  display: flex;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(4)};
  transform: translateX(${({ $isPreviewOpen }) => ($isPreviewOpen ? '0' : '172px')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
`;

export const FormCard = styled(Card)`
  width: 100%;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border-color: ${({ theme }) => theme.palette.divider};
`;
