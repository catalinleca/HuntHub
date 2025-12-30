import { Grid2, Box } from '@mui/material';
import { ScrollIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { HuntCard, HuntCardTitle } from '@/components/HuntCard';
import type { Hunt } from '@hunthub/shared/types';
import { getColor } from '@/utils';
import { HuntActionCard } from '@/pages/Dashboard/components/HuntActionCard';
import { MediaHelper } from '@/components/media/data';

interface RecentHuntsProps {
  hunts: Hunt[];
}

export const RecentHunts = ({ hunts }: RecentHuntsProps) => {
  const navigate = useNavigate();

  if (hunts.length === 0) return null;

  const handleEditHunt = (huntId: number) => {
    navigate(`/editor/${huntId}`);
  };

  return (
    <HuntCard transition={false}>
      <Box sx={{ p: 4 }}>
        <HuntCardTitle icon={<ScrollIcon size={24} color={getColor('grey.600')} />}>Resume Your Crafting</HuntCardTitle>

        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          {hunts.map((hunt) => (
            <Grid2 size={{ xs: 12, md: 6 }} key={hunt.huntId}>
              <HuntActionCard
                image={MediaHelper.getUrl(hunt.coverImage)}
                imageAlt={MediaHelper.getAlt(hunt.coverImage) || hunt.name}
                title={hunt.name}
                subtitle={hunt.description || 'No description'}
                isPublished={hunt.isPublished}
                onClick={() => handleEditHunt(hunt.huntId)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </HuntCard>
  );
};
