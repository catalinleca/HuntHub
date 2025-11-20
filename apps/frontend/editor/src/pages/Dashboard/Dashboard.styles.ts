import styled from 'styled-components';
import { Container, Box, Card, Typography } from '@mui/material';

export const DashboardContainer = styled(Box)`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.palette.background.default};
`;

export const ContentContainer = styled(Container)`
  padding: ${({ theme }) => theme.spacing(8, 0)};
`;

export const PageTitle = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const StyledHuntCard = styled(Card)`
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[8]};
  }
`;

export const EmptyStateContainer = styled(Box)`
  text-align: center;
  padding-top: ${({ theme }) => theme.spacing(8)};
  padding-bottom: ${({ theme }) => theme.spacing(8)};
`;

export const EmptyStateDescription = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const HuntsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const HuntCardContent = styled(Box)`
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const HuntDescription = styled(Typography)`
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
