import { Typography } from '@mui/material';
import { useState } from 'react';
import { useGetHunts } from '@/api/Hunt';
import {
  DashboardNavBar,
  EmptyState,
  ErrorState,
  HuntsGrid,
  CreateHuntDialog,
} from './components';
import { DashboardContainer, ContentContainer, PageTitle } from './Dashboard.styles';

export default function Dashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: hunts, isLoading, error } = useGetHunts();

  const handleCreateClick = () => setIsCreateDialogOpen(true);
  const handleCloseDialog = () => setIsCreateDialogOpen(false);

  return (
    <DashboardContainer>
      <DashboardNavBar onCreateClick={handleCreateClick} />

      <ContentContainer maxWidth="lg">
        <PageTitle variant="h3">
          My Hunts
        </PageTitle>

        {isLoading && <Typography color="text.secondary">Loading hunts...</Typography>}

        {error && <ErrorState />}

        {!isLoading && !error && hunts?.length === 0 && (
          <EmptyState onCreateClick={handleCreateClick} />
        )}

        {!isLoading && hunts && hunts.length > 0 && <HuntsGrid hunts={hunts} />}

        <CreateHuntDialog open={isCreateDialogOpen} onClose={handleCloseDialog} />
      </ContentContainer>
    </DashboardContainer>
  );
}
