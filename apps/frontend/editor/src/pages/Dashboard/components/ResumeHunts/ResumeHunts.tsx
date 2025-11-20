import { Grid2, Box, Button } from '@mui/material';
import { ScrollIcon } from '@phosphor-icons/react';
import { HuntCard, HuntCardTitle } from '@/components/HuntCard';
import type { Hunt } from '@hunthub/shared/types';
import { getColor } from '@/utils';
import { DraftCard } from '@/pages/Dashboard/components/DraftCard';

interface ResumeHuntsProps {
  hunts: Hunt[];
}

export const ResumeHunts = ({ hunts }: ResumeHuntsProps) => {
  const recentHunts = hunts.slice(0, 2);

  if (recentHunts.length === 0) return null;

  return (
    <HuntCard transition={false}>
      <Box sx={{ p: 4 }}>
        <HuntCardTitle icon={<ScrollIcon size={24} color={getColor('grey.600')} />} count={hunts.length}>
          Resume Your Crafting
        </HuntCardTitle>

        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          {recentHunts.map((hunt) => (
            <Grid2 size={{ xs: 12, md: 6 }} key={hunt.huntId}>
              <DraftCard
                title={hunt.name}
                subtitle={hunt.description || 'No description'}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </HuntCard>
  );
};
