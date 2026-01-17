import type { Hunt } from '@hunthub/shared/types';
import { HuntCard, HuntCardTitle } from '@/components/HuntCard';
import { Box, Grid2 } from '@mui/material';
import { StackIcon } from '@phosphor-icons/react';
import { getColor } from '@hunthub/compass';
import { HuntActionCard } from '@/pages/Dashboard/components/HuntActionCard';
import { useDeleteHunt, useCloneHunt } from '@/api/Hunt';
import { useConfirmationDialog } from '@/hooks';
import { DialogVariants } from '@/stores/useDialogStore';
import { useHuntDialogStore, useSnackbarStore } from '@/stores';
import { MediaHelper } from '@/components/media/data';
import { useNavigate } from 'react-router-dom';

interface AllHuntsProps {
  hunts: Hunt[];
}

export const AllHunts = ({ hunts }: AllHuntsProps) => {
  const navigate = useNavigate();

  const { confirm } = useConfirmationDialog();
  const { open: openHuntDialog } = useHuntDialogStore();
  const snackbar = useSnackbarStore();
  const deleteMutation = useDeleteHunt();
  const cloneMutation = useCloneHunt();

  const handleEdit = (huntId: number) => {
    openHuntDialog(huntId);
  };

  const handleNavigateToHunt = (huntId: number) => {
    navigate(`/editor/${huntId}`);
  };

  const handleClone = (hunt: Hunt) => {
    confirm({
      title: 'Clone Hunt',
      message: `Create a copy of "${hunt.name}"?`,
      confirmText: 'Clone',
      variant: DialogVariants.Info,
      awaitConfirmation: false,
      onConfirm: () => {
        cloneMutation.mutate(
          { huntId: hunt.huntId },
          {
            onSuccess: (result) => {
              snackbar.success(`"${hunt.name}" cloned!`, {
                label: 'View',
                onClick: () => {
                  navigate(`/editor/${result.huntId}`);
                },
              });
            },
          }
        );
      },
    });
  };

  const handleDelete = (huntId: number) => {
    confirm({
      title: 'Delete Hunt',
      message: 'Are you sure you want to delete this hunt?',
      confirmText: 'Delete',
      variant: DialogVariants.Danger,
      awaitConfirmation: false,
      onConfirm: () => {
        return deleteMutation.mutateAsync(huntId);
      },
    });
  };

  if (hunts.length === 0) {
    return null;
  }

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
                image={MediaHelper.getUrl(hunt.coverImage)}
                imageAlt={MediaHelper.getAlt(hunt.coverImage) || hunt.name}
                title={hunt.name}
                subtitle={hunt.description || 'No description'}
                isPublished={hunt.isPublished}
                onEdit={() => handleEdit(hunt.huntId)}
                onClone={() => handleClone(hunt)}
                onDelete={() => handleDelete(hunt.huntId)}
                onClick={() => handleNavigateToHunt(hunt.huntId)}
              />
            </Grid2>
          ))}
        </Grid2>
      </Box>
    </HuntCard>
  );
};
