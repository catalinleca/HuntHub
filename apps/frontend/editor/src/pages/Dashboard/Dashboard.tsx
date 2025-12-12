import { Stack, Typography } from '@mui/material';
import { useDashboardHunts } from '@/api/Hunt';
import { RECENT_HUNTS_COUNT } from '@/api/Hunt/config';
import { useHuntDialogStore } from '@/stores';
import { DashboardNavBar, DashboardHero, EmptyState, ErrorState, RecentHunts, AllHunts } from './components';
import { DashboardContainer, ContentContainer } from './Dashboard.styles';

const Dashboard = () => {
  const { open: openHuntDialog } = useHuntDialogStore();
  const { hunts, isLoading, error } = useDashboardHunts();

  const handleCreateClick = () => openHuntDialog();

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
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
