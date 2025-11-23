import { Dialog, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useDashboardHunts } from '@/api/Hunt';
import { RECENT_HUNTS_COUNT } from '@/api/Hunt/config';
import { DashboardNavBar, DashboardHero, EmptyState, ErrorState, RecentHunts, AllHunts } from './components';
import { DashboardContainer, ContentContainer } from './Dashboard.styles';
import { CreateHuntForm } from '@/components';

const CreateHuntDialog = ({ open, onClose }: any) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <CreateHuntForm />
    </Dialog>
  );
};

const Dashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { hunts, isLoading, error } = useDashboardHunts();

  const handleCreateClick = () => setIsCreateDialogOpen(true);
  const handleCloseDialog = () => setIsCreateDialogOpen(false);

  const recentHunts = hunts.slice(0, RECENT_HUNTS_COUNT);
  const hasHunts = hunts.length > 0;

  return (
    <DashboardContainer>
      <DashboardNavBar onCreateClick={handleCreateClick} />
      <DashboardHero onCreateClick={handleCreateClick} />

      <ContentContainer maxWidth="xl">
        {isLoading && <Typography color="text.secondary">Loading hunts...</Typography>}

        {error && <ErrorState />}

        {!isLoading && !error && !hasHunts && <EmptyState onCreateClick={handleCreateClick} />}

        {!isLoading && hasHunts && (
          <Stack direction="column" gap={8}>
            <RecentHunts hunts={recentHunts} />
            <AllHunts hunts={hunts} />
          </Stack>
        )}

        <CreateHuntDialog open={isCreateDialogOpen} onClose={handleCloseDialog} />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
