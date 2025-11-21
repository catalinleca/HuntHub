import type { Hunt } from '@hunthub/shared/types';
import { HuntCard, HuntCardTitle } from '@/components/HuntCard';
import { Box, Grid2 } from '@mui/material';
import { StackIcon } from '@phosphor-icons/react';
import { getColor } from '@/utils';
import { HuntActionCard } from '@/pages/Dashboard/components/HuntActionCard';
import { useDeleteHunt } from '@/api/Hunt';
import { useConfirmationDialog } from '@/hooks';
import { DialogVariants } from '@/stores/useDialogStore';

interface AllHuntsProps {
  hunts: Hunt[];
}

export const AllHunts = ({ hunts }: AllHuntsProps) => {
  const { confirm } = useConfirmationDialog();
  const deleteMutation = useDeleteHunt();

  const handleDelete = async (huntId: number) => {
    const confirmed = await confirm({
      title: 'Delete Hunt',
      message: 'Are you sure you want to delete this hunt?',
      confirmText: 'Delete',
      variant: DialogVariants.Danger,
    });

    if (!confirmed) return;

    await deleteMutation.mutateAsync(huntId);
  };

  if (hunts.length === 0) return null;

  return (
    <HuntCard transition={false}>
      <Box sx={{ p: 4 }}>
        <HuntCardTitle icon={<StackIcon size={24} color={getColor('grey.600')} />} count={hunts.length}>
          All Hunts
        </HuntCardTitle>

        <Grid2 container spacing={3} sx={{ mt: 2 }}>
          {hunts.map((hunt) => (
            <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={hunt.huntId}>
              <HuntActionCard
                title={hunt.name}
                subtitle={hunt.description || 'No description'}
                isPublished={hunt.isPublished}
                onDelete={() => handleDelete(hunt.huntId)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </HuntCard>
  );
};
