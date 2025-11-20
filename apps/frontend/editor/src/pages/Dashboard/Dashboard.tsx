import { Dialog, Typography } from '@mui/material';
import { useState } from 'react';
import { useGetHunts } from '@/api/Hunt';
import {
  DashboardNavBar,
  DashboardHero,
  EmptyState,
  ErrorState,
  HuntsGrid,
  ResumeHunts,
} from './components';
import { DashboardContainer, ContentContainer, PageTitle } from './Dashboard.styles';
import { CreateHuntForm } from '@/components';

// TODO: to be deleted
const CreateHuntDialog = ({ open, onClose }: any) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <CreateHuntForm />
    </Dialog>
  );
};


const Dashboard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { data: hunts, isLoading, error } = useGetHunts();

  const handleCreateClick = () => setIsCreateDialogOpen(true);
  const handleCloseDialog = () => setIsCreateDialogOpen(false);

  return (
    <DashboardContainer>
      <DashboardNavBar onCreateClick={handleCreateClick} />
      <DashboardHero onCreateClick={handleCreateClick} />

      <ContentContainer maxWidth="lg">
        {isLoading && <Typography color="text.secondary">Loading hunts...</Typography>}

        {error && <ErrorState />}

        {!isLoading && !error && hunts?.length === 0 && (
          <EmptyState onCreateClick={handleCreateClick} />
        )}

        {!isLoading && hunts && hunts.length > 0 && <ResumeHunts hunts={hunts} />}

        <CreateHuntDialog open={isCreateDialogOpen} onClose={handleCloseDialog} />
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
