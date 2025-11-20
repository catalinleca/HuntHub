import type { Hunt } from '@hunthub/shared/types';
import { HuntCard, HuntCardTitle } from '@/components/HuntCard';
import { Box, Grid2 } from '@mui/material';
import { Stack } from '@phosphor-icons/react';
import { getColor } from '@/utils';
import { HuntActionCard } from '@/pages/Dashboard/components/HuntActionCard';

interface AllHuntsProps {
  hunts: Hunt[];
}

export const AllHunts = ({ hunts }: AllHuntsProps) => {
  if (hunts.length === 0) return null;

  return (
    <HuntCard transition={false}>
      <Box sx={{ p: 4 }}>
        <HuntCardTitle icon={<Stack size={24} color={getColor('grey.600')} />} count={hunts.length}>
          All Hunts
        </HuntCardTitle>

        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          {hunts.map((hunt) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={hunt.huntId}>
              <HuntActionCard
                title={hunt.name}
                subtitle={hunt.description || 'No description'}
                isPublished={hunt.isPublished}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </HuntCard>
  );
};
