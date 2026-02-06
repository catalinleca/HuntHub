import { Stack, Typography } from '@mui/material';
import { useDashboardHunts } from '@/api/Hunt';
import { RECENT_HUNTS_COUNT } from '@/api/Hunt/config';
import { useHuntDialogStore } from '@/stores';
import {
  DashboardNavBar,
  DashboardHero,
  GenerationProgress,
  EmptyState,
  ErrorState,
  RecentHunts,
  AllHunts,
} from './components';
import { useHuntGeneration } from './hooks';
import { DashboardContainer, ContentContainer } from './Dashboard.styles';

const Dashboard = () => {
  const { open: openHuntDialog } = useHuntDialogStore();
  const { hunts, isLoading, error } = useDashboardHunts();
  const { prompt, setPrompt, style, handleStyleChange, generate, isGenerating } = useHuntGeneration();

  const recentHunts = hunts.slice(0, RECENT_HUNTS_COUNT);
  const hasHunts = hunts.length > 0;

  return (
    <DashboardContainer>
      <DashboardNavBar onCreateClick={openHuntDialog} />
      <DashboardHero
        prompt={prompt}
        onPromptChange={setPrompt}
        style={style}
        onStyleChange={handleStyleChange}
        onGenerate={generate}
        isGenerating={isGenerating}
      />

      <ContentContainer maxWidth="xl">
        {isGenerating && <GenerationProgress />}

        {!isGenerating && (
          <>
            {isLoading && <Typography color="text.secondary">Loading hunts...</Typography>}

            {error && <ErrorState />}

            {!isLoading && !error && !hasHunts && <EmptyState onCreateClick={openHuntDialog} />}

            {!isLoading && hasHunts && (
              <Stack direction="column" gap={{ xs: 5, md: 8 }}>
                <RecentHunts hunts={recentHunts} />
                <AllHunts hunts={hunts} />
              </Stack>
            )}
          </>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default Dashboard;
